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
  projectFormSchema,
  projectIdSchema,
  projectToggleSchema,
} from "@/lib/validators/projects";

export type ProjectSaveActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string>;
  timestamp?: number;
};

export type ProjectMutationResult = {
  status: "success" | "error";
  message: string;
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

function parseTechStack(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw.split(",")) {
    const cleaned = item.trim();
    const key = cleaned.toLowerCase();
    if (cleaned.length > 0 && !seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }

  return result;
}

export async function saveProjectAction(
  _prevState: ProjectSaveActionState,
  formData: FormData
): Promise<ProjectSaveActionState> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
      timestamp: Date.now(),
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const rawOrder = Number(formData.get("display_order") ?? "0");
  const removeThumbnail = formData.get("remove_thumbnail") === "true";

  const parsed = projectFormSchema.safeParse({
    id: rawId || undefined,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    live_url: String(formData.get("live_url") ?? ""),
    repo_url: String(formData.get("repo_url") ?? ""),
    tech_stack: parseTechStack(String(formData.get("tech_stack") ?? "")),
    is_featured: formData.get("is_featured") === "on",
    is_published: formData.get("is_published") === "on",
    display_order: Number.isNaN(rawOrder) ? 0 : rawOrder,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali kolom proyek yang ditandai.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  let previousThumbnailUrl = "";

  if (parsed.data.id) {
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select("id, thumbnail_url")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return {
        status: "error",
        message: "Data proyek tidak ditemukan.",
        timestamp: Date.now(),
      };
    }

    previousThumbnailUrl = existing.thumbnail_url ?? "";
  }

  const thumbnailFile = formData.get("thumbnail");
  const hasNewThumbnail =
    thumbnailFile instanceof File && thumbnailFile.size > 0;

  let uploadedPath: string | null = null;
  let nextThumbnailUrl = removeThumbnail ? "" : previousThumbnailUrl;

  if (hasNewThumbnail) {
    const validation = await validateUploadedFile(thumbnailFile, {
      allowedMimes: ["image/jpeg", "image/png", "image/webp"],
      maxBytes: 3 * 1024 * 1024,
    });

    if (!validation.ok) {
      return {
        status: "error",
        message: validation.error,
        fieldErrors: { thumbnail: validation.error },
        timestamp: Date.now(),
      };
    }

    const filePath = `projects/${globalThis.crypto.randomUUID()}.${validation.ext}`;
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
        message: "Gagal mengunggah thumbnail proyek.",
        timestamp: Date.now(),
      };
    }

    uploadedPath = filePath;
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    nextThumbnailUrl = publicUrlData.publicUrl;
  }

  const recordPayload = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    summary: parsed.data.summary,
    description: parsed.data.description,
    thumbnail_url: nextThumbnailUrl,
    live_url: parsed.data.live_url,
    repo_url: parsed.data.repo_url,
    tech_stack: parsed.data.tech_stack,
    is_featured: parsed.data.is_featured,
    is_published: parsed.data.is_published,
    display_order: parsed.data.display_order,
  };

  if (parsed.data.id) {
    const { error: updateError } = await supabase
      .from("projects")
      .update(recordPayload)
      .eq("id", parsed.data.id);

    if (updateError) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET_NAME).remove([uploadedPath]);
      }

      if (updateError.code === "23505") {
        return {
          status: "error",
          message: "Slug sudah digunakan oleh proyek lain.",
          fieldErrors: { slug: "Slug sudah digunakan oleh proyek lain." },
          timestamp: Date.now(),
        };
      }

      return {
        status: "error",
        message: "Gagal memperbarui data proyek.",
        timestamp: Date.now(),
      };
    }

    if ((hasNewThumbnail || removeThumbnail) && previousThumbnailUrl) {
      const oldPath = extractManagedStoragePath(
        previousThumbnailUrl,
        env.NEXT_PUBLIC_SUPABASE_URL,
        BUCKET_NAME
      );
      if (oldPath && oldPath !== uploadedPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      }
    }

    await recordAuditLog("UPDATE_PROJECT", "projects", parsed.data.id);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert(recordPayload)
      .select("id")
      .single();

    if (insertError) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET_NAME).remove([uploadedPath]);
      }

      if (insertError.code === "23505") {
        return {
          status: "error",
          message: "Slug sudah digunakan oleh proyek lain.",
          fieldErrors: { slug: "Slug sudah digunakan oleh proyek lain." },
          timestamp: Date.now(),
        };
      }

      return {
        status: "error",
        message: "Gagal menambahkan proyek baru.",
        timestamp: Date.now(),
      };
    }

    await recordAuditLog("CREATE_PROJECT", "projects", inserted.id);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  return {
    status: "success",
    message: parsed.data.id
      ? "Proyek berhasil diperbarui."
      : "Proyek baru berhasil ditambahkan.",
    timestamp: Date.now(),
  };
}

export async function toggleProjectFlagAction(
  id: string,
  field: "is_published" | "is_featured",
  value: boolean
): Promise<ProjectMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsed = projectToggleSchema.safeParse({ id, field, value });
  if (!parsed.success) {
    return { status: "error", message: "Permintaan perubahan tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({ [parsed.data.field]: parsed.data.value })
    .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: "Gagal mengubah status proyek." };
  }

  await recordAuditLog("TOGGLE_PROJECT_STATUS", "projects", parsed.data.id);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  const label =
    parsed.data.field === "is_published"
      ? parsed.data.value
        ? "Proyek dipublikasikan."
        : "Proyek dipindahkan ke draft."
      : parsed.data.value
        ? "Proyek ditandai sebagai unggulan."
        : "Proyek dihapus dari daftar unggulan.";

  return { status: "success", message: label };
}

export async function deleteProjectAction(
  id: string
): Promise<ProjectMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsedId = projectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "ID proyek tidak valid." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("projects")
    .select("thumbnail_url")
    .eq("id", parsedId.data)
    .maybeSingle();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return { status: "error", message: "Gagal menghapus proyek." };
  }

  if (existing?.thumbnail_url) {
    const oldPath = extractManagedStoragePath(
      existing.thumbnail_url,
      env.NEXT_PUBLIC_SUPABASE_URL,
      BUCKET_NAME
    );
    if (oldPath) {
      await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
    }
  }

  await recordAuditLog("DELETE_PROJECT", "projects", parsedId.data);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  return { status: "success", message: "Proyek berhasil dihapus." };
}