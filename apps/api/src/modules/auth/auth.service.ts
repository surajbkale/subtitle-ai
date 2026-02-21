import bcrypt from "bcryptjs";
import { client } from "@repo/database";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { ConflictError, UnauthorizedError } from "../../errors/HttpErrors";

export async function registerUser(email: string, password: string) {
  return client.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        provider: "LOCAL",
      },
    });

    return issueTokens(user.id, tx);
  });
}

export async function loginUser(email: string, password: string) {
  return client.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return issueTokens(user.id, tx);
  });
}

export async function refreshSession(refreshToken: string) {
  return client.$transaction(async (tx) => {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await tx.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedError("Unauthorized");
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValid) {
      await tx.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });

      throw new UnauthorizedError("Unauthorized");
    }

    return issueTokens(user.id, tx);
  });
}

export async function logoutUser(userId: string) {
  await client.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

async function issueTokens(
  userId: string,
  db:
    | typeof client
    | Parameters<Parameters<typeof client.$transaction>[0]>[0] = client,
) {
  const payload = { userId };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);

  await db.user.update({
    where: { id: userId },
    data: { refreshToken: hashedRefresh },
  });

  return { accessToken, refreshToken };
}
