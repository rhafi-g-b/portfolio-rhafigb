"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, FileText, Menu, X } from "lucide-react";
import { PORTFOLIO_NAV_ITEMS } from "@/lib/constants/portfolio-nav";
import { MOTION_EASE, SPRING_SNAPPY } from "@/lib/constants/motion";

type PortfolioNavbarProps = {
  brandName: string;
  cvUrl: string | null;
};

export function PortfolioNavbar({ brandName, cvUrl }: PortfolioNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
    if (latest < 120) {
      setActiveId("");
    }
  });

  useEffect(() => {
    const sectionIds = [...PORTFOLIO_NAV_ITEMS.map((item) => item.id), "contact"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
          scrolled || mobileOpen
            ? "border-line bg-surface/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-md"
            : "border-transparent bg-canvas/85 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            onClick={() => {
              setActiveId("");
              setMobileOpen(false);
            }}
            className="inline-flex items-center rounded-md py-1 text-sm font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            {brandName}
          </Link>

          <LayoutGroup id="portfolio-clean-nav">
            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-1 md:flex"
            >
              {PORTFOLIO_NAV_ITEMS.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveId(item.id)}
                    className={`relative rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-accent"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="navbar-active-bg"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-lg border border-accent-line bg-accent-soft"
                      />
                    ) : null}
                    <span className="relative z-10">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="hidden items-center gap-2 md:flex">
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted active:scale-[0.98]"
              >
                <FileText className="h-3.5 w-3.5 text-ink-muted" />
                <span>CV</span>
              </a>
            ) : null}

            <a
              href="#contact"
              onClick={() => setActiveId("contact")}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                activeId === "contact"
                  ? "bg-accent-hover text-accent-foreground ring-2 ring-accent/25"
                  : "bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.22)] hover:bg-accent-hover"
              }`}
            >
              <span>Hubungi Saya</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-surface-muted md:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: MOTION_EASE }}
              className="overflow-hidden border-t border-line bg-surface md:hidden"
            >
              <div className="mx-auto max-w-5xl space-y-3 px-4 py-4 sm:px-6">
                <nav aria-label="Navigasi mobile" className="space-y-1">
                  {PORTFOLIO_NAV_ITEMS.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setActiveId(item.id);
                          setMobileOpen(false);
                        }}
                        className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                          isActive
                            ? "border border-accent-line bg-accent-soft text-accent"
                            : "text-ink-muted hover:bg-canvas hover:text-ink"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        ) : null}
                      </a>
                    );
                  })}
                </nav>

                <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row">
                  {cvUrl ? (
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-xs font-medium text-ink transition-colors hover:bg-surface-muted"
                    >
                      <FileText className="h-4 w-4 text-ink-muted" />
                      <span>Lihat / Unduh CV</span>
                    </a>
                  ) : null}

                  <a
                    href="#contact"
                    onClick={() => {
                      setActiveId("contact");
                      setMobileOpen(false);
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                  >
                    <span>Hubungi Saya</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Tutup menu navigasi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-ink/25 backdrop-blur-[1px] md:hidden cursor-pointer"
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}