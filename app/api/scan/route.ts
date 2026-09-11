import { NextResponse } from "next/server";
import { generateArabicLines } from "@/lib/gemini";
import { composeImages } from "@/lib/images";
import { noticeText } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { scanBusinessUrl } from "@/lib/scan";
import { translateLines } from "@/lib/translate";
import type { ScanPayload } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { url?: string; lang?: string } = {};
  try {
    body = (await req.json()) as { url?: string; lang?: string };
  } catch {
    body = {};
  }

  const lang = parseLang(body.lang);
  const { facts, noticeKey, siteImages } = await scanBusinessUrl(body.url || "", lang);
  const generated = await generateArabicLines(facts);
  const translated = await translateLines(generated.lines, facts, lang);
  const composed = await composeImages(facts, lang, siteImages);

  const payload: ScanPayload = {
    facts,
    baseLines: generated.lines,
    lines: translated.lines,
    images: composed.images,
    outOfNiche: facts.niche === "out_of_niche",
    tools: {
      gemini: generated.usedGemini,
      grounding: generated.usedGrounding,
      translate: translated.usedTranslate,
      imagen: composed.usedImagen,
      siteImages: composed.usedSite,
    },
    notice: noticeText(noticeKey, lang),
    lang,
  };

  return NextResponse.json(payload);
}
