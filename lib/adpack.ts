import { t } from "./i18n";
import { parseLang } from "./lang";
import { safeDisplayName } from "./niches";
import { defaultSelection } from "./session";
import type { AdLayoutId, AdPack, CopyLine, Lang, NicheImage, ScanPayload, SelectionState } from "./types";

export function makePackId(): string {
  return `pack-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function chosenFrom(payload: ScanPayload, sel: SelectionState): { lines: CopyLine[]; images: NicheImage[] } {
  const lines = payload.lines.filter((l) => sel.lineIds.includes(l.id));
  const images = payload.images.filter((i) => sel.imageIds.includes(i.id));
  return { lines, images };
}

export function buildCaption(payload: ScanPayload, sel: SelectionState, lang: Lang): string {
  const { lines } = chosenFrom(payload, sel);
  const facts = payload.facts;
  const name = safeDisplayName(facts);
  const headline = lines.find((l) => l.kind === "headline") || lines[0];
  const hook = lines.find((l) => l.kind === "hook");
  const cta = lines.find((l) => l.kind === "cta");
  const bits = [
    headline?.text || name,
    hook?.text && hook.text !== headline?.text ? hook.text : "",
    facts.place.value ? `${t("place", lang)}: ${facts.place.value}` : "",
    facts.phone.value ? `${t("phone", lang)}: ${facts.phone.value}` : "",
    facts.hours.value ? `${t("hours", lang)}: ${facts.hours.value}` : "",
    cta?.ctaLabel || cta?.text || "",
    facts.url,
  ].filter(Boolean);
  return bits.join("\n");
}

export function packText(pack: AdPack, lang: Lang): string {
  const facts = pack.facts;
  const heads = pack.lines.filter((l) => l.kind === "headline").map((l) => l.text);
  const hooks = pack.lines.filter((l) => l.kind === "hook").map((l) => l.text);
  const ctas = pack.lines.filter((l) => l.kind === "cta").map((l) => `${l.text}  →  ${l.ctaLabel}`);
  return [
    `${t("brand", lang)} — ${t("resultTitle", lang)}`,
    `${t("name", lang)}: ${safeDisplayName(facts)}`,
    `${t("phone", lang)}: ${facts.phone.value || t("missing", lang)}`,
    `${t("place", lang)}: ${facts.place.value || t("missing", lang)}`,
    `${t("hours", lang)}: ${facts.hours.value || t("missing", lang)}`,
    `${t("services", lang)}: ${facts.services.join(", ") || t("missing", lang)}`,
    `URL: ${facts.url}`,
    "",
    `— ${t("headline", lang)} —`,
    ...heads,
    "",
    `— ${t("hook", lang)} —`,
    ...hooks,
    "",
    `— ${t("cta", lang)} —`,
    ...ctas,
    "",
    `— ${t("caption", lang)} —`,
    pack.caption,
    "",
    `— ${t("images", lang)} —`,
    ...pack.images.map((i) => `${i.caption} [${i.source}]`),
    "",
    t("evidenceNote", lang),
    t("noPasswords", lang),
  ].join("\n");
}

export function lockAdPack(
  payload: ScanPayload,
  sel: SelectionState,
  lang: Lang,
  layoutId: AdLayoutId = "feed_bold",
): AdPack {
  const filled: SelectionState = {
    lineIds: sel.lineIds.length ? sel.lineIds : defaultSelection(payload).lineIds,
    imageIds: sel.imageIds.length ? sel.imageIds : defaultSelection(payload).imageIds,
  };
  const { lines, images } = chosenFrom(payload, filled);
  const fallback = defaultSelection(payload);
  const lockedLines = lines.length ? lines : payload.lines.filter((l) => fallback.lineIds.includes(l.id));
  const lockedImages = images.length ? images : payload.images.filter((i) => fallback.imageIds.includes(i.id));
  const snapshotSel: SelectionState = {
    lineIds: lockedLines.map((l) => l.id),
    imageIds: lockedImages.map((i) => i.id),
  };
  return {
    id: makePackId(),
    lockedAt: Date.now(),
    lang: parseLang(lang),
    facts: structuredClone(payload.facts),
    lines: structuredClone(lockedLines),
    images: structuredClone(lockedImages),
    lineIds: snapshotSel.lineIds,
    imageIds: snapshotSel.imageIds,
    layoutId,
    caption: buildCaption({ ...payload, lines: lockedLines, images: lockedImages }, snapshotSel, lang),
    draft: false,
  };
}

export function overlayFacts(pack: AdPack): { name: string; place: string; phone: string; headline: string; cta: string } {
  const name = safeDisplayName(pack.facts);
  const headline = pack.lines.find((l) => l.kind === "headline") || pack.lines[0];
  const cta = pack.lines.find((l) => l.kind === "cta");
  return {
    name,
    place: pack.facts.place.value || "",
    phone: pack.facts.phone.value || pack.facts.whatsapp.value || "",
    headline: headline?.text || name,
    cta: cta?.ctaLabel || headline?.ctaLabel || name,
  };
}

export function isSameSnapshot(pack: AdPack, payload: ScanPayload, sel: SelectionState): boolean {
  const { lines, images } = chosenFrom(payload, sel);
  if (pack.facts.businessId !== payload.facts.businessId) return false;
  if (pack.lineIds.join("|") !== lines.map((l) => l.id).join("|")) return false;
  if (pack.imageIds.join("|") !== images.map((i) => i.id).join("|")) return false;
  return true;
}
