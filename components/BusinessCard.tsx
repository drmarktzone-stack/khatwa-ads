"use client";

import { t } from "@/lib/i18n";
import { fontClass, type Lang } from "@/lib/lang";
import { nicheLabel } from "@/lib/niches";
import type { EvidenceLevel, ScanPayload } from "@/lib/types";

function badge(level: EvidenceLevel, lang: Lang): string {
  if (level === "on_page") return t("fromSite", lang);
  if (level === "hostname") return t("fromHost", lang);
  if (level === "demo") return t("fromDemo", lang);
  return t("missing", lang);
}

function Row({
  label,
  value,
  level,
  lang,
}: {
  label: string;
  value: string | null;
  level: EvidenceLevel;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-khatwa-mint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-khatwa-mute">{label}</p>
        <p className="text-lg font-semibold">{value || t("missing", lang)}</p>
      </div>
      <span className="k-chip bg-khatwa-yellow-soft text-xs font-bold">{badge(level, lang)}</span>
    </div>
  );
}

export function BusinessCard({ payload, lang }: { payload: ScanPayload; lang: Lang }) {
  const facts = payload.facts;
  const phones = facts.phones.length ? facts.phones.join(" · ") : facts.phone.value;
  return (
    <section className={`k-card p-5 sm:p-6 ${fontClass(lang)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-khatwa-green">{t("cardTitle", lang)}</p>
          <h2 className="mt-1 text-2xl font-extrabold">{facts.name.value || facts.host}</h2>
          <p className="mt-1 text-sm text-khatwa-mute" dir="ltr">
            {facts.url}
          </p>
        </div>
        <span
          data-niche-badge={facts.niche}
          className="rounded-full bg-khatwa-yellow px-3 py-1 text-sm font-extrabold text-khatwa-ink"
        >
          {t("nicheBadge", lang)}: {nicheLabel(facts.niche, lang)}
        </span>
      </div>
      <p className="mt-4 rounded-2xl bg-khatwa-yellow-soft px-4 py-3 text-sm font-medium">{payload.notice}</p>
      <div className="mt-4 grid gap-3">
        <Row label={t("name", lang)} value={facts.name.value} level={facts.name.evidence} lang={lang} />
        <Row label={t("phone", lang)} value={phones} level={facts.phone.evidence} lang={lang} />
        <Row label={t("whatsapp", lang)} value={facts.whatsapp.value} level={facts.whatsapp.evidence} lang={lang} />
        <Row label={t("place", lang)} value={facts.place.value} level={facts.place.evidence} lang={lang} />
        <Row label={t("hours", lang)} value={facts.hours.value} level={facts.hours.evidence} lang={lang} />
        <Row
          label={t("services", lang)}
          value={facts.services.length ? facts.services.join(lang === "ar" ? "، " : ", ") : null}
          level={facts.servicesEvidence}
          lang={lang}
        />
      </div>
      <p className="mt-4 text-sm text-khatwa-mute">{t("evidenceNote", lang)}</p>
    </section>
  );
}
