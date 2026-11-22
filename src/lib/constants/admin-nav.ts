export type AdminNavIcon =
  | "overview"
  | "settings"
  | "projects"
  | "experiences"
  | "skills"
  | "messages"
  | "audit";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    description: "Ringkasan konten dan status keamanan portofolio.",
    icon: "overview",
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    description: "Profil utama, Hero, tautan sosial, CV, dan SEO.",
    icon: "settings",
  },
  {
    href: "/admin/projects",
    label: "Proyek",
    description: "Kelola daftar karya dan studi kasus unggulan.",
    icon: "projects",
  },
  {
    href: "/admin/experiences",
    label: "Pengalaman",
    description: "Riwayat pekerjaan dan peran profesional.",
    icon: "experiences",
  },
  {
    href: "/admin/skills",
    label: "Keahlian",
    description: "Kelompokkan bahasa, framework, database, dan tools.",
    icon: "skills",
  },
  {
    href: "/admin/messages",
    label: "Pesan Masuk",
    description: "Inbox pesan dari formulir kontak pengunjung.",
    icon: "messages",
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Log",
    description: "Riwayat aktivitas keamanan dan perubahan data.",
    icon: "audit",
  },
];