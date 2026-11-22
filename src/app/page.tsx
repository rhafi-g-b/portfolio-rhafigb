import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getPublicExperiences,
  getPublicPortfolioStats,
  getPublicProjects,
  getPublicSiteSettings,
  getPublicSkills,
  isSafeHttpsUrl,
} from "@/lib/queries/portfolio";
import { MotionProvider } from "@/components/portfolio/motion-provider";
import { PortfolioNavbar } from "@/components/portfolio/navbar";
import { HeroSection } from "@/components/portfolio/hero-section";
import { AboutSection } from "@/components/portfolio/about-section";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { ExperiencesSection } from "@/components/portfolio/experiences-section";
import { SkillsSection } from "@/components/portfolio/skills-section";
import { ContactSection } from "@/components/portfolio/contact-section";
import { PortfolioFooter } from "@/components/portfolio/footer";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connection();
    const settings = await getPublicSiteSettings();
    const title =
      settings.seo_title.trim() || `${settings.brand_name} — Portfolio`;
    const description =
      settings.seo_description.trim() ||
      settings.hero_subtitle.trim() ||
      "Portofolio proyek, riwayat pengalaman, dan keahlian pengembangan perangkat lunak.";
    const safeAvatarUrl = isSafeHttpsUrl(settings.avatar_url)
      ? settings.avatar_url
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        ...(safeAvatarUrl ? { images: [{ url: safeAvatarUrl }] } : {}),
      },
      twitter: {
        card: safeAvatarUrl ? "summary_large_image" : "summary",
        title,
        description,
        ...(safeAvatarUrl ? { images: [safeAvatarUrl] } : {}),
      },
    };
  } catch {
    return {
      title: "Portfolio",
      description:
        "Portofolio proyek, riwayat pengalaman, dan keahlian pengembangan perangkat lunak.",
    };
  }
}

async function PortfolioShell() {
  await connection();
  const [settings, stats, projects, experiences, skills] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPortfolioStats(),
    getPublicProjects(),
    getPublicExperiences(),
    getPublicSkills(),
  ]);

  const safeCvUrl = isSafeHttpsUrl(settings.cv_url) ? settings.cv_url : null;
  const safeAvatarUrl = isSafeHttpsUrl(settings.avatar_url)
    ? settings.avatar_url
    : null;
  const safeGithubUrl = isSafeHttpsUrl(settings.github_url)
    ? settings.github_url
    : null;
  const safeLinkedinUrl = isSafeHttpsUrl(settings.linkedin_url)
    ? settings.linkedin_url
    : null;
  const currentYear = new Date().getFullYear();

  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <PortfolioNavbar
          brandName={settings.brand_name}
          cvUrl={safeCvUrl}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 sm:px-6">
          <HeroSection
            brandName={settings.brand_name}
            heroTitle={settings.hero_title}
            heroSubtitle={settings.hero_subtitle}
            contactEmail={settings.contact_email}
            githubUrl={safeGithubUrl}
            linkedinUrl={safeLinkedinUrl}
            avatarUrl={safeAvatarUrl}
            cvUrl={safeCvUrl}
          />

          <AboutSection aboutBio={settings.about_bio} stats={stats} />

          <ProjectsSection projects={projects} />

          <ExperiencesSection experiences={experiences} />

          <SkillsSection skills={skills} />

          <ContactSection
            contactEmail={settings.contact_email}
            githubUrl={safeGithubUrl}
            linkedinUrl={safeLinkedinUrl}
            cvUrl={safeCvUrl}
          />
        </main>

        <PortfolioFooter
          brandName={settings.brand_name}
          githubUrl={safeGithubUrl}
          linkedinUrl={safeLinkedinUrl}
          cvUrl={safeCvUrl}
          year={currentYear}
        />
      </div>
    </MotionProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-xs text-ink-muted">
          Memuat portofolio...
        </div>
      }
    >
      <PortfolioShell />
    </Suspense>
  );
}