"use client";

import { useState } from "react";
import { Clock, Lock, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export type AuditLogEntry = {
  id: string;
  admin_email: string;
  action: string;
  target_table: string;
  target_id: string | null;
  created_at: string;
};

type AuditLogsViewerProps = {
  logs: AuditLogEntry[];
};

const TABLE_FILTERS = [
  { value: "all", label: "Semua Tabel" },
  { value: "admin_users", label: "Autentikasi" },
  { value: "site_settings", label: "Pengaturan" },
  { value: "projects", label: "Proyek" },
  { value: "experiences", label: "Pengalaman" },
  { value: "skills", label: "Keahlian" },
  { value: "contact_messages", label: "Pesan" },
] as const;

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function getActionBadgeStyle(action: string) {
  if (action.startsWith("DELETE_")) {
    return "border-danger-line bg-danger-bg text-danger";
  }
  if (action.startsWith("CREATE_") || action.startsWith("UPLOAD_")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (
    action.startsWith("UPDATE_") ||
    action.startsWith("TOGGLE_") ||
    action.startsWith("MARK_")
  ) {
    return "border-accent-line bg-accent-soft text-accent";
  }
  return "border-line bg-canvas text-ink";
}

export function AuditLogsViewer({ logs }: AuditLogsViewerProps) {
  const [tableFilter, setTableFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (tableFilter !== "all" && log.target_table !== tableFilter) {
      return false;
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }

    return (
      log.action.toLowerCase().includes(q) ||
      log.target_table.toLowerCase().includes(q) ||
      log.admin_email.toLowerCase().includes(q) ||
      (log.target_id ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Audit Log Keamanan
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Catatan kronologis 100 aktivitas terbaru administrator di seluruh
            modul sistem.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-ink-muted">
          <Lock className="h-3 w-3 text-ink-subtle" />
          <span>Read-only · Tidak dapat diubah</span>
        </span>
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1">
            {TABLE_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTableFilter(item.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  tableFilter === item.value
                    ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="search"
              placeholder="Cari aksi, tabel, atau admin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
              <ShieldCheck className="h-5 w-5 text-ink-subtle" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              Tidak ada catatan log yang ditemukan
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              Coba pilih filter tabel lain atau ubah kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas/70 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-surface-muted/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${getActionBadgeStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-ink">
                          {log.target_table}
                        </span>
                        {log.target_id ? (
                          <span
                            title={log.target_id}
                            className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle"
                          >
                            {log.target_id.length > 12
                              ? `${log.target_id.slice(0, 8)}...`
                              : log.target_id}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {log.admin_email}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-[11px] text-ink-subtle">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(log.created_at)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}