import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SkillCategory } from "@/lib/validators/skills";

export type PublicSiteSettings = {
  brand_name: string;
  hero_title: string;
  hero_subtitle: string;
  about_bio: string;
  contact_email: string;
  github_url: string;
  linkedin_url: string;
  avatar_url: string;
  cv_url: string;
  seo_title: string;
  seo_description: string;
};

export type PublicPortfolioStats = {
  publishedProjects: number;
  totalExperiences: number;
  totalSkills: number;
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail_url: string | null;
  live_url: string | null;
  repo_url: string | null;
  tech_stack: string[];
  is_featured: boolean;
};

export type PublicExperience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
};

export type PublicSkill = {
  id: string;
  name: string;
  category: SkillCategory;
};

const VALID_SKILL_CATEGORIES = new Set<SkillCategory>([
  "language",
  "framework",
  "database",
  "tools",
  "other",
]);

function normalizeSkillCategory(value: string): SkillCategory {
  return VALID_SKILL_CATEGORIES.has(value as SkillCategory)
    ? (value as SkillCategory)
    : "other";
}

export function isSafeHttpsUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("site_settings")
    .select(
      "brand_name, hero_title, hero_subtitle, about_bio, contact_email, github_url, linkedin_url, avatar_url, cv_url, seo_title, seo_description"
    )
    .eq("id", 1)
    .maybeSingle();

  return {
    brand_name: data?.brand_name ?? "Portfolio",
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
}

export async function getPublicPortfolioStats(): Promise<PublicPortfolioStats> {
  const supabase = await createSupabaseServerClient();

  const [
    { count: publishedProjects },
    { count: totalExperiences },
    { count: totalSkills },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("experiences").select("id", { count: "exact", head: true }),
    supabase.from("skills").select("id", { count: "exact", head: true }),
  ]);

  return {
    publishedProjects: publishedProjects ?? 0,
    totalExperiences: totalExperiences ?? 0,
    totalSkills: totalSkills ?? 0,
  };
}

export async function getPublicProjects(): Promise<PublicProject[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, thumbnail_url, live_url, repo_url, tech_stack, is_featured"
    )
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    description: item.description ?? "",
    thumbnail_url: isSafeHttpsUrl(item.thumbnail_url ?? "")
      ? item.thumbnail_url
      : null,
    live_url: isSafeHttpsUrl(item.live_url ?? "") ? item.live_url : null,
    repo_url: isSafeHttpsUrl(item.repo_url ?? "") ? item.repo_url : null,
    tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack : [],
    is_featured: Boolean(item.is_featured),
  }));
}

export async function getPublicExperiences(): Promise<PublicExperience[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("experiences")
    .select(
      "id, company, role, location, start_date, end_date, is_current, description"
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((item) => ({
    id: item.id,
    company: item.company,
    role: item.role,
    location: item.location ?? "",
    start_date: item.start_date,
    end_date: item.end_date ?? "",
    is_current: Boolean(item.is_current),
    description: item.description ?? "",
  }));
}

export async function getPublicSkills(): Promise<PublicSkill[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    category: normalizeSkillCategory(item.category),
  }));
}