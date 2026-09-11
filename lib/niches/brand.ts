import type { BusinessFacts } from "../types";

/** Marketing slogans that must never be pasted as a business name. */
export const BANNED_NAME_SLOGANS = [
  "طفلك بخير وقلبك مرتاح",
  "طفلك بخير",
  "قلبك مرتاح",
  "your child is well",
  "your heart is at ease",
];

const SLOGAN_SHAPE =
  /^(?=.{16,})(?!د[\.٫]?\s)(?!ד["״]?ר\s)(?!dr\.?\s)(?!عيادتي\b).*(بخير|مرتاح|أحلى|أفضل|رقم\s*١|رقم\s*1|بدون\s*قلق|100\s*%|مجانا)/i;

const DOCTOR_NAME =
  /(?:^|[|\-–—:·]\s*)((?:د(?:كتور)?|الدكتور)\s*\.?\s*[\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,}){0,4}|ד["״]?ר\s+[\u0590-\u05FF]{2,}(?:\s+[\u0590-\u05FF]{2,}){0,4}|Dr\.?\s+[A-Za-z][A-Za-z.'-]{1,}(?:\s+[A-Za-z][A-Za-z.'-]{1,}){0,3})/i;

const CLINIC_SELF = /عيادتي|מרפאתי|my clinic/i;

/** Emergency / civic numbers — never treat as a shop phone. */
const BANNED_PHONE = /^(?:\+?0*)(?:100|101|102|103|104|106|107|108|110|112|911|999)$/;

const JERUSALEM = /القدس|ירושלים|jerusalem|al-?\s*quds/i;

export function isBannedSloganName(text: string | null | undefined): boolean {
  const raw = (text || "").replace(/\s+/g, " ").trim();
  if (!raw) return false;
  const compact = raw.toLowerCase();
  if (BANNED_NAME_SLOGANS.some((s) => compact.includes(s.toLowerCase()))) return true;
  if (SLOGAN_SHAPE.test(raw) && !DOCTOR_NAME.test(raw) && !CLINIC_SELF.test(raw)) return true;
  return false;
}

export function looksLikeDoctorName(text: string | null | undefined): boolean {
  return Boolean(text && DOCTOR_NAME.test(text));
}

export function extractDoctorName(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(DOCTOR_NAME);
  if (!match) return null;
  const name = (match[1] || match[0]).replace(/^[\s|\-–—:·]+/, "").trim();
  return name.slice(0, 80) || null;
}

export function isBannedPhone(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const digits = raw.replace(/[^\d]/g, "");
  if (BANNED_PHONE.test(digits)) return true;
  if (digits === "100" || digits === "101" || digits === "911") return true;
  return false;
}

export function filterRealPhones(phones: string[]): string[] {
  const out: string[] = [];
  for (const phone of phones) {
    const trimmed = phone.replace(/\s+/g, " ").trim();
    if (!trimmed || isBannedPhone(trimmed)) continue;
    const digits = trimmed.replace(/[^\d]/g, "");
    if (digits.length < 8) continue;
    if (out.some((p) => p.replace(/[^\d]/g, "") === digits)) continue;
    out.push(trimmed);
  }
  return out.slice(0, 4);
}

export function mentionsJerusalem(text: string | null | undefined): boolean {
  return Boolean(text && JERUSALEM.test(text));
}

/** Jerusalem is allowed only when the scanned place itself is Jerusalem — never invented. */
export function jerusalemAllowed(place: string | null | undefined): boolean {
  return mentionsJerusalem(place);
}

export function stripInventedJerusalem(text: string, place: string | null | undefined): string | null {
  if (!mentionsJerusalem(text)) return text;
  if (jerusalemAllowed(place)) return text;
  return null;
}

export function medicalFallbackName(): string {
  return "عيادتي";
}

export function pickHonestName(opts: {
  candidates: Array<{ value: string; evidence: "on_page" | "hostname" | "demo" }>;
  host: string;
  blob: string;
  medical: boolean;
}): { value: string; evidence: "on_page" | "hostname" | "demo"; snippet?: string } {
  const cleaned: Array<{ value: string; evidence: "on_page" | "hostname" | "demo" }> = [];
  for (const c of opts.candidates) {
    const value = tidyName(c.value);
    if (!value || isBannedSloganName(value)) continue;
    cleaned.push({ value, evidence: c.evidence });
  }

  if (opts.medical) {
    const fromBlob = extractDoctorName(opts.blob);
    if (fromBlob && !isBannedSloganName(fromBlob)) {
      return { value: shortenDoctor(fromBlob), evidence: "on_page", snippet: fromBlob };
    }
    const doctor = cleaned.find((c) => looksLikeDoctorName(c.value));
    if (doctor) return { ...doctor, value: shortenDoctor(doctor.value), snippet: doctor.value };
    const clinicSelf = cleaned.find((c) => CLINIC_SELF.test(c.value));
    if (clinicSelf) return { ...clinicSelf, snippet: clinicSelf.value };
    const shortClinic = cleaned.find((c) => /عيادة|מרפאה|clinic/i.test(c.value) && c.value.length <= 40);
    if (shortClinic) return { ...shortClinic, snippet: shortClinic.value };
    return { value: medicalFallbackName(), evidence: cleaned[0]?.evidence === "demo" ? "demo" : "on_page", snippet: "عيادتي" };
  }

  if (cleaned[0]) return { ...cleaned[0], snippet: cleaned[0].value };
  return { value: opts.host, evidence: "hostname" };
}

export function shortenDoctor(name: string): string {
  const ar = name.match(/^(د(?:كتور)?\.?\s*[\u0600-\u06FF]+)/);
  if (ar) return ar[1].replace(/\s+/g, " ").trim();
  const he = name.match(/^(ד["״]?ר\s+[\u0590-\u05FF]+)/);
  if (he) return he[1].trim();
  const en = name.match(/^(Dr\.?\s+[A-Za-z]+)/i);
  if (en) return en[1];
  return name.slice(0, 40);
}

export function tidyName(raw: string): string {
  const decoded = raw.replace(/\s+/g, " ").trim();
  if (!decoded) return "";
  const cut = decoded.replace(/\s*[|\-–—].*$/, "").trim() || decoded;
  return cut.slice(0, 80);
}

export function safeDisplayName(facts: Pick<BusinessFacts, "name" | "host" | "niche">): string {
  const raw = facts.name.value || facts.host;
  if (isBannedSloganName(raw)) {
    return facts.niche === "medical_clinics" ? medicalFallbackName() : facts.host;
  }
  if (facts.niche === "medical_clinics" && looksLikeDoctorName(raw)) {
    return shortenDoctor(raw);
  }
  return raw;
}

export function lineInventsFacts(text: string, facts: Pick<BusinessFacts, "place" | "phones" | "phone">): boolean {
  if (stripInventedJerusalem(text, facts.place.value) === null) return true;
  if (/\b(100|101|911)\b/.test(text) && !facts.phones.some((p) => /100|101|911/.test(p))) return true;
  return false;
}
