import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Email tidak valid.")
    .max(120, "Email terlalu panjang.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(128, "Kata sandi terlalu panjang."),
  website: z.string().max(0).optional().default(""),
});

export type LoginInput = z.infer<typeof loginSchema>;