import * as cheerio from "cheerio";
import { detectNiche } from "./niches";
import type { BusinessFacts, EvidenceLevel, FactField, Lang, Niche } from "./types";

const PHONE_RE =
  /(?:\+?\s?(?:972|970)\s?[\-]?\s?(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4}|0(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4})/g;

const PLACE_HINTS = [
  "رام الله",
  "القدس",
  "نابلس",
  "الخليل",
  "بيت لحم",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "أريحا",
  "غزة",
  "رفح",
  "خان يونس",
  "حيفا",
  "يافا",
  "عكا",
  "الناصرة",
  "اللد",
  "الرملة",
  "بئر السبع",
  "רמאללה",
  "ירושלים",
  "חיפה",
  "תל אביב",
  "נצרת",
  "עכו",
  "באר שבע",
  "חברון",
  "שכם",
  "בית לחם",
  "Ramallah",
  "Jerusalem",
  "Nablus",
  "Hebron",
  "Bethlehem",
  "Haifa",
  "Nazareth",
  "Gaza",
];

export function field(value: string | null, evidence: EvidenceLevel, snippet?: string): FactField {
  const clean = value?.replace(/\s+/g, " ").trim() || null;
  return { value: clean, evidence: clean ? evidence : "missing", snippet: clean ? snippet : undefined };
}

function hostFromUrl(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "business";
  }
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function looksLikeUrl(raw: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  try {
    const u = new URL(normalizeUrl(v));
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

function textBlob($: cheerio.CheerioAPI): string {
  const clone = cheerio.load($.html());
  clone("script, style, noscript, svg").remove();
  return clone("body").text().replace(/\s+/g, " ").slice(0, 24000);
}

function allJsonLd($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text()) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (node && typeof node === "object") out.push(node as Record<string, unknown>);
      }
    } catch {
      /* ignore */
    }
  });
  return out;
}

function extractPhones(html: string, $: cheerio.CheerioAPI): string[] {
  const found = new Set<string>();
  $('a[href^="tel:"]').each((_, el) => {
    const num = ($(el).attr("href") || "").replace(/^tel:/, "").trim();
    if (num) found.add(num);
  });
  for (const node of allJsonLd($)) {
    const tel = node.telephone || node.phone;
    if (typeof tel === "string") found.add(tel);
    if (Array.isArray(tel)) tel.forEach((x) => typeof x === "string" && found.add(x));
  }
  for (const match of html.match(PHONE_RE) || []) found.add(match.trim());
  return [...found].slice(0, 4);
}

function extractWhatsapp($: cheerio.CheerioAPI): string | null {
  const href = $('a[href*="wa.me"], a[href*="whatsapp.com"]').first().attr("href");
  return href || null;
}

function extractPlace($: cheerio.CheerioAPI, blob: string): { value: string | null; snippet?: string } {
  for (const node of allJsonLd($)) {
    const addr = node.address;
    if (addr && typeof addr === "object") {
      const a = addr as Record<string, unknown>;
      const locality = [a.streetAddress, a.addressLocality, a.addressRegion]
        .filter((x) => typeof x === "string")
        .join(", ");
      if (locality) return { value: locality, snippet: "jsonld.address" };
    }
    if (typeof addr === "string" && addr.trim()) return { value: addr, snippet: "jsonld.address" };
  }
  const metaPlace =
    $('meta[property="business:contact_data:locality"]').attr("content") ||
    $('meta[name="geo.placename"]').attr("content");
  if (metaPlace) return { value: metaPlace, snippet: "meta.place" };
  for (const hint of PLACE_HINTS) {
    if (blob.includes(hint)) return { value: hint, snippet: hint };
  }
  return { value: null };
}

