"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminSession, recordAuditLog } from "@/lib/security/auth-guard";
import { skillFormSchema, skillIdSchema } from "@/lib/validators/skills";

export type SkillSaveActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string>;
  timestamp?: number;
};

export type SkillMutationResult = {
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

export async function saveSkillAction(
  _prevState: SkillSaveActionState,
  formData: FormData
): Promise<SkillSaveActionState> {
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

  const parsed = skillFormSchema.safeParse({
    id: rawId || undefined,
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    display_order: Number.isNaN(rawOrder) ? 0 : rawOrder,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data keahlian yang dimasukkan.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: existingSkills, error: fetchError } = await supabase
    .from("skills")
    .select("id, name");

  if (fetchError) {
    return {
      status: "error",
      message: "Gagal memverifikasi data keahlian.",
      timestamp: Date.now(),
    };
  }

  const normalizedName = parsed.data.name.toLowerCase();
  const isDuplicate = (existingSkills ?? []).some(
    (item) =>
      item.id !== parsed.data.id &&
      item.name.trim().toLowerCase() === normalizedName
  );

  if (isDuplicate) {
    return {
      status: "error",
      message: "Keahlian dengan nama tersebut sudah terdaftar.",
      fieldErrors: { name: "Nama keahlian sudah ada." },
      timestamp: Date.now(),
    };
  }

  const recordPayload = {
    name: parsed.data.name,
    category: parsed.data.category,
    display_order: parsed.data.display_order,
  };

  if (parsed.data.id) {
    const { data: updated, error } = await supabase
      .from("skills")
      .update(recordPayload)
      .eq("id", parsed.data.id)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      return {
        status: "error",
        message: "Gagal memperbarui data keahlian.",
        timestamp: Date.now(),
      };
    }

    await recordAuditLog("UPDATE_SKILL", "skills", parsed.data.id);
  } else {
    const { data: inserted, error } = await supabase
      .from("skills")
      .insert(recordPayload)
      .select("id")
      .single();

    if (error || !inserted) {
      return {
        status: "error",
        message: "Gagal menambahkan keahlian baru.",
        timestamp: Date.now(),
      };
    }

    await recordAuditLog("CREATE_SKILL", "skills", inserted.id);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/skills");

  return {
    status: "success",
    message: parsed.data.id
      ? "Keahlian berhasil diperbarui."
      : "Keahlian baru berhasil ditambahkan.",
    timestamp: Date.now(),
  };
}

export async function deleteSkillAction(
  id: string
): Promise<SkillMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsedId = skillIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "ID keahlian tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return { status: "error", message: "Gagal menghapus keahlian." };
  }

  await recordAuditLog("DELETE_SKILL", "skills", parsedId.data);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/skills");

  return { status: "success", message: "Keahlian berhasil dihapus." };
}