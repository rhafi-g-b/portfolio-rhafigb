"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import {
  saveSkillAction,
  type SkillSaveActionState,
} from "@/actions/skills";
import {
  SKILL_CATEGORIES,
  type SkillCategory,
  type SkillRecord,
} from "@/lib/validators/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type SkillEditModalProps = {
  skill: SkillRecord;
  onClose: () => void;
};

const initialState: SkillSaveActionState = {
  status: "idle",
  message: null,
};

export function SkillEditModal({ skill, onClose }: SkillEditModalProps) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    saveSkillAction,
    initialState
  );

  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState<SkillCategory>(skill.category);
  const [displayOrder, setDisplayOrder] = useState(String(skill.display_order));
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

  const fieldError = (key: string) => state.fieldErrors?.[key];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup modal edit keahlian"
        disabled={isPending}
        onClick={onClose}
        className="fixed inset-0 bg-ink/35 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            Edit Keahlian
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction}>
          <input type="hidden" name="id" value={skill.id} />

          <div className="space-y-4 p-5">
            <div className="space-y-1.5">
              <label
                htmlFor="edit_skill_name"
                className="block text-xs font-medium text-ink"
              >
                Nama Keahlian
              </label>
              <Input
                id="edit_skill_name"
                name="name"
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                hasError={Boolean(fieldError("name"))}
                disabled={isPending}
              />
              {fieldError("name") ? (
                <p className="text-[11px] text-danger">{fieldError("name")}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="edit_skill_category"
                  className="block text-xs font-medium text-ink"
                >
                  Kategori
                </label>
                <select
                  id="edit_skill_category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SkillCategory)}
                  disabled={isPending}
                  className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-all duration-150 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60"
                >
                  {SKILL_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit_skill_order"
                  className="block text-xs font-medium text-ink"
                >
                  Urutan
                </label>
                <Input
                  id="edit_skill_order"
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
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 rounded-b-xl border-t border-line bg-canvas/60 px-5 py-3.5">
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
              <span>{isPending ? "Menyimpan..." : "Simpan"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}