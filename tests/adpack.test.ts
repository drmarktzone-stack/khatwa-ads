import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaption, isSameSnapshot, lockAdPack, overlayFacts, packText } from "../lib/adpack";
import { imagesForFacts } from "../lib/images";
import { AD_LAYOUTS, getLayout, layoutsByRatio, pairLayout } from "../lib/layouts";
import { buildCopyLines } from "../lib/niches";
import { DEMOS, factsFromDemo } from "../lib/scan";
import { defaultSelection } from "../lib/session";
import type { ScanPayload } from "../lib/types";

function payloadFromDemo(slug: string): ScanPayload {
  const demo = DEMOS.find((d) => d.slug === slug);
  assert.ok(demo);
  const facts = factsFromDemo(demo);
  const lines = buildCopyLines(facts, "ar");
  const images = imagesForFacts(facts, "ar");
  return {
    facts,
    baseLines: lines,
    lines,
    images,
    outOfNiche: false,
    tools: { gemini: false, grounding: false, translate: false, imagen: false, siteImages: false },
    notice: "demo",
    lang: "ar",
  };
}

test("lock freezes selected lines+images — later marketplace edits do not mutate the snapshot", () => {
  const payload = payloadFromDemo("clinic");
  const sel = defaultSelection(payload);
  const pack = lockAdPack(payload, sel, "ar");
  assert.ok(pack.id.startsWith("pack-"));
  assert.ok(pack.lockedAt > 0);
  assert.deepEqual(
    pack.lines.map((l) => l.id),
    sel.lineIds.filter((id) => payload.lines.some((l) => l.id === id)),
  );
  assert.ok(pack.lines.length >= 1);
  assert.ok(pack.images.length >= 1);
  assert.match(pack.caption, /عيادة د\. ليلى|رام الله|059/);

  const mutated: ScanPayload = {
    ...payload,
    lines: payload.lines.map((l, i) => (i === 0 ? { ...l, text: "نص جديد مفبرك ROAS 4x" } : l)),
  };
  assert.equal(pack.lines[0].text.includes("ROAS"), false);
  assert.equal(isSameSnapshot(pack, mutated, sel), true);
  assert.notEqual(pack.lines[0].text, mutated.lines[0].text);
});

test("empty picks still lock a full pack from the smart default", () => {
  const payload = payloadFromDemo("restaurant");
  const pack = lockAdPack(payload, { lineIds: [], imageIds: [] }, "ar");
  assert.ok(pack.lines.length >= 3);
  assert.ok(pack.images.length >= 1);
  assert.equal(pack.facts.niche, "restaurants");
  assert.doesNotMatch(packText(pack, "ar"), /ROAS 4x|القدس/);
});

test("overlay uses scan facts only — no invented city or phone", () => {
  const payload = payloadFromDemo("dental");
  const pack = lockAdPack(payload, defaultSelection(payload), "ar");
  const overlay = overlayFacts(pack);
  assert.equal(overlay.name, payload.facts.name.value);
  assert.equal(overlay.place, "حيفا");
  assert.equal(overlay.phone, payload.facts.phone.value);
  assert.doesNotMatch(overlay.place, /القدس|Jerusalem/);
  assert.doesNotMatch(buildCaption(payload, defaultSelection(payload), "ar"), /ROAS/);
});

test("at least four layouts cover 1:1 feed and 9:16 story", () => {
  assert.ok(AD_LAYOUTS.length >= 4);
  assert.ok(layoutsByRatio("1:1").length >= 2);
  assert.ok(layoutsByRatio("9:16").length >= 2);
  assert.equal(getLayout("feed_bold").ratio, "1:1");
  assert.equal(getLayout("story_stack").ratio, "9:16");
  assert.equal(pairLayout("feed_bold").ratio, "9:16");
  assert.equal(pairLayout("story_banner").ratio, "1:1");
});