function extractHours($: cheerio.CheerioAPI, blob: string): { value: string | null; snippet?: string } {
  for (const node of allJsonLd($)) {
    const hours = node.openingHours;
    if (typeof hours === "string") return { value: hours, snippet: "jsonld.openingHours" };
    if (Array.isArray(hours) && hours.length) return { value: hours.map(String).join(" · "), snippet: "jsonld.openingHours" };
    const spec = node.openingHoursSpecification;
    if (Array.isArray(spec) && spec[0] && typeof spec[0] === "object") {
      const s = spec[0] as Record<string, unknown>;
      const piece = [s.dayOfWeek, s.opens, s.closes].filter(Boolean).join(" ");
      if (piece) return { value: piece, snippet: "jsonld.openingHoursSpecification" };
    }
  }
  const labeled = blob.match(
    /(?:دوام|ساعات العمل|ساعات الدوام|Opening hours|Hours|שעות פתיחה)\s*[:：-]?\s*([^\.]{8,80})/i,
  );
  if (labeled) return { value: labeled[1].trim(), snippet: labeled[0].slice(0, 80) };
  return { value: null };
}

function extractServices(blob: string, niche: Niche): string[] {
  const found = new Set<string>();
  const catalog: Record<string, string[]> = {
    clinic: ["تقويم", "تبييض", "زراعة", "تنظيف", "بوتوكس", "فيلر", "ليزر", "orthodontics", "whitening", "implants", "botox", "filler", "לייזר", "הלבנה"],
    tutoring: ["رياضيات", "انجليزي", "فيزياء", "كيمياء", "توجيهي", "math", "english", "physics", "בגרות", "מתמטיקה"],
    restaurant: ["فطور", "غداء", "عشاء", "حلويات", "منسف", "مسخن", "breakfast", "delivery", "משלוחים", "ארוחת בוקר"],
    renovation: ["دهان", "بلاط", "مطابخ", "حمامات", "جبس", "painting", "tiling", "kitchens", "צביעה", "שיפוץ מטבח"],
    fitness: ["يوغا", "بيلاتس", "كارديو", "شخصي", "yoga", "pilates", "personal training", "יוגה", "פילאטיס", "אימון אישי"],
  };
  const keys = niche === "out_of_niche" ? Object.values(catalog).flat() : catalog[niche] || [];
  for (const key of keys) {
    if (blob.toLowerCase().includes(key.toLowerCase())) found.add(key);
  }
  return [...found].slice(0, 6);
}

function decodeEntities(raw: string): string {
  return raw
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractName($: cheerio.CheerioAPI, host: string): { value: string; evidence: EvidenceLevel; snippet?: string } {
  const jsonName = allJsonLd($).map((n) => n.name).find((v) => typeof v === "string") as string | undefined;
  const ogSite = $('meta[property="og:site_name"]').attr("content");
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const title = $("title").first().text();
  const h1 = $("h1").first().text();
  const pick = [jsonName, ogSite, h1, ogTitle, title].find((v) => v && v.trim().length > 1);
  if (pick) {
    const decoded = decodeEntities(pick);
    const cleaned = decoded.replace(/\s*[|\-–].*$/, "").trim() || decoded.trim();
    return { value: cleaned.slice(0, 80), evidence: "on_page", snippet: cleaned };
  }
  return { value: host, evidence: "hostname" };
}

export function extractSiteImages($: cheerio.CheerioAPI, pageUrl: string): string[] {
  const urls: string[] = [];
  const push = (raw?: string | null) => {
    if (!raw) return;
    try {
      const abs = new URL(raw, pageUrl).href;
      if (!/^https?:/i.test(abs)) return;
      if (/\.svg(\?|$)/i.test(abs)) return;
      if (/sprite|icon|favicon|logo-16|1x1|pixel/i.test(abs)) return;
      if (!urls.includes(abs)) urls.push(abs);
    } catch {
      /* ignore */
    }
  };
  push($('meta[property="og:image"]').attr("content"));
  push($('meta[name="twitter:image"]').attr("content"));
  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    const w = Number($(el).attr("width") || 0);
    const h = Number($(el).attr("height") || 0);
    if (w && h && (w < 80 || h < 80)) return;
    push(src);
  });
  return urls.slice(0, 8);
}

export interface DemoBiz {
  slug: string;
  url: string;
  name: string;
  phone: string;
  place: string;
  hours: string;
  services: string[];
  description: string;
  niche: Niche;
  images: string[];
}

