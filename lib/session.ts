import type { ScanPayload, SelectionState } from "./types";

const SCAN_KEY = "khatwa.scan";
const SEL_KEY = "khatwa.selection";
const DRAFT_KEY = "khatwa.draftUrl";
const LAST_SCAN_KEY = "khatwa.lastScanUrl";

function writeBoth(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

function readPreferSession(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  } catch {
    /* ignore */
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveScan(payload: ScanPayload) {
  writeBoth(SCAN_KEY, JSON.stringify(payload));
}

export function loadScan(): ScanPayload | null {
  const raw = readPreferSession(SCAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ScanPayload;
  } catch {
    return null;
  }
}

export function saveSelection(sel: SelectionState) {
  writeBoth(SEL_KEY, JSON.stringify(sel));
}

export function loadSelection(): SelectionState | null {
  const raw = readPreferSession(SEL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectionState;
  } catch {
    return null;
  }
}

export function saveDraftUrl(url: string) {
  writeBoth(DRAFT_KEY, url);
}

export function loadDraftUrl(): string {
  return readPreferSession(DRAFT_KEY) || "";
}

export function saveLastScanUrl(url: string) {
  writeBoth(LAST_SCAN_KEY, url);
}

export function loadLastScanUrl(): string {
  return readPreferSession(LAST_SCAN_KEY) || "";
}

export function defaultSelection(payload: ScanPayload): SelectionState {
  const headlines = payload.lines.filter((l) => l.kind === "headline").slice(0, 4);
  const hooks = payload.lines.filter((l) => l.kind === "hook").slice(0, 3);
  const ctas = payload.lines.filter((l) => l.kind === "cta").slice(0, 2);
  const siteFirst = [
    ...payload.images.filter((i) => i.source === "site" || i.source === "demo"),
    ...payload.images,
  ];
  const imageIds = [...new Set(siteFirst.map((i) => i.id))].slice(0, 3);
  return {
    lineIds: [...headlines, ...hooks, ...ctas].map((l) => l.id),
    imageIds,
  };
}
