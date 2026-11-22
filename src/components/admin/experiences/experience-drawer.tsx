"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import {
  saveExperienceAction,
  type ExperienceSaveActionState,
} from "@/actions/experiences";
import type { ExperienceRecord } from "@/lib/validators/experiences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type ExperienceDrawerProps = {
  experience: ExperienceRecord | null;
  onClose: () => void;
};

const initialState: ExperienceSaveActionState = {
  status: "idle",
  message: null,
};

export function ExperienceDrawer({
  experience,
  onClose,
}: ExperienceDrawerProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    saveExperienceAction,
    initialState
  );

  const [role, setRole] = useState(experience?.role ?? "");
  const [company, setCompany] = useState(experience?.company ?? "");
  const [location, setLocation] = useState(experience?.location ?? "");
  const [startDate, setStartDate] = useState(experience?.start_date ?? "");
  const [endDate, setEndDate] = useState(experience?.end_date ?? "");
  const [isCurrent, setIsCurrent] = useState(experience?.is_current ?? false);
  const [description, setDescription] = useState(experience?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    String(experience?.display_order ?? 0)
  );

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup panel pengalaman"
        disabled={isPending}
        onClick={onClose}
        className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
      />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              {experience ? "Edit Pengalaman" : "Tambah Pengalaman Baru"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Catat peran, periode kerja, dan pencapaian utama secara ringkas.
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

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="id" value={experience?.id ?? ""} />

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="space-y-1.5">
              <label
                htmlFor="exp_role"
                className="block text-xs font-medium text-ink"
              >
                Jabatan / Peran
              </label>
              <Input
                id="exp_role"
                name="role"
                required
                maxLength={120}
                placeholder="Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                hasError={Boolean(fieldError("role"))}
                disabled={isPending}
              />
              {fieldError("role") ? (
                <p className="text-[11px] text-danger">{fieldError("role")}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="exp_company"
                  className="block text-xs font-medium text-ink"
                >
                  Perusahaan / Instansi
                </label>
                <Input
                  id="exp_company"
                  name="company"
                  required
                  maxLength={120}
                  placeholder="PT Teknologi Nusantara"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  hasError={Boolean(fieldError("company"))}
                  disabled={isPending}
                />
                {fieldError("company") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("company")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp_location"
                  className="block text-xs font-medium text-ink"
                >
                  Lokasi
                </label>
                <Input
                  id="exp_location"
                  name="location"
                  maxLength={120}
                  placeholder="Jakarta (Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  hasError={Boolean(fieldError("location"))}
                  disabled={isPending}
                />
                {fieldError("location") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("location")}
                  </p>
                ) : null}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-3 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-ink">
                  Masih bekerja di sini
                </p>
                <p className="text-[11px] text-ink-subtle">
                  Akan ditampilkan sebagai &quot;Sekarang&quot; pada lini masa.
                </p>
              </div>
              <input
                type="checkbox"
                name="is_current"
                checked={isCurrent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsCurrent(checked);
                  if (checked) {
                    setEndDate("");
                  }
                }}
                disabled={isPending}
                className="h-4 w-4 rounded border-line accent-accent cursor-pointer"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="exp_start_date"
                  className="block text-xs font-medium text-ink"
                >
                  Waktu Mulai
                </label>
                <Input
                  id="exp_start_date"
                  name="start_date"
                  required
                  maxLength={30}
                  placeholder="Jan 2024"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  hasError={Boolean(fieldError("start_date"))}
                  disabled={isPending}
                />
                {fieldError("start_date") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("start_date")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="exp_end_date"
                  className="block text-xs font-medium text-ink"
                >
                  Waktu Selesai
                </label>
                <Input
                  id="exp_end_date"
                  name="end_date"
                  required={!isCurrent}
                  maxLength={30}
                  placeholder={isCurrent ? "Sekarang" : "Des 2025"}
                  value={isCurrent ? "" : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  hasError={Boolean(fieldError("end_date"))}
                  disabled={isPending || isCurrent}
                />
                {fieldError("end_date") ? (
                  <p className="text-[11px] text-danger">
                    {fieldError("end_date")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="exp_description"
                  className="block text-xs font-medium text-ink"
                >
                  Deskripsi & Pencapaian
                </label>
                <span className="font-mono text-[11px] text-ink-subtle">
                  {description.length}/2000
                </span>
              </div>
              <Textarea
                id="exp_description"
                name="description"
                rows={5}
                maxLength={2000}
                placeholder="Tuliskan tanggung jawab inti atau hasil terukur (misal: mempercepat waktu muat halaman 45%)."
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

            <div className="space-y-1.5">
              <label
                htmlFor="exp_display_order"
                className="block text-xs font-medium text-ink"
              >
                Urutan Tampil
              </label>
              <Input
                id="exp_display_order"
                name="display_order"
                type="number"
                min={0}
                max={9999}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                hasError={Boolean(fieldError("display_order"))}
                disabled={isPending}
              />
              <p className="text-[11px] text-ink-subtle">
                Angka lebih kecil tampil paling atas di halaman portofolio.
              </p>
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
                  : experience
                    ? "Simpan Perubahan"
                    : "Tambah Pengalaman"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}