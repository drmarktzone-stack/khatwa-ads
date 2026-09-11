"use client";

import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import type { CopyLine } from "@/lib/types";

const kindKey = { headline: "headline", hook: "hook", cta: "cta" } as const;

export function CopyMarketplace({
  lines,
  selected,
  onToggle,
  lang,
}: {
  lines: CopyLine[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  lang: Lang;
}) {
  return (
    <section className={fontClass(lang)}>
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold">{t("marketplace", lang)}</h2>
        <p className="mt-1 text-khatwa-mute">{t("marketHint", lang)}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lines.map((line) => {
          const on = selected.has(line.id);
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => onToggle(line.id)}
              className={`k-card p-4 text-start transition ${
                on ? "ring-4 ring-khatwa-yellow border-khatwa-green" : "hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-khatwa-green-soft px-2 py-0.5 text-xs font-extrabold text-khatwa-green">
                  {t(kindKey[line.kind], lang)}
                </span>
                <span className="text-xs text-khatwa-mute">{line.angle}</span>
              </div>
              <p className="mt-3 text-lg font-bold leading-snug">{line.text}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="rounded-xl bg-khatwa-yellow px-3 py-1 text-sm font-extrabold text-khatwa-ink">
                  {line.ctaLabel}
                </span>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md border text-xs font-black ${
                    on ? "border-khatwa-green bg-khatwa-green text-white" : "border-khatwa-line bg-white"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
