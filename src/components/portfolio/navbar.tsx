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
  const [desktopHoveredId, setDesktopHoveredId] = useState<string | null>(null);
  const [mobileHoveredId, setMobileHoveredId] = useState<string | null>(null);

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
      setMobileHoveredId(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
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

          <LayoutGroup id="portfolio-desktop-nav">
            <nav
              aria-label="Navigasi utama"
              onMouseLeave={() => setDesktopHoveredId(null)}
              className="hidden items-center gap-1 md:flex"
            >
              {PORTFOLIO_NAV_ITEMS.map((item) => {
                const isActive = activeId === item.id;
                const isHovered = desktopHoveredId === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onMouseEnter={() => setDesktopHoveredId(item.id)}
                    onFocus={() => setDesktopHoveredId(item.id)}
                    onBlur={() => setDesktopHoveredId(null)}
                    onClick={() => setActiveId(item.id)}
                    className={`relative rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-accent"
                        : isHovered
                          ? "text-ink"
                          : "text-ink-muted"
                    }`}
                  >
                    {isHovered && !isActive ? (
                      <motion.span
                        layoutId="desktop-nav-hover"
                        transition={SPRING_SNAPPY}
                        className={`absolute inset-0 rounded-lg ${
                          scrolled
                            ? "bg-canvas"
                            : "bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        }`}
                      />
                    ) : null}

                    {isActive ? (
                      <motion.span
                        layoutId="desktop-nav-active"
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
              <motion.a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-canvas"
              >
                <FileText className="h-3.5 w-3.5 text-ink-muted" />
                <span>CV</span>
              </motion.a>
            ) : null}

            <motion.a
              href="#contact"
              onClick={() => setActiveId("contact")}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_SNAPPY}
              className={`group inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-colors duration-150 ${
                activeId === "contact"
                  ? "bg-accent-hover text-accent-foreground ring-2 ring-accent/25"
                  : "bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.22)] hover:bg-accent-hover"
              }`}
            >
              <span>Hubungi Saya</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-canvas md:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="mobile-nav-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: MOTION_EASE }}
              className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-[0_16px_40px_rgba(15,23,42,0.1)] md:hidden"
            >
              <div className="mx-auto max-w-5xl space-y-3 px-4 py-4 sm:px-6">
                <LayoutGroup id="portfolio-mobile-nav">
                  <nav
                    aria-label="Navigasi mobile"
                    onMouseLeave={() => setMobileHoveredId(null)}
                    className="space-y-1"
                  >
                    {PORTFOLIO_NAV_ITEMS.map((item) => {
                      const isActive = activeId === item.id;
                      const isHovered = mobileHoveredId === item.id;

                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          onMouseEnter={() => setMobileHoveredId(item.id)}
                          onFocus={() => setMobileHoveredId(item.id)}
                          onBlur={() => setMobileHoveredId(null)}
                          onClick={() => {
                            setActiveId(item.id);
                            setMobileOpen(false);
                          }}
                          className={`relative flex min-h-11 items-center justify-between rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 ${
                            isActive
                              ? "text-accent"
                              : isHovered
                                ? "text-ink"
                                : "text-ink-muted"
                          }`}
                        >
                          {isHovered && !isActive ? (
                            <motion.span
                              layoutId="mobile-nav-hover"
                              transition={SPRING_SNAPPY}
                              className="absolute inset-0 rounded-lg bg-canvas"
                            />
                          ) : null}

                          {isActive ? (
                            <motion.span
                              layoutId="mobile-nav-active"
                              transition={SPRING_SNAPPY}
                              className="absolute inset-0 rounded-lg border border-accent-line bg-accent-soft"
                            />
                          ) : null}

                          <span className="relative z-10">{item.label}</span>
                          {isActive ? (
                            <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-accent" />
                          ) : null}
                        </a>
                      );
                    })}
                  </nav>
                </LayoutGroup>

                <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row">
                  {cvUrl ? (
                    <motion.a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-canvas sm:flex-1"
                    >
                      <FileText className="h-4 w-4 text-ink-muted" />
                      <span>Lihat / Unduh CV</span>
                    </motion.a>
                  ) : null}

                  <motion.a
                    href="#contact"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => {
                      setActiveId("contact");
                      setMobileOpen(false);
                    }}
                    className={`group inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-medium transition-colors duration-150 sm:flex-1 ${
                      activeId === "contact"
                        ? "bg-accent-hover text-accent-foreground ring-2 ring-accent/25"
                        : "bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.22)] hover:bg-accent-hover"
                    }`}
                  >
                    <span>Hubungi Saya</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </motion.a>
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