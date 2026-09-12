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
import { getLayout } from "@/lib/layouts";
import { saveAdPack, saveDraftPack } from "@/lib/session";
import type { AdPack } from "@/lib/types";

export function PreviewClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [pack, setPack] = useState<AdPack | null>(null);
  const [caption, setCaption] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const next = ensureAdPack(lang);
    setPack(next);
    setCaption(next?.caption || "");
  }, [lang]);

  if (!pack) return <NeedScanGate lang={lang} step={5} />;

  const layout = getLayout(pack.layoutId);

  function persistCaption(value: string) {
    if (!pack) return;
    const next = { ...pack, caption: value };
    saveAdPack(next);
    setPack(next);
    setCaption(value);
  }

  function saveDraft() {
    if (!pack) return;
    const next = { ...pack, caption, draft: true };
    saveDraftPack(next);
    setPack(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={5} />
      <div className="grid items-start gap-10 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <AdPoster pack={pack} className="!w-[min(100%,340px)]" />
        </div>
        <div className="k-studio p-6 sm:p-8">
          <p className="k-kicker">{t("caption", lang)}</p>
          <h1 className="mt-3 text-4xl font-black">{t("previewTitle", lang)}</h1>
          <p className="mt-2 text-khatwa-mute">{t("previewSub", lang)}</p>
          <p className="mt-3 text-sm font-extrabold text-khatwa-green">
            {layout.name[lang]} · {layout.ratio === "1:1" ? t("ratioFeed", lang) : t("ratioStory", lang)}
          </p>
          <label className="mt-6 block">
            <span className="text-sm font-extrabold">{t("caption", lang)}</span>
            <textarea
              value={caption}
              onChange={(e) => persistCaption(e.target.value)}
              rows={8}
              className="mt-2 w-full rounded-2xl border border-khatwa-line bg-white p-4 text-base font-semibold leading-relaxed outline-none ring-khatwa-lime focus:ring-4"
            />
          </label>
          <p className="mt-2 text-sm text-khatwa-mute">{t("captionHint", lang)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryCta onClick={() => router.push(`/publish?lang=${lang}`)}>{t("publishNow", lang)}</PrimaryCta>
            <button
              type="button"
              className="rounded-2xl bg-khatwa-ink px-6 py-3 font-extrabold text-white"
              onClick={saveDraft}
            >
              {saved ? t("draftSaved", lang) : t("saveDraft", lang)}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
              onClick={() => router.push(`/design?lang=${lang}`)}
            >
              {t("designTitle", lang)}
            </button>
          </div>
          <p className="mt-6 text-sm font-semibold text-khatwa-mute">{t("noPasswords", lang)}</p>
        </div>
      </div>
    </AppFrame>
  );
}
