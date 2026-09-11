import { gcpConfig, toolsAvailable, vertexGenerate, vertexPredict } from "./gcp";
import type { BusinessFacts, Lang, Niche, NicheImage } from "./types";

interface Stock {
  id: string;
  src: string;
  theme: string;
}

const STOCK: Record<Niche, Stock[]> = {
  clinic: [
    { id: "c1", src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80", theme: "reception" },
    { id: "c2", src: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80", theme: "chair" },
    { id: "c3", src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80", theme: "tools" },
    { id: "c4", src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80", theme: "hallway" },
    { id: "c5", src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80", theme: "care" },
    { id: "c6", src: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&q=80", theme: "team" },
    { id: "c7", src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&q=80", theme: "consult" },
    { id: "c8", src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=80", theme: "calm" },
    { id: "c9", src: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=80", theme: "light" },
  ],
  tutoring: [
    { id: "t1", src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80", theme: "desk" },
    { id: "t2", src: "https://images.unsplash.com/photo-1456513080880-7d93d20b90ff?w=900&q=80", theme: "books" },
    { id: "t3", src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900&q=80", theme: "classroom" },
    { id: "t4", src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=80", theme: "notes" },
    { id: "t5", src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80", theme: "board" },
    { id: "t6", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80", theme: "pair" },
    { id: "t7", src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&q=80", theme: "write" },
    { id: "t8", src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80", theme: "lecture" },
    { id: "t9", src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80", theme: "plan" },
  ],
  restaurant: [
    { id: "r1", src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80", theme: "room" },
    { id: "r2", src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80", theme: "coffee" },
    { id: "r3", src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80", theme: "plated" },
    { id: "r4", src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80", theme: "table" },
    { id: "r5", src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&q=80", theme: "street" },
    { id: "r6", src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80", theme: "dish" },
    { id: "r7", src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80", theme: "cafe" },
    { id: "r8", src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=80", theme: "pastry" },
    { id: "r9", src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=80", theme: "evening" },
  ],
  renovation: [
    { id: "n1", src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80", theme: "site" },
    { id: "n2", src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80", theme: "kitchen" },
    { id: "n3", src: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=900&q=80", theme: "build" },
    { id: "n4", src: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=900&q=80", theme: "paint" },
    { id: "n5", src: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&q=80", theme: "tools" },
    { id: "n6", src: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900&q=80", theme: "interior" },
    { id: "n7", src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80", theme: "crew" },
    { id: "n8", src: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=900&q=80", theme: "home" },
    { id: "n9", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80", theme: "space" },
  ],
  fitness: [
    { id: "f1", src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80", theme: "gym" },
    { id: "f2", src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80", theme: "yoga" },
    { id: "f3", src: "https://images.unsplash.com/photo-1518611012118-696072451274?w=900&q=80", theme: "mat" },
    { id: "f4", src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80", theme: "coach" },
    { id: "f5", src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80", theme: "weights" },
    { id: "f6", src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80", theme: "studio" },
    { id: "f7", src: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=900&q=80", theme: "stretch" },
    { id: "f8", src: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=900&q=80", theme: "group" },
    { id: "f9", src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=900&q=80", theme: "run" },
  ],
  out_of_niche: [
    { id: "o1", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80", theme: "desk" },
    { id: "o2", src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=80", theme: "street" },
    { id: "o3", src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=80", theme: "work" },
    { id: "o4", src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80", theme: "people" },
    { id: "o5", src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80", theme: "plan" },
    { id: "o6", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80", theme: "screen" },
    { id: "o7", src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&q=80", theme: "office" },
    { id: "o8", src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80", theme: "room" },
    { id: "o9", src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80", theme: "shop" },
  ],
};

const THEME_AR: Record<string, (n: string, p: string | null, s: string | null, i: number) => string> = {
  reception: (n) => `${n} — المدخل الظاهر`,
  chair: (n, _p, s) => (s ? `${n}: كرسي ${s}` : `${n} — كرسي العلاج`),
  tools: (n) => `${n} — أدوات الشغل`,
  hallway: (n, p) => (p ? `ممر ${n} في ${p}` : `ممر ${n}`),
  care: (n) => `رعاية ${n}`,
  team: (n) => `ناس ${n}`,
  consult: (n) => `جلسة ${n}`,
  calm: (n, p) => (p ? `هدوء ${n} — ${p}` : `هدوء ${n}`),
  light: (n) => `ضوء إعلان ${n}`,
  desk: (n, _p, s) => (s ? `مكتب ${s} — ${n}` : `مكتب ${n}`),
  books: (n) => `كتب ${n}`,
  classroom: (n, p) => (p ? `حصة ${n} قرب ${p}` : `حصة ${n}`),
  notes: (n) => `دفتر ${n}`,
  board: (n) => `لوح ${n}`,
  pair: (n) => `حصة ثنائية — ${n}`,
  write: (n) => `كتابة عند ${n}`,
  lecture: (n) => `شرح ${n}`,
  plan: (n) => `خطة ${n}`,
  room: (n, p) => (p ? `صالة ${n} — ${p}` : `صالة ${n}`),
  coffee: (n) => `قهوة ${n}`,
  plated: (n, _p, s) => (s ? `طبق ${s} — ${n}` : `طبق ${n}`),
  table: (n) => `طاولة ${n}`,
  street: (n, p) => (p ? `واجهة ${n} في ${p}` : `واجهة ${n}`),
  dish: (n, _p, s, i) => (s ? `${s} #${i + 1} عند ${n}` : `أكل ${n}`),
  cafe: (n) => `ركن ${n}`,
  pastry: (n) => `حلويات ${n}`,
  evening: (n) => `مساء ${n}`,
  site: (n, p) => (p ? `ورشة ${n} — ${p}` : `ورشة ${n}`),
  kitchen: (n, _p, s) => (s ? `${s} مطبخ — ${n}` : `مطبخ ${n}`),
  build: (n) => `شغل ${n} عالعظم`,
  paint: (n, _p, s) => (s ? `${s} على الحيطان — ${n}` : `دهان ${n}`),
  interior: (n) => `داخل شغل ${n}`,
  crew: (n) => `طاقم ${n}`,
  home: (n) => `بيت مع ${n}`,
  space: (n) => `مساحة قبل فرش ${n}`,
  gym: (n) => `بساط ${n}`,
  yoga: (n, _p, s) => (s ? `حصة ${s} — ${n}` : `يوغا ${n}`),
  mat: (n) => `مات ${n}`,
  coach: (n) => `مدرب ${n}`,
  weights: (n) => `حديد ${n}`,
  studio: (n, p) => (p ? `ستوديو ${n} في ${p}` : `ستوديو ${n}`),
  stretch: (n) => `تمسيد ${n}`,
  group: (n) => `مجموعة ${n}`,
  run: (n) => `خطوة برّا مع ${n}`,
  work: (n) => `مكتب ${n}`,
  people: (n) => `وجوه ${n}`,
  screen: (n) => `شاشة ${n}`,
  office: (n) => `نهار ${n}`,
  shop: (n) => `محل ${n}`,
};

function caption(
  theme: string,
  facts: BusinessFacts,
  lang: Lang,
  index: number,
  source: NicheImage["source"],
): string {
  const name = facts.name.value || facts.host;
  const place = facts.place.value;
  const service = facts.services[index % Math.max(facts.services.length, 1)] || null;
  const ar = (THEME_AR[theme] || THEME_AR.work)(name, place, service, index);
  const tag =
    source === "site"
      ? lang === "he"
        ? "מהאתר"
        : lang === "en"
          ? "from the site"
          : "من الموقع"
      : source === "generated"
        ? lang === "he"
          ? "נוצר"
          : lang === "en"
            ? "generated"
            : "مولَّدة"
        : lang === "he"
          ? "סטוק נישה"
          : lang === "en"
            ? "niche stock"
            : "ستوك المجال";
  if (lang === "ar") return `${ar} · ${tag}`;
  if (lang === "he") return `${name} · ${theme} · ${tag}`;
  return `${name} · ${theme} · ${tag}`;
}

async function tryGenerated(facts: BusinessFacts): Promise<NicheImage[]> {
  if (!toolsAvailable().imagen) return [];
  const cfg = gcpConfig();
  const name = facts.name.value || facts.host;
  const niche = facts.niche;
  const prompt = `Photorealistic local-business photo for a ${niche} named "${name}". No text, no prices, no logos invented.`;
  try {
    const predicted = await vertexPredict(cfg.imagenModel, {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1" },
    });
    const pred = predicted as { predictions?: Array<{ bytesBase64Encoded?: string }> } | null;
    const b64 = pred?.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      return [
        {
          id: "gen-1",
          src: `data:image/png;base64,${b64}`,
          alt: name,
          caption: caption("light", facts, "ar", 0, "generated"),
          source: "generated",
        },
      ];
    }
    await vertexGenerate({
      model: cfg.imageModel,
      grounding: false,
      prompt: `Describe (do not invent facts) a ${niche} photo for ${name}. Return only the description.`,
    });
  } catch {
    /* optional */
  }
  return [];
}

export async function composeImages(
  facts: BusinessFacts,
  lang: Lang,
  siteImages: string[],
): Promise<{ images: NicheImage[]; usedImagen: boolean; usedSite: boolean }> {
  const usedCaptions = new Set<string>();
  const images: NicheImage[] = [];

  siteImages.slice(0, 6).forEach((src, i) => {
    let cap = caption(["street", "room", "team", "light", "care", "desk"][i] || "work", facts, lang, i, facts.usedDemo ? "demo" : "site");
    if (usedCaptions.has(cap)) cap = `${cap} ${i + 1}`;
    usedCaptions.add(cap);
    images.push({
      id: `site-${i}`,
      src,
      alt: cap,
      caption: cap,
      source: facts.usedDemo ? "demo" : "site",
    });
  });

  const generated = await tryGenerated(facts);
  for (const g of generated) {
    if (usedCaptions.has(g.caption)) g.caption = `${g.caption} · AI`;
    usedCaptions.add(g.caption);
    images.push(g);
  }

  const pack = STOCK[facts.niche] || STOCK.out_of_niche;
  pack.forEach((stock, index) => {
    if (images.length >= 12) return;
    let cap = caption(stock.theme, facts, lang, index, "stock");
    if (usedCaptions.has(cap)) cap = `${cap} · ${index + 1}`;
    usedCaptions.add(cap);
    images.push({
      id: stock.id,
      src: stock.src,
      alt: cap,
      caption: cap,
      source: "stock",
    });
  });

  return {
    images,
    usedImagen: generated.length > 0,
    usedSite: siteImages.length > 0,
  };
}

export function imagesForFacts(facts: BusinessFacts, lang: Lang): NicheImage[] {
  const pack = STOCK[facts.niche] || STOCK.out_of_niche;
  const used = new Set<string>();
  return pack.map((stock, index) => {
    let cap = caption(stock.theme, facts, lang, index, "stock");
    if (used.has(cap)) cap = `${cap} · ${index + 1}`;
    used.add(cap);
    return { id: stock.id, src: stock.src, alt: cap, caption: cap, source: "stock" as const };
  });
}
