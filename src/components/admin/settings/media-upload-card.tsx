"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, ImageIcon, Upload } from "lucide-react";
import {
  uploadSiteMediaAction,
  type MediaUploadActionState,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type MediaUploadCardProps = {
  avatarUrl: string;
  cvUrl: string;
};

const initialState: MediaUploadActionState = {
  status: "idle",
  message: null,
};

export function MediaUploadCard({ avatarUrl, cvUrl }: MediaUploadCardProps) {
  const { showToast } = useToast();

  const [avatarState, avatarAction, isAvatarPending] = useActionState(
    uploadSiteMediaAction,
    initialState
  );
  const [cvState, cvAction, isCvPending] = useActionState(
    uploadSiteMediaAction,
    initialState
  );

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [currentCvUrl, setCurrentCvUrl] = useState(cvUrl);
  const [hasAvatarFile, setHasAvatarFile] = useState(false);
  const [hasCvFile, setHasCvFile] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const lastAvatarTsRef = useRef<number | undefined>(undefined);
  const lastCvTsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      avatarState.timestamp &&
      avatarState.timestamp !== lastAvatarTsRef.current &&
      avatarState.message
    ) {
      lastAvatarTsRef.current = avatarState.timestamp;
      showToast(
        avatarState.status === "success" ? "success" : "error",
        avatarState.message
      );
      if (avatarState.status === "success") {
        if (avatarState.url) {
          setCurrentAvatarUrl(avatarState.url);
        }
        if (avatarInputRef.current) {
          avatarInputRef.current.value = "";
        }
        setHasAvatarFile(false);
      }
    }
  }, [avatarState, showToast]);

  useEffect(() => {
    if (
      cvState.timestamp &&
      cvState.timestamp !== lastCvTsRef.current &&
      cvState.message
    ) {
      lastCvTsRef.current = cvState.timestamp;
      showToast(
        cvState.status === "success" ? "success" : "error",
        cvState.message
      );
      if (cvState.status === "success") {
        if (cvState.url) {
          setCurrentCvUrl(cvState.url);
        }
        if (cvInputRef.current) {
          cvInputRef.current.value = "";
        }
        setHasCvFile(false);
      }
    }
  }, [cvState, showToast]);

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          Aset Media &amp; Dokumen
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Unggah foto profil atau CV secara terpisah tanpa memengaruhi bagian
          lain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <form
          action={avatarAction}
          className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-canvas/50 p-4"
        >
          <input type="hidden" name="media_type" value="avatar" />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt="Foto profil aktif"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-ink-subtle" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink">Foto Profil</p>
                <p className="text-[11px] text-ink-subtle">
                  JPG, PNG, atau WebP. Maksimal 2 MB.
                </p>
              </div>
            </div>

            <input
              ref={avatarInputRef}
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isAvatarPending}
              onChange={(e) =>
                setHasAvatarFile(Boolean(e.target.files && e.target.files[0]))
              }
              className="block w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-muted file:mr-2.5 file:rounded-md file:border file:border-line file:bg-canvas file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-ink hover:file:bg-surface-muted cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {currentAvatarUrl ? (
              <a
                href={currentAvatarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
              >
                <span>Lihat foto aktif</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[11px] text-ink-subtle">
                Pilih gambar baru untuk mengganti
              </span>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isAvatarPending}
              disabled={!hasAvatarFile || isAvatarPending}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isAvatarPending ? "Mengunggah..." : "Unggah Foto"}</span>
            </Button>
          </div>
        </form>

        <form
          action={cvAction}
          className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-canvas/50 p-4"
        >
          <input type="hidden" name="media_type" value="cv" />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                <FileText className="h-5 w-5 text-ink-subtle" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink">
                  Dokumen CV (PDF)
                </p>
                <p className="text-[11px] text-ink-subtle">
                  Khusus format PDF. Maksimal 5 MB.
                </p>
              </div>
            </div>

            <input
              ref={cvInputRef}
              name="file"
              type="file"
              accept="application/pdf"
              disabled={isCvPending}
              onChange={(e) =>
                setHasCvFile(Boolean(e.target.files && e.target.files[0]))
              }
              className="block w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink-muted file:mr-2.5 file:rounded-md file:border file:border-line file:bg-canvas file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-ink hover:file:bg-surface-muted cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {currentCvUrl ? (
              <a
                href={currentCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
              >
                <span>Lihat CV aktif</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[11px] text-ink-subtle">
                Pilih file PDF baru untuk mengganti
              </span>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isCvPending}
              disabled={!hasCvFile || isCvPending}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isCvPending ? "Mengunggah..." : "Unggah CV"}</span>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}