import assert from "node:assert/strict";
import { test } from "node:test";
import { lockAdPack } from "../lib/adpack";
import { imagesForFacts } from "../lib/images";
import { buildCopyLines, lineInventsFacts } from "../lib/niches";
import { looksLikeChrome } from "../lib/guards";
import { DEMOS, factsFromDemo, factsFromHtml } from "../lib/scan";
import { defaultSelection } from "../lib/session";
import { buildToolsBundle, isToolSlug, TOOL_CARDS, TOOL_SLUGS } from "../lib/tools-engine";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ScanPayload } from "../lib/types";

const here = dirname(fileURLToPath(import.meta.url));

function payloadFromFacts(facts: ReturnType<typeof factsFromDemo>): ScanPayload {
  const lines = buildCopyLines(facts, "ar");
  const images = imagesForFacts(facts, "ar");
  return {
    facts,
    baseLines: lines,
    lines,
    images,
    outOfNiche: facts.niche === "out_of_niche",
    tools: { gemini: false, grounding: false, translate: false, imagen: false, siteImages: false },
    notice: "demo",
    lang: "ar",
  };
}

test("tools hub has the five Mohtawak-class cards", () => {
  assert.deepEqual(TOOL_SLUGS, ["scripts", "carousel", "calendar", "bio", "stories"]);
  assert.equal(TOOL_CARDS.length, 5);
  assert.ok(TOOL_CARDS.every((c) => c.title.ar && c.blurb.ar));
  assert.equal(isToolSlug("scripts"), true);
  assert.equal(isToolSlug("hack"), false);
});

test("facts fallback tools stay honest for every demo niche", () => {
  for (const demo of DEMOS) {
    const payload = payloadFromFacts(factsFromDemo(demo));
    const pack = lockAdPack(payload, defaultSelection(payload), "ar");
    const bundle = buildToolsBundle(pack, "ar");
    assert.equal(bundle.scripts.length, 7, `${demo.slug} scripts ${bundle.scripts.length}`);
    assert.deepEqual(
      bundle.scripts.map((s) => s.n),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(bundle.carousel.length, 10, `${demo.slug} carousel`);
    assert.equal(bundle.calendar.length, 30, `${demo.slug} calendar`);
    assert.ok(bundle.bios.length >= 1, `${demo.slug} bios`);
    assert.ok(bundle.stories.length >= 3, `${demo.slug} stories`);
    assert.equal(bundle.usedGemini, false);

    const texts = [
      ...bundle.scripts.flatMap((s) => [s.hook, ...s.beats, s.cta]),
      ...bundle.carousel.map((s) => s.caption),
      ...bundle.calendar.map((d) => d.caption),
      ...bundle.bios.map((b) => b.text),
      ...bundle.stories.flatMap((s) => [s.body, s.cta]),
    ];
    for (const text of texts) {
      assert.equal(looksLikeChrome(text), false, `${demo.slug} chrome: ${text}`);
      assert.equal(lineInventsFacts(text, pack.facts), false, `${demo.slug} invented: ${text}`);
      assert.doesNotMatch(text, /القدس|ירושלים|Jerusalem/);
      assert.doesNotMatch(text, /ROAS\s*\d|4x ROAS/i);
    }
    assert.ok(texts.some((t) => t.includes(pack.facts.name.value || pack.facts.host)));
  }
});

test("restaurant tools do not leak pediatric clinic hooks", () => {
  const demo = DEMOS.find((d) => d.niche === "restaurants");
  assert.ok(demo);
  const pack = lockAdPack(payloadFromFacts(factsFromDemo(demo)), defaultSelection(payloadFromFacts(factsFromDemo(demo))), "ar");
  const bundle = buildToolsBundle(pack, "ar");
  const blob = JSON.stringify(bundle);
  assert.match(blob, /مقهى السطح|بيت لحم|قهوة|طاولة/);
  assert.doesNotMatch(blob, /عيادة هادية|كرسي العلاج|الولد سخن/);
});

test("pediatric Samer fixture tools brand as عيادتي — slogan never the name", () => {
  const html = readFileSync(join(here, "fixtures/drsamerped.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://drsamerped.ai.studio/");
  const pack = lockAdPack(payloadFromFacts(facts), defaultSelection(payloadFromFacts(facts)), "ar");
  assert.equal(pack.facts.name.value, "عيادتي");
  const bundle = buildToolsBundle(pack, "ar");
  const blob = JSON.stringify(bundle);
  assert.match(blob, /عيادتي/);
  assert.ok(bundle.bios.every((b) => !b.text.trim().startsWith("طفلك بخير وقلبك مرتاح")));
  assert.doesNotMatch(blob, /القدس|ירושלים/);
  if (facts.place.value) assert.match(blob, /باقة الغربية/);
});
