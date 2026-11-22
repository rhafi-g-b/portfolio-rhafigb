"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Cpu,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Terminal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ADMIN_NAV_ITEMS,
  type AdminNavIcon,
} from "@/lib/constants/admin-nav";
import { logoutAction } from "@/actions/auth";

type SidebarNavProps = {
  email: string;
  role: string;
  brandName: string;
  unreadMessages: number;
  onNavigate?: () => void;
  onCloseMobile?: () => void;
};

const iconMap: Record<AdminNavIcon, LucideIcon> = {
  overview: LayoutDashboard,
  settings: Settings,
  projects: FolderKanban,
  experiences: Briefcase,
  skills: Cpu,
  messages: Mail,
  audit: ShieldCheck,
};

export function SidebarNav({
  email,
  role,
  brandName,
  unreadMessages,
  onNavigate,
  onCloseMobile,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-surface">
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.25)]">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              {brandName}
            </p>
            <p className="text-[11px] text-ink-subtle">Admin Workspace</p>
          </div>
        </Link>

        {onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "border border-accent-line bg-accent-soft font-medium text-accent shadow-[0_1px_2px_rgba(37,99,235,0.06)]"
                  : "border border-transparent text-ink-muted hover:bg-surface-muted hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? "text-accent"
                      : "text-ink-subtle group-hover:text-ink"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.icon === "messages" && unreadMessages > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-foreground">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3 space-y-2.5">
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="truncate text-xs font-medium text-ink">{email}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-subtle">{role}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </form>
      </div>
    </aside>
  );
}