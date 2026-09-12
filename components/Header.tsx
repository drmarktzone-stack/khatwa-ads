"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ lang }: { lang: Lang }) {
  return (
    <header className={`sticky top-0 z-20 border-b border-khatwa-line/70 bg-white/80 backdrop-blur ${fontClass(lang)}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={`/?lang=${lang}`} className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-khatwa-green text-lg font-extrabold text-khatwa-lime">
            خ
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-none">{t("brand", lang)}</span>
            <span className="text-xs text-khatwa-mute">Meta · AR / HE / EN</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/tools?lang=${lang}`}
            className="rounded-full border border-khatwa-line bg-khatwa-lime px-3 py-1.5 text-sm font-extrabold text-khatwa-ink"
          >
            {t("toolsNav", lang)}
          </Link>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  );
}
