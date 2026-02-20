import express from "express";
import cors from "cors";
import { client } from "@repo/database";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const users = await client.user.findMany();
  res.json({
    message: "Video processing service is running...",
    users: users,
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
