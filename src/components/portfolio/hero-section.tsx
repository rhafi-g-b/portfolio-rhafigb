"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Check, Copy, FileText } from "lucide-react";
import {
  MOTION_EASE,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
} from "@/lib/constants/motion";

type HeroSectionProps = {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  cvUrl: string | null;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: MOTION_EASE },
  },
};

export function HeroSection({
  brandName,
  heroTitle,
  heroSubtitle,
  contactEmail,
  githubUrl,
  linkedinUrl,
  avatarUrl,
  cvUrl,
}: HeroSectionProps) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayTitle =
    heroTitle.trim() ||
    "Merancang dan membangun produk web yang cepat, aman, dan terukur.";
  const displaySubtitle =
    heroSubtitle.trim() ||
    "Developer dengan fokus pada arsitektur bersih, antarmuka yang tenang, dan kualitas kode siap produksi.";

  const initials = brandName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleCopyEmail = async () => {
    if (!contactEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="pt-8 pb-16 sm:pt-14 sm:pb-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-7 lg:col-span-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent"
          >
            <span>/</span>
            <span className="uppercase tracking-wider">{brandName}</span>
          </motion.div>

          <div className="space-y-4">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.1, ease: MOTION_EASE }}
                className="text-3xl leading-[1.12] font-semibold tracking-tight text-ink sm:text-5xl"
              >
                {displayTitle}
              </motion.h1>
            </div>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg"
            >
              {displaySubtitle}
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <motion.a
              href="#projects"
              onMouseEnter={() => setPrimaryHovered(true)}
              onMouseLeave={() => setPrimaryHovered(false)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_SNAPPY}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-colors hover:bg-accent-hover"
            >
              <span>Lihat Proyek</span>
              <span className="relative h-4 w-4 overflow-hidden">
                <motion.span
                  animate={{
                    x: primaryHovered ? 16 : 0,
                    y: primaryHovered ? 16 : 0,
                  }}
                  transition={{ duration: 0.25, ease: MOTION_EASE }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ArrowDownRight className="h-4 w-4" />
                </motion.span>
                <motion.span
                  animate={{
                    x: primaryHovered ? 0 : -16,
                    y: primaryHovered ? 0 : -16,
                  }}
                  transition={{ duration: 0.25, ease: MOTION_EASE }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ArrowDownRight className="h-4 w-4" />
                </motion.span>
              </span>
            </motion.a>

            {cvUrl ? (
              <motion.a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-line-strong hover:bg-surface-muted"
              >
                <FileText className="h-4 w-4 text-ink-muted" />
                <span>Unduh CV</span>
              </motion.a>
            ) : null}

            {contactEmail ? (
              <motion.button
                type="button"
                onClick={handleCopyEmail}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink-muted shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-line-strong hover:text-ink cursor-pointer"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: MOTION_EASE }}
                      className="inline-flex items-center gap-1.5 text-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      <span>Email Tersalin</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: MOTION_EASE }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{contactEmail}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : null}
          </motion.div>

          {githubUrl || linkedinUrl ? (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-5 border-t border-line pt-5"
            >
              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ) : null}

              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ) : null}
            </motion.div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.18, ease: MOTION_EASE }}
          className="lg:col-span-4"
        >
          <motion.div
            whileHover={{ y: -3 }}
            transition={SPRING_SMOOTH}
            className="overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
          >
            <div className="group relative aspect-4/5 w-full overflow-hidden rounded-xl border border-line bg-canvas">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`Foto profil ${brandName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-muted p-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-line bg-accent-soft font-mono text-xl font-semibold text-accent">
                    {initials || "DEV"}
                  </span>
                  <p className="text-xs text-ink-subtle">
                    Unggah foto profil melalui Pengaturan Admin
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}