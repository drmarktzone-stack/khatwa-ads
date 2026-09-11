import type { CopyLine } from "./types";

const CHROME =
  /\b(roas|sponsored|sponsored\b|like\b|comment\b|share\b|facts engine|scan again|ads manager chrome|hitl|base44)\b/i;
const CHROME_AR = /محرّك الوقائع|امسح الرابط من جديد|حكايا ROAS|بدون اختراع سعر|شعارات فاضي/;
const PRICE = /(?:roas\s*\d|4x|\d+\s*%|₪\s*\d|nis\s*\d|\$\s*\d|من\s*\d+\s*(?:شيكل|₪))/i;

export function looksLikeChrome(text: string): boolean {
  return CHROME.test(text) || CHROME_AR.test(text) || PRICE.test(text);
}

export function normalizeLine(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function assertDistinct(lines: CopyLine[]): boolean {
  if (lines.length < 20) return false;
  const texts = lines.map((l) => normalizeLine(l.text));
  const ctas = lines.filter((l) => l.kind === "cta").map((l) => normalizeLine(l.ctaLabel));
  if (new Set(texts).size !== texts.length) return false;
  if (ctas.length && new Set(ctas).size !== ctas.length) return false;
  if (lines.some((l) => looksLikeChrome(l.text) || looksLikeChrome(l.ctaLabel))) return false;
  return true;
}

export function dedupeLines(lines: CopyLine[]): CopyLine[] {
  const seen = new Set<string>();
  const out: CopyLine[] = [];
  for (const line of lines) {
    const key = normalizeLine(line.text);
    if (!key || seen.has(key) || looksLikeChrome(line.text)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}
