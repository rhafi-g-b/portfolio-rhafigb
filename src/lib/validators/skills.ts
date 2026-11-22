import { z } from "zod";

export const SKILL_CATEGORIES = [
  { value: "language", label: "Bahasa Pemrograman" },
  { value: "framework", label: "Framework & Library" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools & DevOps" },
  { value: "other", label: "Lainnya" },
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]["value"];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Bahasa Pemrograman",
  framework: "Framework & Library",
  database: "Database",
  tools: "Tools & DevOps",
  other: "Lainnya",
};

export const skillFormSchema = z.object({
  id: z.string().uuid("ID keahlian tidak valid.").optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nama keahlian wajib diisi.")
    .max(60, "Nama keahlian maksimal 60 karakter."),
  category: z.enum(["language", "framework", "database", "tools", "other"], {
    message: "Kategori keahlian tidak valid.",
  }),
  display_order: z
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),
});

export const skillIdSchema = z.string().uuid("ID keahlian tidak valid.");

export type SkillRecord = {
  id: string;
  name: string;
  category: SkillCategory;
  display_order: number;
  created_at: string;
};