export const DEMOS: DemoBiz[] = [
  {
    slug: "clinic",
    url: "https://demo.khatwa.ads/clinic-ramallah",
    name: "عيادة سنّة البيضا",
    phone: "059-700-2140",
    place: "رام الله",
    hours: "السبت–الخميس ٩–٥",
    services: ["تنظيف", "تبييض", "تقويم"],
    description: "عيادة أسنان محلية — العيّنة للتوضيح فقط.",
    niche: "clinic",
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80",
    ],
  },
  {
    slug: "tutoring",
    url: "https://demo.khatwa.ads/tutor-nablus",
    name: "مركز خطوة للدرس",
    phone: "056-880-3312",
    place: "نابلس",
    hours: "بعد الظهر والمساء",
    services: ["رياضيات", "انجليزي", "توجيهي"],
    description: "دروس خصوصية — عيّنة توضيحية.",
    niche: "tutoring",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
      "https://images.unsplash.com/photo-1456513080880-7d93d20b90ff?w=900&q=80",
    ],
  },
  {
    slug: "restaurant",
    url: "https://demo.khatwa.ads/cafe-bethlehem",
    name: "مقهى السطح",
    phone: "02-274-1190",
    place: "بيت لحم",
    hours: "يومياً ٨–١٢ بالليل",
    services: ["فطور", "قهوة", "حلويات"],
    description: "مقهى محلي — عيّنة توضيحية.",
    niche: "restaurant",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
    ],
  },
  {
    slug: "renovation",
    url: "https://demo.khatwa.ads/renovate-hebron",
    name: "مقاولات بيت العمارة",
    phone: "059-331-9088",
    place: "الخليل",
    hours: "أيام الأسبوع ٧–٤",
    services: ["دهان", "بلاط", "مطابخ"],
    description: "ترميم منازل — عيّنة توضيحية.",
    niche: "renovation",
    images: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
    ],
  },
  {
    slug: "fitness",
    url: "https://demo.khatwa.ads/fit-haifa",
    name: "استوديو نفس",
    phone: "04-855-2201",
    place: "حيفا",
    hours: "صباحي ومسائي",
    services: ["يوغا", "بيلاتس", "شخصي"],
    description: "لياقة بوتيك — عيّنة توضيحية.",
    niche: "fitness",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072451274?w=900&q=80",
    ],
  },
  {
    slug: "other",
    url: "https://demo.khatwa.ads/law-office",
    name: "مكتب ورق للمحاماة",
    phone: "02-298-4400",
    place: "القدس",
    hours: "الأحد–الخميس",
    services: [],
    description: "عيّنة برّا التخصص — لتوضيح الرسالة اللطيفة.",
    niche: "out_of_niche",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80"],
  },
];

export const SAMPLE_CLINIC = DEMOS[0];
export const SAMPLE_CLINIC_ID = "demo:clinic";
export const SAMPLE_CLINIC_NAME = SAMPLE_CLINIC.name;

export function demoBusinessId(slug: string): string {
  return `demo:${slug}`;
}

export function siteBusinessId(host: string): string {
  return `site:${host}`;
}

/** Built-in sample only — never match a live URL just because it contains "clinic" / "other". */
export function isExplicitDemoUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  let normalized = "";
  try {
    normalized = normalizeUrl(trimmed);
  } catch {
    normalized = trimmed;
  }
  return DEMOS.some((d) => {
    const demoNorm = d.url;
    return (
      trimmed === d.url ||
      normalized === demoNorm ||
      trimmed === d.slug ||
      trimmed === `demo:${d.slug}` ||
      trimmed === `demo://${d.slug}`
    );
  });
}

export function findExplicitDemo(raw: string): DemoBiz | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  let normalized = "";
  try {
    normalized = normalizeUrl(trimmed);
  } catch {
    normalized = trimmed;
  }
  return DEMOS.find(
    (d) =>
      trimmed === d.url ||
      normalized === d.url ||
      trimmed === d.slug ||
      trimmed === `demo:${d.slug}` ||
      trimmed === `demo://${d.slug}`,
  );
}

export function isSampleBusiness(facts: Pick<BusinessFacts, "businessId" | "name" | "usedDemo" | "url">): boolean {
  if (facts.usedDemo) return true;
  if (facts.businessId.startsWith("demo:")) return true;
  if (DEMOS.some((d) => d.name === facts.name.value || d.url === facts.url)) return true;
  return false;
}

