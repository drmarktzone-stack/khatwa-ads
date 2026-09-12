"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { PrimaryCta } from "@/components/PrimaryCta";
import { ensureAdPack } from "@/lib/ensure-pack";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { loadDraftPacks } from "@/lib/session";
import { TOOL_CARDS } from "@/lib/tools-engine";
import type { AdPack } from "@/lib/types";

export function ToolsHub() {
  const lang = parseLang(useSearchParams().get("lang"));
  const [pack, setPack] = useState<AdPack | null>(null);
  const [drafts, setDrafts] = useState<AdPack[]>([]);

  useEffect(() => {
    setPack(ensureAdPack(lang));
    setDrafts(loadDraftPacks());
  }, [lang]);

  return (
    <AppFrame lang={lang}>
      <p className="mb-3 inline-flex rounded-full bg-khatwa-lime px-3 py-1 text-sm font-extrabold text-khatwa-ink">
        {t("toolsNav", lang)}
      </p>
      <h1 className="text-4xl font-black">{t("toolsTitle", lang)}</h1>
      <p className="mt-3 max-w-2xl text-lg text-khatwa-mute">{t("toolsSub", lang)}</p>

      {!pack ? (
        <div className="k-card mt-8 p-6">
          <p className="font-bold">{t("toolsNeedPack", lang)}</p>
          <Link href={`/?lang=${lang}`}>
            <PrimaryCta className="mt-4">{t("backHomeKeepUrl", lang)}</PrimaryCta>
          </Link>
        </div>
      ) : (
        <p className="mt-4 text-sm font-bold text-khatwa-green">
          {pack.facts.name.value || pack.facts.host} · {pack.lines.length} · {pack.images.length}
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {TOOL_CARDS.map((card) => (
          <article key={card.slug} className="k-card p-6" data-tool-card={card.slug}>
            <h2 className="text-2xl font-black">{card.title[lang]}</h2>
            <p className="mt-2 text-sm text-khatwa-mute">{card.blurb[lang]}</p>
            <Link
              href={`/tools/${card.slug}?lang=${lang}`}
              className="mt-5 inline-flex rounded-full bg-khatwa-lime px-5 py-2 text-sm font-extrabold text-khatwa-ink"
            >
              {t("startNow", lang)}
            </Link>
          </article>
        ))}
      </div>

      {drafts.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold">{t("draftsTitle", lang)}</h2>
          <ul className="mt-3 grid gap-2">
            {drafts.map((d) => (
              <li key={d.id} className="k-card px-4 py-3 text-sm font-semibold">
                {d.facts.name.value || d.facts.host} · {new Date(d.lockedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={`/result?lang=${lang}`} className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold">
          {t("goLock", lang)}
        </Link>
        <Link href={`/publish?lang=${lang}`} className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold">
          {t("backPublish", lang)}
        </Link>
      </div>
    </AppFrame>
  );
}
