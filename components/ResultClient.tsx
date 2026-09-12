"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdPoster } from "@/components/AdPoster";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { NeedScanGate } from "@/components/NeedScanGate";
import { PrimaryCta } from "@/components/PrimaryCta";
import { lockAdPack, packText } from "@/lib/adpack";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { AD_LAYOUTS } from "@/lib/layouts";
import { downloadTextFile } from "@/lib/publish";
import { resolveMarketplacePayload } from "@/lib/scan-accept";
import {
  defaultSelection,
  loadAdPack,
  loadDraftUrl,
  loadLastScanUrl,
  loadScan,
  loadSelection,
  saveAdPack,
  saveScan,
  saveSelection,
} from "@/lib/session";
import type { AdPack, ScanPayload, SelectionState } from "@/lib/types";

export function ResultClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [sel, setSel] = useState<SelectionState | null>(null);
  const [pack, setPack] = useState<AdPack | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadScan();
    const resolved = resolveMarketplacePayload(stored, loadLastScanUrl() || loadDraftUrl());
    if (resolved.kind !== "ok") return;
    const selection = loadSelection() || defaultSelection(resolved.payload);
    saveScan(resolved.payload);
    saveSelection(selection);
    setPayload(resolved.payload);
    setSel(selection);
    setPack(loadAdPack());
  }, []);

  const previewPack = useMemo(() => {
    if (!payload || !sel) return null;
    return lockAdPack(payload, sel, lang, pack?.layoutId || "feed_bold");
  }, [payload, sel, lang, pack?.layoutId]);

  if (!payload || !sel || !previewPack) {
    return <NeedScanGate lang={lang} step={3} />;
  }

  const text = packText(pack && pack.facts.businessId === payload.facts.businessId ? pack : previewPack, lang);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function lockAndGo() {
    if (!payload || !sel) {
      router.push(`/?lang=${lang}`);
      return;
    }
    const next = lockAdPack(payload, sel, lang, pack?.layoutId || "feed_bold");
    saveAdPack(next);
    setPack(next);
    router.push(`/design?lang=${lang}`);
  }

  const host = payload.facts.host;
  const already = Boolean(pack && pack.facts.businessId === payload.facts.businessId);

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={3} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{t("resultTitle", lang)}</h1>
          <p className="mt-2 max-w-xl text-khatwa-mute">{t("resultSub", lang)}</p>
          {already ? <p className="mt-2 text-sm font-bold text-khatwa-green">{t("lockedNote", lang)}</p> : null}
        </div>
        <PrimaryCta onClick={lockAndGo} data-cta="lock-ad">
          {already ? t("lockedContinue", lang) : t("lockCta", lang)}
        </PrimaryCta>
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
        {AD_LAYOUTS.slice(0, 4).map((layout) => (
          <AdPoster key={layout.id} pack={{ ...previewPack, layoutId: layout.id }} layoutId={layout.id} />
        ))}
      </div>

      <div className="mt-8 grid gap-3">
        {previewPack.lines.map((line) => (
          <div key={line.id} className="k-card p-4">
            <p className="text-xs font-extrabold text-khatwa-green">{t(line.kind, lang)}</p>
            <p className="mt-1 text-lg font-bold">{line.text}</p>
            <p className="mt-2 text-sm font-semibold text-khatwa-mute">{line.ctaLabel}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {previewPack.images.map((img) => (
          <figure key={img.id} className="k-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="h-40 w-full object-cover" />
            <figcaption className="p-3 text-sm font-semibold">{img.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <PrimaryCta onClick={lockAndGo}>{already ? t("lockedContinue", lang) : t("lockCta", lang)}</PrimaryCta>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => void copyAll()}
        >
          {copied ? t("copied", lang) : t("copyAll", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => downloadTextFile(`khatwa-ads-${host}-${lang}.txt`, text)}
        >
          {t("download", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => router.push(`/tools?lang=${lang}`)}
        >
          {t("toolsNav", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => router.push(`/scan?lang=${lang}`)}
        >
          {t("backMarket", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => router.push(`/?lang=${lang}`)}
        >
          {t("newScan", lang)}
        </button>
      </div>
    </AppFrame>
  );
}
