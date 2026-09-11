"use client";

import { downloadAdPng } from "@/lib/export-frame";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import type { CopyLine, NicheImage } from "@/lib/types";
import { PrimaryCta } from "./PrimaryCta";

function Frame({
  ratio,
  name,
  headline,
  cta,
  image,
  lang,
}: {
  ratio: "1:1" | "9:16";
  name: string;
  headline: string;
  cta: string;
  image?: NicheImage;
  lang: Lang;
}) {
  const tall = ratio === "9:16";
  return (
    <div className={fontClass(lang)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold">{ratio === "1:1" ? t("frame11", lang) : t("frame916", lang)}</p>
        <PrimaryCta
          className="!px-4 !py-2 !text-sm"
          onClick={() =>
            void downloadAdPng({ ratio, name, headline, cta, image })
          }
        >
          {t("downloadFrame", lang)}
        </PrimaryCta>
      </div>
      <div
        className={`relative overflow-hidden rounded-[2rem] border-4 border-khatwa-yellow shadow-card ${
          tall ? "aspect-[9/16] max-w-[280px]" : "aspect-square max-w-[420px]"
        } bg-khatwa-green-dark`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-khatwa-ink/90 via-khatwa-ink/20 to-transparent" />
        <div className="absolute start-0 top-0 h-2 w-full bg-khatwa-yellow" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-khatwa-yellow">{name}</p>
          <p className={`mt-2 font-black leading-tight ${tall ? "text-2xl" : "text-xl"}`}>{headline}</p>
          <span className="mt-4 inline-flex rounded-2xl bg-khatwa-green px-4 py-2 text-sm font-extrabold">
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdFrames({
  name,
  headline,
  image,
  cta,
  lang,
}: {
  name: string;
  headline: CopyLine | undefined;
  image: NicheImage | undefined;
  cta: CopyLine | undefined;
  lang: Lang;
}) {
  const head = headline?.text || name;
  const ctaLabel = cta?.ctaLabel || headline?.ctaLabel || t("continue", lang);
  return (
    <section className="k-card p-5">
      <p className="mb-4 text-sm font-extrabold text-khatwa-green">{t("mock", lang)}</p>
      <div className="flex flex-wrap items-start justify-center gap-8">
        <Frame ratio="1:1" name={name} headline={head} cta={ctaLabel} image={image} lang={lang} />
        <Frame ratio="9:16" name={name} headline={head} cta={ctaLabel} image={image} lang={lang} />
      </div>
    </section>
  );
}
