import { buildCopyLines } from "./copy-engine";
import { gcpConfig, vertexGenerate } from "./gcp";
import type { BusinessFacts, CopyLine, Lang } from "./types";

async function cloudTranslate(texts: string[], target: "he" | "en"): Promise<string[] | null> {
  const key = gcpConfig().translateKey;
  if (!key) return null;
  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts, source: "ar", target, format: "text" }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { translations?: Array<{ translatedText?: string }> } };
    const out = (data.data?.translations || []).map((t) => t.translatedText || "");
    return out.length === texts.length ? out : null;
  } catch {
    return null;
  }
}

async function geminiTranslate(texts: string[], target: "he" | "en"): Promise<string[] | null> {
  const label = target === "he" ? "natural Israeli Hebrew" : "clear everyday English";
  const raw = await vertexGenerate({
    grounding: false,
    prompt: `Translate each Arabic string to ${label}. Keep meaning. Do not add prices, ROAS, or extra claims.
Return a JSON array of strings in the same order.\n${JSON.stringify(texts)}`,
  });
  if (!raw) return null;
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== texts.length) return null;
    return parsed.map((x) => String(x));
  } catch {
    return null;
  }
}

export async function translateLines(
  baseAr: CopyLine[],
  facts: BusinessFacts,
  target: Lang,
): Promise<{ lines: CopyLine[]; usedTranslate: boolean }> {
  if (target === "ar") return { lines: baseAr, usedTranslate: false };
  const texts = baseAr.flatMap((l) => [l.text, l.ctaLabel]);
  const viaCloud = await cloudTranslate(texts, target);
  const viaGem = viaCloud || (await geminiTranslate(texts, target));
  if (viaGem) {
    const lines = baseAr.map((line, i) => ({
      ...line,
      text: viaGem[i * 2] || line.text,
      ctaLabel: viaGem[i * 2 + 1] || line.ctaLabel,
    }));
    return { lines, usedTranslate: true };
  }
  return { lines: buildCopyLines(facts, target), usedTranslate: false };
}
