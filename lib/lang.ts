import type { Lang } from "./types";

export type { Lang };

export const LANGS: Lang[] = ["ar", "he", "en"];

export function isRtl(lang: Lang): boolean {
  return lang === "ar" || lang === "he";
}

export function parseLang(value: string | null | undefined): Lang {
  if (value === "he" || value === "en" || value === "ar") return value;
  return "ar";
}

export function langLabel(lang: Lang): string {
  if (lang === "ar") return "عربي";
  if (lang === "he") return "עברית";
  return "EN";
}

export function fontClass(lang: Lang): string {
  if (lang === "he") return "font-heebo";
  if (lang === "en") return "font-outfit";
  return "font-cairo";
}
