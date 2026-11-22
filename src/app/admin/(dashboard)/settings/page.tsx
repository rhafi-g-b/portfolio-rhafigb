import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/security/auth-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MediaUploadCard } from "@/components/admin/settings/media-upload-card";
import { IdentitySettingsCard } from "@/components/admin/settings/identity-settings-card";
import { SocialSettingsCard } from "@/components/admin/settings/social-settings-card";
import { SeoSettingsCard } from "@/components/admin/settings/seo-settings-card";

async function SettingsContent() {
  await connection();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("site_settings")
    .select(
      "brand_name, hero_title, hero_subtitle, about_bio, contact_email, github_url, linkedin_url, avatar_url, cv_url, seo_title, seo_description"
    )
    .eq("id", 1)
    .maybeSingle();

  const settings = {
    brand_name: data?.brand_name ?? "",
    hero_title: data?.hero_title ?? "",
    hero_subtitle: data?.hero_subtitle ?? "",
    about_bio: data?.about_bio ?? "",
    contact_email: data?.contact_email ?? "",
    github_url: data?.github_url ?? "",
    linkedin_url: data?.linkedin_url ?? "",
    avatar_url: data?.avatar_url ?? "",
    cv_url: data?.cv_url ?? "",
    seo_title: data?.seo_title ?? "",
    seo_description: data?.seo_description ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          Pengaturan Situs
        </h1>
        <p className="mt-0.5 text-xs text-ink-muted">
          Setiap bagian dapat diperbarui secara terpisah dan langsung diterapkan
          ke portofolio publik.
        </p>
      </div>

      <MediaUploadCard
        avatarUrl={settings.avatar_url}
        cvUrl={settings.cv_url}
      />

      <IdentitySettingsCard
        initialValues={{
          brand_name: settings.brand_name,
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          about_bio: settings.about_bio,
        }}
      />

      <SocialSettingsCard
        initialValues={{
          contact_email: settings.contact_email,
          github_url: settings.github_url,
          linkedin_url: settings.linkedin_url,
        }}
      />

      <SeoSettingsCard
        initialValues={{
          seo_title: settings.seo_title,
          seo_description: settings.seo_description,
        }}
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-muted">
          Memuat pengaturan situs...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}