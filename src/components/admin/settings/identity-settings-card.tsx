"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  updateIdentitySettingsAction,
  type SectionActionState,
} from "@/actions/settings";
import type { IdentitySettingsValues } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type IdentitySettingsCardProps = {
  initialValues: IdentitySettingsValues;
};

const initialState: SectionActionState = {
  status: "idle",
  message: null,
};

export function IdentitySettingsCard({
  initialValues,
}: IdentitySettingsCardProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    updateIdentitySettingsAction,
    initialState
  );

  const [saved, setSaved] = useState<IdentitySettingsValues>(initialValues);
  const [values, setValues] = useState<IdentitySettingsValues>(initialValues);
  const lastTsRef = useRef<number | undefined>(undefined);

  const isDirty =
    values.brand_name !== saved.brand_name ||
    values.hero_title !== saved.hero_title ||
    values.hero_subtitle !== saved.hero_subtitle ||
    values.about_bio !== saved.about_bio;

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
        setSaved(values);
      }
    }
  }, [state, showToast, values]);

  const fieldError = (key: string) => state.fieldErrors?.[key];

  const handleReset = () => {
    setValues(saved);
  };

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            Identitas &amp; Bagian Hero
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Informasi utama yang langsung dilihat pengunjung saat membuka situs.
          </p>
        </div>

        {isDirty ? (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
            Belum disimpan
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label
            htmlFor="brand_name"
            className="block text-xs font-medium text-ink"
          >
            Nama Brand / Developer
          </label>
          <Input
            id="brand_name"
            name="brand_name"
            required
            maxLength={80}
            placeholder="Nama lengkap atau nama brand"
            value={values.brand_name}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, brand_name: e.target.value }))
            }
            hasError={Boolean(fieldError("brand_name"))}
            disabled={isPending}
          />
          {fieldError("brand_name") ? (
            <p className="text-[11px] text-danger">
              {fieldError("brand_name")}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hero_title"
              className="block text-xs font-medium text-ink"
            >
              Judul Hero
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">
              {values.hero_title.length}/160
            </span>
          </div>
          <Input
            id="hero_title"
            name="hero_title"
            maxLength={160}
            placeholder="Fullstack Engineer yang membangun sistem web cepat & skalabel."
            value={values.hero_title}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, hero_title: e.target.value }))
            }
            hasError={Boolean(fieldError("hero_title"))}
            disabled={isPending}
          />
          {fieldError("hero_title") ? (
            <p className="text-[11px] text-danger">
              {fieldError("hero_title")}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hero_subtitle"
              className="block text-xs font-medium text-ink"
            >
              Subjudul Hero
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">
              {values.hero_subtitle.length}/320
            </span>
          </div>
          <Textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={2}
            maxLength={320}
            placeholder="Ringkasan singkat spesialisasi dan nilai utama yang ditawarkan."
            value={values.hero_subtitle}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, hero_subtitle: e.target.value }))
            }
            hasError={Boolean(fieldError("hero_subtitle"))}
            disabled={isPending}
          />
          {fieldError("hero_subtitle") ? (
            <p className="text-[11px] text-danger">
              {fieldError("hero_subtitle")}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="about_bio"
              className="block text-xs font-medium text-ink"
            >
              Tentang / Bio Lengkap
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">
              {values.about_bio.length}/3000
            </span>
          </div>
          <Textarea
            id="about_bio"
            name="about_bio"
            rows={5}
            maxLength={3000}
            placeholder="Ceritakan latar belakang, fokus rekayasa, dan pendekatan kerja. Pisahkan paragraf dengan baris kosong."
            value={values.about_bio}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, about_bio: e.target.value }))
            }
            hasError={Boolean(fieldError("about_bio"))}
            disabled={isPending}
          />
          {fieldError("about_bio") ? (
            <p className="text-[11px] text-danger">{fieldError("about_bio")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
        <p className="text-[11px] text-ink-subtle">
          {isDirty
            ? "Ada perubahan identitas yang belum disimpan."
            : "Semua perubahan identitas tersimpan."}
        </p>

        <div className="flex items-center gap-2">
          {isDirty ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Batal</span>
            </Button>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            disabled={!isDirty}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPending ? "Menyimpan..." : "Simpan Identitas"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}