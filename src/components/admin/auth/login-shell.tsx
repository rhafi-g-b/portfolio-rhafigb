import type { ReactNode } from "react";
import { ShieldCheck, Terminal } from "lucide-react";

type LoginShellProps = {
  children: ReactNode;
};

export function LoginShell({ children }: LoginShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-100 space-y-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Terminal className="h-5 w-5 text-ink" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              Admin Workspace
            </h1>
            <p className="text-sm text-ink-muted">
              Masuk untuk mengelola konten dan pengaturan portofolio.
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] sm:p-7">
          {children}
        </section>

        <div className="flex items-center justify-center gap-2 text-xs text-ink-subtle">
          <ShieldCheck className="h-3.5 w-3.5 text-ink-muted" />
          <span>Akses terbatas hanya untuk administrator terverifikasi</span>
        </div>
      </div>
    </main>
  );
}