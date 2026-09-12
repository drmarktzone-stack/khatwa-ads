import { lockAdPack } from "./adpack";
import type { Lang } from "./lang";
import { defaultSelection, loadAdPack, loadScan, loadSelection, saveAdPack } from "./session";
import type { AdPack } from "./types";

/** Recover a locked pack, or lock from the current scan so finish pages never dead-end. */
export function ensureAdPack(lang: Lang): AdPack | null {
  const existing = loadAdPack();
  if (existing?.facts && existing.lines?.length) return existing;
  const scan = loadScan();
  if (!scan) return null;
  const sel = loadSelection() || defaultSelection(scan);
  const pack = lockAdPack(scan, sel, lang);
  saveAdPack(pack);
  return pack;
}
