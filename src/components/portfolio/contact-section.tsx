"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Mail,
  Send,
} from "lucide-react";
import {
  submitContactMessageAction,
  type ContactActionState,
} from "@/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/portfolio/reveal";
import { MOTION_EASE, SPRING_SNAPPY } from "@/lib/constants/motion";

type ContactSectionProps = {
  contactEmail: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  cvUrl: string | null;
};

const initialState: ContactActionState = {
  status: "idle",
  message: null,
};

export function ContactSection({
  contactEmail,
  githubUrl,
  linkedinUrl,
  cvUrl,
}: ContactSectionProps) {
  const [state, formAction, isPending] = useActionState(
    submitContactMessageAction,
    initialState
  );

  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const lastTsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      state.timestamp &&
      state.timestamp !== lastTsRef.current &&
      state.status === "success"
    ) {
      lastTsRef.current = state.timestamp;
      setSubmitted(true);
      setValues({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  }, [state]);

  const fieldError = (key: string) =>
    submitted ? undefined : state.fieldErrors?.[key];

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

  const hasContactChannels = Boolean(
    contactEmail || githubUrl || linkedinUrl || cvUrl
  );

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-line py-16 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="space-y-6 lg:col-span-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-medium text-accent">
              <span>05</span>
              <span className="h-px w-5 bg-accent-line" />
              <span>KONTAK</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Mari Diskusikan Proyek Anda
            </h2>

            <p className="text-xs leading-relaxed text-ink-muted sm:text-sm">
              Terbuka untuk kolaborasi produk, pengembangan aplikasi web, atau
              peluang kerja penuh waktu. Kirim pesan singkat lewat formulir di
              samping atau langsung via email.
            </p>
          </div>

          {hasContactChannels ? (
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
              {contactEmail ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-ink-subtle">
                    Email Langsung
                  </p>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5">
                    <a
                      href={`mailto:${encodeURIComponent(contactEmail)}`}
                      className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink transition-colors hover:text-accent"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                      <span className="truncate">{contactEmail}</span>
                    </a>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={handleCopyEmail}
                      aria-label="Salin alamat email"
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[11px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : null}

              {githubUrl || linkedinUrl || cvUrl ? (
                <div
                  className={`flex flex-wrap items-center gap-2 ${
                    contactEmail ? "border-t border-line pt-4" : ""
                  }`}
                >
                  {githubUrl ? (
                    <motion.a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-ink-muted" />
                    </motion.a>
                  ) : null}

                  {linkedinUrl ? (
                    <motion.a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <span>LinkedIn</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-ink-muted" />
                    </motion.a>
                  ) : null}

                  {cvUrl ? (
                    <motion.a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <FileText className="h-3.5 w-3.5 text-ink-muted" />
                      <span>Unduh CV</span>
                    </motion.a>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.32, ease: MOTION_EASE }}
                  className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
                    Pesan Berhasil Terkirim
                  </h3>

                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink-muted sm:text-sm">
                    {state.message ??
                      "Terima kasih telah menghubungi. Pesan Anda sudah diterima dan akan segera dibalas."}
                  </p>

                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex h-9 items-center justify-center rounded-lg border border-line bg-canvas px-4 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted cursor-pointer"
                  >
                    Kirim Pesan Lain
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  action={formAction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 sm:p-7 space-y-4"
                >
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="contact_website">Website</label>
                    <input
                      id="contact_website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {state.status === "error" && state.message ? (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-3 text-xs text-danger"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{state.message}</span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_name"
                        className="block text-xs font-medium text-ink"
                      >
                        Nama Lengkap
                      </label>
                      <Input
                        id="contact_name"
                        name="name"
                        required
                        maxLength={100}
                        placeholder="Nama Anda"
                        value={values.name}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        hasError={Boolean(fieldError("name"))}
                        disabled={isPending}
                      />
                      {fieldError("name") ? (
                        <p className="text-[11px] text-danger">
                          {fieldError("name")}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_email"
                        className="block text-xs font-medium text-ink"
                      >
                        Alamat Email
                      </label>
                      <Input
                        id="contact_email"
                        name="email"
                        type="email"
                        required
                        maxLength={120}
                        placeholder="nama@perusahaan.com"
                        value={values.email}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        hasError={Boolean(fieldError("email"))}
                        disabled={isPending}
                      />
                      {fieldError("email") ? (
                        <p className="text-[11px] text-danger">
                          {fieldError("email")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact_subject"
                      className="block text-xs font-medium text-ink"
                    >
                      Subjek
                    </label>
                    <Input
                      id="contact_subject"
                      name="subject"
                      required
                      maxLength={150}
                      placeholder="Contoh: Kolaborasi Pengembangan Web App"
                      value={values.subject}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      hasError={Boolean(fieldError("subject"))}
                      disabled={isPending}
                    />
                    {fieldError("subject") ? (
                      <p className="text-[11px] text-danger">
                        {fieldError("subject")}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="contact_message"
                        className="block text-xs font-medium text-ink"
                      >
                        Pesan
                      </label>
                      <span className="font-mono text-[11px] text-ink-subtle">
                        {values.message.length}/2000
                      </span>
                    </div>
                    <Textarea
                      id="contact_message"
                      name="message"
                      required
                      rows={5}
                      maxLength={2000}
                      placeholder="Ceritakan singkat kebutuhan proyek, linimasa, atau topik yang ingin didiskusikan."
                      value={values.message}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      hasError={Boolean(fieldError("message"))}
                      disabled={isPending}
                    />
                    {fieldError("message") ? (
                      <p className="text-[11px] text-danger">
                        {fieldError("message")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-ink-subtle">
                      Pesan dikirim aman langsung ke kotak masuk pribadi.
                    </p>

                    <motion.button
                      type="submit"
                      disabled={isPending}
                      onMouseEnter={() => setSubmitHovered(true)}
                      onMouseLeave={() => setSubmitHovered(false)}
                      whileHover={isPending ? undefined : { y: -1 }}
                      whileTap={isPending ? undefined : { scale: 0.98 }}
                      transition={SPRING_SNAPPY}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-xs font-medium text-accent-foreground shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      <span>{isPending ? "Mengirim..." : "Kirim Pesan"}</span>
                      <motion.span
                        animate={{
                          x: submitHovered && !isPending ? 2 : 0,
                          y: submitHovered && !isPending ? -1 : 0,
                        }}
                        transition={{ duration: 0.2, ease: MOTION_EASE }}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}