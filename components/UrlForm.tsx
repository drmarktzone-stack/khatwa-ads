"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { acceptScanPayload } from "@/lib/scan-accept";
import { SAMPLE_CLINIC } from "@/lib/scan";
import { defaultSelection, loadDraftUrl, saveDraftUrl, saveLastScanUrl, saveScan, saveSelection } from "@/lib/session";
import { PrimaryCta } from "./PrimaryCta";

const SCAN_TIMEOUT_MS = 90000;

export function UrlForm({ lang, initialUrl = "" }: { lang: Lang; initialUrl?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [waitSec, setWaitSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = initialUrl.trim();
    const draft = loadDraftUrl().trim();
    if (fromQuery) {
      setUrl(fromQuery);
      saveDraftUrl(fromQuery);
    } else if (draft) {
      setUrl(draft);
    }
    setHydrated(true);
  }, [initialUrl]);

  useEffect(() => {
    if (!hydrated) return;
    saveDraftUrl(url);
  }, [url, hydrated]);

  useEffect(() => {
    if (!busy) {
      setWaitSec(0);
      return;
    }
    const started = Date.now();
    const tick = window.setInterval(() => {
      setWaitSec(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(tick);
  }, [busy]);

  function errorMessage(reason: "http" | "rejected_demo" | "invalid" | "network"): string {
    if (reason === "rejected_demo") return t("scanRejectedDemo", lang);
    if (reason === "invalid") return t("notice_invalid_url", lang);
    return t("scanError", lang);
  }

  async function runLiveScan(scanUrl: string, mode: "typed" | "sample") {
    if (busy) return;
    const typed = url;
    if (mode === "typed") {
      saveDraftUrl(typed);
    }
    saveLastScanUrl(scanUrl);
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl, lang }),
        signal: controller.signal,
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        setError(errorMessage("invalid"));
        return;
      }
      const accepted = acceptScanPayload(scanUrl, res.ok, data);
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
      saveDraftUrl(typed);
      router.push(`/scan?lang=${lang}`);
    } catch {
      setError(errorMessage("network"));
    } finally {
      clearTimeout(timer);
      setBusy(false);
      setUrl(typed);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next = url.trim();
    if (!next) {
      setError(t("needUrl", lang));
      return;
    }
    void runLiveScan(next, "typed");
  }

  function retryTyped() {
    if (busy) return;
    const next = url.trim();
    if (!next) {
      setError(t("needUrl", lang));
      return;
    }
    void runLiveScan(next, "typed");
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
          <PrimaryCta type="submit" className="min-h-14 min-w-44">
            {busy ? t("scanning", lang) : t("scan", lang)}
          </PrimaryCta>
        </div>
        {busy ? (
          <p className="mt-3 text-sm font-semibold text-khatwa-green" data-scan-progress="true">
            {t("scanProgress", lang)}
            {waitSec ? ` (${waitSec}s)` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm text-khatwa-mute">{t("pasteOrSample", lang)}</p>
        )}
        {error ? (
          <div className="mt-3 flex flex-col gap-2 text-sm text-khatwa-ink">
            <span>{error}</span>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryCta onClick={retryTyped} className="!py-2 !text-sm">
                {t("retry", lang)}
              </PrimaryCta>
              <button
                type="button"
                className="text-sm font-extrabold text-khatwa-mute underline decoration-dashed underline-offset-4"
                disabled={busy}
                data-sample-entry="true"
                onClick={() => void runLiveScan(SAMPLE_CLINIC.url, "sample")}
              >
                {t("separateSample", lang)}
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
