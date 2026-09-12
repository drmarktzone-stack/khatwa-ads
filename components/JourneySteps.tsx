"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/lang";

export function JourneySteps({ lang, step }: { lang: Lang; step: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const items = [
    { n: 1 as const, href: `/?lang=${lang}`, label: t("step1", lang) },
    { n: 2 as const, href: `/scan?lang=${lang}`, label: t("step2", lang) },
    { n: 3 as const, href: `/result?lang=${lang}`, label: t("step3", lang) },
    { n: 4 as const, href: `/design?lang=${lang}`, label: t("step4", lang) },
    { n: 5 as const, href: `/preview?lang=${lang}`, label: t("step5", lang) },
    { n: 6 as const, href: `/publish?lang=${lang}`, label: t("step6", lang) },
  ];
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <li key={item.n} className="flex items-center gap-2">
          <Link
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
              item.n === step
                ? "bg-khatwa-green text-white shadow-cta"
                : item.n < step
                  ? "bg-khatwa-lime text-khatwa-ink"
                  : "border border-khatwa-line bg-white text-khatwa-mute"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                item.n === step ? "bg-white/20 text-white" : item.n < step ? "bg-khatwa-ink text-khatwa-lime" : "bg-khatwa-mint"
              }`}
            >
              {item.n}
            </span>
            {item.label.replace(/^\d+\.\s*/, "")}
          </Link>
          {i < items.length - 1 ? <span className="hidden h-px w-5 bg-khatwa-line sm:block" /> : null}
        </li>
      ))}
    </ol>
  );
}
