import type { CopyKind, CopyNeed } from "../types";
import type { CopyTemplate, ImageMotif } from "./types";

export function T(
  kind: CopyKind,
  angle: string,
  ar: string,
  he: string,
  en: string,
  ctaAr: string,
  ctaHe: string,
  ctaEn: string,
  need?: CopyNeed,
): CopyTemplate {
  return { kind, angle, ar, he, en, ctaAr, ctaHe, ctaEn, need };
}

export function motif(
  id: string,
  theme: string,
  src: string,
  queries: string[],
  captionAr: string,
  captionHe: string,
  captionEn: string,
): ImageMotif {
  return { id, theme, src, queries, captionAr, captionHe, captionEn };
}