export function factsFromDemo(demo: DemoBiz): BusinessFacts {
  return {
    url: demo.url,
    host: hostFromUrl(demo.url),
    businessId: demoBusinessId(demo.slug),
    name: field(demo.name, "demo", "demo.name"),
    phone: field(demo.phone, "demo", "demo.phone"),
    phones: [demo.phone],
    whatsapp: field(null, "missing"),
    place: field(demo.place, "demo", "demo.place"),
    hours: field(demo.hours, "demo", "demo.hours"),
    services: demo.services,
    servicesEvidence: demo.services.length ? "demo" : "missing",
    description: field(demo.description, "demo"),
    niche: demo.niche,
    fetched: false,
    usedDemo: true,
    sourceTitle: demo.name,
  };
}

async function fetchHtmlOnce(url: string, userAgent: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return { html: html.slice(0, 450000), finalUrl: res.url || url };
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  const agents = [
    "KhatwaAdsScanner/1.1 (honest-facts; +https://github.com/drmarktzone-stack/khatwa-ads)",
    "Mozilla/5.0 (compatible; KhatwaAdsBot/1.1; +https://github.com/drmarktzone-stack/khatwa-ads)",
  ];
  for (const ua of agents) {
    const got = await fetchHtmlOnce(url, ua);
    if (got) return got;
  }
  return null;
}

export type NoticeKey =
  | "ok"
  | "demo"
  | "empty_used_demo"
  | "invalid_used_demo"
  | "invalid_url"
  | "fetch_failed"
  | "out_of_niche";

export type ScanErrorCode = "invalid_url" | "fetch_failed";

export type ScanOutcome = {
  facts: BusinessFacts | null;
  noticeKey: NoticeKey;
  siteImages: string[];
  error?: ScanErrorCode;
};

export async function scanBusinessUrl(rawUrl: string, _lang: Lang): Promise<ScanOutcome> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { facts: factsFromDemo(DEMOS[0]), noticeKey: "empty_used_demo", siteImages: DEMOS[0].images };
  }

  const demo = findExplicitDemo(trimmed);
  if (demo) {
    return { facts: factsFromDemo(demo), noticeKey: "demo", siteImages: demo.images };
  }

  if (!looksLikeUrl(trimmed)) {
    return { facts: null, noticeKey: "invalid_url", siteImages: [], error: "invalid_url" };
  }

  const url = normalizeUrl(trimmed);
  const fetched = await fetchHtml(url);
  if (!fetched) {
    return { facts: null, noticeKey: "fetch_failed", siteImages: [], error: "fetch_failed" };
  }

  const $ = cheerio.load(fetched.html);
  const blob = textBlob($);
  const host = hostFromUrl(fetched.finalUrl);
  const name = extractName($, host);
  const phones = extractPhones(fetched.html, $);
  const place = extractPlace($, blob);
  const hours = extractHours($, blob);
  const wa = extractWhatsapp($);
  const desc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;
  const niche = detectNiche(`${name.value} ${desc || ""} ${blob.slice(0, 4000)}`);
  const services = extractServices(blob, niche);
  const siteImages = extractSiteImages($, fetched.finalUrl);

  const facts: BusinessFacts = {
    url: fetched.finalUrl,
    host,
    businessId: siteBusinessId(host),
    name: field(name.value, name.evidence, name.snippet),
    phone: field(phones[0] || null, phones[0] ? "on_page" : "missing", phones[0]),
    phones,
    whatsapp: field(wa, wa ? "on_page" : "missing", wa || undefined),
    place: field(place.value, place.value ? "on_page" : "missing", place.snippet),
    hours: field(hours.value, hours.value ? "on_page" : "missing", hours.snippet),
    services,
    servicesEvidence: services.length ? "on_page" : "missing",
    description: field(desc, desc ? "on_page" : "missing"),
    niche,
    fetched: true,
    usedDemo: false,
    sourceTitle: $("title").first().text().trim() || null,
  };

  return { facts, noticeKey: niche === "out_of_niche" ? "out_of_niche" : "ok", siteImages };
}
