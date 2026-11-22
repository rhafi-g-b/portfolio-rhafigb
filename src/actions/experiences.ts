"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminSession, recordAuditLog } from "@/lib/security/auth-guard";
import {
  experienceFormSchema,
  experienceIdSchema,
} from "@/lib/validators/experiences";

export type ExperienceSaveActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string>;
  timestamp?: number;
};

export type ExperienceMutationResult = {
  status: "success" | "error";
  message: string;
};

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

export async function saveExperienceAction(
  _prevState: ExperienceSaveActionState,
  formData: FormData
): Promise<ExperienceSaveActionState> {
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
  const isCurrent = formData.get("is_current") === "on";

  const parsed = experienceFormSchema.safeParse({
    id: rawId || undefined,
    company: String(formData.get("company") ?? ""),
    role: String(formData.get("role") ?? ""),
    location: String(formData.get("location") ?? ""),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: isCurrent ? "" : String(formData.get("end_date") ?? ""),
    is_current: isCurrent,
    description: String(formData.get("description") ?? ""),
    display_order: Number.isNaN(rawOrder) ? 0 : rawOrder,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali kolom pengalaman yang ditandai.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();

  const recordPayload = {
    company: parsed.data.company,
    role: parsed.data.role,
    location: parsed.data.location,
    start_date: parsed.data.start_date,
    end_date: parsed.data.is_current ? "" : parsed.data.end_date,
    is_current: parsed.data.is_current,
    description: parsed.data.description,
    display_order: parsed.data.display_order,
  };

  if (parsed.data.id) {
    const { data: updated, error } = await supabase
      .from("experiences")
      .update(recordPayload)
      .eq("id", parsed.data.id)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      return {
        status: "error",
        message: "Gagal memperbarui data pengalaman.",
        timestamp: Date.now(),
      };
    }

    await recordAuditLog("UPDATE_EXPERIENCE", "experiences", parsed.data.id);
  } else {
    const { data: inserted, error } = await supabase
      .from("experiences")
      .insert(recordPayload)
      .select("id")
      .single();

    if (error || !inserted) {
      return {
        status: "error",
        message: "Gagal menambahkan pengalaman baru.",
        timestamp: Date.now(),
      };
    }

    await recordAuditLog("CREATE_EXPERIENCE", "experiences", inserted.id);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/experiences");

  return {
    status: "success",
    message: parsed.data.id
      ? "Pengalaman berhasil diperbarui."
      : "Pengalaman baru berhasil ditambahkan.",
    timestamp: Date.now(),
  };
}

export async function deleteExperienceAction(
  id: string
): Promise<ExperienceMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsedId = experienceIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "ID pengalaman tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return { status: "error", message: "Gagal menghapus data pengalaman." };
  }

  await recordAuditLog("DELETE_EXPERIENCE", "experiences", parsedId.data);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/experiences");

  return { status: "success", message: "Pengalaman berhasil dihapus." };
}