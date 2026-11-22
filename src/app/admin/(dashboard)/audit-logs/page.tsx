import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AuditLogsViewer,
  type AuditLogEntry,
} from "@/components/admin/audit/audit-logs-viewer";

async function AuditLogsContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: rawLogs }, { data: admins }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("id, admin_id, action, target_table, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("admin_users").select("user_id, email"),
  ]);

  const adminEmailMap = new Map<string, string>(
    (admins ?? []).map((admin) => [admin.user_id, admin.email])
  );

  const logs: AuditLogEntry[] = (rawLogs ?? []).map((log) => ({
    id: log.id,
    admin_email: adminEmailMap.get(log.admin_id) ?? "Admin",
    action: log.action,
    target_table: log.target_table,
    target_id: log.target_id,
    created_at: log.created_at,
  }));

  return <AuditLogsViewer logs={logs} />;
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat audit log keamanan...
        </div>
      }
    >
      <AuditLogsContent />
    </Suspense>
  );
}