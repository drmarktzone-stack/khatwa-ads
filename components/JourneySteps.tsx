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
    <ol className="mb-8 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.n}>
          <Link
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${
              item.n === step
                ? "bg-khatwa-green text-white"
                : item.n < step
                  ? "bg-khatwa-lime text-khatwa-ink"
                  : "bg-white text-khatwa-mute border border-khatwa-line"
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ol>
  );
}
