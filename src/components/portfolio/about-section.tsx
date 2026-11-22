"use client";

import { motion } from "framer-motion";
import type { PublicPortfolioStats } from "@/lib/queries/portfolio";
import { Reveal } from "@/components/portfolio/reveal";
import { SPRING_SNAPPY } from "@/lib/constants/motion";

type AboutSectionProps = {
  aboutBio: string;
  stats: PublicPortfolioStats;
};

export function AboutSection({ aboutBio, stats }: AboutSectionProps) {
  const paragraphs = aboutBio
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const metricItems = [
    {
      label: "Proyek Publik",
      value: stats.publishedProjects,
      href: "#projects",
    },
    {
      label: "Pengalaman",
      value: stats.totalExperiences,
      href: "#experiences",
    },
    {
      label: "Tech Stack",
      value: stats.totalSkills,
      href: "#skills",
    },
  ];

  return (
    <section
      id="about"
      className="scroll-mt-24 border-t border-line py-16 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="space-y-3 lg:col-span-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent">
            <span>01</span>
            <span className="h-px w-5 bg-accent-line" />
            <span>TENTANG</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Latar Belakang &amp; Pendekatan Kerja
          </h2>

          <p className="text-xs leading-relaxed text-ink-muted">
            Ringkasan fokus pengembangan, prinsip rekayasa perangkat lunak, dan
            rekam jejak karya.
          </p>
        </Reveal>

        <div className="space-y-6 lg:col-span-8">
          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-8">
              {paragraphs.length > 0 ? (
                <div className="space-y-4 text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className={`whitespace-pre-line ${
                        index === 0 ? "font-medium text-ink" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-ink-muted">
                  Belum ada bio yang diisi. Perbarui bagian Tentang / Bio
                  Lengkap melalui menu Pengaturan di Dashboard Admin.
                </p>
              )}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metricItems.map((item, index) => (
              <Reveal key={item.label} delay={0.12 + index * 0.06}>
                <motion.a
                  href={item.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={SPRING_SNAPPY}
                  className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-accent-line"
                >
                  <span className="text-xs font-medium text-ink-muted group-hover:text-accent">
                    {item.label}
                  </span>
                  <span className="mt-2 font-mono text-2xl font-semibold tracking-tight text-ink">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}