import express from "express";
import cors from "cors";
import { client } from "@repo/database";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (_req, res) => {
  const users = await client.user.findMany();
  res.json({
    message: "Video processing service is running...",
    users: users,
  });
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const user = await client.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  res.json({
    user,
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await client.user.findUnique({
    where: {
      email,
    },
  });

  res.json({
    user,
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
