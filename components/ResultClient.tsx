"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { NeedScanGate } from "@/components/NeedScanGate";
import { PrimaryCta } from "@/components/PrimaryCta";
import { VariantGallery } from "@/components/VariantGallery";
import { lockAdPack, packText } from "@/lib/adpack";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
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
import type { AdPack, AdVariant, ScanPayload, SelectionState } from "@/lib/types";
import { applyVariant, variantsFromSelection } from "@/lib/variants";

export function ResultClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [sel, setSel] = useState<SelectionState | null>(null);
  const [locked, setLocked] = useState<AdPack | null>(null);
  const [hero, setHero] = useState<AdPack | null>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
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
    setLocked(loadAdPack());
  }, []);

  const previewPack = useMemo(() => {
    if (!payload || !sel) return null;
    return lockAdPack(payload, sel, lang, hero?.layoutId || locked?.layoutId || "feed_bold");
  }, [payload, sel, lang, hero?.layoutId, locked?.layoutId]);

  const sameBiz = Boolean(payload && locked && locked.facts.businessId === payload.facts.businessId);
  const working = hero || (sameBiz ? locked : null) || previewPack;
  const variants = useMemo(
    () => (payload && sel ? variantsFromSelection(payload, sel, 18) : []),
    [payload, sel],
  );

  if (!payload || !sel || !previewPack || !working) {
    return <NeedScanGate lang={lang} step={3} />;
  }

  const text = packText(working, lang);

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
    const base = lockAdPack(payload, sel, lang, working?.layoutId || "feed_bold");
    const next = working
      ? {
          ...base,
          layoutId: working.layoutId,
          images: working.images.length ? working.images : base.images,
          lines: working.lines.length ? working.lines : base.lines,
          caption: working.caption || base.caption,
          lineIds: working.lineIds.length ? working.lineIds : base.lineIds,
          imageIds: working.imageIds.length ? working.imageIds : base.imageIds,
        }
      : base;
    saveAdPack(next);
    setLocked(next);
    setHero(next);
    router.push(`/design?lang=${lang}`);
  }

  function pickVariant(variant: AdVariant) {
    if (!working) return;
    const next = applyVariant(working, variant);
    setActiveVariant(variant.id);
    setHero(next);
  }

  const host = payload.facts.host;
  const already = sameBiz;

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={3} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="k-kicker">{t("lockThen", lang)}</p>
          <h1 className="mt-3 text-4xl font-black">{t("resultTitle", lang)}</h1>
          <p className="mt-2 max-w-xl text-khatwa-mute">{t("resultSub", lang)}</p>
          {already ? <p className="mt-2 text-sm font-bold text-khatwa-green">{t("lockedNote", lang)}</p> : null}
        </div>
        <PrimaryCta onClick={lockAndGo} data-cta="lock-ad">
          {already ? t("lockedContinue", lang) : t("lockCta", lang)}
        </PrimaryCta>
      </div>

      <div className="mt-10">
        <VariantGallery
          pack={working}
          variants={variants}
          lang={lang}
          activeId={activeVariant}
          onPick={pickVariant}
        />
      </div>

      <div className="mt-10 grid gap-3">
        {working.lines.map((line) => (
          <div key={line.id} className="k-card p-4">
            <p className="text-xs font-extrabold text-khatwa-green">{t(line.kind, lang)}</p>
            <p className="mt-1 text-lg font-bold">{line.text}</p>
            <p className="mt-2 text-sm font-semibold text-khatwa-mute">{line.ctaLabel}</p>
          </div>
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
