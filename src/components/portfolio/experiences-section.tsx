"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import type { PublicExperience } from "@/lib/queries/portfolio";
import { Reveal } from "@/components/portfolio/reveal";
import { MOTION_EASE, SPRING_SMOOTH } from "@/lib/constants/motion";

type ExperiencesSectionProps = {
  experiences: PublicExperience[];
};

function parseDescriptionLines(description: string): string[] {
  return description
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function ExperienceTimeline({
  experiences,
}: {
  experiences: PublicExperience[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 65%"],
  });

  const lineScaleY = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative pl-8 sm:pl-10">
      <div
        aria-hidden="true"
        className="absolute top-3 bottom-3 left-3 w-0.5 rounded-full bg-line"
      />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: lineScaleY }}
        className="absolute top-3 bottom-3 left-3 w-0.5 origin-top rounded-full bg-accent"
      />

      <ol className="space-y-5">
        {experiences.map((item, index) => {
          const lines = parseDescriptionLines(item.description);

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: Math.min(index * 0.06, 0.24),
                ease: MOTION_EASE,
              }}
              className="group relative"
            >
              <span
                aria-hidden="true"
                className={`absolute top-6 -left-6.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-colors duration-200 sm:-left-8.5 ${
                  item.is_current
                    ? "border-accent bg-accent shadow-[0_0_0_4px_rgba(37,99,235,0.14)]"
                    : "border-line-strong bg-surface group-hover:border-accent"
                }`}
              >
                {item.is_current ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />
                ) : null}
              </span>

              <motion.article
                whileHover={{ x: 4 }}
                transition={SPRING_SMOOTH}
                className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-colors duration-200 group-hover:border-line-strong group-hover:shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight text-ink">
                        {item.role}
                      </h3>
                      {item.is_current ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          <span>Saat ini</span>
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm font-medium text-ink-muted">
                      {item.company}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle sm:flex-col sm:items-end sm:gap-1">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
                      <Calendar className="h-3 w-3 text-ink-subtle" />
                      <span>
                        {item.start_date} —{" "}
                        {item.is_current ? "Sekarang" : item.end_date}
                      </span>
                    </span>

                    {item.location ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-subtle">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                {lines.length > 0 ? (
                  <div className="mt-4 border-t border-line pt-4">
                    {lines.length === 1 ? (
                      <p className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                        {lines[0]}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {lines.map((line, lineIndex) => (
                          <li
                            key={lineIndex}
                            className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-muted sm:text-sm"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </motion.article>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export function ExperiencesSection({ experiences }: ExperiencesSectionProps) {
  const activeRole = experiences.find((item) => item.is_current) ?? null;

  return (
    <section
      id="experiences"
      className="scroll-mt-24 border-t border-line py-16 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <Reveal className="space-y-4 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent">
              <span>03</span>
              <span className="h-px w-5 bg-accent-line" />
              <span>PENGALAMAN</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Rekam Jejak &amp; Karier
            </h2>

            <p className="text-xs leading-relaxed text-ink-muted sm:text-sm">
              Perjalanan profesional, tanggung jawab teknis, dan kontribusi
              utama di setiap tim.
            </p>

            {experiences.length > 0 ? (
              <div className="rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Total Riwayat</span>
                  <span className="font-mono font-semibold text-ink">
                    {String(experiences.length).padStart(2, "0")} Peran
                  </span>
                </div>

                {activeRole ? (
                  <div className="border-t border-line pt-2.5">
                    <p className="text-[11px] text-ink-subtle">Peran Aktif</p>
                    <p className="mt-0.5 text-xs font-medium text-ink">
                      {activeRole.role}
                    </p>
                    <p className="text-[11px] text-accent">
                      {activeRole.company}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          {experiences.length === 0 ? (
            <Reveal>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
                  <Briefcase className="h-5 w-5 text-ink-subtle" />
                </div>
                <p className="mt-3 text-sm font-medium text-ink">
                  Belum ada riwayat pengalaman
                </p>
                <p className="mt-1 max-w-xs text-xs text-ink-muted">
                  Tambahkan pengalaman kerja melalui menu Pengalaman di
                  Dashboard Admin untuk menampilkannya di sini.
                </p>
              </div>
            </Reveal>
          ) : (
            <ExperienceTimeline experiences={experiences} />
          )}
        </div>
      </div>
    </section>
  );
}