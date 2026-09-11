import { buildCopyLines, sanitizeGeneratedLines } from "./niches/copy";
import { getNiche, nicheLabel, safeDisplayName } from "./niches";
import { gcpConfig, vertexGenerate } from "./gcp";
import { assertDistinct, dedupeLines, looksLikeChrome } from "./guards";
import type { BusinessFacts, CopyLine, Lang } from "./types";

interface GeminiLine {
  kind: "headline" | "hook" | "cta";
  text: string;
  angle: string;
  ctaLabel: string;
}

function promptAr(facts: BusinessFacts): string {
  const def = getNiche(facts.niche);
  const name = safeDisplayName(facts);
  const angles = def.copy.map((s) => s.angle).slice(0, 24).join(", ");
  return `Write Meta ad lines for a local business in Palestinian colloquial Arabic (اللهجة الفلسطينية).
FACTS ONLY. Never invent phone, place, hours, services, prices, discounts, or ROAS.
If a fact is missing, do not mention it.
Never invent Jerusalem / القدس / ירושלים unless FACTS.place already contains it.
Never use a marketing slogan as the business name. Forbidden name: «طفلك بخير وقلبك مرتاح».
Use this name only: "${name}". Medical clinics may use عيادتي or a doctor name — never a slogan.
Banned phones as the shop number: 100, 101, 911.
Niche is exactly "${facts.niche}" (${nicheLabel(facts.niche, "ar")}). Use this niche's angles only. Do not dump clinic hooks on a restaurant or dental lines on a plumber.
Warehouse angles to vary: ${angles}
CTA style: ${def.ctaStyle} (WhatsApp and/or call — only if a real phone exists).
No engine slogans, no "facts engine", no "scan again", no Facebook chrome (Sponsored/Like/Comment/Share).
No repeated CTAs. Each text unique. Each ctaLabel unique.
Return JSON array of at least 22 objects: {kind: headline|hook|cta, text, angle, ctaLabel}

FACTS:
${JSON.stringify(
    {
      name,
      phones: facts.phones,
      whatsapp: facts.whatsapp.value,
      place: facts.place.value,
      hours: facts.hours.value,
      services: facts.services,
      niche: facts.niche,
      url: facts.url,
      missing: [
        !facts.phone.value && "phone",
        !facts.place.value && "place",
        !facts.hours.value && "hours",
        facts.services.length === 0 && "services",
      ].filter(Boolean),
    },
    null,
    2,
  )}`;
}

function parseLines(raw: string, facts: BusinessFacts): CopyLine[] | null {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as GeminiLine[];
    if (!Array.isArray(parsed) || parsed.length < 20) return null;
    const lines = sanitizeGeneratedLines(
      dedupeLines(
        parsed.map((row, i) => ({
          id: `gem-${row.kind}-${row.angle || i}`,
          kind: row.kind,
          text: String(row.text || "").trim(),
          angle: String(row.angle || `a${i}`),
          ctaLabel: String(row.ctaLabel || "").trim() || String(row.text || "").trim(),
        })),
      ),
      facts,
    );
    if (lines.some((l) => looksLikeChrome(l.text))) return null;
    if (!assertDistinct(lines)) return null;
    return lines;
  } catch {
    return null;
  }
}

export async function generateArabicLines(
  facts: BusinessFacts,
): Promise<{ lines: CopyLine[]; usedGemini: boolean; usedGrounding: boolean }> {
  const fallback = buildCopyLines(facts, "ar");
  const cfg = gcpConfig();
  try {
    let raw = await vertexGenerate({
      prompt: promptAr(facts),
      grounding: cfg.grounding,
    });
    let grounded = Boolean(raw && cfg.grounding);
    if (!raw) {
      raw = await vertexGenerate({ prompt: promptAr(facts), grounding: false });
      grounded = false;
    }
    if (!raw) return { lines: fallback, usedGemini: false, usedGrounding: false };
    const parsed = parseLines(raw, facts);
    if (!parsed) return { lines: fallback, usedGemini: false, usedGrounding: false };
    return { lines: parsed, usedGemini: true, usedGrounding: grounded };
  } catch {
    return { lines: fallback, usedGemini: false, usedGrounding: false };
  }
}

export async function linesWithOptionalGemini(
  facts: BusinessFacts,
  lang: Lang,
): Promise<{ lines: CopyLine[]; usedGemini: boolean; usedGrounding: boolean }> {
  const ar = await generateArabicLines(facts);
  if (lang === "ar") return ar;
  return { lines: buildCopyLines(facts, lang), usedGemini: ar.usedGemini, usedGrounding: ar.usedGrounding };
}
