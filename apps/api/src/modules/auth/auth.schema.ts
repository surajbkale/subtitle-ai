import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string(),
});
