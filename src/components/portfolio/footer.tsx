"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { PORTFOLIO_NAV_ITEMS } from "@/lib/constants/portfolio-nav";
import { SPRING_SNAPPY } from "@/lib/constants/motion";

type PortfolioFooterProps = {
  brandName: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  cvUrl: string | null;
  year: number;
};

export function PortfolioFooter({
  brandName,
  githubUrl,
  linkedinUrl,
  cvUrl,
  year,
}: PortfolioFooterProps) {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
            >
              <span className="font-mono text-xs text-accent">/</span>
              <span>{brandName}</span>
            </Link>
            <p className="text-xs text-ink-muted">
              &copy; {year} {brandName}. Seluruh hak cipta dilindungi.
            </p>
          </div>

          <nav
            aria-label="Navigasi footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {PORTFOLIO_NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Kontak
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <span>GitHub</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}

            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}

            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <span>CV</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : null}

            <motion.button
              type="button"
              onClick={handleBackToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              transition={SPRING_SNAPPY}
              aria-label="Kembali ke atas"
              title="Kembali ke atas"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:border-accent-line hover:bg-accent-soft hover:text-accent cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}