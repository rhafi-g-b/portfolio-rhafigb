import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  Cpu,
  FolderKanban,
  Mail,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function OverviewContent() {
  await connection();
  const session = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalProjects },
    { count: publishedProjects },
    { count: totalExperiences },
    { count: totalSkills },
    { count: unreadMessages },
    { data: recentMessages },
    { data: recentLogs },
    { data: settings },
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("experiences").select("id", { count: "exact", head: true }),
    supabase.from("skills").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("contact_messages")
      .select("id, name, subject, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_logs")
      .select("id, action, target_table, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("site_settings")
      .select("brand_name")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const statCards = [
    {
      label: "Proyek Publik",
      value: `${publishedProjects ?? 0} / ${totalProjects ?? 0}`,
      hint: "Dipublikasikan dari total proyek",
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Pengalaman",
      value: String(totalExperiences ?? 0),
      hint: "Riwayat karier tercatat",
      href: "/admin/experiences",
      icon: Briefcase,
    },
    {
      label: "Keahlian",
      value: String(totalSkills ?? 0),
      hint: "Item tech stack aktif",
      href: "/admin/skills",
      icon: Cpu,
    },
    {
      label: "Pesan Belum Dibaca",
      value: String(unreadMessages ?? 0),
      hint: "Menunggu tinjauan di inbox",
      href: "/admin/messages",
      icon: Mail,
      highlight: (unreadMessages ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Ringkasan {settings?.brand_name || "Workspace"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Masuk sebagai <span className="font-medium text-ink">{session.email}</span>. Pantau konten portofolio dan aktivitas terbaru di sini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/settings"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
          >
            <Settings className="h-3.5 w-3.5 text-ink-muted" />
            <span>Pengaturan</span>
          </Link>

          <Link
            href="/admin/projects"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.22)] transition-colors hover:bg-accent-hover"
          >
            <span>Kelola Proyek</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-line-strong"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  {card.label}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    card.highlight
                      ? "border-accent-line bg-accent-soft text-accent"
                      : "border-line bg-canvas text-ink-muted group-hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] text-ink-subtle">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Pesan Masuk Terbaru
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs font-medium text-accent hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {!recentMessages || recentMessages.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-ink-muted">
              Belum ada pesan masuk.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentMessages.map((msg) => (
                <li
                  key={msg.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!msg.is_read ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      ) : null}
                      <p className="truncate text-xs font-medium text-ink">
                        {msg.name}
                      </p>
                    </div>
                    <p className="truncate text-[11px] text-ink-muted">
                      {msg.subject || "Tanpa Subjek"}
                    </p>
                  </div>

                  <span className="shrink-0 text-[11px] text-ink-subtle">
                    {formatShortDate(msg.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-ink-subtle" />
              <h2 className="text-sm font-semibold tracking-tight text-ink">
                Aktivitas Audit Terbaru
              </h2>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-medium text-accent hover:underline"
            >
              Lihat log
            </Link>
          </div>

          {!recentLogs || recentLogs.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-ink-muted">
              Belum ada aktivitas tercatat.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate font-mono text-[11px] font-medium text-ink">
                      {log.action}
                    </p>
                    <p className="font-mono text-[11px] text-ink-subtle">
                      {log.target_table}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-ink-subtle">
                    <Clock className="h-3 w-3" />
                    <span>{formatShortDate(log.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat ringkasan dashboard...
        </div>
      }
    >
      <OverviewContent />
    </Suspense>
  );
}