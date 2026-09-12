"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { NeedScanGate } from "@/components/NeedScanGate";
import { PrimaryCta } from "@/components/PrimaryCta";
import { ensureAdPack } from "@/lib/ensure-pack";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang";
import { buildToolsBundle, TOOL_CARDS } from "@/lib/tools-engine";
import type { AdPack, ToolSlug, ToolsBundle } from "@/lib/types";

export function ToolClient({ slug }: { slug: ToolSlug }) {
  const lang = parseLang(useSearchParams().get("lang"));
  const [pack, setPack] = useState<AdPack | null>(null);
  const [bundle, setBundle] = useState<ToolsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const card = TOOL_CARDS.find((c) => c.slug === slug);

  useEffect(() => {
    const next = ensureAdPack(lang);
    setPack(next);
    if (!next) {
      setLoading(false);
      return;
    }
    const local = buildToolsBundle(next, lang);
    setBundle(local);
    setLoading(false);
    void fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack: next, lang, tool: slug }),
    })
      .then((r) => r.json())
      .then((data: ToolsBundle) => {
        if (Array.isArray(data?.scripts) && data.scripts.length >= 7) {
          setBundle({ ...local, ...data });
        }
      })
      .catch(() => {
        /* keep facts fallback */
      });
  }, [lang, slug]);

  if (!loading && !pack) return <NeedScanGate lang={lang} step={3} />;

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <AppFrame lang={lang}>
      <p className="k-kicker">{t("toolsNav", lang)}</p>
      <h1 className="mt-3 text-4xl font-black">{card?.title[lang] || slug}</h1>
      <p className="mt-2 max-w-2xl text-khatwa-mute">{card?.blurb[lang]}</p>
      {bundle ? (
        <p className="mt-3 text-sm font-bold text-khatwa-green">
          {bundle.usedGemini ? t("usedGemini", lang) : t("usedFacts", lang)}
        </p>
      ) : (
        <p className="mt-3 text-sm font-bold text-khatwa-green">{t("scanning", lang)}</p>
      )}

      {slug === "scripts" && bundle ? (
        <div className="mt-8 grid gap-4">
          <p className="text-sm font-extrabold text-khatwa-green">{t("ugcVoice", lang)}</p>
          {bundle.scripts.map((s) => (
            <article key={s.id} className="k-card p-5" data-script={s.n}>
              <p className="text-xs font-extrabold text-khatwa-green">
                {t("scriptN", lang)} {s.n} · {s.title} · {s.durationSec}s
              </p>
              <p className="mt-2 text-xl font-black">{s.hook}</p>
              <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm font-semibold">
                {s.beats.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ol>
              <p className="mt-3 font-extrabold">{s.cta}</p>
              <button
                type="button"
                className="mt-3 rounded-xl bg-khatwa-lime px-3 py-1.5 text-sm font-extrabold"
                onClick={() => void copy([s.hook, ...s.beats, s.cta].join("\n"), s.id)}
              >
                {copied === s.id ? t("copied", lang) : t("copyItem", lang)}
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {slug === "carousel" && bundle ? (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {bundle.carousel.map((s) => (
            <article key={s.n} className="k-card min-w-[240px] shrink-0 p-4">
              <p className="text-xs font-extrabold text-khatwa-green">
                {t("slide", lang)} {s.n} · {s.title}
              </p>
              <p className="mt-3 text-lg font-bold">{s.caption}</p>
              <p className="mt-2 text-sm text-khatwa-mute">{s.visual}</p>
            </article>
          ))}
        </div>
      ) : null}

      {slug === "calendar" && bundle ? (
        <div className="mt-8">
          <p className="mb-3 text-sm font-extrabold text-khatwa-green">{t("monthGrid", lang)}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.calendar.map((d) => (
              <article key={d.day} className="k-card p-4">
                <p className="text-xs font-extrabold text-khatwa-green">
                  {t("day", lang)} {d.day} · {d.channel} · {d.theme}
                </p>
                <p className="mt-2 font-bold">{d.caption}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {slug === "bio" && bundle ? (
        <div className="mt-8 grid gap-4">
          {bundle.bios.map((b) => (
            <article key={b.id} className="k-card p-5">
              <p className="text-xs font-extrabold text-khatwa-green">{b.tone}</p>
              <pre className="mt-2 whitespace-pre-wrap font-cairo text-base font-bold">{b.text}</pre>
              <button
                type="button"
                className="mt-3 rounded-xl bg-khatwa-lime px-3 py-1.5 text-sm font-extrabold"
                onClick={() => void copy(b.text, b.id)}
              >
                {copied === b.id ? t("copied", lang) : t("copyItem", lang)}
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {slug === "stories" && bundle ? (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {bundle.stories.map((s) => (
            <article key={s.day} className="k-card flex min-w-[220px] shrink-0 flex-col justify-between bg-khatwa-ink p-5 text-white">
              <p className="text-xs font-extrabold text-khatwa-lime">{s.headline}</p>
              <p className="mt-4 text-lg font-black leading-snug">{s.body}</p>
              <p className="mt-6 inline-flex w-fit rounded-xl bg-khatwa-lime px-3 py-1.5 text-xs font-extrabold text-khatwa-ink">
                {s.cta}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={`/tools?lang=${lang}`}>
          <PrimaryCta>{t("toolsTitle", lang)}</PrimaryCta>
        </Link>
        <Link href={`/publish?lang=${lang}`} className="rounded-2xl border border-khatwa-line px-6 py-3 font-extrabold">
          {t("backPublish", lang)}
        </Link>
      </div>
    </AppFrame>
  );
}
