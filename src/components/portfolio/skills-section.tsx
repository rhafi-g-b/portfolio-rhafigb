"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Blocks,
  Code2,
  Cpu,
  Database,
  Layers,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { PublicSkill } from "@/lib/queries/portfolio";
import {
  SKILL_CATEGORIES,
  type SkillCategory,
} from "@/lib/validators/skills";
import { Reveal } from "@/components/portfolio/reveal";
import {
  MOTION_EASE,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
} from "@/lib/constants/motion";

type SkillsSectionProps = {
  skills: PublicSkill[];
};

type CategoryFilter = "all" | SkillCategory;

const CATEGORY_META: Record<
  SkillCategory,
  { icon: LucideIcon; description: string }
> = {
  language: {
    icon: Code2,
    description: "Bahasa inti yang dipakai dalam pengembangan sehari-hari.",
  },
  framework: {
    icon: Blocks,
    description: "Ekosistem frontend, backend, dan library antarmuka.",
  },
  database: {
    icon: Database,
    description: "Penyimpanan data relasional, cache, dan layanan backend.",
  },
  tools: {
    icon: Wrench,
    description: "Alur kerja deployment, container, dan kontrol versi.",
  },
  other: {
    icon: Layers,
    description: "Keahlian pendukung arsitektur, desain sistem, dan kolaborasi.",
  },
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const populatedGroups = useMemo(() => {
    return SKILL_CATEGORIES.map((category) => ({
      ...category,
      items: skills.filter((item) => item.category === category.value),
    })).filter((group) => group.items.length > 0);
  }, [skills]);

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") {
      return populatedGroups;
    }
    return populatedGroups.filter((group) => group.value === activeCategory);
  }, [populatedGroups, activeCategory]);

  return (
    <section
      id="skills"
      className="scroll-mt-24 border-t border-line py-16 sm:py-20"
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent">
              <span>04</span>
              <span className="h-px w-5 bg-accent-line" />
              <span>KEAHLIAN</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Tech Stack &amp; Perkakas
            </h2>

            <p className="max-w-xl text-xs leading-relaxed text-ink-muted sm:text-sm">
              Teknologi yang digunakan untuk merancang antarmuka, membangun API,
              dan menjaga kestabilan sistem di lingkungan produksi.
            </p>
          </Reveal>

          {populatedGroups.length > 1 ? (
            <Reveal delay={0.08}>
              <LayoutGroup id="portfolio-skill-filters">
                <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      activeCategory === "all"
                        ? "text-accent-foreground"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {activeCategory === "all" ? (
                      <motion.span
                        layoutId="skills-filter-pill"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-lg bg-accent shadow-[0_1px_2px_rgba(37,99,235,0.25)]"
                      />
                    ) : null}
                    <span className="relative z-10">Semua</span>
                  </button>

                  {populatedGroups.map((group) => {
                    const isActive = activeCategory === group.value;
                    return (
                      <button
                        key={group.value}
                        type="button"
                        onClick={() => setActiveCategory(group.value)}
                        className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                          isActive
                            ? "text-accent-foreground"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="skills-filter-pill"
                            transition={SPRING_SNAPPY}
                            className="absolute inset-0 rounded-lg bg-accent shadow-[0_1px_2px_rgba(37,99,235,0.25)]"
                          />
                        ) : null}
                        <span className="relative z-10">{group.label}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </Reveal>
          ) : null}
        </div>

        {populatedGroups.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
                <Cpu className="h-5 w-5 text-ink-subtle" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                Belum ada keahlian yang tercatat
              </p>
              <p className="mt-1 max-w-xs text-xs text-ink-muted">
                Tambahkan daftar tech stack melalui menu Keahlian di Dashboard
                Admin untuk menampilkannya di sini.
              </p>
            </div>
          </Reveal>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {visibleGroups.map((group, groupIndex) => {
                const meta = CATEGORY_META[group.value];
                const Icon = meta.icon;
                const isSingleCard = visibleGroups.length === 1;
                const isLastOddCard =
                  !isSingleCard &&
                  visibleGroups.length % 2 === 1 &&
                  groupIndex === visibleGroups.length - 1;

                return (
                  <motion.article
                    key={group.value}
                    layout="position"
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.36,
                      delay: Math.min(groupIndex * 0.05, 0.2),
                      ease: MOTION_EASE,
                    }}
                    whileHover={{ y: -2 }}
                    className={`group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-colors duration-200 hover:border-line-strong hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6 ${
                      isSingleCard || isLastOddCard ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink-muted transition-colors duration-200 group-hover:border-accent-line group-hover:bg-accent-soft group-hover:text-accent">
                            <Icon className="h-4 w-4" />
                          </span>

                          <div className="space-y-0.5">
                            <h3 className="text-sm font-semibold tracking-tight text-ink">
                              {group.label}
                            </h3>
                            <p className="text-xs text-ink-subtle">
                              {meta.description}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] font-medium text-ink-muted">
                          {String(group.items.length).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                        {group.items.map((skill, skillIndex) => (
                          <motion.span
                            key={skill.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(skillIndex * 0.025, 0.25),
                              ease: MOTION_EASE,
                            }}
                            whileHover={{ y: -2 }}
                            className="group/chip inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-150 hover:border-accent-line hover:bg-accent-soft hover:text-accent"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-line-strong transition-colors duration-150 group-hover/chip:bg-accent" />
                            <span>{skill.name}</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
                        {group.value}
                      </span>
                      <motion.span
                        transition={SPRING_SMOOTH}
                        className="h-1 w-6 rounded-full bg-line transition-all duration-200 group-hover:w-10 group-hover:bg-accent"
                      />
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}