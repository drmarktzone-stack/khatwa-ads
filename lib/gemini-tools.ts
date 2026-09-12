import { vertexGenerate } from "./gcp";
import { looksLikeChrome } from "./guards";
import { lineInventsFacts, lineRepeatsProperName, nicheLabel, safeDisplayName } from "./niches";
import { buildToolsBundle, sanitizeBundle } from "./tools-engine";
import type { AdPack, Lang, ToolSlug, ToolsBundle } from "./types";

function factsBlock(pack: AdPack): string {
  const facts = pack.facts;
  return JSON.stringify(
    {
      name: safeDisplayName(facts),
      niche: facts.niche,
      nicheLabel: nicheLabel(facts.niche, "ar"),
      place: facts.place.value,
      phone: facts.phone.value,
      phones: facts.phones,
      whatsapp: facts.whatsapp.value,
      hours: facts.hours.value,
      services: facts.services,
      slogan: facts.slogan.value,
      insurance: facts.insurance.value,
      doctorName: facts.doctorName.value,
      url: facts.url,
      selectedLines: pack.lines.map((l) => ({ kind: l.kind, text: l.text, cta: l.ctaLabel })),
      missing: [
        !facts.phone.value && "phone",
        !facts.place.value && "place",
        !facts.hours.value && "hours",
        facts.services.length === 0 && "services",
      ].filter(Boolean),
    },
    null,
    2,
  );
}

function promptFor(pack: AdPack, lang: Lang, tool: ToolSlug, fallback: ToolsBundle): string {
  const langName = lang === "ar" ? "Palestinian colloquial Arabic (اللهجة الفلسطينية)" : lang === "he" ? "Hebrew" : "English";
  return `Rewrite the ${tool} content for a local-business ad pack.
Language: ${langName}.
FACTS ONLY. Never invent phone, place, hours, services, prices, discounts, or ROAS.
Never invent Jerusalem / القدس / ירושלים unless FACTS.place already contains it.
Never use a marketing slogan as the business name. «طفلك بخير وقلبك مرتاح» is USP only.
Pediatric / Samer / عيادتي sites brand as عيادتي.
If a fact is missing, say it is not on the site — do not fill it.
No engine slogans. No Facebook chrome (Sponsored/Like/Comment/Share).
Return ONLY JSON matching this shape (keep counts):
${JSON.stringify(
    {
      scripts: fallback.scripts,
      carousel: fallback.carousel,
      calendar: fallback.calendar,
      bios: fallback.bios,
      stories: fallback.stories,
    },
    null,
    2,
  )}

You may improve wording but must keep the same keys and array lengths (±0).
FACTS:
${factsBlock(pack)}`;
}

function parseBundle(raw: string, pack: AdPack, fallback: ToolsBundle): ToolsBundle | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Partial<ToolsBundle>;
    const next: ToolsBundle = {
      scripts: Array.isArray(parsed.scripts) && parsed.scripts.length >= 7 ? parsed.scripts : fallback.scripts,
      carousel: Array.isArray(parsed.carousel) && parsed.carousel.length >= 8 ? parsed.carousel : fallback.carousel,
      calendar: Array.isArray(parsed.calendar) && parsed.calendar.length >= 28 ? parsed.calendar : fallback.calendar,
      bios: Array.isArray(parsed.bios) && parsed.bios.length ? parsed.bios : fallback.bios,
      stories: Array.isArray(parsed.stories) && parsed.stories.length ? parsed.stories : fallback.stories,
      usedGemini: true,
      notice: null,
    };
    const clean = sanitizeBundle(next, pack);
    if (clean.scripts.some((s) => looksLikeChrome(s.hook))) return null;
    if (clean.calendar.some((d) => lineInventsFacts(d.caption, pack.facts))) return null;
    if (clean.bios.some((b) => lineRepeatsProperName(b.text, pack.facts))) return null;
    if (clean.calendar.length < 28) return null;
    return clean;
  } catch {
    return null;
  }
}

export async function toolsWithOptionalGemini(
  pack: AdPack,
  lang: Lang,
  tool: ToolSlug,
): Promise<ToolsBundle> {
  const fallback = buildToolsBundle(pack, lang, false);
  try {
    const raw = await vertexGenerate({
      prompt: promptFor(pack, lang, tool, fallback),
      grounding: false,
      temperature: 0.3,
    });
    if (!raw) return fallback;
    const parsed = parseBundle(raw, pack, fallback);
    if (!parsed) return fallback;
    return { ...parsed, usedGemini: true };
  } catch {
    return fallback;
  }
}
