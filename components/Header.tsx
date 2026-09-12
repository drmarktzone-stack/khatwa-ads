"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ lang }: { lang: Lang }) {
  return (
    <header className={`sticky top-0 z-20 border-b border-khatwa-line/70 bg-white/85 backdrop-blur-md ${fontClass(lang)}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={`/?lang=${lang}`} className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-khatwa-green text-xl font-black text-khatwa-lime shadow-cta">
            خ
          </span>
          <span>
            <span className="block text-lg font-black leading-none">{t("brand", lang)}</span>
            <span className="text-[11px] font-bold text-khatwa-mute">{t("studio", lang)} · Meta 1:1 / 9:16</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/tools?lang=${lang}`}
            className="rounded-full bg-khatwa-lime px-3.5 py-1.5 text-sm font-extrabold text-khatwa-ink shadow-sm"
          >
            {t("toolsNav", lang)}
          </Link>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  );
}
