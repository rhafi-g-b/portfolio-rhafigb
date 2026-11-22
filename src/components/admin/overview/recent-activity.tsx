import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";

export type AuditLogItem = {
  id: string;
  action: string;
  target_table: string;
  created_at: string;
};

type RecentActivityProps = {
  logs: AuditLogItem[];
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-ink-muted" />
          <h3 className="text-sm font-semibold tracking-tight text-ink">
            Aktivitas Keamanan Terbaru
          </h3>
        </div>
        <Link
          href="/admin/audit-logs"
          className="text-xs font-medium text-ink-muted hover:text-ink"
        >
          Lihat semua
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-ink-subtle">
          Belum ada catatan aktivitas.
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink">
                  {log.action}
                </span>
                <span className="text-xs text-ink-muted">
                  pada tabel{" "}
                  <span className="font-mono text-ink">{log.target_table}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle">
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(log.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}