"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdPoster } from "@/components/AdPoster";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { NeedScanGate } from "@/components/NeedScanGate";
import { PrimaryCta } from "@/components/PrimaryCta";
import { overlayFacts, packText } from "@/lib/adpack";
import { ensureAdPack } from "@/lib/ensure-pack";
import { downloadAdPng } from "@/lib/export-frame";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { getLayout, pairLayout } from "@/lib/layouts";
import { canUseNativeShare, downloadTextFile, PUBLISH_DESTS, sharePayload, whatsappShareUrl } from "@/lib/publish";
import type { AdPack } from "@/lib/types";

export function PublishClient() {
  const lang = parseLang(useSearchParams().get("lang"));
  const router = useRouter();
  const [pack, setPack] = useState<AdPack | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [openHow, setOpenHow] = useState<string | null>(null);

  useEffect(() => {
    setPack(ensureAdPack(lang));
  }, [lang]);

  if (!pack) return <NeedScanGate lang={lang} step={6} />;

  const facts = overlayFacts(pack);
  const layout = getLayout(pack.layoutId);
  const pair = pairLayout(pack.layoutId);
  const text = pack.caption || packText(pack, lang);
  const shareBody = sharePayload({ title: facts.name, text, url: pack.facts.url });

  async function copyPack() {
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

  async function nativeShare() {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share(shareBody);
      setShared(true);
    } catch {
      /* user cancelled */
    }
  }

  async function downloadBoth() {
    if (!pack) return;
    const common = {
      name: facts.name,
      headline: facts.headline,
      cta: facts.cta,
      place: facts.place,
      phone: facts.phone,
      image: pack.images[0],
      lang,
    };
    await downloadAdPng({ ...common, ratio: layout.ratio, layoutId: layout.id });
    await downloadAdPng({ ...common, ratio: pair.ratio, layoutId: pair.id });
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={6} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{t("whereTitle", lang)}</h1>
          <p className="mt-2 max-w-xl text-khatwa-mute">{t("whereSub", lang)}</p>
        </div>
        <AdPoster pack={pack} className="!w-[180px]" />
      </div>

      <p className="mt-6 rounded-2xl bg-khatwa-lime/80 px-4 py-3 text-sm font-extrabold text-khatwa-ink">
        {t("noPasswords", lang)}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PUBLISH_DESTS.map((dest) => (
          <article key={dest.id} className="k-card p-5" data-dest={dest.id}>
            <h2 className="text-xl font-black">{dest.name[lang]}</h2>
            <p className="mt-2 text-sm text-khatwa-mute">{dest.hint[lang]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dest.id === "whatsapp" ? (
                <a
                  href={whatsappShareUrl(`${shareBody.text}\n${shareBody.url}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-2xl bg-khatwa-green px-4 py-2 text-sm font-extrabold text-white"
                >
                  {t("shareWhatsapp", lang)}
                </a>
              ) : (
                <a
                  href={dest.openUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-2xl bg-khatwa-green px-4 py-2 text-sm font-extrabold text-white"
                >
                  {t("openDest", lang)}
                </a>
              )}
              <button
                type="button"
                className="rounded-2xl border border-khatwa-line px-4 py-2 text-sm font-extrabold"
                onClick={() => setOpenHow(openHow === dest.id ? null : dest.id)}
              >
                {t("howTo", lang)}
              </button>
            </div>
            {openHow === dest.id ? (
              <p className="mt-3 text-sm font-semibold leading-relaxed text-khatwa-ink">{dest.how[lang]}</p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {canUseNativeShare() ? (
          <PrimaryCta onClick={() => void nativeShare()}>
            {shared ? t("copied", lang) : t("shareNative", lang)}
          </PrimaryCta>
        ) : null}
        <PrimaryCta onClick={() => void downloadBoth()}>{t("downloadBoth", lang)}</PrimaryCta>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => void copyPack()}
        >
          {copied ? t("copied", lang) : t("copyAll", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => downloadTextFile(`khatwa-ads-${pack.facts.host}-${lang}.txt`, packText(pack, lang))}
        >
          {t("download", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl bg-khatwa-lime px-6 py-3 font-extrabold text-khatwa-ink"
          onClick={() => router.push(`/tools?lang=${lang}`)}
        >
          {t("toolsNav", lang)}
        </button>
        <button
          type="button"
          className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold"
          onClick={() => router.push(`/preview?lang=${lang}`)}
        >
          {t("previewTitle", lang)}
        </button>
      </div>
    </AppFrame>
  );
}
