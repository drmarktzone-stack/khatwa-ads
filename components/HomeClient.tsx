"use client";

import { useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { UrlForm } from "@/components/UrlForm";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { nicheLabel } from "@/lib/niches";
import { acceptScanPayload } from "@/lib/scan-accept";
import { DEMOS } from "@/lib/scan";
import { defaultSelection, saveScan, saveSelection } from "@/lib/session";
import { useRouter } from "next/navigation";

export function HomeClient() {
  const lang = parseLang(useSearchParams().get("lang"));
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
    saveScan(accepted.payload);
    saveSelection(defaultSelection(accepted.payload));
    router.push(`/scan?lang=${lang}`);
  }

  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={1} />
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
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
        <p className="mt-1 text-sm text-khatwa-mute">{t("samples", lang)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => (
            <button
              key={demo.slug}
              type="button"
              onClick={() => void runDemo(demo.url)}
              className="k-card overflow-hidden text-start transition hover:-translate-y-0.5"
              data-sample-entry="true"
              aria-label={`${t("sampleBadge", lang)}: ${demo.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={demo.images[0]} alt="" className="h-28 w-full object-cover" />
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
      <p className="mt-10 text-center text-xs text-khatwa-mute">{t("owner", lang)}</p>
    </AppFrame>
  );
}
