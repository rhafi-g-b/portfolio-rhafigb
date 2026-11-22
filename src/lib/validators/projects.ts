import { z } from "zod";

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500, "URL maksimal 500 karakter.")
  .refine(
    (value) => {
      if (value === "") {
        return true;
      }
      try {
        const parsed = new URL(value);
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL harus valid dan diawali dengan https://" }
  );

export const projectFormSchema = z.object({
  id: z.string().uuid("ID proyek tidak valid.").optional(),
  title: z
    .string()
    .trim()
    .min(2, "Judul proyek minimal 2 karakter.")
    .max(120, "Judul proyek maksimal 120 karakter."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug minimal 2 karakter.")
    .max(120, "Slug maksimal 120 karakter.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)."
    ),
  summary: z
    .string()
    .trim()
    .min(5, "Ringkasan minimal 5 karakter.")
    .max(300, "Ringkasan maksimal 300 karakter."),
  description: z
    .string()
    .trim()
    .max(10000, "Deskripsi studi kasus maksimal 10.000 karakter."),
  live_url: optionalHttpsUrl,
  repo_url: optionalHttpsUrl,
  tech_stack: z
    .array(z.string().trim().min(1).max(40))
    .max(15, "Maksimal 15 teknologi per proyek."),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  display_order: z
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),
});

export const projectIdSchema = z.string().uuid("ID proyek tidak valid.");

export const projectToggleSchema = z.object({
  id: z.string().uuid("ID proyek tidak valid."),
  field: z.enum(["is_published", "is_featured"]),
  value: z.boolean(),
});

export type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail_url: string;
  live_url: string;
  repo_url: string;
  tech_stack: string[];
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};