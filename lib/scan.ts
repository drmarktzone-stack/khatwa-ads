import * as cheerio from "cheerio";
import { detectNiche } from "./niches";
import type { BusinessFacts, EvidenceLevel, FactField, Lang, Niche } from "./types";

const PHONE_RE =
  /(?:\+?\s?(?:972|970)\s?[\-]?\s?(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4}|0(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4})/;

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
  "يافا",
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

function field(value: string | null, evidence: EvidenceLevel, snippet?: string): FactField {
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
  $("script, style, noscript, svg").remove();
  return $("body").text().replace(/\s+/g, " ").slice(0, 20000);
}

function extractPhone(html: string, $: cheerio.CheerioAPI): { value: string | null; snippet?: string } {
  const tel = $('a[href^="tel:"]').first().attr("href");
  if (tel) {
    const num = tel.replace(/^tel:/, "").trim();
    if (num) return { value: num, snippet: `tel:${num}` };
  }
  const jsonLd = extractJsonLd($);
  const jsonPhone = jsonLd?.telephone || jsonLd?.phone;
  if (typeof jsonPhone === "string") return { value: jsonPhone, snippet: "jsonld.telephone" };
  const match = html.match(PHONE_RE);
  if (match) return { value: match[0], snippet: match[0] };
  return { value: null };
}

function extractJsonLd($: cheerio.CheerioAPI): Record<string, unknown> | null {
  const blocks = $('script[type="application/ld+json"]');
  for (let i = 0; i < blocks.length; i++) {
    try {
      const parsed = JSON.parse($(blocks[i]).text()) as unknown;
      const node = Array.isArray(parsed) ? parsed[0] : parsed;
      if (node && typeof node === "object") return node as Record<string, unknown>;
    } catch {
      /* ignore broken json-ld */
    }
  }
  return null;
}

