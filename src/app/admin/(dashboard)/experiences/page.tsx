import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExperienceRecord } from "@/lib/validators/experiences";
import { ExperiencesManager } from "@/components/admin/experiences/experiences-manager";

async function ExperiencesContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("experiences")
    .select(
      "id, company, role, location, start_date, end_date, is_current, description, display_order, created_at, updated_at"
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const experiences = (data ?? []) as ExperienceRecord[];

  return <ExperiencesManager experiences={experiences} />;
}

export default function AdminExperiencesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat riwayat pengalaman...
        </div>
      }
    >
      <ExperiencesContent />
    </Suspense>
  );
}