"use client";

import { useState, useTransition } from "react";
import {
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteMessageAction,
  markAllMessagesReadAction,
  toggleMessageReadAction,
} from "@/actions/messages";
import type { ContactMessageRecord } from "@/lib/validators/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { MessageDetailDrawer } from "@/components/admin/messages/message-detail-drawer";

type MessagesManagerProps = {
  messages: ContactMessageRecord[];
};

type MessageFilter = "all" | "unread" | "read";

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessagesManager({ messages }: MessagesManagerProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<MessageFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] =
    useState<ContactMessageRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const unreadCount = messages.filter((item) => !item.is_read).length;
  const readCount = messages.length - unreadCount;

  const selectedMessage =
    messages.find((item) => item.id === selectedId) ?? null;

  const filteredMessages = messages.filter((item) => {
    if (filter === "unread" && item.is_read) {
      return false;
    }
    if (filter === "read" && !item.is_read) {
      return false;
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)
    );
  });

  const handleOpenMessage = (item: ContactMessageRecord) => {
    setSelectedId(item.id);
    if (!item.is_read) {
      setBusyId(item.id);
      startTransition(async () => {
        await toggleMessageReadAction(item.id, true);
        setBusyId(null);
      });
    }
  };

  const handleToggleRead = (item: ContactMessageRecord) => {
    setBusyId(item.id);
    startTransition(async () => {
      const result = await toggleMessageReadAction(item.id, !item.is_read);
      showToast(result.status, result.message);
      setBusyId(null);
    });
  };

  const handleMarkAllRead = () => {
    setBusyId("mark-all");
    startTransition(async () => {
      const result = await markAllMessagesReadAction();
      showToast(result.status, result.message);
      setBusyId(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingMessage) {
      return;
    }

    const target = deletingMessage;
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteMessageAction(target.id);
      showToast(result.status, result.message);
      if (result.status === "success" && selectedId === target.id) {
        setSelectedId(null);
      }
      setBusyId(null);
      setDeletingMessage(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Pesan Masuk
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Kelola pertanyaan klien, tawaran kolaborasi, dan pesan dari formulir
            kontak.
          </p>
        </div>

        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isPending && busyId === "mark-all"}
            disabled={isPending}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            <span>Tandai Semua Dibaca ({unreadCount})</span>
          </Button>
        ) : null}
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-line bg-canvas p-1">
            {(
              [
                { key: "all", label: `Semua (${messages.length})` },
                { key: "unread", label: `Belum Dibaca (${unreadCount})` },
                { key: "read", label: `Dibaca (${readCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  filter === tab.key
                    ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="search"
              placeholder="Cari pengirim atau isi pesan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
              <Inbox className="h-5 w-5 text-ink-subtle" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              {messages.length === 0
                ? "Belum ada pesan masuk"
                : "Tidak ada pesan yang sesuai filter"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              {messages.length === 0
                ? "Pesan yang dikirim pengunjung lewat formulir kontak halaman depan akan muncul di sini."
                : "Coba ubah kata kunci pencarian atau pilih tab lainnya."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filteredMessages.map((item) => {
              const isRowBusy = isPending && busyId === item.id;

              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    item.is_read
                      ? "hover:bg-surface-muted/60"
                      : "bg-accent-soft/40 hover:bg-accent-soft/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenMessage(item)}
                    className="min-w-0 flex-1 text-left space-y-1 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {!item.is_read ? (
                        <span
                          aria-label="Belum dibaca"
                          className="h-2 w-2 shrink-0 rounded-full bg-accent"
                        />
                      ) : null}
                      <span
                        className={`text-sm ${
                          item.is_read
                            ? "font-medium text-ink"
                            : "font-semibold text-ink"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-ink-subtle">
                        &lt;{item.email}&gt;
                      </span>
                    </div>

                    <p
                      className={`truncate text-xs ${
                        item.is_read
                          ? "font-medium text-ink-muted"
                          : "font-semibold text-ink"
                      }`}
                    >
                      {item.subject || "Tanpa Subjek"}
                    </p>

                    <p className="line-clamp-1 text-xs text-ink-muted">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-ink-subtle">
                      <Clock className="h-3 w-3" />
                      <span>{formatShortDate(item.created_at)}</span>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1.5 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isRowBusy}
                      onClick={() => handleOpenMessage(item)}
                    >
                      Buka
                    </Button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => handleToggleRead(item)}
                      aria-label={
                        item.is_read
                          ? "Tandai belum dibaca"
                          : "Tandai sudah dibaca"
                      }
                      title={
                        item.is_read
                          ? "Tandai belum dibaca"
                          : "Tandai sudah dibaca"
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer disabled:opacity-50"
                    >
                      {item.is_read ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5 text-accent" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => setDeletingMessage(item)}
                      aria-label="Hapus pesan"
                      title="Hapus pesan"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:border-danger-line hover:bg-danger-bg hover:text-danger cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {selectedMessage ? (
        <MessageDetailDrawer
          message={selectedMessage}
          isBusy={isPending && busyId === selectedMessage.id}
          onClose={() => setSelectedId(null)}
          onToggleRead={handleToggleRead}
          onRequestDelete={(msg) => setDeletingMessage(msg)}
        />
      ) : null}

      {deletingMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup konfirmasi hapus"
            disabled={isPending}
            onClick={() => setDeletingMessage(null)}
            className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">
                Hapus Pesan Ini?
              </h3>
              <p className="text-xs text-ink-muted">
                Pesan dari{" "}
                <span className="font-medium text-ink">
                  {deletingMessage.name}
                </span>{" "}
                akan dihapus permanen dari kotak masuk.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingMessage(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isPending && busyId === deletingMessage.id}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}