function extractPlace($: cheerio.CheerioAPI, blob: string): { value: string | null; snippet?: string } {
  const jsonLd = extractJsonLd($);
  const addr = jsonLd?.address;
  if (addr && typeof addr === "object") {
    const a = addr as Record<string, unknown>;
    const locality = [a.streetAddress, a.addressLocality, a.addressRegion]
      .filter((x) => typeof x === "string")
      .join(", ");
    if (locality) return { value: locality, snippet: "jsonld.address" };
  }
  if (typeof jsonLd?.address === "string") {
    return { value: jsonLd.address as string, snippet: "jsonld.address" };
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

function extractServices(blob: string, niche: Niche): string[] {
  const found = new Set<string>();
  const catalog: Record<string, string[]> = {
    clinic: [
      "تقويم",
      "تبييض",
      "زراعة",
      "تنظيف",
      "بوتوكس",
      "فيلر",
      "ليزر",
      "orthodontics",
      "whitening",
      "implants",
      "botox",
      "filler",
      "לייזר",
      "הלבנה",
    ],
    tutoring: [
      "رياضيات",
      "انجليزي",
      "فيزياء",
      "كيمياء",
      "توجيهي",
      "math",
      "english",
      "physics",
      "בגרות",
      "מתמטיקה",
    ],
    restaurant: [
      "فطور",
      "غداء",
      "عشاء",
      "حلويات",
      "منسف",
      "مسخن",
      "breakfast",
      "delivery",
      "משלוחים",
      "ארוחת בוקר",
    ],
    renovation: [
      "دهان",
      "بلاط",
      "مطابخ",
      "حمامات",
      "جبس",
      "painting",
      "tiling",
      "kitchens",
      "צביעה",
      "שיפוץ מטבח",
    ],
    fitness: [
      "يوغا",
      "بيلاتس",
      "كارديو",
      "شخصي",
      "yoga",
      "pilates",
      "personal training",
      "יוגה",
      "פילאטיס",
      "אימון אישי",
    ],
  };
  const keys = niche === "out_of_niche" ? Object.values(catalog).flat() : catalog[niche] || [];
  for (const key of keys) {
    if (blob.toLowerCase().includes(key.toLowerCase())) found.add(key);
  }
  return [...found].slice(0, 6);
}

function extractName($: cheerio.CheerioAPI, host: string): { value: string; evidence: EvidenceLevel; snippet?: string } {
  const jsonLd = extractJsonLd($);
  const jsonName = typeof jsonLd?.name === "string" ? jsonLd.name : null;
  const ogSite = $('meta[property="og:site_name"]').attr("content");
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const title = $("title").first().text();
  const h1 = $("h1").first().text();
  const pick = [jsonName, ogSite, h1, ogTitle, title].find((v) => v && v.trim().length > 1);
  if (pick) {
    const cleaned = pick.replace(/\s*[|\-–].*$/, "").trim() || pick.trim();
    return { value: cleaned.slice(0, 80), evidence: "on_page", snippet: cleaned };
  }
  return { value: host, evidence: "hostname" };
}

export interface DemoBiz {
  slug: string;
  url: string;
  name: string;
  phone: string;
  place: string;
  services: string[];
  description: string;
  niche: Niche;
}

export const DEMOS: DemoBiz[] = [
  {
    slug: "clinic",
    url: "https://demo.khatwa.ads/clinic-ramallah",
    name: "عيادة سنّة البيضا",
    phone: "059-700-2140",
    place: "رام الله",
    services: ["تنظيف", "تبييض", "تقويم"],
    description: "عيادة أسنان محلية — العيّنة للتوضيح فقط.",
    niche: "clinic",
  },
  {
    slug: "tutoring",
    url: "https://demo.khatwa.ads/tutor-nablus",
    name: "مركز خطوة للدرس",
    phone: "056-880-3312",
    place: "نابلس",
    services: ["رياضيات", "انجليزي", "توجيهي"],
    description: "دروس خصوصية — عيّنة توضيحية.",
    niche: "tutoring",
  },
  {
    slug: "restaurant",
    url: "https://demo.khatwa.ads/cafe-bethlehem",
    name: "مقهى السطح",
    phone: "02-274-1190",
    place: "بيت لحم",
    services: ["فطور", "قهوة", "حلويات"],
    description: "مقهى محلي — عيّنة توضيحية.",
    niche: "restaurant",
  },
  {
    slug: "renovation",
    url: "https://demo.khatwa.ads/renovate-hebron",
    name: "مقاولات بيت العمارة",
    phone: "059-331-9088",
    place: "الخليل",
    services: ["دهان", "بلاط", "مطابخ"],
    description: "ترميم منازل — عيّنة توضيحية.",
    niche: "renovation",
  },
  {
    slug: "fitness",
    url: "https://demo.khatwa.ads/fit-haifa",
    name: "استوديو نفس",
    phone: "04-855-2201",
    place: "حيفا",
    services: ["يوغا", "بيلاتس", "شخصي"],
    description: "لياقة بوتيك — عيّنة توضيحية.",
    niche: "fitness",
  },
  {
    slug: "other",
    url: "https://demo.khatwa.ads/law-office",
    name: "مكتب ورق للمحاماة",
    phone: "02-298-4400",
    place: "القدس",
    services: [],
    description: "عيّنة برّا التخصص — لتوضيح الرسالة اللطيفة.",
    niche: "out_of_niche",
  },
];

export function factsFromDemo(demo: DemoBiz): BusinessFacts {
  return {
    url: demo.url,
    host: hostFromUrl(demo.url),
    name: field(demo.name, "demo", "demo.name"),
    phone: field(demo.phone, "demo", "demo.phone"),
    place: field(demo.place, "demo", "demo.place"),
    services: demo.services,
    servicesEvidence: demo.services.length ? "demo" : "missing",
    description: field(demo.description, "demo"),
    niche: demo.niche,
    fetched: false,
    usedDemo: true,
    sourceTitle: demo.name,
  };
}

function hostnameFacts(url: string): BusinessFacts {
  const host = hostFromUrl(url);
  const pretty = host.split(".")[0].replace(/[-_]/g, " ");
  return {
    url,
    host,
    name: field(pretty || host, "hostname", host),
    phone: field(null, "missing"),
    place: field(null, "missing"),
    services: [],
    servicesEvidence: "missing",
    description: field(null, "missing"),
    niche: "out_of_niche",
    fetched: false,
    usedDemo: false,
    sourceTitle: null,
  };
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "KhatwaAdsScanner/1.0 (honest-facts; +https://github.com/drmarktzone-stack/khatwa-ads)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return { html: html.slice(0, 450000), finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function scanBusinessUrl(rawUrl: string, _lang: Lang): Promise<{ facts: BusinessFacts; noticeKey: NoticeKey }> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { facts: factsFromDemo(DEMOS[0]), noticeKey: "empty_used_demo" };
  }

  const demo = DEMOS.find((d) => trimmed.includes(d.slug) || trimmed === d.url || normalizeUrl(trimmed) === d.url);
  if (demo) {
    return { facts: factsFromDemo(demo), noticeKey: "demo" };
  }

  if (!looksLikeUrl(trimmed)) {
    return { facts: factsFromDemo(DEMOS[0]), noticeKey: "invalid_used_demo" };
  }

  const url = normalizeUrl(trimmed);
  const fetched = await fetchHtml(url);
  if (!fetched) {
    const fallback = hostnameFacts(url);
    return { facts: fallback, noticeKey: "fetch_failed" };
  }

  const $ = cheerio.load(fetched.html);
  const blob = textBlob($);
  const host = hostFromUrl(fetched.finalUrl);
  const name = extractName($, host);
  const phone = extractPhone(fetched.html, $);
  const place = extractPlace($, blob);
  const desc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;
  const niche = detectNiche(`${name.value} ${desc || ""} ${blob.slice(0, 4000)}`);
  const services = extractServices(blob, niche);

  const facts: BusinessFacts = {
    url: fetched.finalUrl,
    host,
    name: field(name.value, name.evidence, name.snippet),
    phone: field(phone.value, phone.value ? "on_page" : "missing", phone.snippet),
    place: field(place.value, place.value ? "on_page" : "missing", place.snippet),
    services,
    servicesEvidence: services.length ? "on_page" : "missing",
    description: field(desc, desc ? "on_page" : "missing"),
    niche,
    fetched: true,
    usedDemo: false,
    sourceTitle: $("title").first().text().trim() || null,
  };

  return { facts, noticeKey: niche === "out_of_niche" ? "out_of_niche" : "ok" };
}

export type NoticeKey = "ok" | "demo" | "empty_used_demo" | "invalid_used_demo" | "fetch_failed" | "out_of_niche";
