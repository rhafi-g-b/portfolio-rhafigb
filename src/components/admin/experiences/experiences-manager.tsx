"use client";

import { useState, useTransition } from "react";
import {
  Briefcase,
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { deleteExperienceAction } from "@/actions/experiences";
import type { ExperienceRecord } from "@/lib/validators/experiences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ExperienceDrawer } from "@/components/admin/experiences/experience-drawer";

type ExperiencesManagerProps = {
  experiences: ExperienceRecord[];
};

export function ExperiencesManager({ experiences }: ExperiencesManagerProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<ExperienceRecord | null>(null);
  const [deletingExperience, setDeletingExperience] =
    useState<ExperienceRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredExperiences = experiences.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }

    return (
      item.role.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );
  });

  const openCreateDrawer = () => {
    setEditingExperience(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (experience: ExperienceRecord) => {
    setEditingExperience(experience);
    setDrawerOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingExperience) {
      return;
    }

    const target = deletingExperience;
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteExperienceAction(target.id);
      showToast(result.status, result.message);
      setBusyId(null);
      setDeletingExperience(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Riwayat Pengalaman
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Susun kronologi karier, peran profesional, dan dampak utama di tiap
            perusahaan.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={openCreateDrawer}
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengalaman</span>
        </Button>
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-ink-muted">
            Menampilkan{" "}
            <span className="font-semibold text-ink">
              {filteredExperiences.length}
            </span>{" "}
            dari {experiences.length} riwayat pengalaman
          </p>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="search"
              placeholder="Cari jabatan atau perusahaan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {filteredExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
              <Briefcase className="h-5 w-5 text-ink-subtle" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              {experiences.length === 0
                ? "Belum ada pengalaman yang dicatat"
                : "Tidak ada pengalaman yang cocok"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              {experiences.length === 0
                ? "Tambahkan riwayat kerja atau proyek penting klien agar mudah dipindai recruiter."
                : "Coba ubah kata kunci pencarian Anda."}
            </p>
            {experiences.length === 0 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={openCreateDrawer}
                className="mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Pengalaman Pertama</span>
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filteredExperiences.map((exp) => {
              const isRowBusy = isPending && busyId === exp.id;

              return (
                <li
                  key={exp.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-muted/60 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">
                        {exp.role}
                      </h3>
                      <span className="text-xs text-ink-subtle">di</span>
                      <span className="text-sm font-medium text-ink">
                        {exp.company}
                      </span>
                      <span className="font-mono text-[11px] text-ink-subtle">
                        #{exp.display_order}
                      </span>
                      {exp.is_current ? (
                        <span className="inline-flex items-center rounded-full border border-accent-line bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                          Saat ini
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-ink-subtle" />
                        <span>
                          {exp.start_date} —{" "}
                          {exp.is_current ? "Sekarang" : exp.end_date}
                        </span>
                      </span>

                      {exp.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ink-subtle" />
                          <span>{exp.location}</span>
                        </span>
                      ) : null}
                    </div>

                    {exp.description ? (
                      <p className="line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-ink-muted">
                        {exp.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:justify-end">
                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => openEditDrawer(exp)}
                      aria-label="Edit pengalaman"
                      title="Edit pengalaman"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => setDeletingExperience(exp)}
                      aria-label="Hapus pengalaman"
                      title="Hapus pengalaman"
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

      {drawerOpen ? (
        <ExperienceDrawer
          key={editingExperience?.id ?? "new-experience"}
          experience={editingExperience}
          onClose={() => setDrawerOpen(false)}
        />
      ) : null}

      {deletingExperience ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup konfirmasi hapus"
            disabled={isPending}
            onClick={() => setDeletingExperience(null)}
            className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">
                Hapus Riwayat Pengalaman?
              </h3>
              <p className="text-xs text-ink-muted">
                Pengalaman sebagai{" "}
                <span className="font-medium text-ink">
                  {deletingExperience.role}
                </span>{" "}
                di{" "}
                <span className="font-medium text-ink">
                  {deletingExperience.company}
                </span>{" "}
                akan dihapus permanen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingExperience(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isPending && busyId === deletingExperience.id}
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