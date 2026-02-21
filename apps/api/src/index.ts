import express from "express";
import cors from "cors";
import { client } from "@repo/database";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", async (_req, res) => {
  const users = await client.user.findMany();
  res.json({
    message: "Video processing service is running...",
    users: users,
  });
});

app.use("/auth", authRoutes);

app.use(errorMiddleware);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
