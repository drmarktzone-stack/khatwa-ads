import { NextResponse } from "next/server";
import { imagesForFacts } from "@/lib/images";
import { linesWithOptionalGemini } from "@/lib/gemini";
import { noticeText } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { scanBusinessUrl } from "@/lib/scan";
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
  const { facts, noticeKey } = await scanBusinessUrl(body.url || "", lang);
  const { lines, usedGemini } = await linesWithOptionalGemini(facts, lang);
  const images = imagesForFacts(facts, lang);

  const payload: ScanPayload = {
    facts,
    lines,
    images,
    outOfNiche: facts.niche === "out_of_niche",
    usedGemini,
    notice: noticeText(noticeKey, lang),
    lang,
  };

  return NextResponse.json(payload);
}
