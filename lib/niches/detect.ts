import type { NicheId } from "../types";
import { NICHE_REGISTRY, SUPPORTED_NICHES } from "./registry";

export interface NicheScore {
  niche: NicheId;
  score: number;
  hits: string[];
}

function hay(text: string): string {
  return text.toLowerCase();
}

function countHits(blob: string, terms: string[]): { score: number; hits: string[] } {
  const hits: string[] = [];
  let score = 0;
  for (const term of terms) {
    const needle = term.toLowerCase();
    if (!needle) continue;
    if (blob.includes(needle)) {
      hits.push(term);
      score += Math.min(6, Math.max(1, Math.ceil(needle.length / 6)));
    }
  }
  return { score, hits };
}

export function scoreNiches(text: string): NicheScore[] {
  const blob = hay(text);
  const rows: NicheScore[] = [];
  for (const id of SUPPORTED_NICHES) {
    const def = NICHE_REGISTRY[id];
    const base = countHits(blob, def.keywords);
    const strong = countHits(blob, def.strongKeywords || []);
    const veto = countHits(blob, def.vetoKeywords || []);
    let score = base.score + strong.score * 2;
    if (veto.score > 0 && veto.score >= strong.score && veto.score >= 4) score -= veto.score * 2;
    rows.push({ niche: id, score, hits: [...base.hits, ...strong.hits] });
  }
  return rows.sort((a, b) => b.score - a.score);
}

export function detectNiche(text: string): NicheId {
  const ranked = scoreNiches(text);
  const best = ranked[0];
  if (!best || best.score <= 0) return "out_of_niche";
  return best.niche;
}

export function classifySite(parts: {
  name?: string | null;
  title?: string | null;
  description?: string | null;
  blob?: string | null;
  host?: string | null;
}): NicheId {
  const text = [parts.name, parts.title, parts.description, parts.host, (parts.blob || "").slice(0, 8000)]
    .filter(Boolean)
    .join(" \n ");
  return detectNiche(text);
}
