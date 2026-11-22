"use client";

import { useEffect } from "react";
import { Clock, Mail, MailOpen, Reply, Trash2, X } from "lucide-react";
import type { ContactMessageRecord } from "@/lib/validators/messages";
import { Button } from "@/components/ui/button";

type MessageDetailDrawerProps = {
  message: ContactMessageRecord;
  isBusy: boolean;
  onClose: () => void;
  onToggleRead: (message: ContactMessageRecord) => void;
  onRequestDelete: (message: ContactMessageRecord) => void;
};

function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageDetailDrawer({
  message,
  isBusy,
  onClose,
  onToggleRead,
  onRequestDelete,
}: MessageDetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, onClose]);

  const replySubject = message.subject
    ? `Re: ${message.subject}`
    : "Balasan Pesan Portofolio";
  const mailtoHref = `mailto:${encodeURIComponent(
    message.email
  )}?subject=${encodeURIComponent(replySubject)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup detail pesan"
        disabled={isBusy}
        onClick={onClose}
        className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
      />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="min-w-0 pr-3">
            <h2 className="truncate text-sm font-semibold tracking-tight text-ink">
              {message.subject || "Tanpa Subjek"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Detail pesan dari formulir kontak
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Tutup panel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {message.name}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {message.email}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  message.is_read
                    ? "border-line bg-surface text-ink-muted"
                    : "border-accent-line bg-accent-soft text-accent"
                }`}
              >
                {message.is_read ? "Dibaca" : "Baru"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle pt-1 border-t border-line">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatFullDate(message.created_at)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted">Isi Pesan</p>
            <div className="rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed whitespace-pre-line text-ink">
              {message.message}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isBusy}
              onClick={() => onToggleRead(message)}
            >
              {message.is_read ? (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span>Tandai Belum Dibaca</span>
                </>
              ) : (
                <>
                  <MailOpen className="h-3.5 w-3.5" />
                  <span>Tandai Dibaca</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isBusy}
              onClick={() => onRequestDelete(message)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus</span>
            </Button>
          </div>

          <a
            href={mailtoHref}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-accent-hover"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Balas Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}