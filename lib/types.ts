export type Lang = "ar" | "he" | "en";

export type Niche =
  | "clinic"
  | "tutoring"
  | "restaurant"
  | "renovation"
  | "fitness"
  | "out_of_niche";

export type CopyKind = "headline" | "hook" | "cta";

export type EvidenceLevel = "on_page" | "missing" | "demo" | "hostname";

export interface FactField {
  value: string | null;
  evidence: EvidenceLevel;
  snippet?: string;
}

export interface BusinessFacts {
  url: string;
  host: string;
  name: FactField;
  phone: FactField;
  place: FactField;
  services: string[];
  servicesEvidence: EvidenceLevel;
  description: FactField;
  niche: Niche;
  fetched: boolean;
  usedDemo: boolean;
  sourceTitle: string | null;
}

export interface CopyLine {
  id: string;
  kind: CopyKind;
  text: string;
  angle: string;
  ctaLabel: string;
}

export interface NicheImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

export interface ScanPayload {
  facts: BusinessFacts;
  lines: CopyLine[];
  images: NicheImage[];
  outOfNiche: boolean;
  usedGemini: boolean;
  notice: string | null;
  lang: Lang;
}

export interface SelectionState {
  lineIds: string[];
  imageIds: string[];
}
