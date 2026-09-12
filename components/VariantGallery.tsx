"use client";

import { AdPoster } from "@/components/AdPoster";
import { t } from "@/lib/i18n";
import { getLayout } from "@/lib/layouts";
import type { Lang } from "@/lib/lang";
import type { AdPack, AdVariant } from "@/lib/types";
import { packForVariant } from "@/lib/variants";

export function VariantGallery({
  pack,
  variants,
  lang,
  activeId,
  onPick,
}: {
  pack: AdPack;
  variants: AdVariant[];
  lang: Lang;
  activeId?: string | null;
  onPick?: (variant: AdVariant) => void;
}) {
  if (!variants.length) return null;
  return (
    <section data-variants-gallery="true">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="k-kicker">{t("noScores", lang)}</p>
          <h2 className="mt-2 text-2xl font-black">{t("variantsTitle", lang)}</h2>
          <p className="mt-1 max-w-2xl text-sm text-khatwa-mute">{t("variantsSub", lang)}</p>
        </div>
        <p className="text-sm font-extrabold text-khatwa-green">
          {variants.length} · {t("moreAds", lang)}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {variants.map((variant) => {
          const on = activeId === variant.id;
          const layout = getLayout(variant.layoutId);
          const poster = packForVariant(pack, variant);
          const inner = (
            <>
              <AdPoster pack={poster} layoutId={variant.layoutId} className="!w-full" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black leading-snug">{variant.headline.text}</p>
                  <p className="mt-1 text-xs font-bold text-khatwa-mute">
                    {layout.name[lang]} · {layout.ratio === "1:1" ? t("ratioFeed", lang) : t("ratioStory", lang)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-khatwa-lime px-2 py-0.5 text-[11px] font-extrabold text-khatwa-ink">
                  {layout.ratio}
                </span>
              </div>
            </>
          );
          if (!onPick) {
            return (
              <article key={variant.id} data-variant={variant.id} className="k-card p-3">
                {inner}
              </article>
            );
          }
          return (
            <button
              key={variant.id}
              type="button"
              data-variant={variant.id}
              onClick={() => onPick(variant)}
              className={`k-card p-3 text-start transition hover:-translate-y-0.5 ${
                on ? "ring-4 ring-khatwa-lime border-khatwa-green" : ""
              }`}
            >
              {inner}
              <span className="mt-3 inline-flex rounded-full bg-khatwa-green px-3 py-1 text-xs font-extrabold text-white">
                {on ? t("selectedLayout", lang) : t("variantPick", lang)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
