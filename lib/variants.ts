import { lockAdPack } from "./adpack";
import { AD_LAYOUTS } from "./layouts";
import { defaultSelection } from "./session";
import type { AdLayoutId, AdPack, AdVariant, CopyLine, NicheImage, ScanPayload, SelectionState } from "./types";

export const MAX_VARIANTS = 24;

function headsFrom(lines: CopyLine[]): CopyLine[] {
  const headlines = lines.filter((l) => l.kind === "headline");
  if (headlines.length) return headlines;
  const hooks = lines.filter((l) => l.kind === "hook");
  if (hooks.length) return hooks;
  return lines;
}

/**
 * AdCreative / Predis-style gallery: cross-match headlines × images,
 * cycling Meta layouts (1:1 + 9:16). No scores, no ROAS, no invented rank.
 */
export function buildVariants(opts: {
  lines: CopyLine[];
  images: NicheImage[];
  max?: number;
}): AdVariant[] {
  const max = Math.max(1, opts.max ?? MAX_VARIANTS);
  const heads = headsFrom(opts.lines);
  const images = opts.images.filter((img) => img?.id && img.src);
  const hooks = opts.lines.filter((l) => l.kind === "hook");
  const ctas = opts.lines.filter((l) => l.kind === "cta");
  if (!heads.length || !images.length) return [];

  const layouts = AD_LAYOUTS.map((l) => l.id);
  const combos: Array<{ headline: CopyLine; image: NicheImage }> = [];
  for (const headline of heads) {
    for (const image of images) {
      combos.push({ headline, image });
    }
  }

  const explodeLayouts = combos.length < 8;
  const out: AdVariant[] = [];
  const seen = new Set<string>();
  let i = 0;

  for (const combo of combos) {
    const layoutPass = explodeLayouts ? layouts : [layouts[i % layouts.length]];
    for (const layoutId of layoutPass) {
      if (out.length >= max) return out;
      const id = `var-${combo.headline.id}-${combo.image.id}-${layoutId}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const hook = hooks.length ? hooks[i % hooks.length] : undefined;
      const cta = ctas.length ? ctas[i % ctas.length] : undefined;
      out.push({
        id,
        headline: combo.headline,
        image: combo.image,
        layoutId,
        hook: hook && hook.id !== combo.headline.id ? hook : undefined,
        cta,
      });
      i += 1;
    }
  }

  return out;
}

export function variantsFromSelection(payload: ScanPayload, sel: SelectionState, max?: number): AdVariant[] {
  const filled: SelectionState = {
    lineIds: sel.lineIds.length ? sel.lineIds : defaultSelection(payload).lineIds,
    imageIds: sel.imageIds.length ? sel.imageIds : defaultSelection(payload).imageIds,
  };
  const lines = payload.lines.filter((l) => filled.lineIds.includes(l.id));
  const images = payload.images.filter((img) => filled.imageIds.includes(img.id));
  return buildVariants({
    lines: lines.length ? lines : payload.lines,
    images: images.length ? images : payload.images,
    max,
  });
}

export function variantsFromPack(pack: AdPack, max?: number): AdVariant[] {
  return buildVariants({ lines: pack.lines, images: pack.images, max });
}

export function packForVariant(base: AdPack, variant: AdVariant): AdPack {
  const extras = [variant.headline, variant.hook, variant.cta].filter((x): x is CopyLine => Boolean(x));
  const restLines = base.lines.filter((l) => !extras.some((x) => x.id === l.id));
  const images = [variant.image, ...base.images.filter((img) => img.id !== variant.image.id)];
  return {
    ...base,
    layoutId: variant.layoutId,
    lines: [...extras, ...restLines],
    images,
  };
}

export function applyVariant(pack: AdPack, variant: AdVariant): AdPack {
  const next = packForVariant(pack, variant);
  return {
    ...next,
    lineIds: next.lines.map((l) => l.id),
    imageIds: next.images.map((img) => img.id),
  };
}

export function previewPack(payload: ScanPayload, sel: SelectionState, lang: AdPack["lang"], layoutId?: AdLayoutId): AdPack {
  return lockAdPack(payload, sel, lang, layoutId || "feed_bold");
}

export function variantHasScore(variant: AdVariant): boolean {
  return "score" in variant || "roas" in variant || "rank" in variant;
}
