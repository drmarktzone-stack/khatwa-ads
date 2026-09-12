import * as cheerio from "cheerio";
import {
  classifySite,
  extractDoctorName,
  extractInsurance,
  extractKnownSlogan,
  filterRealPhones,
  findExplicitJerusalem,
  findPlaceHint,
  getNiche,
  isBannedSloganName,
  pickHonestName,
  termMatches,
} from "./niches";
import type { BusinessFacts, EvidenceLevel, FactField, Lang, NicheId } from "./types";

const PHONE_RE =
  /(?:\+?\s?(?:972|970)\s?[\-]?\s?(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4}|0(?:5\d|[2-9])[\s\-]?\d{3}[\s\-]?\d{3,4})/g;

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

function textBlob($: cheerio.CheerioAPI): string {
  const clone = cheerio.load($.html());
  clone("script, style, noscript, svg").remove();
  return clone("body").text().replace(/\s+/g, " ").slice(0, 24000);
}

function scriptBlob($: cheerio.CheerioAPI): string {
  const bits: string[] = [];
  $("script").each((_, el) => {
    const txt = $(el).text();
    if (txt && txt.length < 400000) bits.push(txt);
  });
  return bits.join("\n").slice(0, 200000);
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

function isFormattedPhone(raw: string): boolean {
  return /[+\-()\s]/.test(raw) || /^(?:\+972|\+970|05\d)/.test(raw.replace(/[^\d+]/g, ""));
}

function rankPhone(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (/^05\d/.test(digits) || digits.startsWith("9725") || digits.startsWith("9705")) return 100;
  if (isFormattedPhone(raw)) return 80;
  if (/^(02|03|04|08|09|972|970)/.test(digits)) return 60;
  return 10;
}

export function extractPhones(html: string, $: cheerio.CheerioAPI, extra = ""): string[] {
  const labeled: string[] = [];
  const visible: string[] = [];
  $('a[href^="tel:"]').each((_, el) => {
    const num = ($(el).attr("href") || "").replace(/^tel:/, "").trim();
    if (num) labeled.push(num);
  });
  for (const node of allJsonLd($)) {
    const tel = node.telephone || node.phone;
    if (typeof tel === "string") labeled.push(tel);
    if (Array.isArray(tel)) tel.forEach((x) => typeof x === "string" && labeled.push(x));
  }
  const keyRe = /"(?:phone|mobile|telephone|whatsapp|whatsappDisplay|whatsappNumber)"\s*:\s*"([^"]+)"/gi;
  for (const blob of [html, extra]) {
    for (const match of blob.matchAll(keyRe)) {
      if (match[1]) labeled.push(match[1]);
    }
  }
  const clone = cheerio.load(html);
  clone("script, style, noscript, svg").remove();
  const visibleText = `${clone("body").text()} ${clone("title").text()} ${clone('meta[name="description"]').attr("content") || ""}`;
  for (const match of visibleText.match(PHONE_RE) || []) visible.push(match.trim());
  // JS: only dashed / +972-style numbers — never raw minified integers.
  const formattedJs = extra.match(/(?:\+972|\+970|0(?:5\d|[2-9]))[\s\-]\d{3}[\s\-]?\d{3,4}/g) || [];
  const ranked = [...labeled, ...formattedJs, ...visible].sort((a, b) => rankPhone(b) - rankPhone(a));
  return filterRealPhones(ranked);
}

