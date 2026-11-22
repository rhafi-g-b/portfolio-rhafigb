"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminSession, recordAuditLog } from "@/lib/security/auth-guard";
import {
  extractManagedStoragePath,
  validateUploadedFile,
} from "@/lib/security/file-validation";
import {
  identitySettingsSchema,
  seoSettingsSchema,
  socialSettingsSchema,
} from "@/lib/validators/settings";

export type SectionActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string>;
  timestamp?: number;
};

export type MediaUploadActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  url?: string;
  timestamp?: number;
};

const BUCKET_NAME = "portfolio-media";

function extractFieldErrors(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function updateIdentitySettingsAction(
  _prevState: SectionActionState,
  formData: FormData
): Promise<SectionActionState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
      timestamp: Date.now(),
    };
  }

  const parsed = identitySettingsSchema.safeParse({
    brand_name: String(formData.get("brand_name") ?? ""),
    hero_title: String(formData.get("hero_title") ?? ""),
    hero_subtitle: String(formData.get("hero_subtitle") ?? ""),
    about_bio: String(formData.get("about_bio") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali kolom identitas yang ditandai.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      brand_name: parsed.data.brand_name,
      hero_title: parsed.data.hero_title,
      hero_subtitle: parsed.data.hero_subtitle,
      about_bio: parsed.data.about_bio,
    })
    .eq("id", 1);

  if (error) {
    return {
      status: "error",
      message: "Gagal menyimpan pengaturan identitas.",
      timestamp: Date.now(),
    };
  }

  await recordAuditLog("UPDATE_IDENTITY_SETTINGS", "site_settings", "1");

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Pengaturan identitas & hero berhasil disimpan.",
    timestamp: Date.now(),
  };
}

export async function updateSocialSettingsAction(
  _prevState: SectionActionState,
  formData: FormData
): Promise<SectionActionState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
      timestamp: Date.now(),
    };
  }

  const parsed = socialSettingsSchema.safeParse({
    contact_email: String(formData.get("contact_email") ?? ""),
    github_url: String(formData.get("github_url") ?? ""),
    linkedin_url: String(formData.get("linkedin_url") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali tautan sosial atau email yang dimasukkan.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      contact_email: parsed.data.contact_email,
      github_url: parsed.data.github_url,
      linkedin_url: parsed.data.linkedin_url,
    })
    .eq("id", 1);

  if (error) {
    return {
      status: "error",
      message: "Gagal menyimpan pengaturan kontak & tautan sosial.",
      timestamp: Date.now(),
    };
  }

  await recordAuditLog("UPDATE_SOCIAL_SETTINGS", "site_settings", "1");

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Pengaturan kontak & tautan sosial berhasil disimpan.",
    timestamp: Date.now(),
  };
}

export async function updateSeoSettingsAction(
  _prevState: SectionActionState,
  formData: FormData
): Promise<SectionActionState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
      timestamp: Date.now(),
    };
  }

  const parsed = seoSettingsSchema.safeParse({
    seo_title: String(formData.get("seo_title") ?? ""),
    seo_description: String(formData.get("seo_description") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali kolom metadata SEO yang ditandai.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      seo_title: parsed.data.seo_title,
      seo_description: parsed.data.seo_description,
    })
    .eq("id", 1);

  if (error) {
    return {
      status: "error",
      message: "Gagal menyimpan metadata SEO.",
      timestamp: Date.now(),
    };
  }

  await recordAuditLog("UPDATE_SEO_SETTINGS", "site_settings", "1");

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Metadata SEO berhasil disimpan.",
    timestamp: Date.now(),
  };
}

export async function uploadSiteMediaAction(
  _prevState: MediaUploadActionState,
  formData: FormData
): Promise<MediaUploadActionState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
      timestamp: Date.now(),
    };
  }

  const mediaType = String(formData.get("media_type") ?? "");
  if (mediaType !== "avatar" && mediaType !== "cv") {
    return {
      status: "error",
      message: "Jenis media tidak valid.",
      timestamp: Date.now(),
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Pilih file terlebih dahulu sebelum mengunggah.",
      timestamp: Date.now(),
    };
  }

  const validation = await validateUploadedFile(
    file,
    mediaType === "avatar"
      ? {
          allowedMimes: ["image/jpeg", "image/png", "image/webp"],
          maxBytes: 2 * 1024 * 1024,
        }
      : {
          allowedMimes: ["application/pdf"],
          maxBytes: 5 * 1024 * 1024,
        }
  );

  if (!validation.ok) {
    return {
      status: "error",
      message: validation.error,
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  const column = mediaType === "avatar" ? "avatar_url" : "cv_url";
  const folder = mediaType === "avatar" ? "avatars" : "cv";

  const { data: current } = await supabase
    .from("site_settings")
    .select("avatar_url, cv_url")
    .eq("id", 1)
    .maybeSingle();

  const previousUrl =
    mediaType === "avatar"
      ? (current?.avatar_url ?? "")
      : (current?.cv_url ?? "");

  const filePath = `${folder}/${globalThis.crypto.randomUUID()}.${validation.ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, validation.buffer, {
      contentType: validation.mime,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return {
      status: "error",
      message:
        mediaType === "avatar"
          ? "Gagal mengunggah foto profil."
          : "Gagal mengunggah dokumen CV.",
      timestamp: Date.now(),
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  const nextUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("site_settings")
    .update({ [column]: nextUrl })
    .eq("id", 1);

  if (updateError) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return {
      status: "error",
      message: "Gagal memperbarui tautan media di database.",
      timestamp: Date.now(),
    };
  }

  if (previousUrl) {
    const oldPath = extractManagedStoragePath(
      previousUrl,
      env.NEXT_PUBLIC_SUPABASE_URL,
      BUCKET_NAME
    );
    if (oldPath && oldPath !== filePath) {
      await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
    }
  }

  await recordAuditLog(
    mediaType === "avatar" ? "UPLOAD_AVATAR" : "UPLOAD_CV",
    "site_settings",
    "1"
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message:
      mediaType === "avatar"
        ? "Foto profil berhasil diperbarui."
        : "Dokumen CV berhasil diperbarui.",
    url: nextUrl,
    timestamp: Date.now(),
  };
}