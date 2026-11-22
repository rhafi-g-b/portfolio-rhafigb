import { z } from "zod";

export const experienceFormSchema = z
  .object({
    id: z.string().uuid("ID pengalaman tidak valid.").optional(),
    company: z
      .string()
      .trim()
      .min(1, "Nama perusahaan wajib diisi.")
      .max(120, "Nama perusahaan maksimal 120 karakter."),
    role: z
      .string()
      .trim()
      .min(1, "Jabatan atau peran wajib diisi.")
      .max(120, "Jabatan maksimal 120 karakter."),
    location: z
      .string()
      .trim()
      .max(120, "Lokasi maksimal 120 karakter."),
    start_date: z
      .string()
      .trim()
      .min(4, "Waktu mulai minimal 4 karakter (contoh: Jan 2024).")
      .max(30, "Waktu mulai maksimal 30 karakter."),
    end_date: z
      .string()
      .trim()
      .max(30, "Waktu selesai maksimal 30 karakter."),
    is_current: z.boolean(),
    description: z
      .string()
      .trim()
      .max(2000, "Deskripsi pencapaian maksimal 2.000 karakter."),
    display_order: z
      .number()
      .int("Urutan harus berupa bilangan bulat.")
      .min(0, "Urutan minimal 0.")
      .max(9999, "Urutan maksimal 9999."),
  })
  .superRefine((data, ctx) => {
    if (!data.is_current && data.end_date.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Waktu selesai wajib diisi jika sudah tidak aktif.",
      });
    }
  });

export const experienceIdSchema = z
  .string()
  .uuid("ID pengalaman tidak valid.");

export type ExperienceRecord = {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};