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

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(120, "Email maksimal 120 karakter.")
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    { message: "Format alamat email tidak valid." }
  );

export const identitySettingsSchema = z.object({
  brand_name: z
    .string()
    .trim()
    .min(1, "Nama brand / developer wajib diisi.")
    .max(80, "Nama brand maksimal 80 karakter."),
  hero_title: z
    .string()
    .trim()
    .max(160, "Judul hero maksimal 160 karakter."),
  hero_subtitle: z
    .string()
    .trim()
    .max(320, "Subjudul hero maksimal 320 karakter."),
  about_bio: z
    .string()
    .trim()
    .max(3000, "Bio lengkap maksimal 3.000 karakter."),
});

export const socialSettingsSchema = z.object({
  contact_email: optionalEmail,
  github_url: optionalHttpsUrl,
  linkedin_url: optionalHttpsUrl,
});

export const seoSettingsSchema = z.object({
  seo_title: z
    .string()
    .trim()
    .max(120, "Judul SEO maksimal 120 karakter."),
  seo_description: z
    .string()
    .trim()
    .max(300, "Deskripsi SEO maksimal 300 karakter."),
});

export type IdentitySettingsValues = z.infer<typeof identitySettingsSchema>;
export type SocialSettingsValues = z.infer<typeof socialSettingsSchema>;
export type SeoSettingsValues = z.infer<typeof seoSettingsSchema>;

export type SiteSettingsRecord = IdentitySettingsValues &
  SocialSettingsValues &
  SeoSettingsValues & {
    avatar_url: string;
    cv_url: string;
  };