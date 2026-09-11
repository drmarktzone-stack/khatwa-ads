"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { DEMOS } from "@/lib/scan";
import { defaultSelection, saveScan, saveSelection } from "@/lib/session";
import type { ScanPayload } from "@/lib/types";
import { PrimaryCta } from "./PrimaryCta";

export function UrlForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan(nextUrl: string) {
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: nextUrl, lang }),
        signal: controller.signal,
      });
      const data = (await res.json()) as ScanPayload;
      saveScan(data);
      saveSelection(defaultSelection(data));
      router.push(`/scan?lang=${lang}`);
    } catch {
      setError(
        lang === "ar"
          ? "في غلطة شبكة — منعيد المحاولة أو منكمّل بعيّنة."
          : lang === "he"
            ? "תקלת רשת — נסו שוב או דוגמה."
            : "Network hiccup — retry or use a sample.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void runScan(url);
  }

  return (
    <div className={fontClass(lang)}>
      <form onSubmit={onSubmit} className="k-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="biz-url">
            URL
          </label>
          <input
            id="biz-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("urlPh", lang)}
            className="min-h-14 flex-1 rounded-2xl border border-khatwa-line bg-khatwa-mint px-4 text-lg outline-none ring-khatwa-yellow focus:ring-4"
            dir="ltr"
            autoComplete="url"
          />
          <PrimaryCta type="submit" disabled={busy} className="min-h-14 min-w-44">
            {busy ? t("scanning", lang) : t("scan", lang)}
          </PrimaryCta>
        </div>
        {error ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-khatwa-ink">
            <span>{error}</span>
            <PrimaryCta onClick={() => void runScan(DEMOS[0].url)} className="!py-2 !text-sm">
              {t("samples", lang)}
            </PrimaryCta>
          </div>
        ) : null}
      </form>

      <p className="mt-6 text-sm font-semibold text-khatwa-mute">{t("samples", lang)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DEMOS.map((demo) => (
          <button
            key={demo.slug}
            type="button"
            onClick={() => {
              setUrl(demo.url);
              void runScan(demo.url);
            }}
            className="k-chip hover:border-khatwa-green hover:bg-khatwa-green-soft"
          >
            {demo.name}
          </button>
        ))}
      </div>
    </div>
  );
}
