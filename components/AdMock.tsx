"use client";

import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import type { CopyLine, NicheImage } from "@/lib/types";

export function AdMock({
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
  return (
    <section className={`k-card overflow-hidden ${fontClass(lang)}`}>
      <div className="border-b border-khatwa-line bg-khatwa-yellow-soft px-4 py-3 text-sm font-extrabold">
        {t("mock", lang)}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-khatwa-green text-lg font-black text-white">
            {name.slice(0, 1)}
          </div>
          <div>
            <p className="font-extrabold leading-tight">{name}</p>
            <p className="text-xs text-khatwa-mute">{t("sponsored", lang)}</p>
          </div>
        </div>
        <p className="mt-3 text-base font-semibold leading-snug">{headline?.text}</p>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} className="mt-3 h-56 w-full rounded-2xl object-cover" />
        ) : (
          <div className="mt-3 grid h-56 place-items-center rounded-2xl bg-khatwa-green-soft text-khatwa-green">
            {t("images", lang)}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-khatwa-mint px-3 py-3">
          <span className="text-sm text-khatwa-mute">{image?.caption}</span>
          <span className="rounded-xl bg-khatwa-green px-3 py-1 text-sm font-extrabold text-white">
            {cta?.ctaLabel || headline?.ctaLabel}
          </span>
        </div>
        <div className="mt-3 flex justify-between text-sm font-semibold text-khatwa-mute">
          <span>{t("like", lang)}</span>
          <span>{t("comment", lang)}</span>
          <span>{t("share", lang)}</span>
        </div>
      </div>
    </section>
  );
}
