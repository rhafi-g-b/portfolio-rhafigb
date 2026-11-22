import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactMessageRecord } from "@/lib/validators/messages";
import { MessagesManager } from "@/components/admin/messages/messages-manager";

async function MessagesContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessageRecord[];

  return <MessagesManager messages={messages} />;
}

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat kotak masuk...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}