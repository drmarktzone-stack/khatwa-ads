import { gcpConfig, toolsAvailable, vertexGenerate, vertexPredict } from "./gcp";
import { safeDisplayName } from "./niches/brand";
import { getNiche } from "./niches/registry";
import type { ImageMotif } from "./niches/types";
import type { BusinessFacts, Lang, NicheImage } from "./types";

function fillCaption(template: string, facts: BusinessFacts, index: number): string {
  const name = safeDisplayName(facts);
  const place = facts.place.value;
  const service = facts.services[index % Math.max(facts.services.length, 1)] || null;
  return template
    .replaceAll("{name}", name)
    .replaceAll("{place}", place ? ` — ${place}` : "")
    .replaceAll("{service}", service || "")
    .replaceAll("{doctor}", facts.doctorName.value || name)
    .replace(/\s{2,}/g, " ")
    .replace(/\s+[—–-]\s*$/g, "")
    .trim();
}

function captionFor(
  motif: Pick<ImageMotif, "captionAr" | "captionHe" | "captionEn" | "theme">,
  facts: BusinessFacts,
  lang: Lang,
  index: number,
  source: NicheImage["source"],
): string {
  const raw =
    lang === "he" ? motif.captionHe : lang === "en" ? motif.captionEn : motif.captionAr;
  const base = fillCaption(raw || motif.theme, facts, index);
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
  return `${base} · ${tag}`;
}

async function tryGenerated(facts: BusinessFacts): Promise<NicheImage[]> {
  if (!toolsAvailable().imagen) return [];
  const cfg = gcpConfig();
  const name = safeDisplayName(facts);
  const niche = facts.niche;
  const queries = getNiche(niche).stockQueries.slice(0, 2).join("; ");
  const prompt = `Photorealistic local-business photo for a ${niche} named "${name}". Motifs: ${queries}. No text, no prices, no logos invented. No Jerusalem unless the business is there.`;
  try {
    const predicted = await vertexPredict(cfg.imagenModel, {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1" },
    });
    const pred = predicted as { predictions?: Array<{ bytesBase64Encoded?: string }> } | null;
    const b64 = pred?.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      const pack = getNiche(niche).motifs;
      return [
        {
          id: "gen-1",
          src: `data:image/png;base64,${b64}`,
          alt: name,
          caption: captionFor(pack[0] || { captionAr: name, captionHe: name, captionEn: name, theme: "light" }, facts, "ar", 0, "generated"),
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
  const pack = getNiche(facts.niche).motifs;

  siteImages.slice(0, 6).forEach((src, i) => {
    const motif = pack[i % pack.length];
    let cap = captionFor(motif, facts, lang, i, facts.usedDemo ? "demo" : "site");
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

  pack.forEach((stock, index) => {
    if (images.length >= 12) return;
    let cap = captionFor(stock, facts, lang, index, "stock");
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
  const pack = getNiche(facts.niche).motifs;
  const used = new Set<string>();
  return pack.map((stock, index) => {
    let cap = captionFor(stock, facts, lang, index, "stock");
    if (used.has(cap)) cap = `${cap} · ${index + 1}`;
    used.add(cap);
    return { id: stock.id, src: stock.src, alt: cap, caption: cap, source: "stock" as const };
  });
}
