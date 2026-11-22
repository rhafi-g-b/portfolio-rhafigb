"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  updateSeoSettingsAction,
  type SectionActionState,
} from "@/actions/settings";
import type { SeoSettingsValues } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type SeoSettingsCardProps = {
  initialValues: SeoSettingsValues;
};

const initialState: SectionActionState = {
  status: "idle",
  message: null,
};

export function SeoSettingsCard({ initialValues }: SeoSettingsCardProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    updateSeoSettingsAction,
    initialState
  );

  const [saved, setSaved] = useState<SeoSettingsValues>(initialValues);
  const [values, setValues] = useState<SeoSettingsValues>(initialValues);
  const lastTsRef = useRef<number | undefined>(undefined);

  const isDirty =
    values.seo_title !== saved.seo_title ||
    values.seo_description !== saved.seo_description;

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

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            Metadata SEO
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Judul tab browser dan deskripsi pratinjau untuk mesin pencari serta
            tautan media sosial.
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="seo_title"
              className="block text-xs font-medium text-ink"
            >
              Judul SEO
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">
              {values.seo_title.length}/120
            </span>
          </div>
          <Input
            id="seo_title"
            name="seo_title"
            maxLength={120}
            placeholder="Nama Anda — Fullstack Developer Portfolio"
            value={values.seo_title}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, seo_title: e.target.value }))
            }
            hasError={Boolean(fieldError("seo_title"))}
            disabled={isPending}
          />
          {fieldError("seo_title") ? (
            <p className="text-[11px] text-danger">{fieldError("seo_title")}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="seo_description"
              className="block text-xs font-medium text-ink"
            >
              Deskripsi SEO
            </label>
            <span className="font-mono text-[11px] text-ink-subtle">
              {values.seo_description.length}/300
            </span>
          </div>
          <Textarea
            id="seo_description"
            name="seo_description"
            rows={3}
            maxLength={300}
            placeholder="Ringkasan singkat keahlian dan karya untuk hasil pencarian Google."
            value={values.seo_description}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                seo_description: e.target.value,
              }))
            }
            hasError={Boolean(fieldError("seo_description"))}
            disabled={isPending}
          />
          {fieldError("seo_description") ? (
            <p className="text-[11px] text-danger">
              {fieldError("seo_description")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
        <p className="text-[11px] text-ink-subtle">
          {isDirty
            ? "Ada perubahan metadata SEO yang belum disimpan."
            : "Metadata SEO tersimpan."}
        </p>

        <div className="flex items-center gap-2">
          {isDirty ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={() => setValues(saved)}
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
            <span>{isPending ? "Menyimpan..." : "Simpan SEO"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}