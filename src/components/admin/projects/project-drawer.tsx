"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import {
  saveProjectAction,
  type ProjectSaveActionState,
} from "@/actions/projects";
import type { ProjectRecord } from "@/lib/validators/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type ProjectDrawerProps = {
  project: ProjectRecord | null;
  onClose: () => void;
};

const initialState: ProjectSaveActionState = {
  status: "idle",
  message: null,
};

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProjectDrawer({ project, onClose }: ProjectDrawerProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    saveProjectAction,
    initialState
  );

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(project));
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? "");
  const [repoUrl, setRepoUrl] = useState(project?.repo_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    String(project?.display_order ?? 0)
  );
  const [isPublished, setIsPublished] = useState(
    project?.is_published ?? false
  );
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false);

  const [techTags, setTechTags] = useState<string[]>(project?.tech_stack ?? []);
  const [techInput, setTechInput] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string>(
    project?.thumbnail_url ?? ""
  );
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const lastTsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      state.timestamp &&
      state.timestamp !== lastTsRef.current &&
      state.message
    ) {
      lastTsRef.current = state.timestamp;
      showToast(
        state.status === "success" ? "success" : "error",
        state.message
      );
      if (state.status === "success") {
        onClose();
      }
    }
  }, [state, showToast, onClose]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const addTechTag = (raw: string) => {
    const parts = raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parts.length === 0) {
      return;
    }

    setTechTags((prev) => {
      const next = [...prev];
      for (const part of parts) {
        const exists = next.some(
          (item) => item.toLowerCase() === part.toLowerCase()
        );
        if (!exists && next.length < 15) {
          next.push(part.slice(0, 40));
        }
      }
      return next;
    });
    setTechInput("");
  };

  const removeTechTag = (target: string) => {
    setTechTags((prev) => prev.filter((item) => item !== target));
  };

  const handleFileChange = (file: File | undefined) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(removeThumbnail ? "" : (project?.thumbnail_url ?? ""));
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setRemoveThumbnail(false);
  };

  const handleClearThumbnail = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewUrl("");
    setRemoveThumbnail(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup panel proyek"
        disabled={isPending}
        onClick={onClose}
        className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
      />

      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              {project ? "Edit Proyek" : "Tambah Proyek Baru"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Lengkapi informasi karya untuk ditampilkan di portofolio publik.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup formulir"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          action={formAction}
          className="flex min-h-0 flex-1 flex-col"
        >
          <input type="hidden" name="id" value={project?.id ?? ""} />
          <input
            type="hidden"
            name="tech_stack"
            value={techTags.join(",")}
          />
          <input
            type="hidden"
            name="remove_thumbnail"
            value={removeThumbnail ? "true" : "false"}
          />

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-ink">
                Thumbnail Proyek
              </label>

              <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-3.5 sm:flex-row sm:items-center">
                <div className="relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface sm:w-36">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Pratinjau thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-ink-subtle" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    name="thumbnail"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isPending}
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="block w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-muted file:mr-2.5 file:rounded-md file:border file:border-line file:bg-canvas file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-ink hover:file:bg-surface-muted cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-ink-subtle">
                      JPG, PNG, atau WebP. Maks 3 MB.
                    </p>
                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={handleClearThumbnail}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-danger hover:underline cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus gambar</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {fieldError("thumbnail") ? (
                <p className="text-[11px] text-danger">
                  {fieldError("thumbnail")}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="project_title"
                  className="block text-xs font-medium text-ink"
                >
                  Judul Proyek
                </label>
                <Input
                  id="project_title"
                  name="title"
                  required
                  maxLength={120}
                  placeholder="SaaS Analytics Platform"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  hasError={Boolean(fieldError("title"))}
                  disabled={isPending}
                />
                {fieldError("title") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("title")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="project_slug"
                  className="block text-xs font-medium text-ink"
                >
                  Slug URL
                </label>
                <Input
                  id="project_slug"
                  name="slug"
                  required
                  maxLength={120}
                  placeholder="saas-analytics-platform"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value);
                  }}
                  hasError={Boolean(fieldError("slug"))}
                  disabled={isPending}
                  className="font-mono text-xs"
                />
                {fieldError("slug") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("slug")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project_summary"
                  className="block text-xs font-medium text-ink"
                >
                  Ringkasan Singkat
                </label>
                <span className="font-mono text-[11px] text-ink-subtle">
                  {summary.length}/300
                </span>
              </div>
              <Textarea
                id="project_summary"
                name="summary"
                required
                rows={2}
                maxLength={300}
                placeholder="Penjelasan singkat masalah yang diselesaikan dan hasil utamanya."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                hasError={Boolean(fieldError("summary"))}
                disabled={isPending}
              />
              {fieldError("summary") ? (
                <p className="text-[11px] text-danger">
                  {fieldError("summary")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="project_description"
                className="block text-xs font-medium text-ink"
              >
                Studi Kasus / Deskripsi Lengkap
              </label>
              <Textarea
                id="project_description"
                name="description"
                rows={5}
                maxLength={10000}
                placeholder="Ceritakan arsitektur teknis, tantangan yang dihadapi, peran spesifik, dan dampaknya."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                hasError={Boolean(fieldError("description"))}
                disabled={isPending}
              />
              {fieldError("description") ? (
                <p className="text-[11px] text-danger">
                  {fieldError("description")}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project_tech_input"
                  className="block text-xs font-medium text-ink"
                >
                  Tech Stack
                </label>
                <span className="font-mono text-[11px] text-ink-subtle">
                  {techTags.length}/15
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  id="project_tech_input"
                  type="text"
                  placeholder="Contoh: Next.js, TypeScript, PostgreSQL"
                  value={techInput}
                  disabled={isPending || techTags.length >= 15}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTechTag(techInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending || !techInput.trim() || techTags.length >= 15}
                  onClick={() => addTechTag(techInput)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah</span>
                </Button>
              </div>

              {techTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {techTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTechTag(tag)}
                        disabled={isPending}
                        aria-label={`Hapus ${tag}`}
                        className="text-ink-subtle hover:text-danger cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              {fieldError("tech_stack") ? (
                <p className="text-[11px] text-danger">
                  {fieldError("tech_stack")}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="project_live_url"
                  className="block text-xs font-medium text-ink"
                >
                  URL Live Demo
                </label>
                <Input
                  id="project_live_url"
                  name="live_url"
                  type="url"
                  maxLength={500}
                  placeholder="https://app.domain.com"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  hasError={Boolean(fieldError("live_url"))}
                  disabled={isPending}
                />
                {fieldError("live_url") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("live_url")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="project_repo_url"
                  className="block text-xs font-medium text-ink"
                >
                  URL Repository GitHub
                </label>
                <Input
                  id="project_repo_url"
                  name="repo_url"
                  type="url"
                  maxLength={500}
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  hasError={Boolean(fieldError("repo_url"))}
                  disabled={isPending}
                />
                {fieldError("repo_url") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("repo_url")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="project_display_order"
                  className="block text-xs font-medium text-ink"
                >
                  Urutan Tampil
                </label>
                <Input
                  id="project_display_order"
                  name="display_order"
                  type="number"
                  min={0}
                  max={9999}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  hasError={Boolean(fieldError("display_order"))}
                  disabled={isPending}
                />
              </div>

              <label className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2.5 sm:mt-5 cursor-pointer">
                <span className="text-xs font-medium text-ink">
                  Publikasikan
                </span>
                <input
                  type="checkbox"
                  name="is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-line accent-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2.5 sm:mt-5 cursor-pointer">
                <span className="text-xs font-medium text-ink">Unggulan</span>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-line accent-accent cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPending}
            >
              <Save className="h-3.5 w-3.5" />
              <span>
                {isPending
                  ? "Menyimpan..."
                  : project
                    ? "Simpan Perubahan"
                    : "Tambah Proyek"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}