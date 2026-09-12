"use client";

import { getLayout } from "@/lib/layouts";
import { overlayFacts } from "@/lib/adpack";
import type { AdLayoutId, AdPack } from "@/lib/types";

export function AdPoster({
  pack,
  layoutId,
  className = "",
}: {
  pack: AdPack;
  layoutId?: AdLayoutId;
  className?: string;
}) {
  const layout = getLayout(layoutId || pack.layoutId);
  const facts = overlayFacts(pack);
  const image = pack.images[0];
  const tall = layout.ratio === "9:16";

  return (
    <div className={`${tall ? "w-[220px]" : "w-[280px]"} ${className}`}>
      <div
        data-layout={layout.id}
        className={`relative w-full overflow-hidden rounded-[1.8rem] border-4 border-khatwa-lime shadow-card ${
          tall ? "aspect-[9/16]" : "aspect-square"
        } bg-khatwa-green-dark`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}

        {layout.id === "feed_card" ? (
          <>
            <div className="absolute inset-x-0 top-0 h-1.5 bg-khatwa-yellow" />
            <div className="absolute inset-x-0 bottom-0 bg-white p-4 text-khatwa-ink">
              <p className="text-xs font-extrabold text-khatwa-green">{facts.name}</p>
              {facts.place || facts.phone ? (
                <p className="mt-1 text-[11px] font-semibold text-khatwa-mute">
                  {[facts.place, facts.phone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-black leading-snug">{facts.headline}</p>
              <span className="mt-3 inline-flex rounded-xl bg-khatwa-green px-3 py-1.5 text-xs font-extrabold text-white">
                {facts.cta}
              </span>
            </div>
          </>
        ) : null}

        {layout.id === "feed_split" ? (
          <div className="absolute inset-y-0 start-0 w-1/2 bg-khatwa-green-dark/90 p-3 text-white">
            <p className="text-[11px] font-extrabold text-khatwa-lime">{facts.name}</p>
            <p className="mt-2 text-sm font-black leading-snug">{facts.headline}</p>
            {facts.place || facts.phone ? (
              <p className="mt-2 text-[10px] font-semibold text-white/80">
                {[facts.place, facts.phone].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <span className="mt-3 inline-flex rounded-xl bg-khatwa-lime px-2.5 py-1 text-[11px] font-extrabold text-khatwa-ink">
              {facts.cta}
            </span>
          </div>
        ) : null}

        {layout.id === "story_banner" ? (
          <>
            <div className="absolute inset-x-0 top-0 bg-khatwa-lime px-3 py-2 text-khatwa-ink">
              <p className="text-xs font-black">{facts.name}</p>
              {facts.place ? <p className="text-[10px] font-bold">{facts.place}</p> : null}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-khatwa-ink/80 p-3 text-white">
              <p className="text-sm font-black leading-snug">{facts.headline}</p>
              {facts.phone ? <p className="mt-1 text-[11px] font-semibold">{facts.phone}</p> : null}
              <span className="mt-2 inline-flex rounded-xl bg-khatwa-green px-3 py-1.5 text-xs font-extrabold">
                {facts.cta}
              </span>
            </div>
          </>
        ) : null}

        {layout.id === "story_glass" ? (
          <div className="absolute inset-x-4 top-[28%] rounded-3xl bg-khatwa-ink/70 p-4 text-white backdrop-blur-sm">
            <p className="text-[11px] font-extrabold text-khatwa-lime">{facts.name}</p>
            <p className="mt-2 text-base font-black leading-snug">{facts.headline}</p>
            {facts.place || facts.phone ? (
              <p className="mt-2 text-[11px] font-semibold text-white/85">
                {[facts.place, facts.phone].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <span className="mt-3 inline-flex rounded-xl bg-khatwa-lime px-3 py-1.5 text-xs font-extrabold text-khatwa-ink">
              {facts.cta}
            </span>
          </div>
        ) : null}

        {layout.id === "feed_bold" || layout.id === "story_stack" ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-khatwa-ink/90 via-khatwa-ink/15 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1.5 bg-khatwa-yellow" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-khatwa-lime">{facts.name}</p>
              {facts.place || facts.phone ? (
                <p className="mt-1 text-[11px] font-semibold text-white/85">
                  {[facts.place, facts.phone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              <p className={`mt-2 font-black leading-tight ${tall ? "text-xl" : "text-base"}`}>{facts.headline}</p>
              <span className="mt-3 inline-flex rounded-2xl bg-khatwa-green px-3 py-1.5 text-xs font-extrabold">
                {facts.cta}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
