import type { NicheId } from "../types";
import { NICHE_REGISTRY, SUPPORTED_NICHES } from "./registry";

export interface NicheScore {
  niche: NicheId;
  score: number;
  hits: string[];
}

const BUILD_NICHES = new Set<NicheId>(["contractors", "home_trades"]);

/** Distinctive food signals in the name, title, host, or description.
 *  Exclude مطبخ/מטבח/kitchen — those are also renovation catalog words. */
const FOOD_IDENTITY =
  /grill|bbq|barbecue|barbeque|restaurant|bistro|diner|eatery|steakhouse|pizzeria|shawarma|falafel|\bfood\b|\bcafe\b|café|مطعم|مطاعم|مقهى|جريل|مشاوي|شواء|طعام|مأكولات|شاورما|فلافل|منسف|مسخن|מסעדה|מסעדת|בית קפה|גריל|אוכל|ברביקיו|תפריט/i;

/** Body-only override: skip kitchen/menu/delivery — those bleed into renovation and nav chrome. */
const FOOD_BODY =
  /grill|bbq|barbecue|barbeque|restaurant|bistro|steakhouse|shawarma|falafel|مطعم|مطاعم|مقهى|جريل|مشاوي|شواء|شاورما|فلافل|منسف|مسخن|מסעדה|מסעדת|בית קפה|גריל|ברביקיו/i;

const FOOD_HOST =
  /grill|bbq|barbecue|restaurant|cafe|bistro|falafel|shawarma|pizza|steakhouse|diner|eatery|shawerma/i;

function hay(text: string): string {
  return text.toLowerCase();
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLatinTerm(term: string): boolean {
  return /[a-z]/i.test(term);
}

/**
 * Latin terms match as whole words/phrases so "tiling" does not hit
 * Duda's `IsSiteMultilingual` and "menu" does not hit `dmLinksMenu`.
 * Arabic/Hebrew keep substring match so الـ / ה prefixes still count.
 */
export function termMatches(blob: string, term: string): boolean {
  const haystack = blob.toLowerCase();
  const needle = term.toLowerCase().replace(/\s+/g, " ").trim();
  if (!needle) return false;
  if (isLatinTerm(needle)) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(needle)}(?![\\p{L}\\p{N}])`, "u");
    return re.test(haystack);
  }
  return haystack.includes(needle);
}

function countHits(blob: string, terms: string[]): { score: number; hits: string[] } {
  const hits: string[] = [];
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    if (termMatches(blob, term)) {
      hits.push(term);
      score += Math.min(6, Math.max(1, Math.ceil(term.length / 6)));
    }
  }
  return { score, hits };
}

function layerScore(blob: string, id: NicheId): { score: number; hits: string[]; veto: number; strong: number } {
  const def = NICHE_REGISTRY[id];
  const base = countHits(blob, def.keywords);
  const strong = countHits(blob, def.strongKeywords || []);
  const veto = countHits(blob, def.vetoKeywords || []);
  let score = base.score + strong.score * 2;
  if (veto.score > 0 && veto.score >= strong.score && veto.score >= 4) score -= veto.score * 2;
  return { score, hits: [...base.hits, ...strong.hits], veto: veto.score, strong: strong.score };
}

function scoreLayers(identity: string, body: string): NicheScore[] {
  const idHay = hay(identity);
  const bodyHay = hay(body);
  const rows: NicheScore[] = [];
  for (const id of SUPPORTED_NICHES) {
    const idLayer = layerScore(idHay, id);
    const bodyLayer = bodyHay ? layerScore(bodyHay, id) : { score: 0, hits: [], veto: 0, strong: 0 };
    const score = idLayer.score * 3 + bodyLayer.score;
    const hits = [...idLayer.hits, ...bodyLayer.hits];
    rows.push({ niche: id, score, hits });
  }
  return rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.niche === "restaurants") return -1;
    if (b.niche === "restaurants") return 1;
    return 0;
  });
}

export function scoreNiches(text: string): NicheScore[] {
  return scoreLayers(text, "");
}

function foodIdentity(identity: string, host: string): boolean {
  return FOOD_IDENTITY.test(identity) || FOOD_HOST.test(host);
}

function foodBeatsBuild(identity: string, body: string, host: string): boolean {
  return foodIdentity(identity, host) || FOOD_BODY.test(body);
}

function pickNiche(ranked: NicheScore[], identity: string, body: string, host: string): NicheId {
  const best = ranked[0];
  const restaurant = ranked.find((row) => row.niche === "restaurants");
  if (foodBeatsBuild(identity, body, host)) {
    if (!best || best.score <= 0 || BUILD_NICHES.has(best.niche)) {
      return "restaurants";
    }
    if (restaurant && restaurant.score > 0 && restaurant.score >= best.score) {
      return "restaurants";
    }
  }
  if (!best || best.score <= 0) return "out_of_niche";
  return best.niche;
}

export function detectNiche(text: string): NicheId {
  return pickNiche(scoreNiches(text), text, "", "");
}

export function classifySite(parts: {
  name?: string | null;
  title?: string | null;
  description?: string | null;
  blob?: string | null;
  host?: string | null;
}): NicheId {
  const host = parts.host || "";
  const hostBoost = [
    /drsamerped|samerped|pediatr/i.test(host) ? " pediatric pediatrics طب الأطفال عيادة أطفال " : "",
    FOOD_HOST.test(host) ? " restaurant grill cafe food مطعم גריל جريل " : "",
  ].join("");
  const identity = [parts.name, parts.title, parts.description, host, hostBoost].filter(Boolean).join(" \n ");
  const body = (parts.blob || "").slice(0, 8000);
  return pickNiche(scoreLayers(identity, body), identity, body, host);
}
