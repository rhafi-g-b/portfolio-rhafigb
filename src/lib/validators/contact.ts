import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format alamat email tidak valid.")
    .max(120, "Email maksimal 120 karakter."),
  subject: z
    .string()
    .trim()
    .min(3, "Subjek minimal 3 karakter.")
    .max(150, "Subjek maksimal 150 karakter."),
  message: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter.")
    .max(2000, "Pesan maksimal 2.000 karakter."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;