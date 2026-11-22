"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  saveSkillAction,
  type SkillSaveActionState,
} from "@/actions/skills";
import {
  SKILL_CATEGORIES,
  type SkillCategory,
} from "@/lib/validators/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const initialState: SkillSaveActionState = {
  status: "idle",
  message: null,
};

export function SkillQuickAdd() {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    saveSkillAction,
    initialState
  );

  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("language");
  const [displayOrder, setDisplayOrder] = useState("0");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const lastTsRef = useRef<number | undefined>(undefined);

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
        setName("");
        setDisplayOrder("0");
        nameInputRef.current?.focus();
      }
    }
  }, [state, showToast]);

  const fieldError = (key: string) => state.fieldErrors?.[key];

  return (
    <form
      action={formAction}
      className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          Tambah Keahlian Cepat
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Masukkan nama teknologi dan pilih kategorinya untuk langsung
          ditampilkan di portofolio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-start">
        <div className="space-y-1 sm:col-span-5">
          <label
            htmlFor="quick_skill_name"
            className="block text-xs font-medium text-ink"
          >
            Nama Keahlian
          </label>
          <Input
            ref={nameInputRef}
            id="quick_skill_name"
            name="name"
            required
            maxLength={60}
            placeholder="Contoh: TypeScript, Next.js, Docker"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hasError={Boolean(fieldError("name"))}
            disabled={isPending}
          />
          {fieldError("name") ? (
            <p className="text-[11px] text-danger">{fieldError("name")}</p>
          ) : null}
        </div>

        <div className="space-y-1 sm:col-span-4">
          <label
            htmlFor="quick_skill_category"
            className="block text-xs font-medium text-ink"
          >
            Kategori
          </label>
          <select
            id="quick_skill_category"
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

        <div className="space-y-1 sm:col-span-1">
          <label
            htmlFor="quick_skill_order"
            className="block text-xs font-medium text-ink"
          >
            Urutan
          </label>
          <Input
            id="quick_skill_order"
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

        <div className="sm:col-span-2 sm:pt-5">
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            disabled={!name.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>
    </form>
  );
}