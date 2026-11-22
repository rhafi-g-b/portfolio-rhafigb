"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  ExternalLink,
  FolderKanban,
  GitBranch,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import {
  deleteProjectAction,
  toggleProjectFlagAction,
} from "@/actions/projects";
import type { ProjectRecord } from "@/lib/validators/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ProjectDrawer } from "@/components/admin/projects/project-drawer";

type ProjectsManagerProps = {
  projects: ProjectRecord[];
};

type FilterTab = "all" | "published" | "draft";

export function ProjectsManager({ projects }: ProjectsManagerProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(
    null
  );
  const [deletingProject, setDeletingProject] = useState<ProjectRecord | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const publishedCount = projects.filter((item) => item.is_published).length;
  const draftCount = projects.length - publishedCount;

  const filteredProjects = projects.filter((item) => {
    if (filter === "published" && !item.is_published) {
      return false;
    }
    if (filter === "draft" && item.is_published) {
      return false;
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.tech_stack.some((tech) => tech.toLowerCase().includes(q))
    );
  });

  const openCreateDrawer = () => {
    setEditingProject(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (project: ProjectRecord) => {
    setEditingProject(project);
    setDrawerOpen(true);
  };

  const handleToggle = (
    project: ProjectRecord,
    field: "is_published" | "is_featured"
  ) => {
    setBusyId(project.id);
    startTransition(async () => {
      const result = await toggleProjectFlagAction(
        project.id,
        field,
        !project[field]
      );
      showToast(result.status, result.message);
      setBusyId(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) {
      return;
    }

    const target = deletingProject;
    setBusyId(target.id);
    startTransition(async () => {
      const result = await deleteProjectAction(target.id);
      showToast(result.status, result.message);
      setBusyId(null);
      setDeletingProject(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            Manajemen Proyek
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Kelola portofolio karya, studi kasus, dan proyek unggulan yang
            tampil di halaman publik.
          </p>
        </div>

        <Button type="button" variant="primary" size="sm" onClick={openCreateDrawer}>
          <Plus className="h-4 w-4" />
          <span>Tambah Proyek</span>
        </Button>
      </div>

      <section className="rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-line bg-canvas p-1">
            {(
              [
                { key: "all", label: `Semua (${projects.length})` },
                { key: "published", label: `Publik (${publishedCount})` },
                { key: "draft", label: `Draft (${draftCount})` },
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
              placeholder="Cari judul atau tech stack..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-canvas">
              <FolderKanban className="h-5 w-5 text-ink-subtle" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              {projects.length === 0
                ? "Belum ada proyek yang ditambahkan"
                : "Tidak ada proyek yang sesuai filter"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-muted">
              {projects.length === 0
                ? "Tambahkan karya terbaik klien lengkap dengan deskripsi, tech stack, dan tautan demo."
                : "Coba ubah kata kunci pencarian atau pilih tab status lainnya."}
            </p>
            {projects.length === 0 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={openCreateDrawer}
                className="mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Proyek Pertama</span>
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filteredProjects.map((project) => {
              const isRowBusy = isPending && busyId === project.id;

              return (
                <li
                  key={project.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-muted/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
                      {project.thumbnail_url ? (
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-ink-subtle" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-ink">
                          {project.title}
                        </h3>
                        <span className="font-mono text-[11px] text-ink-subtle">
                          #{project.display_order}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            project.is_published
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-line bg-canvas text-ink-muted"
                          }`}
                        >
                          {project.is_published ? "Publik" : "Draft"}
                        </span>
                        {project.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Unggulan
                          </span>
                        ) : null}
                      </div>

                      <p className="line-clamp-1 text-xs text-ink-muted">
                        {project.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {project.tech_stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-muted"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech_stack.length > 4 ? (
                          <span className="font-mono text-[10px] text-ink-subtle">
                            +{project.tech_stack.length - 4}
                          </span>
                        ) : null}

                        {project.live_url ? (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Demo</span>
                          </a>
                        ) : null}

                        {project.repo_url ? (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink hover:underline"
                          >
                            <GitBranch className="h-3 w-3" />
                            <span>Repo</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isRowBusy}
                      onClick={() => handleToggle(project, "is_published")}
                    >
                      {project.is_published ? "Jadikan Draft" : "Publikasikan"}
                    </Button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => handleToggle(project, "is_featured")}
                      aria-label={
                        project.is_featured
                          ? "Hapus dari unggulan"
                          : "Tandai unggulan"
                      }
                      title={
                        project.is_featured
                          ? "Hapus dari unggulan"
                          : "Tandai unggulan"
                      }
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                        project.is_featured
                          ? "border-accent-line bg-accent-soft text-accent"
                          : "border-line bg-surface text-ink-subtle hover:bg-surface-muted hover:text-ink"
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          project.is_featured ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => openEditDrawer(project)}
                      aria-label="Edit proyek"
                      title="Edit proyek"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={isRowBusy}
                      onClick={() => setDeletingProject(project)}
                      aria-label="Hapus proyek"
                      title="Hapus proyek"
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
        <ProjectDrawer
          key={editingProject?.id ?? "new-project"}
          project={editingProject}
          onClose={() => setDrawerOpen(false)}
        />
      ) : null}

      {deletingProject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup konfirmasi hapus"
            disabled={isPending}
            onClick={() => setDeletingProject(null)}
            className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">
                Hapus Proyek Ini?
              </h3>
              <p className="text-xs text-ink-muted">
                Proyek{" "}
                <span className="font-medium text-ink">
                  {deletingProject.title}
                </span>{" "}
                beserta thumbnail-nya akan dihapus permanen dan tidak dapat
                dikembalikan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingProject(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isPending && busyId === deletingProject.id}
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