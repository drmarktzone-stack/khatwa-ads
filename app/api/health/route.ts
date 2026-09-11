import { NextResponse } from "next/server";
import { gcpConfig, toolsAvailable } from "@/lib/gcp";

export function GET() {
  const cfg = gcpConfig();
  return NextResponse.json({
    ok: true,
    name: "khatwa-ads",
    location: cfg.location,
    model: cfg.model,
    tools: toolsAvailable(),
  });
}
