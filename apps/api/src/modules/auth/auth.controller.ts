import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "./auth.service";
import { verifyRefreshToken } from "../../utils/jwt";
import { BadRequestError, UnauthorizedError } from "../../errors/HttpErrors";

const refreshCookieSameSite: "lax" | "strict" | "none" =
  (process.env.REFRESH_COOKIE_SAMESITE as "lax" | "strict" | "none") || "lax";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: refreshCookieSameSite,
    path: "/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new BadRequestError("Validation failed");
  }

  const { email, password } = result.data;

  const { accessToken, refreshToken } = await registerUser(email, password);

  setRefreshCookie(res, refreshToken);

  return res.json({ accessToken });
}

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new BadRequestError("Validation failed");
  }

  const { email, password } = result.data;

  const { accessToken, refreshToken } = await loginUser(email, password);

  setRefreshCookie(res, refreshToken);

  return res.json({ accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new UnauthorizedError("Unauthorized");
  }

  const { accessToken, refreshToken } = await refreshSession(token);

  setRefreshCookie(res, refreshToken);

  return res.json({ accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.sendStatus(204);
  }

  const decoded = verifyRefreshToken(token);

  await logoutUser(decoded.userId);

  res.clearCookie("refreshToken", {
    path: "/auth/refresh",
  });

  return res.sendStatus(204);
}
