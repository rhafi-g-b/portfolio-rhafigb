"use client";

import { useState, useTransition } from "react";
import { Cpu, Pencil, Search, Trash2 } from "lucide-react";
import { deleteSkillAction } from "@/actions/skills";
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  type SkillCategory,
  type SkillRecord,
} from "@/lib/validators/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { SkillQuickAdd } from "@/components/admin/skills/skill-quick-add";
import { SkillEditModal } from "@/components/admin/skills/skill-edit-modal";

type SkillsManagerProps = {
  skills: SkillRecord[];
};

type CategoryFilter = "all" | SkillCategory;

export function SkillsManager({ skills }: SkillsManagerProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [editingSkill, setEditingSkill] = useState<SkillRecord | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<SkillRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredSkills = skills.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(q) ||
      SKILL_CATEGORY_LABELS[item.category].toLowerCase().includes(q)
    );
  });

  const groupedCategories = SKILL_CATEGORIES.map((category) => ({
    ...category,
    items: filteredSkills.filter((item) => item.category === category.value),
  })).filter((group) => group.items.length > 0);

  const handleConfirmDelete = () => {
    if (!deletingSkill) {
      return;
    }

    const target = deletingSkill;
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteSkillAction(target.id);
      showToast(result.status, result.message);
      setBusyId(null);
      setDeletingSkill(null);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          Manajemen Keahlian
        </h1>
        <p className="mt-0.5 text-xs text-ink-muted">
          Kelompokkan tech stack berdasarkan kategori agar mudah dipindai tanpa
          persentase subjektif.
        </p>
      </div>

      <SkillQuickAdd />

      <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Semua ({skills.length})
            </button>

            {SKILL_CATEGORIES.map((cat) => {
              const count = skills.filter(
                (item) => item.category === cat.value
              ).length;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat.value
                      ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="search"
              placeholder="Cari keahlian..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {groupedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
              <Cpu className="h-5 w-5 text-ink-subtle" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              {skills.length === 0
                ? "Belum ada keahlian yang ditambahkan"
                : "Tidak ada keahlian yang sesuai filter"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              {skills.length === 0
                ? "Gunakan formulir Tambah Keahlian Cepat di atas untuk mulai mengisi daftar tech stack."
                : "Coba ubah kata kunci pencarian atau pilih kategori lain."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {groupedCategories.map((group) => (
              <div key={group.value} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {group.label}
                  </h3>
                  <span className="font-mono text-[11px] text-ink-subtle">
                    {group.items.length} item
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => {
                    const isRowBusy = isPending && busyId === skill.id;

                    return (
                      <div
                        key={skill.id}
                        className="group inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 transition-colors hover:border-line-strong hover:bg-surface"
                      >
                        <span className="text-xs font-medium text-ink">
                          {skill.name}
                        </span>
                        <span className="font-mono text-[10px] text-ink-subtle">
                          #{skill.display_order}
                        </span>

                        <div className="ml-1 flex items-center gap-0.5 border-l border-line pl-1.5">
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => setEditingSkill(skill)}
                            aria-label={`Edit ${skill.name}`}
                            title="Edit keahlian"
                            className="rounded p-1 text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer disabled:opacity-50"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => setDeletingSkill(skill)}
                            aria-label={`Hapus ${skill.name}`}
                            title="Hapus keahlian"
                            className="rounded p-1 text-ink-subtle transition-colors hover:bg-danger-bg hover:text-danger cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editingSkill ? (
        <SkillEditModal
          key={editingSkill.id}
          skill={editingSkill}
          onClose={() => setEditingSkill(null)}
        />
      ) : null}

      {deletingSkill ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup konfirmasi hapus"
            disabled={isPending}
            onClick={() => setDeletingSkill(null)}
            className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">
                Hapus Keahlian Ini?
              </h3>
              <p className="text-xs text-ink-muted">
                Keahlian{" "}
                <span className="font-medium text-ink">
                  {deletingSkill.name}
                </span>{" "}
                akan dihapus permanen dari daftar tech stack.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingSkill(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isPending && busyId === deletingSkill.id}
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