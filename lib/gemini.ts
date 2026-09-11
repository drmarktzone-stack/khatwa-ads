import type { BusinessFacts, CopyLine, Lang } from "./types";
import { assertDistinct, buildCopyLines } from "./copy-engine";

interface GeminiLine {
  kind: "headline" | "hook" | "cta";
  text: string;
  angle: string;
  ctaLabel: string;
}

function geminiEnabled(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (process.env.GOOGLE_CLOUD_PROJECT && process.env.VERTEX_API_KEY),
  );
}

function promptFor(facts: BusinessFacts, lang: Lang, fallback: CopyLine[]): string {
  const langName = lang === "ar" ? "Palestinian colloquial Arabic (اللهجة الفلسطينية)" : lang === "he" ? "natural Israeli Hebrew" : "clear English";
  return `You write Meta ad lines for local businesses.
LANGUAGE: ${langName}
FACTS ONLY — never invent phone, place, services, prices, discounts, or ROAS.
If a fact is missing, do not pretend it exists.
Return JSON array of at least 20 objects: {kind: headline|hook|cta, text, angle, ctaLabel}
Each text must be unique. Each ctaLabel must be unique. No repeated CTAs.
Do not mention ROAS, invented shekels, or English-only if language is ar/he.

FACTS:
${JSON.stringify(
    {
      name: facts.name.value,
      phone: facts.phone.value,
      place: facts.place.value,
      services: facts.services,
      niche: facts.niche,
      url: facts.url,
      missing: [
        !facts.name.value && "name",
        !facts.phone.value && "phone",
        !facts.place.value && "place",
        facts.services.length === 0 && "services",
      ].filter(Boolean),
    },
    null,
    2,
  )}

You may lightly vary these fallback angles, still facts-only:
${fallback
  .slice(0, 8)
  .map((l) => `${l.kind}: ${l.angle}`)
  .join("\n")}`;
}

async function callGeminiStudio(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const model = process.env.VERTEX_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callVertex(prompt: string): Promise<string | null> {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.VERTEX_LOCATION || "us-central1";
  const model = process.env.VERTEX_MODEL || "gemini-2.0-flash";
  const key = process.env.VERTEX_API_KEY;
  if (!project || !key) return null;
  const res = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function parseLines(raw: string): CopyLine[] | null {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as GeminiLine[];
    if (!Array.isArray(parsed) || parsed.length < 20) return null;
    const lines: CopyLine[] = parsed.map((row, i) => ({
      id: `gem-${row.kind}-${row.angle || i}`,
      kind: row.kind,
      text: String(row.text || "").trim(),
      angle: String(row.angle || `a${i}`),
      ctaLabel: String(row.ctaLabel || row.text || "").trim(),
    }));
    if (lines.some((l) => !l.text)) return null;
    const banned = /roas|4x|xx%|₪\s*\d|nis\s*\d|\$\d/i;
    if (lines.some((l) => banned.test(l.text))) return null;
    if (!assertDistinct(lines)) return null;
    return lines;
  } catch {
    return null;
  }
}

export async function linesWithOptionalGemini(
  facts: BusinessFacts,
  lang: Lang,
): Promise<{ lines: CopyLine[]; usedGemini: boolean }> {
  const fallback = buildCopyLines(facts, lang);
  if (!geminiEnabled()) return { lines: fallback, usedGemini: false };
  try {
    const prompt = promptFor(facts, lang, fallback);
    const raw = (await callGeminiStudio(prompt)) || (await callVertex(prompt));
    if (!raw) return { lines: fallback, usedGemini: false };
    const parsed = parseLines(raw);
    if (!parsed) return { lines: fallback, usedGemini: false };
    return { lines: parsed, usedGemini: true };
  } catch {
    return { lines: fallback, usedGemini: false };
  }
}
