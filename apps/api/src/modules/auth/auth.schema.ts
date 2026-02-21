import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string(),
});
