"use client";

import { useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { UrlForm } from "@/components/UrlForm";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";

export function HomeClient() {
  const lang = parseLang(useSearchParams().get("lang"));

  return (
    <AppFrame lang={lang}>
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-khatwa-yellow px-3 py-1 text-sm font-extrabold">
            {t("brand", lang)}
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">{t("tagline", lang)}</h1>
          <p className="mt-4 max-w-xl text-lg text-khatwa-mute">{t("sub", lang)}</p>
          <ul className="mt-6 grid gap-2 text-sm font-semibold">
            <li className="k-chip w-fit bg-khatwa-green-soft">{t("promise1", lang)}</li>
            <li className="k-chip w-fit bg-khatwa-yellow-soft">{t("promise2", lang)}</li>
            <li className="k-chip w-fit">{t("promise3", lang)}</li>
          </ul>
          <p className="mt-4 text-sm font-medium text-khatwa-green">{t("noStuck", lang)}</p>
        </div>
        <div className="pattern-dots rounded-[2rem] border border-khatwa-line bg-white/70 p-4 sm:p-6">
          <UrlForm lang={lang} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-extrabold">{t("nichesTitle", lang)}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[t("nClinic", lang), t("nTutor", lang), t("nFood", lang), t("nReno", lang), t("nFit", lang)].map((label) => (
            <div key={label} className="k-card px-4 py-5 text-center font-bold">
              {label}
            </div>
          ))}
        </div>
      </section>
      <p className="mt-10 text-center text-xs text-khatwa-mute">{t("owner", lang)}</p>
    </AppFrame>
  );
}
