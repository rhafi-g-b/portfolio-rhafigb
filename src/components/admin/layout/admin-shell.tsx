"use client";

import { useState, type ReactNode } from "react";
import { SidebarNav } from "@/components/admin/layout/sidebar-nav";
import { Topbar } from "@/components/admin/layout/topbar";
import { ToastProvider } from "@/components/ui/toast";

type AdminShellProps = {
  email: string;
  role: string;
  brandName: string;
  unreadMessages: number;
  children: ReactNode;
};

export function AdminShell({
  email,
  role,
  brandName,
  unreadMessages,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas text-ink">
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
          <SidebarNav
            email={email}
            role={role}
            brandName={brandName}
            unreadMessages={unreadMessages}
          />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              aria-label="Tutup latar belakang menu"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-ink/30 backdrop-blur-[1px]"
            />
            <div className="relative z-10 flex h-full">
              <SidebarNav
                email={email}
                role={role}
                brandName={brandName}
                unreadMessages={unreadMessages}
                onNavigate={() => setMobileOpen(false)}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}