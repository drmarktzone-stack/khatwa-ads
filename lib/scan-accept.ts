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
 * A non-empty live URL must never be replaced by a built-in sample business.
 * Empty URL and explicit demo URLs may carry the sample clinic.
 */
export function acceptScanPayload(inputUrl: string, resOk: boolean, data: unknown): AcceptScanResult {
  if (!resOk) return { ok: false, reason: "http" };
  if (!isScanPayload(data)) return { ok: false, reason: "invalid" };

  const trimmed = inputUrl.trim();
  const explicitDemo = Boolean(trimmed && findExplicitDemo(trimmed));
  if (trimmed && !explicitDemo && isSampleBusiness(data.facts)) {
    return { ok: false, reason: "rejected_demo" };
  }

  return { ok: true, payload: { ...data, inputUrl: trimmed, scannedAt: data.scannedAt ?? Date.now() } };
}

export function liveUrlMustNotBeSample(inputUrl: string, payload: ScanPayload): boolean {
  const accepted = acceptScanPayload(inputUrl, true, payload);
  return accepted.ok;
}
