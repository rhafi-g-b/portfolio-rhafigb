"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  updateSocialSettingsAction,
  type SectionActionState,
} from "@/actions/settings";
import type { SocialSettingsValues } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type SocialSettingsCardProps = {
  initialValues: SocialSettingsValues;
};

const initialState: SectionActionState = {
  status: "idle",
  message: null,
};

export function SocialSettingsCard({
  initialValues,
}: SocialSettingsCardProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    updateSocialSettingsAction,
    initialState
  );

  const [saved, setSaved] = useState<SocialSettingsValues>(initialValues);
  const [values, setValues] = useState<SocialSettingsValues>(initialValues);
  const lastTsRef = useRef<number | undefined>(undefined);

  const isDirty =
    values.contact_email !== saved.contact_email ||
    values.github_url !== saved.github_url ||
    values.linkedin_url !== saved.linkedin_url;

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
            Kontak &amp; Tautan Sosial
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Alamat email publik dan tautan profil profesional yang tampil di
            portofolio.
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
            htmlFor="contact_email"
            className="block text-xs font-medium text-ink"
          >
            Email Publik
          </label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            maxLength={120}
            placeholder="halo@domain.com"
            value={values.contact_email}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, contact_email: e.target.value }))
            }
            hasError={Boolean(fieldError("contact_email"))}
            disabled={isPending}
          />
          {fieldError("contact_email") ? (
            <p className="text-[11px] text-danger">
              {fieldError("contact_email")}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="github_url"
              className="block text-xs font-medium text-ink"
            >
              URL GitHub
            </label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              maxLength={500}
              placeholder="https://github.com/username"
              value={values.github_url}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, github_url: e.target.value }))
              }
              hasError={Boolean(fieldError("github_url"))}
              disabled={isPending}
            />
            {fieldError("github_url") ? (
              <p className="text-[11px] text-danger">
                {fieldError("github_url")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="linkedin_url"
              className="block text-xs font-medium text-ink"
            >
              URL LinkedIn
            </label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              maxLength={500}
              placeholder="https://linkedin.com/in/username"
              value={values.linkedin_url}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, linkedin_url: e.target.value }))
              }
              hasError={Boolean(fieldError("linkedin_url"))}
              disabled={isPending}
            />
            {fieldError("linkedin_url") ? (
              <p className="text-[11px] text-danger">
                {fieldError("linkedin_url")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 py-3.5">
        <p className="text-[11px] text-ink-subtle">
          {isDirty
            ? "Ada perubahan tautan yang belum disimpan."
            : "Semua tautan sosial tersimpan."}
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
            <span>{isPending ? "Menyimpan..." : "Simpan Tautan"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}