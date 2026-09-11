import { assertDistinct, dedupeLines } from "../guards";
import type { BusinessFacts, CopyKind, CopyLine, Lang } from "../types";
import { lineInventsFacts, safeDisplayName } from "./brand";
import { getNiche } from "./registry";
import type { CopyTemplate } from "./types";
import { ANGLE_GROUPS, type AngleGroupId } from "./types";

function pick(facts: BusinessFacts, i: number) {
  return {
    name: safeDisplayName(facts),
    place: facts.place.value,
    service: facts.services.length ? facts.services[i % facts.services.length] : null,
    phone: facts.phone.value,
    hours: facts.hours.value,
    wa: facts.whatsapp.value,
  };
}

export function fillTemplate(template: string, facts: BusinessFacts, index: number): string {
  const p = pick(facts, index);
  return template
    .replaceAll("{name}", p.name)
    .replaceAll("{place}", p.place || "")
    .replaceAll("{service}", p.service || "")
    .replaceAll("{phone}", p.phone || "")
    .replaceAll("{hours}", p.hours || "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([،,.!?])/g, "$1")
    .replace(/\s+[—–-]\s*$/g, "")
    .trim();
}

function hasNeed(facts: BusinessFacts, need?: CopyTemplate["need"]): boolean {
  if (!need) return true;
  if (need === "phone") return Boolean(facts.phone.value);
  if (need === "whatsapp") return Boolean(facts.whatsapp.value || facts.phone.value);
  if (need === "place") return Boolean(facts.place.value);
  if (need === "hours") return Boolean(facts.hours.value);
  if (need === "service") return facts.services.length > 0;
  return true;
}

function renderSeed(seed: CopyTemplate, facts: BusinessFacts, lang: Lang, index: number): CopyLine | null {
  if (!hasNeed(facts, seed.need)) return null;
  const raw = lang === "he" ? seed.he : lang === "en" ? seed.en : seed.ar;
  const ctaRaw = lang === "he" ? seed.ctaHe : lang === "en" ? seed.ctaEn : seed.ctaAr;
  const text = fillTemplate(raw, facts, index);
  const ctaLabel = fillTemplate(ctaRaw, facts, index);
  if (!text || !ctaLabel) return null;
  if (lineInventsFacts(text, facts) || lineInventsFacts(ctaLabel, facts)) return null;
  return {
    id: `${seed.kind}-${seed.angle}`,
    kind: seed.kind,
    text,
    angle: seed.angle,
    ctaLabel,
  };
}

export function buildCopyLines(facts: BusinessFacts, lang: Lang): CopyLine[] {
  const def = getNiche(facts.niche);
  const lines: CopyLine[] = [];
  def.copy.forEach((seed, index) => {
    const row = renderSeed(seed, facts, lang, index);
    if (row) lines.push(row);
  });

  const unique = dedupeLines(lines);
  if (unique.length < 20) {
    const name = safeDisplayName(facts);
    const extras: CopyLine[] = [
      {
        id: "extra-hello",
        kind: "headline",
        angle: "hello",
        text: lang === "ar" ? `مرحبا في ${name}` : lang === "he" ? `ברוכים הבאים ל${name}` : `Welcome to ${name}`,
        ctaLabel: lang === "ar" ? "أهلاً" : lang === "he" ? "שלום" : "Hello",
      },
      {
        id: "extra-more",
        kind: "hook",
        angle: "more",
        text:
          lang === "ar"
            ? `في تفاصيل زيادة عن ${name} على الصفحة.`
            : lang === "he"
              ? `יש עוד פרטים על ${name} בעמוד.`
              : `More about ${name} is on the page.`,
        ctaLabel: lang === "ar" ? "زِد قراءة" : lang === "he" ? "קראו עוד קצת" : "Read a bit more",
      },
      {
        id: "extra-go",
        kind: "cta",
        angle: "go",
        text: lang === "ar" ? `كمّل لصفحة ${name}` : lang === "he" ? `המשיכו לעמוד ${name}` : `Continue to ${name}`,
        ctaLabel: lang === "ar" ? "كمّل" : lang === "he" ? "המשיכו" : "Continue",
      },
      {
        id: "extra-ask",
        kind: "cta",
        angle: "ask-page",
        text: lang === "ar" ? `اسأل ${name} سؤال واحد` : lang === "he" ? `שאלו את ${name} שאלה אחת` : `Ask ${name} one question`,
        ctaLabel: lang === "ar" ? "اسأل سؤال" : lang === "he" ? "שאלו שאלה" : "Ask one question",
      },
    ];
    for (const extra of extras) {
      if (unique.length >= 24) break;
      if (unique.some((l) => l.text === extra.text)) continue;
      if (lineInventsFacts(extra.text, facts)) continue;
      unique.push(extra);
    }
  }
  return unique;
}

export function sanitizeGeneratedLines(lines: CopyLine[], facts: BusinessFacts): CopyLine[] {
  const name = safeDisplayName(facts);
  const sloganLeak = /طفلك بخير|قلبك مرتاح/i;
  return dedupeLines(
    lines.filter((line) => {
      if (lineInventsFacts(line.text, facts) || lineInventsFacts(line.ctaLabel, facts)) return false;
      if (sloganLeak.test(line.text) && !sloganLeak.test(name)) return false;
      return true;
    }),
  );
}

export function angleGroupOf(angle: string): AngleGroupId {
  for (const g of ANGLE_GROUPS) {
    if (g.match.test(angle)) return g.id;
  }
  return "other";
}

export function groupLinesByAngle(lines: CopyLine[]): Array<{ id: AngleGroupId; label: { ar: string; he: string; en: string }; lines: CopyLine[] }> {
  const buckets = new Map<AngleGroupId, CopyLine[]>();
  for (const line of lines) {
    const id = angleGroupOf(line.angle);
    const list = buckets.get(id) || [];
    list.push(line);
    buckets.set(id, list);
  }
  const order: AngleGroupId[] = ["name", "place", "contact", "pain", "usp", "hours", "visit", "other"];
  const labels: Record<AngleGroupId, { ar: string; he: string; en: string }> = {
    name: { ar: "الاسم", he: "שם", en: "Name" },
    place: { ar: "المكان", he: "מקום", en: "Place" },
    contact: { ar: "تواصل", he: "יצירת קשר", en: "Contact" },
    pain: { ar: "الوجع", he: "כאב", en: "Pain" },
    usp: { ar: "الخدمة", he: "שירות", en: "Offer" },
    hours: { ar: "الدوام", he: "שעות", en: "Hours" },
    visit: { ar: "الزيارة", he: "ביקור", en: "Visit" },
    other: { ar: "زوايا ثانية", he: "זוויות נוספות", en: "More angles" },
  };
  return order
    .filter((id) => (buckets.get(id) || []).length)
    .map((id) => ({ id, label: labels[id], lines: buckets.get(id) || [] }));
}

export function warehouseHasKind(facts: BusinessFacts, kind: CopyKind): boolean {
  return getNiche(facts.niche).copy.some((s) => s.kind === kind);
}

export { assertDistinct };
