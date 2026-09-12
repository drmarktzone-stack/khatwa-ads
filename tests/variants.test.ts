import assert from "node:assert/strict";
import { test } from "node:test";
import { lockAdPack } from "../lib/adpack";
import { imagesForFacts } from "../lib/images";
import { AD_LAYOUTS } from "../lib/layouts";
import { buildCopyLines } from "../lib/niches";
import { DEMOS, factsFromDemo } from "../lib/scan";
import { defaultSelection } from "../lib/session";
import type { ScanPayload } from "../lib/types";
import {
  applyVariant,
  buildVariants,
  packForVariant,
  variantHasScore,
  variantsFromPack,
  variantsFromSelection,
} from "../lib/variants";

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

test("cross-match headlines × images into a bigger gallery — no fake scores", () => {
  const payload = payloadFromDemo("clinic");
  const sel = defaultSelection(payload);
  const variants = variantsFromSelection(payload, sel);
  const heads = payload.lines.filter((l) => sel.lineIds.includes(l.id) && l.kind === "headline");
  const imgs = payload.images.filter((i) => sel.imageIds.includes(i.id));
  assert.ok(heads.length >= 1 && imgs.length >= 1);
  assert.ok(variants.length >= heads.length * imgs.length || variants.length >= 4);
  assert.ok(variants.length <= 24);
  assert.equal(new Set(variants.map((v) => v.id)).size, variants.length);
  assert.ok(variants.every((v) => !variantHasScore(v)));
  assert.ok(variants.every((v) => v.headline.text && v.image.src && v.layoutId));
  const blob = JSON.stringify(variants);
  assert.doesNotMatch(blob, /"score"|ROAS\s*\d|4x/);
  assert.ok(variants.some((v) => AD_LAYOUTS.find((l) => l.id === v.layoutId)?.ratio === "1:1"));
  assert.ok(variants.some((v) => AD_LAYOUTS.find((l) => l.id === v.layoutId)?.ratio === "9:16"));
});

test("empty picks still explode a gallery from the smart default", () => {
  const payload = payloadFromDemo("restaurant");
  const variants = variantsFromSelection(payload, { lineIds: [], imageIds: [] });
  assert.ok(variants.length >= 4);
  assert.ok(variants.every((v) => payload.lines.some((l) => l.id === v.headline.id)));
  assert.ok(variants.every((v) => payload.images.some((i) => i.id === v.image.id)));
});

test("few combos explode across Meta layouts so the gallery is never a single card", () => {
  const payload = payloadFromDemo("dental");
  const oneHead = payload.lines.find((l) => l.kind === "headline");
  const oneImg = payload.images[0];
  assert.ok(oneHead && oneImg);
  const variants = buildVariants({ lines: [oneHead], images: [oneImg] });
  assert.ok(variants.length >= 4);
  assert.ok(new Set(variants.map((v) => v.layoutId)).size >= 4);
  assert.ok(variants.every((v) => v.headline.id === oneHead.id && v.image.id === oneImg.id));
});

test("applying a variant only reorders frozen facts — no invented city or phone", () => {
  const payload = payloadFromDemo("dental");
  const pack = lockAdPack(payload, defaultSelection(payload), "ar");
  const variants = variantsFromPack(pack);
  assert.ok(variants.length);
  const next = applyVariant(pack, variants[0]);
  assert.equal(next.facts.name.value, pack.facts.name.value);
  assert.equal(next.facts.place.value, "حيفا");
  assert.doesNotMatch(next.facts.place.value || "", /القدس|Jerusalem/);
  assert.equal(next.images[0].id, variants[0].image.id);
  assert.equal(next.layoutId, variants[0].layoutId);
  const poster = packForVariant(pack, variants[0]);
  assert.equal(poster.lines[0].text, variants[0].headline.text);
});

test("restaurant variants do not leak pediatric clinic hooks", () => {
  const payload = payloadFromDemo("restaurant");
  const variants = variantsFromSelection(payload, defaultSelection(payload));
  const blob = variants.map((v) => v.headline.text).join("\n");
  assert.match(blob, /مقهى|طاولة|قهوة|تعشى|قائمة|مطبخ/);
  assert.doesNotMatch(blob, /عيادة هادية|كرسي العلاج|الولد سخن/);
});
