"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { BusinessCard } from "@/components/BusinessCard";
import { CopyMarketplace } from "@/components/CopyMarketplace";
import { ImageGrid } from "@/components/ImageGrid";
import { JourneySteps } from "@/components/JourneySteps";
import { PrimaryCta } from "@/components/PrimaryCta";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { defaultSelection, loadScan, loadSelection, saveScan, saveSelection } from "@/lib/session";
import type { CopyLine, ScanPayload } from "@/lib/types";

export function ScanClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [lineIds, setLineIds] = useState<string[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const translatedFor = useRef<string | null>(null);

  useEffect(() => {
    const stored = loadScan();
    if (!stored) return;
    if (!stored.baseLines) stored.baseLines = stored.lines;
    saveScan(stored);
    setPayload(stored);
    const sel = loadSelection() || defaultSelection(stored);
    saveSelection(sel);
    setLineIds(sel.lineIds);
    setImageIds(sel.imageIds);
  }, []);

  useEffect(() => {
    if (!payload || payload.lang === lang || translatedFor.current === lang) return;
    translatedFor.current = lang;
    let cancelled = false;
    setNote(t("translating", lang));
    void fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: payload.baseLines || payload.lines, facts: payload.facts, lang }),
    })
      .then((r) => r.json())
      .then((data: { lines?: CopyLine[] }) => {
        if (cancelled || !data.lines?.length) return;
        const next = { ...payload, lines: data.lines, lang };
        saveScan(next);
        setPayload(next);
      })
      .finally(() => {
        if (!cancelled) setNote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, payload]);

  const lineSet = useMemo(() => new Set(lineIds), [lineIds]);
  const imageSet = useMemo(() => new Set(imageIds), [imageIds]);

  function toggle(list: string[], id: string, setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function continueOn() {
    if (!payload) {
      router.push(`/?lang=${lang}`);
      return;
    }
    let nextLines = lineIds;
    let nextImages = imageIds;
    if (nextLines.length === 0 || nextImages.length === 0) {
      const fallback = defaultSelection(payload);
      nextLines = nextLines.length ? nextLines : fallback.lineIds;
      nextImages = nextImages.length ? nextImages : fallback.imageIds;
    }
    saveSelection({ lineIds: nextLines, imageIds: nextImages });
    router.push(`/result?lang=${lang}`);
  }

  if (!payload) {
    return (
      <AppFrame lang={lang}>
        <JourneySteps lang={lang} step={2} />
        <div className="k-card mx-auto max-w-lg p-8 text-center">
          <p className="text-lg font-bold">{t("tagline", lang)}</p>
          <PrimaryCta className="mt-6" onClick={() => router.push(`/?lang=${lang}`)}>
            {t("scan", lang)}
          </PrimaryCta>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={2} />
      {note ? <p className="mb-4 text-sm font-bold text-khatwa-green">{note}</p> : null}
      <BusinessCard payload={payload} lang={lang} />
      <div className="mt-10">
        <CopyMarketplace
          lines={payload.lines}
          selected={lineSet}
          onToggle={(id) => toggle(lineIds, id, setLineIds)}
          lang={lang}
        />
      </div>
      <div className="mt-10">
        <ImageGrid
          images={payload.images}
          selected={imageSet}
          onToggle={(id) => toggle(imageIds, id, setImageIds)}
          lang={lang}
        />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-khatwa-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-semibold">
            {lineIds.length + imageIds.length} {t("selected", lang)}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-2xl border border-khatwa-line px-4 py-2 text-sm font-bold"
              onClick={() => {
                setLineIds(payload.lines.map((l) => l.id));
                setImageIds(payload.images.map((i) => i.id));
              }}
            >
              {t("selectAll", lang)}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-khatwa-line px-4 py-2 text-sm font-bold"
              onClick={() => {
                const sel = defaultSelection(payload);
                setLineIds(sel.lineIds);
                setImageIds(sel.imageIds);
              }}
            >
              {t("selectSome", lang)}
            </button>
            <PrimaryCta onClick={continueOn}>{t("continue", lang)}</PrimaryCta>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
