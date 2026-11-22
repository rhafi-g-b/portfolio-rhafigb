"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminSession, recordAuditLog } from "@/lib/security/auth-guard";
import {
  messageIdSchema,
  messageReadToggleSchema,
} from "@/lib/validators/messages";

export type MessageMutationResult = {
  status: "success" | "error";
  message: string;
};

export async function toggleMessageReadAction(
  id: string,
  isRead: boolean
): Promise<MessageMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsed = messageReadToggleSchema.safeParse({ id, is_read: isRead });
  if (!parsed.success) {
    return { status: "error", message: "Permintaan perubahan tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: parsed.data.is_read })
    .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: "Gagal memperbarui status pesan." };
  }

  await recordAuditLog(
    parsed.data.is_read ? "MARK_MESSAGE_READ" : "MARK_MESSAGE_UNREAD",
    "contact_messages",
    parsed.data.id
  );

  revalidatePath("/admin");
  revalidatePath("/admin/messages");

  return {
    status: "success",
    message: parsed.data.is_read
      ? "Pesan ditandai sudah dibaca."
      : "Pesan ditandai belum dibaca.",
  };
}

export async function markAllMessagesReadAction(): Promise<MessageMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    return {
      status: "error",
      message: "Gagal menandai semua pesan sebagai dibaca.",
    };
  }

  await recordAuditLog("MARK_ALL_MESSAGES_READ", "contact_messages");

  revalidatePath("/admin");
  revalidatePath("/admin/messages");

  return {
    status: "success",
    message: "Semua pesan berhasil ditandai sudah dibaca.",
  };
}

export async function deleteMessageAction(
  id: string
): Promise<MessageMutationResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      status: "error",
      message: "Sesi admin tidak valid. Silakan masuk kembali.",
    };
  }

  const parsedId = messageIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "ID pesan tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    return { status: "error", message: "Gagal menghapus pesan." };
  }

  await recordAuditLog("DELETE_MESSAGE", "contact_messages", parsedId.data);

  revalidatePath("/admin");
  revalidatePath("/admin/messages");

  return { status: "success", message: "Pesan berhasil dihapus." };
}