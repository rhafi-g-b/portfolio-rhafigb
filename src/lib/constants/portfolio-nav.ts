export type PortfolioNavItem = {
  id: string;
  href: string;
  label: string;
};

export const PORTFOLIO_NAV_ITEMS: PortfolioNavItem[] = [
  { id: "about", href: "#about", label: "Tentang" },
  { id: "projects", href: "#projects", label: "Proyek" },
  { id: "experiences", href: "#experiences", label: "Pengalaman" },
  { id: "skills", href: "#skills", label: "Keahlian" },
];