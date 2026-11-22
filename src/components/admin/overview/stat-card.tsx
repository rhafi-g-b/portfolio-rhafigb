import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  detail: string;
  href: string;
};

export function StatCard({ label, value, detail, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-line-strong"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <ArrowUpRight className="h-4 w-4 text-ink-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight text-ink">
          {value}
        </p>
        <p className="mt-1 text-xs text-ink-subtle">{detail}</p>
      </div>
    </Link>
  );
}