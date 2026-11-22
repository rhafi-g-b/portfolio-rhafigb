import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/layout/admin-shell";

export const metadata: Metadata = {
  title: "Admin Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

type DashboardLayoutProps = {
  children: ReactNode;
};

async function AuthenticatedShell({ children }: DashboardLayoutProps) {
  await connection();
  const session = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: settings }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("brand_name")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  return (
    <AdminShell
      email={session.email}
      role={session.role}
      brandName={settings?.brand_name || "Portfolio"}
      unreadMessages={unreadCount ?? 0}
    >
      {children}
    </AdminShell>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-xs text-ink-muted">
          Memuat workspace...
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}