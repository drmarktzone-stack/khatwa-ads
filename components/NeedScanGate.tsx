"use client";

import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { JourneySteps } from "@/components/JourneySteps";
import { PrimaryCta } from "@/components/PrimaryCta";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/lang";
import { loadDraftUrl } from "@/lib/session";

export function NeedScanGate({ lang, step = 3 }: { lang: Lang; step?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const router = useRouter();
  return (
    <AppFrame lang={lang}>
      <JourneySteps lang={lang} step={step} />
      <div className="k-card mx-auto max-w-lg p-8 text-center">
        <p className="text-lg font-bold">{t("noScanStored", lang)}</p>
        <PrimaryCta
          className="mt-6"
          onClick={() => {
            const draft = loadDraftUrl().trim();
            const q = new URLSearchParams({ lang });
            if (draft) q.set("url", draft);
            router.push(`/?${q.toString()}`);
          }}
        >
          {t("backHomeKeepUrl", lang)}
        </PrimaryCta>
      </div>
    </AppFrame>
  );
}
