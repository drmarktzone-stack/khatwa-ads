import type { CopyKind, CopyNeed, CtaStyle, Lang, NicheId, ScanField } from "../types";

export interface CopyTemplate {
  kind: CopyKind;
  angle: string;
  ar: string;
  he: string;
  en: string;
  ctaAr: string;
  ctaHe: string;
  ctaEn: string;
  need?: CopyNeed;
}

export interface ImageMotif {
  id: string;
  theme: string;
  src: string;
  queries: string[];
  captionAr: string;
  captionHe: string;
  captionEn: string;
}

export interface NicheDefinition {
  id: Exclude<NicheId, "out_of_niche">;
  labels: Record<Lang, string>;
  /** Distinctive detect terms. Longer / rarer terms score higher. */
  keywords: string[];
  /** Extra weight if these appear (disambiguators). */
  strongKeywords?: string[];
  /** If these dominate, do not pick this niche. */
  vetoKeywords?: string[];
  copy: CopyTemplate[];
  motifs: ImageMotif[];
  stockQueries: string[];
  scanPriority: ScanField[];
  ctaStyle: CtaStyle;
  serviceCatalog: string[];
  /** Clinic-only hooks that must never leak into this warehouse. */
  forbiddenHooks?: string[];
}

export interface OutOfNicheDefinition {
  id: "out_of_niche";
  labels: Record<Lang, string>;
  keywords: string[];
  strongKeywords?: string[];
  vetoKeywords?: string[];
  copy: CopyTemplate[];
  motifs: ImageMotif[];
  stockQueries: string[];
  scanPriority: ScanField[];
  ctaStyle: CtaStyle;
  serviceCatalog: string[];
  forbiddenHooks?: string[];
}

export type AnyNicheDefinition = NicheDefinition | OutOfNicheDefinition;

export const NICHE_IDS: Exclude<NicheId, "out_of_niche">[] = [
  "lawyers",
  "real_estate_agents",
  "medical_clinics",
  "dental",
  "beauty_aesthetic",
  "contractors",
  "tutoring",
  "restaurants",
  "fitness",
  "home_trades",
];

export const ANGLE_GROUPS = [
  { id: "name", match: /^(name|who|hello|brand)/i, ar: "الاسم", he: "שם", en: "Name" },
  { id: "place", match: /^(place|near|map|local|area)/i, ar: "المكان", he: "מקום", en: "Place" },
  { id: "contact", match: /^(wa|whatsapp|call|phone|contact)/i, ar: "تواصل", he: "יצירת קשר", en: "Contact" },
  { id: "pain", match: /^(pain|worry|urgent|emergency|stuck)/i, ar: "الوجع", he: "כאב", en: "Pain" },
  { id: "usp", match: /^(usp|service|offer|menu|subject|scope)/i, ar: "الخدمة", he: "שירות", en: "Offer" },
  { id: "hours", match: /^(hours|today|tonight|week|open)/i, ar: "الدوام", he: "שעות", en: "Hours" },
  { id: "visit", match: /^(visit|book|first|trial|table|mat)/i, ar: "الزيارة", he: "ביקור", en: "Visit" },
] as const;

export type AngleGroupId = (typeof ANGLE_GROUPS)[number]["id"] | "other";
