"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdFrames } from "@/components/AdFrames";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { PrimaryCta } from "@/components/PrimaryCta";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { defaultSelection, loadScan, loadSelection, saveScan, saveSelection } from "@/lib/session";
import type { ScanPayload, SelectionState } from "@/lib/types";

function packText(payload: ScanPayload, sel: SelectionState, lang: ReturnType<typeof parseLang>): string {
  const lines = payload.lines.filter((l) => sel.lineIds.includes(l.id));
  const images = payload.images.filter((i) => sel.imageIds.includes(i.id));
  const facts = payload.facts;
  const heads = lines.filter((l) => l.kind === "headline").map((l) => l.text);
  const hooks = lines.filter((l) => l.kind === "hook").map((l) => l.text);
  const ctas = lines.filter((l) => l.kind === "cta").map((l) => `${l.text}  →  ${l.ctaLabel}`);
  return [
    `${t("brand", lang)} — ${t("resultTitle", lang)}`,
    `${t("name", lang)}: ${facts.name.value || facts.host}`,
    `${t("phone", lang)}: ${facts.phone.value || t("missing", lang)}`,
    `${t("place", lang)}: ${facts.place.value || t("missing", lang)}`,
    `${t("hours", lang)}: ${facts.hours.value || t("missing", lang)}`,
    `${t("services", lang)}: ${facts.services.join(", ") || t("missing", lang)}`,
    `URL: ${facts.url}`,
    "",
    `— ${t("headline", lang)} —`,
    ...heads,
    "",
    `— ${t("hook", lang)} —`,
    ...hooks,
    "",
    `— ${t("cta", lang)} —`,
    ...ctas,
    "",
    `— ${t("images", lang)} —`,
    ...images.map((i) => `${i.caption} [${i.source}]`),
    "",
    t("evidenceNote", lang),
  ].join("\n");
}

export function ResultClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [sel, setSel] = useState<SelectionState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadScan();
    if (!stored) return;
    const selection = loadSelection() || defaultSelection(stored);
    saveScan(stored);
    saveSelection(selection);
    setPayload(stored);
    setSel(selection);
  }, []);

  const chosen = useMemo(() => {
    if (!payload || !sel) return null;
    const lines = payload.lines.filter((l) => sel.lineIds.includes(l.id));
    const images = payload.images.filter((i) => sel.imageIds.includes(i.id));
    return { lines, images };
  }, [payload, sel]);

  if (!payload || !sel || !chosen) {
    return (
      <AppFrame lang={lang}>
        <JourneySteps lang={lang} step={3} />
        <div className="k-card mx-auto max-w-lg p-8 text-center">
          <p className="text-lg font-bold">{t("emptyPick", lang)}</p>
          <PrimaryCta className="mt-6" onClick={() => router.push(`/?lang=${lang}`)}>
            {t("scan", lang)}
          </PrimaryCta>
        </div>
      </AppFrame>
    );
  }

  const text = packText(payload, sel, lang);
  const headline = chosen.lines.find((l) => l.kind === "headline") || chosen.lines[0];
  const cta = chosen.lines.find((l) => l.kind === "cta");
  const image = chosen.images[0];
  const host = payload.facts.host;

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

  function download() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `khatwa-ads-${host}-${lang}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={3} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{t("resultTitle", lang)}</h1>
          <p className="mt-2 max-w-xl text-khatwa-mute">{t("resultSub", lang)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryCta onClick={() => void copyAll()}>{copied ? t("copied", lang) : t("copyAll", lang)}</PrimaryCta>
          <PrimaryCta onClick={download} className="!bg-khatwa-ink">
            {t("download", lang)}
          </PrimaryCta>
        </div>
      </div>

      <div className="mt-8">
        <AdFrames
          name={payload.facts.name.value || payload.facts.host}
          headline={headline}
          image={image}
          cta={cta}
          lang={lang}
        />
      </div>

      <div className="mt-8 grid gap-3">
        {chosen.lines.map((line) => (
          <div key={line.id} className="k-card p-4">
            <p className="text-xs font-extrabold text-khatwa-green">{t(line.kind, lang)}</p>
            <p className="mt-1 text-lg font-bold">{line.text}</p>
            <p className="mt-2 text-sm font-semibold text-khatwa-mute">{line.ctaLabel}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {chosen.images.map((img) => (
          <figure key={img.id} className="k-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="h-40 w-full object-cover" />
            <figcaption className="p-3 text-sm font-semibold">{img.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <PrimaryCta onClick={() => router.push(`/scan?lang=${lang}`)}>{t("backMarket", lang)}</PrimaryCta>
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
