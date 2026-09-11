import type { ScanPayload, SelectionState } from "./types";

const SCAN_KEY = "khatwa.scan";
const SEL_KEY = "khatwa.selection";

export function saveScan(payload: ScanPayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SCAN_KEY, JSON.stringify(payload));
}

export function loadScan(): ScanPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SCAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ScanPayload;
  } catch {
    return null;
  }
}

export function saveSelection(sel: SelectionState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SEL_KEY, JSON.stringify(sel));
}

export function loadSelection(): SelectionState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SEL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectionState;
  } catch {
    return null;
  }
}

export function defaultSelection(payload: ScanPayload): SelectionState {
  const headlines = payload.lines.filter((l) => l.kind === "headline").slice(0, 4);
  const hooks = payload.lines.filter((l) => l.kind === "hook").slice(0, 3);
  const ctas = payload.lines.filter((l) => l.kind === "cta").slice(0, 2);
  return {
    lineIds: [...headlines, ...hooks, ...ctas].map((l) => l.id),
    imageIds: payload.images.slice(0, 3).map((i) => i.id),
  };
}
