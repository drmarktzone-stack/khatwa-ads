export type Lang = "ar" | "he" | "en";

export type NicheId =
  | "lawyers"
  | "real_estate_agents"
  | "medical_clinics"
  | "dental"
  | "beauty_aesthetic"
  | "contractors"
  | "tutoring"
  | "restaurants"
  | "fitness"
  | "home_trades"
  | "out_of_niche";

/** @deprecated Use NicheId — kept as an alias for existing imports. */
export type Niche = NicheId;

export type CopyKind = "headline" | "hook" | "cta";

export type EvidenceLevel = "on_page" | "missing" | "demo" | "hostname";

export type ImageSource = "site" | "stock" | "generated" | "demo";

export type CtaStyle = "whatsapp" | "call" | "whatsapp_or_call";

export type ScanField = "name" | "phone" | "whatsapp" | "place" | "hours" | "services";

export type CopyNeed = "phone" | "place" | "hours" | "service" | "whatsapp";

export interface FactField {
  value: string | null;
  evidence: EvidenceLevel;
  snippet?: string;
}

export interface BusinessFacts {
  url: string;
  host: string;
  /** `demo:<slug>` for built-in samples, `site:<host>` for a live scan. */
  businessId: string;
  name: FactField;
  phone: FactField;
  phones: string[];
  whatsapp: FactField;
  place: FactField;
  hours: FactField;
  services: string[];
  servicesEvidence: EvidenceLevel;
  description: FactField;
  niche: NicheId;
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
  source: ImageSource;
}

export interface ToolFlags {
  gemini: boolean;
  grounding: boolean;
  translate: boolean;
  imagen: boolean;
  siteImages: boolean;
}

export interface ScanPayload {
  facts: BusinessFacts;
  baseLines: CopyLine[];
  lines: CopyLine[];
  images: NicheImage[];
  outOfNiche: boolean;
  tools: ToolFlags;
  notice: string | null;
  lang: Lang;
  /** The URL the user submitted (empty string only for the empty-URL sample path). */
  inputUrl?: string;
  scannedAt?: number;
}

export interface SelectionState {
  lineIds: string[];
  imageIds: string[];
}