function extractWhatsapp($: cheerio.CheerioAPI, extra = ""): string | null {
  const href = $('a[href*="wa.me"], a[href*="whatsapp.com"]').first().attr("href");
  if (href) return href;
  const wa = extra.match(/whatsapp"\s*:\s*"([^"]+)"/i);
  return wa?.[1] || null;
}

function extractPlace(
  $: cheerio.CheerioAPI,
  blob: string,
): { value: string | null; snippet?: string } {
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

  const hinted = findPlaceHint(blob);
  if (hinted) return hinted;

  const jer = findExplicitJerusalem(blob);
  if (jer) return jer;
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

function extractServices(blob: string, niche: NicheId): string[] {
  const found = new Set<string>();
  const keys = getNiche(niche).serviceCatalog;
  for (const key of keys) {
    if (termMatches(blob, key)) found.add(key);
  }
  return [...found].slice(0, 6);
}

function extractName(
  $: cheerio.CheerioAPI,
  host: string,
  blob: string,
  medical: boolean,
): { value: string; evidence: EvidenceLevel; snippet?: string } {
  const jsonName = allJsonLd($).map((n) => n.name).find((v) => typeof v === "string") as string | undefined;
  const ogSite = $('meta[property="og:site_name"]').attr("content");
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const title = $("title").first().text();
  const h1 = $("h1").first().text();
  const doctorFromBlob = extractDoctorName(blob);
  const candidates = [jsonName, ogSite, h1, ogTitle, title, doctorFromBlob]
    .filter((v): v is string => Boolean(v && String(v).trim().length > 1))
    .filter((v) => !isBannedSloganName(v))
    .map((v) => ({ value: decodeEntities(v), evidence: "on_page" as const }));
  return pickHonestName({
    candidates,
    host,
    blob,
    medical: medical || /pediatric|أطفال|عيادتي|samerped/i.test(`${host} ${blob}`),
  });
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
  niche: NicheId;
  images: string[];
  doctorName?: string;
  slogan?: string;
  insurance?: string;
}

export const DEMOS: DemoBiz[] = [
  {
    slug: "clinic",
    url: "https://demo.khatwa.ads/clinic-ramallah",
    name: "عيادة د. ليلى",
    phone: "059-700-2140",
    place: "رام الله",
    hours: "السبت–الخميس ٩–٥",
    services: ["فحص أطفال", "متابعة نمو", "تطعيم"],
    description: "عيادة أطفال محلية — العيّنة للتوضيح فقط.",
    niche: "pediatric_clinics",
    doctorName: "د. ليلى",
    slogan: "طفلك بخير وقلبك مرتاح",
    insurance: "كلاليت",
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80",
    ],
  },
  {
    slug: "medical",
    url: "https://demo.khatwa.ads/clinic-general-jenin",
    name: "عيادة النور",
    phone: "04-250-3310",
    place: "جنين",
    hours: "السبت–الخميس ٨–٣",
    services: ["فحص", "استشارة", "طب عائلة"],
    description: "عيادة طبية عامة — عيّنة توضيحية.",
    niche: "medical_clinics",
    images: [
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=80",
    ],
  },
  {
    slug: "dental",
    url: "https://demo.khatwa.ads/dental-haifa",
    name: "عيادة سنّة البيضا",
    phone: "04-834-5346",
    place: "حيفا",
    hours: "الأحد–الخميس ٨–٤",
    services: ["تنظيف", "تبييض", "تقويم"],
    description: "عيادة أسنان محلية — عيّنة توضيحية.",
    niche: "dental",
    images: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80",
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
    niche: "restaurants",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
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
    slug: "contractors",
    url: "https://demo.khatwa.ads/renovate-hebron",
    name: "مقاولات بيت العمارة",
    phone: "059-331-9088",
    place: "الخليل",
    hours: "أيام الأسبوع ٧–٤",
    services: ["دهان", "بلاط", "مطابخ"],
    description: "ترميم منازل — عيّنة توضيحية.",
    niche: "contractors",
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
    description: "صالات ومدربون — عيّنة توضيحية.",
    niche: "fitness",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072451274?w=900&q=80",
    ],
  },
  {
    slug: "lawyers",
    url: "https://demo.khatwa.ads/law-ramallah",
    name: "مكتب ورق للمحاماة",
    phone: "02-298-4400",
    place: "رام الله",
    hours: "الأحد–الخميس",
    services: ["استشارة", "عقود"],
    description: "مكتب محاماة محلي — عيّنة توضيحية.",
    niche: "lawyers",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80"],
  },
  {
    slug: "realestate",
    url: "https://demo.khatwa.ads/homes-nablus",
    name: "وسيط دار البلد",
    phone: "059-441-2200",
    place: "نابلس",
    hours: "بعد الظهر",
    services: ["بيع", "إيجار", "شقق"],
    description: "تياوُك محلي — عيّنة توضيحية.",
    niche: "real_estate_agents",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80"],
  },
  {
    slug: "beauty",
    url: "https://demo.khatwa.ads/salon-nazareth",
    name: "صالون نور",
    phone: "04-601-8800",
    place: "الناصرة",
    hours: "السبت–الخميس",
    services: ["قص", "صبغة", "عناية بشرة"],
    description: "صالون تجميل — عيّنة توضيحية.",
    niche: "beauty_aesthetic",
    images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80"],
  },
  {
    slug: "hometrades",
    url: "https://demo.khatwa.ads/plumb-tulkarm",
    name: "فني بدر للطوارئ",
    phone: "059-220-1188",
    place: "طولكرم",
    hours: "٢٤ ساعة",
    services: ["سباكة", "كهرباء", "تكييف"],
    description: "خدمات بيت طارئة — عيّنة توضيحية.",
    niche: "home_trades",
    images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&q=80"],
  },
  {
    slug: "other",
    url: "https://demo.khatwa.ads/books-nablus",
    name: "مكتبة الدرج",
    phone: "09-238-1100",
    place: "نابلس",
    hours: "يومياً عدا الجمعة",
    services: [],
    description: "عيّنة برّا التخصص — لتوضيح الرسالة اللطيفة.",
    niche: "out_of_niche",
    images: ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80"],
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
  return Boolean(findExplicitDemo(raw));
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
    doctorName: field(demo.doctorName || null, demo.doctorName ? "demo" : "missing"),
    slogan: field(demo.slogan || null, demo.slogan ? "demo" : "missing"),
    insurance: field(demo.insurance || null, demo.insurance ? "demo" : "missing"),
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

async function fetchSameOriginScripts(pageUrl: string, $: cheerio.CheerioAPI, already: string): Promise<string> {
  const phonesAlready = filterRealPhones(already.match(PHONE_RE) || []);
  const bodyLen = textBlob($).length;
  if (phonesAlready.length && bodyLen > 400) return already;
  const page = new URL(pageUrl);
  const srcs: string[] = [];
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    try {
      const abs = new URL(src, pageUrl);
      if (abs.origin !== page.origin) return;
      if (/\.(js)(\?|$)/i.test(abs.pathname)) srcs.push(abs.href);
    } catch {
      /* ignore */
    }
  });
  let extra = already;
  for (const src of srcs.slice(0, 2)) {
    try {
      const res = await fetch(src, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/javascript,text/javascript,*/*" },
      });
      if (!res.ok) continue;
      extra += `\n${(await res.text()).slice(0, 500000)}`;
      if (filterRealPhones(extra.match(PHONE_RE) || []).length) break;
    } catch {
      /* optional */
    }
  }
  return extra.slice(0, 700000);
}

export function factsFromHtml(
  html: string,
  pageUrl: string,
  extraScript = "",
): { facts: BusinessFacts; siteImages: string[] } {
  const $ = cheerio.load(html);
  const visible = textBlob($);
  const scripts = `${scriptBlob($)}\n${extraScript}`;
  const blob = `${visible}\n${$("title").text()}\n${$('meta[name="description"]').attr("content") || ""}\n${scripts}`.slice(
    0,
    40000,
  );
  const host = hostFromUrl(pageUrl);
  const desc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;
  const title = $("title").first().text().trim() || null;
  // Classify from visible page text — never Duda/Wix runtime JS (IsSiteMultilingual ⊂ tiling).
  const preNiche = classifySite({ name: title, title, description: desc, blob: visible, host });
  const name = extractName($, host, blob, preNiche === "medical_clinics" || preNiche === "pediatric_clinics");
  const niche = classifySite({ name: name.value, title, description: desc, blob: visible, host });
  const doctorName = extractDoctorName(blob);
  const slogan = extractKnownSlogan(blob);
  const insurance = extractInsurance(blob);
  const phones = extractPhones(html, $, scripts);
  const place = extractPlace($, blob);
  const hours = extractHours($, blob);
  const wa = extractWhatsapp($, scripts);
  const services = extractServices(visible, niche);
  const siteImages = extractSiteImages($, pageUrl);

  const facts: BusinessFacts = {
    url: pageUrl,
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
    doctorName: field(doctorName, doctorName ? "on_page" : "missing", doctorName || undefined),
    slogan: field(slogan, slogan ? "on_page" : "missing", slogan || undefined),
    insurance: field(insurance, insurance ? "on_page" : "missing", insurance || undefined),
    niche,
    fetched: true,
    usedDemo: false,
    sourceTitle: title,
  };
  return { facts, siteImages };
}

export type NoticeKey =
  | "ok"
  | "demo"
  | "empty_used_demo"
  | "empty_url"
  | "invalid_used_demo"
  | "invalid_url"
  | "fetch_failed"
  | "out_of_niche";

export type ScanErrorCode = "invalid_url" | "fetch_failed" | "empty_url";

export type ScanOutcome = {
  facts: BusinessFacts | null;
  noticeKey: NoticeKey;
  siteImages: string[];
  error?: ScanErrorCode;
};

export async function scanBusinessUrl(rawUrl: string, _lang: Lang): Promise<ScanOutcome> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { facts: null, noticeKey: "empty_url", siteImages: [], error: "empty_url" };
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
  const extra = await fetchSameOriginScripts(fetched.finalUrl, $, scriptBlob($));
  const { facts, siteImages } = factsFromHtml(fetched.html, fetched.finalUrl, extra);

  return { facts, noticeKey: facts.niche === "out_of_niche" ? "out_of_niche" : "ok", siteImages };
}
