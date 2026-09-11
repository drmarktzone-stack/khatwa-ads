"use client";

import { fontClass, isRtl, type Lang } from "@/lib/lang";
import { Header } from "./Header";

export function AppFrame({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} lang={lang} className={`${fontClass(lang)} min-h-screen`}>
      <Header lang={lang} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8">{children}</main>
    </div>
  );
}
