"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdPoster } from "@/components/AdPoster";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { NeedScanGate } from "@/components/NeedScanGate";
import { PrimaryCta } from "@/components/PrimaryCta";
import { ensureAdPack } from "@/lib/ensure-pack";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { AD_LAYOUTS, getLayout } from "@/lib/layouts";
import { saveAdPack } from "@/lib/session";
import type { AdLayoutId, AdPack } from "@/lib/types";

export function DesignClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [pack, setPack] = useState<AdPack | null>(null);

  useEffect(() => {
    setPack(ensureAdPack(lang));
  }, [lang]);

  if (!pack) return <NeedScanGate lang={lang} step={4} />;

  function pick(id: AdLayoutId) {
    if (!pack) return;
    const next = { ...pack, layoutId: id };
    saveAdPack(next);
    setPack(next);
  }

  const current = getLayout(pack.layoutId);

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={4} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{t("designTitle", lang)}</h1>
          <p className="mt-2 max-w-xl text-khatwa-mute">{t("designSub", lang)}</p>
        </div>
        <PrimaryCta onClick={() => router.push(`/preview?lang=${lang}`)}>{t("designContinue", lang)}</PrimaryCta>
      </div>

      <div className="mt-8 flex gap-5 overflow-x-auto pb-4">
        {AD_LAYOUTS.map((layout) => {
          const on = pack.layoutId === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              data-layout-pick={layout.id}
              onClick={() => pick(layout.id)}
              className={`min-w-[260px] shrink-0 rounded-[2rem] border-2 bg-white p-4 text-start shadow-card transition ${
                on ? "border-khatwa-green ring-4 ring-khatwa-lime" : "border-khatwa-line hover:-translate-y-0.5"
              }`}
            >
              <AdPoster pack={pack} layoutId={layout.id} className="mx-auto" />
              <p className="mt-4 text-lg font-black">{layout.name[lang]}</p>
              <p className="mt-1 text-sm text-khatwa-mute">{layout.blurb[lang]}</p>
              <p className="mt-2 text-xs font-extrabold text-khatwa-green">
                {layout.ratio === "1:1" ? t("ratioFeed", lang) : t("ratioStory", lang)}
                {on ? ` · ${t("selectedLayout", lang)}` : ""}
              </p>
              <span className="mt-3 inline-flex rounded-full bg-khatwa-lime px-4 py-1.5 text-sm font-extrabold text-khatwa-ink">
                {t("startNow", lang)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-bold text-khatwa-green">
        {current.name[lang]} — {current.blurb[lang]}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryCta onClick={() => router.push(`/preview?lang=${lang}`)}>{t("designContinue", lang)}</PrimaryCta>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => router.push(`/result?lang=${lang}`)}
        >
          {t("resultTitle", lang)}
        </button>
      </div>
    </AppFrame>
  );
}
