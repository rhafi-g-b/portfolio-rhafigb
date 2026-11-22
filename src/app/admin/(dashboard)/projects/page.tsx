import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectRecord } from "@/lib/validators/projects";
import { ProjectsManager } from "@/components/admin/projects/projects-manager";

async function ProjectsContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, thumbnail_url, live_url, repo_url, tech_stack, is_featured, is_published, display_order, created_at, updated_at"
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as ProjectRecord[];

  return <ProjectsManager projects={projects} />;
}

export default function AdminProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat daftar proyek...
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}