"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { acceptScanPayload } from "@/lib/scan-accept";
import { DEMOS, SAMPLE_CLINIC } from "@/lib/scan";
import { defaultSelection, saveScan, saveSelection } from "@/lib/session";
import { PrimaryCta } from "./PrimaryCta";

const SCAN_TIMEOUT_MS = 55000;

export function UrlForm({ lang, initialUrl = "" }: { lang: Lang; initialUrl?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [lastAttempt, setLastAttempt] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorMessage(reason: "http" | "rejected_demo" | "invalid" | "network"): string {
    if (reason === "rejected_demo") return t("scanRejectedDemo", lang);
    if (reason === "invalid") return t("notice_invalid_url", lang);
    return t("scanError", lang);
  }

  async function runLiveScan(nextUrl: string) {
    setLastAttempt(nextUrl);
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: nextUrl, lang }),
        signal: controller.signal,
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        setError(errorMessage("invalid"));
        return;
      }
      const accepted = acceptScanPayload(nextUrl, res.ok, data);
      if (!accepted.ok) {
        const notice =
          data && typeof data === "object" && "notice" in data && typeof (data as { notice?: string }).notice === "string"
            ? (data as { notice: string }).notice
            : errorMessage(accepted.reason);
        setError(notice || errorMessage(accepted.reason));
        return;
      }
      saveScan(accepted.payload);
      saveSelection(defaultSelection(accepted.payload));
      router.push(`/scan?lang=${lang}`);
    } catch {
      setError(errorMessage("network"));
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  async function runSample() {
    setUrl("");
    await runLiveScan(SAMPLE_CLINIC.url);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = url.trim();
    if (!next) {
      void runSample();
      return;
    }
    void runLiveScan(next);
  }

  const urlEmpty = !url.trim();

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
            disabled={busy}
          />
          <PrimaryCta type="submit" className="min-h-14 min-w-44" disabled={busy}>
            {busy ? t("scanning", lang) : t("scan", lang)}
          </PrimaryCta>
        </div>
        {urlEmpty && !busy ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-khatwa-mute">{t("pasteOrSample", lang)}</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-khatwa-line px-3 py-2 text-sm font-extrabold"
              onClick={() => void runSample()}
              data-sample-entry="true"
            >
              <span className="rounded-full bg-khatwa-yellow px-2 py-0.5 text-xs">{t("sampleBadge", lang)}</span>
              {DEMOS[0].name}
            </button>
          </div>
        ) : null}
        {error ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-khatwa-ink">
            <span>{error}</span>
            <PrimaryCta
              onClick={() => void runLiveScan(url.trim() || lastAttempt)}
              className="!py-2 !text-sm"
              disabled={busy || !(url.trim() || lastAttempt)}
            >
              {t("retry", lang)}
            </PrimaryCta>
          </div>
        ) : null}
      </form>
    </div>
  );
}
