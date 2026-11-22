"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, GitBranch, Layers, Star, X } from "lucide-react";
import type { PublicProject } from "@/lib/queries/portfolio";
import { MOTION_EASE, SPRING_SNAPPY } from "@/lib/constants/motion";

type ProjectCaseModalProps = {
  project: PublicProject | null;
  onClose: () => void;
};

export function ProjectCaseModal({ project, onClose }: ProjectCaseModalProps) {
  useEffect(() => {
    if (!project) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  const paragraphs = (project?.description ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return (
    <AnimatePresence>
      {project ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Tutup detail studi kasus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/45 backdrop-blur-[2px] cursor-pointer"
          />

          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: MOTION_EASE }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-subtle">
                    /{project.slug}
                  </span>
                  {project.is_featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>Unggulan</span>
                    </span>
                  ) : null}
                </div>

                <h3
                  id="project-modal-title"
                  className="text-lg font-semibold tracking-tight text-ink sm:text-xl"
                >
                  {project.title}
                </h3>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                aria-label="Tutup modal"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {project.thumbnail_url ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-canvas">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="rounded-xl border border-line bg-canvas p-4">
                <p className="text-xs font-medium text-ink-subtle">Ringkasan</p>
                <p className="mt-1.5 text-sm leading-relaxed font-medium text-ink">
                  {project.summary}
                </p>
              </div>

              {paragraphs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                    Studi Kasus &amp; Detail Teknis
                  </p>
                  <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {project.tech_stack.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-xs text-ink"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/80 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-ink-muted transition-colors hover:text-ink cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {project.repo_url ? (
                  <motion.a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SNAPPY}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-ink-muted" />
                    <span>Repository</span>
                  </motion.a>
                ) : null}

                {project.live_url ? (
                  <motion.a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SNAPPY}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground shadow-[0_1px_2px_rgba(37,99,235,0.25)] transition-colors hover:bg-accent-hover"
                  >
                    <span>Kunjungi Live Demo</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </motion.a>
                ) : null}
              </div>
            </div>
          </motion.article>
        </div>
      ) : null}
    </AnimatePresence>
  );
}