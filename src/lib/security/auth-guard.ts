import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  role: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return null;
  }

  return {
    userId: adminRecord.user_id,
    email: adminRecord.email,
    role: adminRecord.role,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function recordAuditLog(
  action: string,
  targetTable: string,
  targetId?: string
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action,
    target_table: targetTable,
    target_id: targetId ?? null,
  });
}