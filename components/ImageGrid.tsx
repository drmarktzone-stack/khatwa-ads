"use client";

import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import type { NicheImage } from "@/lib/types";

function sourceLabel(source: NicheImage["source"], lang: Lang): string {
  if (source === "site" || source === "demo") return t("fromSiteImg", lang);
  if (source === "generated") return t("genImg", lang);
  return t("stockImg", lang);
}

export function ImageGrid({
  images,
  selected,
  onToggle,
  lang,
}: {
  images: NicheImage[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  lang: Lang;
}) {
  return (
    <section className={fontClass(lang)}>
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold">{t("images", lang)}</h2>
        <p className="mt-1 text-khatwa-mute">{t("imagesHint", lang)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => {
          const on = selected.has(img.id);
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => onToggle(img.id)}
              className={`k-card overflow-hidden text-start ${on ? "ring-4 ring-khatwa-yellow" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="h-44 w-full object-cover" />
              <div className="flex items-start justify-between gap-2 p-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-khatwa-green">
                    {sourceLabel(img.source, lang)}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug">{img.caption}</p>
                </div>
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-black ${
                    on ? "bg-khatwa-green text-white" : "bg-khatwa-green-soft text-khatwa-green"
                  }`}
                >
                  {on ? "✓" : "+"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
