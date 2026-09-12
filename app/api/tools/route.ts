import { NextResponse } from "next/server";
import { toolsWithOptionalGemini } from "@/lib/gemini-tools";
import { parseLang } from "@/lib/lang";
import { buildToolsBundle, isToolSlug } from "@/lib/tools-engine";
import type { AdPack } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: Request) {
  let body: { pack?: AdPack; lang?: string; tool?: string } = {};
  try {
    body = (await req.json()) as { pack?: AdPack; lang?: string; tool?: string };
  } catch {
    body = {};
  }
  const lang = parseLang(body.lang);
  const pack = body.pack;
  const tool = isToolSlug(body.tool) ? body.tool : "scripts";
  if (!pack?.facts || !Array.isArray(pack.lines)) {
    return NextResponse.json({ ok: false, error: "need_pack" }, { status: 400 });
  }
  try {
    const bundle = await toolsWithOptionalGemini(pack, lang, tool);
    return NextResponse.json(bundle);
  } catch {
    return NextResponse.json(buildToolsBundle(pack, lang, false));
  }
}
