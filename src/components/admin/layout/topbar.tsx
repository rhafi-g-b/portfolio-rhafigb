"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/admin-nav";

type TopbarProps = {
  onOpenMobileMenu: () => void;
};

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const pathname = usePathname();

  const activeItem =
    ADMIN_NAV_ITEMS.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
    ) ?? ADMIN_NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink lg:hidden cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-ink">
            {activeItem.label}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-muted hover:border-line-strong"
        >
          <span>Lihat Situs</span>
          <ExternalLink className="h-3.5 w-3.5 text-ink-muted" />
        </Link>
      </div>
    </header>
  );
}