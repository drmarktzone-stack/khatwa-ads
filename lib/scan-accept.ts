import { findExplicitDemo, isSampleBusiness } from "./scan";
import type { ScanPayload } from "./types";

export type AcceptFailure = "http" | "rejected_demo" | "invalid";

export type AcceptScanResult =
  | { ok: true; payload: ScanPayload }
  | { ok: false; reason: AcceptFailure };

function isScanPayload(data: unknown): data is ScanPayload {
  if (!data || typeof data !== "object") return false;
  const facts = (data as ScanPayload).facts;
  return Boolean(facts && typeof facts === "object" && facts.businessId && facts.name);
}

/**
 * Only an explicit demo URL (exact demo host / demo:slug) may carry a sample business.
 * Empty URL and any live URL must never be accepted as the built-in clinic.
 */
export function acceptScanPayload(inputUrl: string, resOk: boolean, data: unknown): AcceptScanResult {
  if (!resOk) return { ok: false, reason: "http" };
  if (!isScanPayload(data)) return { ok: false, reason: "invalid" };

  const trimmed = inputUrl.trim();
  const explicitDemo = Boolean(findExplicitDemo(trimmed));
  if (!explicitDemo && isSampleBusiness(data.facts)) {
    return { ok: false, reason: "rejected_demo" };
  }

  return { ok: true, payload: { ...data, inputUrl: trimmed, scannedAt: data.scannedAt ?? Date.now() } };
}

export type MarketplaceResolve =
  | { kind: "ok"; payload: ScanPayload }
  | { kind: "empty" }
  | { kind: "rejected_demo" };

/** Marketplace reads session facts only — never injects DEMOS. */
export function resolveMarketplacePayload(
  stored: ScanPayload | null,
  lastScanUrl: string | null,
): MarketplaceResolve {
  if (!stored?.facts) return { kind: "empty" };
  const attempted = (lastScanUrl || stored.inputUrl || "").trim();
  if (attempted && !findExplicitDemo(attempted) && isSampleBusiness(stored.facts)) {
    return { kind: "rejected_demo" };
  }
  return { kind: "ok", payload: stored };
}

export function liveUrlMustNotBeSample(inputUrl: string, payload: ScanPayload): boolean {
  const accepted = acceptScanPayload(inputUrl, true, payload);
  return accepted.ok;
}
