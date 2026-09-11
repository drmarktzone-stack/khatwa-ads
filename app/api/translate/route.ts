import { NextResponse } from "next/server";
import { parseLang } from "@/lib/lang";
import { translateLines } from "@/lib/translate";
import type { BusinessFacts, CopyLine } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { lines?: CopyLine[]; facts?: BusinessFacts; lang?: string } = {};
  try {
    body = (await req.json()) as { lines?: CopyLine[]; facts?: BusinessFacts; lang?: string };
  } catch {
    body = {};
  }
  const lang = parseLang(body.lang);
  if (!body.lines?.length || !body.facts) {
    return NextResponse.json({ lines: [], usedTranslate: false, lang });
  }
  const result = await translateLines(body.lines, body.facts, lang);
  return NextResponse.json({ ...result, lang });
}
