"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowUpRight,
  FolderKanban,
  GitBranch,
  ImageIcon,
  Star,
} from "lucide-react";
import type { PublicProject } from "@/lib/queries/portfolio";
import { Reveal } from "@/components/portfolio/reveal";
import { ProjectCaseModal } from "@/components/portfolio/project-case-modal";
import {
  MOTION_EASE,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
} from "@/lib/constants/motion";

type ProjectsSectionProps = {
  projects: PublicProject[];
};

const FILTER_ALL = "__all__";
const FILTER_FEATURED = "__featured__";

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>(FILTER_ALL);
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(
    null
  );

  const filterOptions = useMemo(() => {
    const options: { key: string; label: string }[] = [
      { key: FILTER_ALL, label: "Semua" },
    ];

    const hasFeatured = projects.some((item) => item.is_featured);
    if (hasFeatured) {
      options.push({ key: FILTER_FEATURED, label: "Unggulan" });
    }

    const freq = new Map<string, { label: string; count: number }>();
    for (const project of projects) {
      for (const tech of project.tech_stack) {
        const key = tech.toLowerCase();
        const existing = freq.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          freq.set(key, { label: tech, count: 1 });
        }
      }
    }

    const topTechs = Array.from(freq.entries())
      .sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label))
      .slice(0, 4);

    for (const [key, entry] of topTechs) {
      options.push({ key, label: entry.label });
    }

    return options;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === FILTER_ALL) {
      return projects;
    }
    if (activeFilter === FILTER_FEATURED) {
      return projects.filter((item) => item.is_featured);
    }
    return projects.filter((item) =>
      item.tech_stack.some((tech) => tech.toLowerCase() === activeFilter)
    );
  }, [projects, activeFilter]);

  return (
    <section
      id="projects"
      className="scroll-mt-24 border-t border-line py-16 sm:py-20"
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent">
              <span>02</span>
              <span className="h-px w-5 bg-accent-line" />
              <span>PROYEK TERPILIH</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Karya &amp; Studi Kasus
            </h2>

            <p className="max-w-xl text-xs leading-relaxed text-ink-muted sm:text-sm">
              Kumpulan aplikasi dan sistem yang dibangun dengan perhatian pada
              performa, keamanan, dan kejelasan arsitektur.
            </p>
          </Reveal>

          {projects.length > 0 ? (
            <Reveal delay={0.08}>
              <LayoutGroup id="portfolio-project-filters">
                <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  {filterOptions.map((option) => {
                    const isActive = activeFilter === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setActiveFilter(option.key)}
                        className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                          isActive
                            ? "text-accent-foreground"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="projects-filter-pill"
                            transition={SPRING_SNAPPY}
                            className="absolute inset-0 rounded-lg bg-accent shadow-[0_1px_2px_rgba(37,99,235,0.25)]"
                          />
                        ) : null}
                        <span className="relative z-10">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </Reveal>
          ) : null}
        </div>

        {projects.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
                <FolderKanban className="h-5 w-5 text-ink-subtle" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                Belum ada proyek yang dipublikasikan
              </p>
              <p className="mt-1 max-w-xs text-xs text-ink-muted">
                Tambahkan proyek melalui menu Proyek di Dashboard Admin dan
                aktifkan status Publikasikan.
              </p>
            </div>
          </Reveal>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isSpotlight =
                  activeFilter === FILTER_ALL &&
                  index === 0 &&
                  project.is_featured &&
                  filteredProjects.length > 1;

                return (
                  <motion.article
                    key={project.id}
                    layout="position"
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.38,
                      delay: Math.min(index * 0.05, 0.2),
                      ease: MOTION_EASE,
                    }}
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedProject(project)}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-colors duration-200 hover:border-line-strong hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)] ${
                      isSpotlight ? "md:col-span-2 md:grid md:grid-cols-12" : ""
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden border-b border-line bg-canvas ${
                        isSpotlight
                          ? "aspect-16/10 md:col-span-7 md:aspect-auto md:min-h-72 md:border-r md:border-b-0"
                          : "aspect-16/10"
                      }`}
                    >
                      {project.thumbnail_url ? (
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          sizes={
                            isSpotlight
                              ? "(max-width: 768px) 100vw, 560px"
                              : "(max-width: 768px) 100vw, 480px"
                          }
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface-muted">
                          <ImageIcon className="h-7 w-7 text-ink-subtle" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="rounded-md border border-line bg-surface/90 px-2 py-0.5 font-mono text-[11px] font-medium text-ink backdrop-blur-sm">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {project.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-accent-line bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-accent backdrop-blur-sm">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>Unggulan</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className={`flex flex-1 flex-col justify-between p-5 sm:p-6 ${
                        isSpotlight ? "md:col-span-5" : ""
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-accent sm:text-lg">
                            {project.title}
                          </h3>
                          <p
                            className={`text-xs leading-relaxed text-ink-muted sm:text-sm ${
                              isSpotlight ? "line-clamp-3" : "line-clamp-2"
                            }`}
                          >
                            {project.summary}
                          </p>
                        </div>

                        {project.tech_stack.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.tech_stack.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] text-ink-muted"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.tech_stack.length > 4 ? (
                              <span className="rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] text-ink-subtle">
                                +{project.tech_stack.length - 4}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-ink transition-colors group-hover:text-accent">
                          <span>Detail Studi Kasus</span>
                          <motion.span
                            transition={SPRING_SMOOTH}
                            className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </motion.span>
                        </span>

                        <div
                          className="flex items-center gap-1.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {project.repo_url ? (
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Repository ${project.title}`}
                              title="Repository GitHub"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-canvas text-ink-muted transition-colors hover:border-line-strong hover:bg-surface hover:text-ink"
                            >
                              <GitBranch className="h-3.5 w-3.5" />
                            </a>
                          ) : null}

                          {project.live_url ? (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Live Demo ${project.title}`}
                              title="Kunjungi Live Demo"
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-accent-line bg-accent-soft px-2.5 text-[11px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <span>Demo</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProjectCaseModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}