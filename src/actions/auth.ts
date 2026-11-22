"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { recordAuditLog } from "@/lib/security/auth-guard";

export type LoginActionState = {
  error: string | null;
};

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const rawWebsite = String(formData.get("website") ?? "");
  if (rawWebsite.length > 0) {
    return { error: "Permintaan tidak dapat diproses." };
  }

  const rawEmail = String(formData.get("email") ?? "");
  const rawPassword = String(formData.get("password") ?? "");

  const clientIp = await getClientIp();
  const rateKey = `login:${clientIp}:${rawEmail.trim().toLowerCase()}`;
  const limit = checkRateLimit(rateKey, 5, 15 * 60 * 1000);

  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    website: rawWebsite,
  });

  if (!parsed.success) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    await supabase.auth.signOut();
    return { error: "Email atau kata sandi tidak valid." };
  }

  resetRateLimit(rateKey);
  await recordAuditLog("ADMIN_LOGIN", "admin_users", data.user.id);

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await recordAuditLog("ADMIN_LOGOUT", "admin_users", user.id);
  }

  await supabase.auth.signOut();
  redirect("/admin/login");
}