import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SkillRecord } from "@/lib/validators/skills";
import { SkillsManager } from "@/components/admin/skills/skills-manager";

async function SkillsContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("skills")
    .select("id, name, category, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const skills = (data ?? []) as SkillRecord[];

  return <SkillsManager skills={skills} />;
}

export default function AdminSkillsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat daftar keahlian...
        </div>
      }
    >
      <SkillsContent />
    </Suspense>
  );
}