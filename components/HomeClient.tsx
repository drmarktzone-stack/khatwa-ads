"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { UrlForm } from "@/components/UrlForm";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { NICHE_MARKS } from "@/lib/niche-marks";
import { allNicheLabels, nicheLabel } from "@/lib/niches";
import { acceptScanPayload } from "@/lib/scan-accept";
import { DEMOS } from "@/lib/scan";
import { defaultSelection, saveLastScanUrl, saveScan, saveSelection } from "@/lib/session";
import { TOOL_CARDS } from "@/lib/tools-engine";

export function HomeClient() {
  const params = useSearchParams();
  const lang = parseLang(params.get("lang"));
  const initialUrl = params.get("url") || "";
  const router = useRouter();

  async function runDemo(url: string) {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, lang }),
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      return;
    }
    const accepted = acceptScanPayload(url, res.ok, data);
    if (!accepted.ok) return;
    saveLastScanUrl(url);
    saveScan(accepted.payload);
    saveSelection(defaultSelection(accepted.payload));
    router.push(`/scan?lang=${lang}`);
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={1} />
      <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <p className="k-kicker">{t("heroKicker", lang)}</p>
          <h1 className="k-display mt-4 text-4xl font-black leading-[1.15] sm:text-6xl">{t("tagline", lang)}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-khatwa-mute">{t("sub", lang)}</p>
          <ul className="mt-7 grid gap-2 text-sm font-semibold">
            <li className="k-chip w-fit bg-khatwa-green-soft">{t("promise1", lang)}</li>
            <li className="k-chip w-fit bg-khatwa-yellow-soft">{t("promise2", lang)}</li>
            <li className="k-chip w-fit">{t("promise3", lang)}</li>
            <li className="k-chip w-fit bg-khatwa-lime">{t("promise4", lang)}</li>
          </ul>
          <p className="mt-5 text-sm font-bold text-khatwa-green">{t("noStuck", lang)}</p>
        </div>
        <div className="pattern-dots rounded-[2.2rem] border border-khatwa-line bg-white/75 p-4 shadow-card sm:p-6">
          <p className="mb-3 text-sm font-extrabold text-khatwa-green">{t("honestScan", lang)}</p>
          <UrlForm lang={lang} initialUrl={initialUrl} />
        </div>
      </section>

      <section className="mt-14">
        <p className="k-kicker">{t("nicheTile", lang)}</p>
        <h2 className="mt-3 text-2xl font-black">{t("nichesTitle", lang)}</h2>
        <p className="mt-1 text-sm text-khatwa-mute">{t("nichesWeServe", lang)}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allNicheLabels(lang).map((n) => (
            <div
              key={n.id}
              data-niche-chip={n.id}
              className="k-card flex items-center gap-3 px-4 py-3.5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-khatwa-lime text-lg font-black text-khatwa-ink">
                {NICHE_MARKS[n.id]}
              </span>
              <span className="text-base font-extrabold">{n.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-extrabold">{t("samples", lang)}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => (
            <button
              key={demo.slug}
              type="button"
              onClick={() => void runDemo(demo.url)}
              className="k-card overflow-hidden text-start transition hover:-translate-y-1"
              data-sample-entry="true"
              aria-label={`${t("sampleBadge", lang)}: ${demo.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={demo.images[0]} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <p className="mb-2 inline-flex rounded-full bg-khatwa-yellow px-2 py-0.5 text-xs font-extrabold">
                  {t("sampleBadge", lang)}
                </p>
                <p className="font-extrabold">{demo.name}</p>
                <p className="mt-1 text-sm text-khatwa-mute">
                  {demo.place} ·{" "}
                  {demo.niche === "out_of_niche"
                    ? nicheLabel(demo.niche, lang)
                    : demo.services.join(lang === "ar" ? "، " : ", ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-[2.2rem] bg-khatwa-ink px-6 py-12 text-white">
        <p className="k-kicker">{t("toolsNav", lang)}</p>
        <h2 className="mt-4 text-4xl font-black">{t("toolsTitle", lang)}</h2>
        <p className="mt-3 max-w-2xl text-white/75">{t("toolsSub", lang)}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={`/tools/${card.slug}?lang=${lang}`}
              className="rounded-[1.6rem] bg-white p-5 text-khatwa-ink transition hover:-translate-y-0.5"
            >
              <p className="text-lg font-black">{card.title[lang]}</p>
              <p className="mt-2 text-sm leading-relaxed text-khatwa-mute">{card.blurb[lang]}</p>
              <span className="mt-5 inline-flex rounded-full bg-khatwa-lime px-4 py-1.5 text-sm font-extrabold">
                {t("startNow", lang)}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <p className="mt-10 text-center text-xs text-khatwa-mute">{t("owner", lang)}</p>
    </AppFrame>
  );
}
