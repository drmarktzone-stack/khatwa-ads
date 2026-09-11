import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assertDistinct } from "../lib/guards";
import { imagesForFacts } from "../lib/images";
import {
  BANNED_NAME_SLOGANS,
  NICHE_REGISTRY,
  SUPPORTED_NICHES,
  buildCopyLines,
  classifySite,
  detectNiche,
  filterRealPhones,
  isBannedPhone,
  isBannedSloganName,
  nicheLabel,
  pickHonestName,
} from "../lib/niches";
import { DEMOS, factsFromDemo, factsFromHtml, scanBusinessUrl } from "../lib/scan";

const here = dirname(fileURLToPath(import.meta.url));

const CLINIC_HOOKS = /عيادة هادية|موجوع؟|كرسي العلاج|طفلك بخير|قلبك مرتاح|موعد طبي/;

test("registry is exactly the 10 high-ad niches", () => {
  assert.deepEqual(SUPPORTED_NICHES, [
    "lawyers",
    "real_estate_agents",
    "medical_clinics",
    "dental",
    "beauty_aesthetic",
    "contractors",
    "tutoring",
    "restaurants",
    "fitness",
    "home_trades",
  ]);
  for (const id of SUPPORTED_NICHES) {
    const def = NICHE_REGISTRY[id];
    assert.ok(def.copy.length >= 30, `${id} warehouse ${def.copy.length}`);
    assert.ok(def.motifs.length >= 8, `${id} motifs`);
    assert.ok(def.stockQueries.length >= 3, `${id} stock queries`);
    assert.ok(def.scanPriority.length >= 4, `${id} scan fields`);
    assert.ok(def.labels.ar && def.labels.he && def.labels.en);
    assert.ok(nicheLabel(id, "ar").length > 2);
  }
});

test("each niche warehouse yields ≥20 distinct Palestinian-AR lines", () => {
  for (const demo of DEMOS) {
    const facts = factsFromDemo(demo);
    const lines = buildCopyLines(facts, "ar");
    assert.ok(lines.length >= 20, `${demo.slug} lines ${lines.length}`);
    assert.equal(assertDistinct(lines), true, `${demo.slug} not distinct`);
    assert.ok(lines.every((l) => l.text.includes(facts.name.value || "") || l.text.length > 4));
    assert.ok(!lines.some((l) => /القدس|ירושלים|Jerusalem/.test(l.text)), `${demo.slug} invented Jerusalem`);
    assert.ok(!lines.some((l) => BANNED_NAME_SLOGANS.some((s) => l.text.includes(s))));
  }
});

test("dental and restaurant fixtures use their own warehouse — not clinic hooks", () => {
  const dental = DEMOS.find((d) => d.niche === "dental");
  const restaurant = DEMOS.find((d) => d.niche === "restaurants");
  assert.ok(dental && restaurant);
  const dentalLines = buildCopyLines(factsFromDemo(dental), "ar");
  const foodLines = buildCopyLines(factsFromDemo(restaurant), "ar");

  assert.ok(dentalLines.some((l) => /سن|ضرس|تبييض|تقويم|أسنان/.test(l.text)));
  assert.ok(!dentalLines.some((l) => CLINIC_HOOKS.test(l.text)), "dental leaked clinic hooks");
  assert.ok(!NICHE_REGISTRY.dental.copy.some((s) => CLINIC_HOOKS.test(`${s.ar} ${s.ctaAr}`)));

  assert.ok(foodLines.some((l) => /طاولة|مطبخ|قائمة|قهوة|تعشى|تعشى|مطعم/.test(l.text)));
  assert.ok(!foodLines.some((l) => CLINIC_HOOKS.test(l.text) || /عيادة الأسنان|كرسي الأسنان/.test(l.text)));
  assert.ok(!NICHE_REGISTRY.restaurants.copy.some((s) => CLINIC_HOOKS.test(`${s.ar} ${s.ctaAr}`)));

  const dentalCaps = imagesForFacts(factsFromDemo(dental), "ar").map((i) => i.caption);
  const foodCaps = imagesForFacts(factsFromDemo(restaurant), "ar").map((i) => i.caption);
  assert.ok(dentalCaps.some((c) => /سن|أسنان|dental|كرسي/.test(c)));
  assert.ok(foodCaps.some((c) => /قهوة|صالة|طبق|مطبخ|طاولة/.test(c)));
  assert.equal(new Set(dentalCaps).size, dentalCaps.length);
  assert.equal(new Set(foodCaps).size, foodCaps.length);
});

test("classifier maps sites onto one of the 10 — out-of-list is a soft gate", () => {
  assert.equal(detectNiche("عيادة طب الأطفال والعائلة كلاليت باقة الغربية"), "medical_clinics");
  assert.equal(detectNiche("מרפאת שיניים הלבנה יישור"), "dental");
  assert.equal(detectNiche("مطعم منسف ومقهى قائمة الطعام"), "restaurants");
  assert.equal(detectNiche("مكتب محاماة استشارة قانونية"), "lawyers");
  assert.equal(detectNiche("وسيط عقارات شقة للبيع תיווך"), "real_estate_agents");
  assert.equal(detectNiche("صالون تجميل بوتوكس فيلر מספרה"), "beauty_aesthetic");
  assert.equal(detectNiche("مقاول ترميم تشطيب مطبخ שיפוץ"), "contractors");
  assert.equal(detectNiche("دروس خصوصية توجيهي رياضيات"), "tutoring");
  assert.equal(detectNiche("ستوديو يوغا بيلاتس إيمان شخصي"), "fitness");
  assert.equal(detectNiche("سباك طوارئ كهربائي تكييف نזילה"), "home_trades");
  assert.equal(classifySite({ title: "مكتبة الدرج", description: "كتب مستعملة" }), "out_of_niche");
});

test("medical brand law: doctor name or عيادتي — never the slogan", () => {
  assert.equal(isBannedSloganName("طفلك بخير وقلبك مرتاح"), true);
  const picked = pickHonestName({
    candidates: [
      { value: "طفلك بخير وقلبك مرتاح", evidence: "on_page" },
      { value: "د. سامر محمد أبو مخ", evidence: "on_page" },
    ],
    host: "drsamerped.ai.studio",
    blob: "د. سامر محمد أبو مخ عيادة طب الأطفال طفلك بخير وقلبك مرتاح",
    medical: true,
  });
  assert.match(picked.value, /د\.?\s*سامر|عيادتي/);
  assert.equal(isBannedSloganName(picked.value), false);
});

test("emergency phones 100/101/911 are banned; real mobiles stay", () => {
  assert.equal(isBannedPhone("101"), true);
  assert.equal(isBannedPhone("100"), true);
  assert.equal(isBannedPhone("911"), true);
  assert.deepEqual(filterRealPhones(["101", "100", "911", "052-8885800", "059-700-2140"]), [
    "052-8885800",
    "059-700-2140",
  ]);
});

test("drsamerped fixture → medical_clinics, honest name/place/phone, no slogan, no القدس", () => {
  const html = readFileSync(join(here, "fixtures/drsamerped.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://drsamerped.ai.studio/");
  assert.equal(facts.niche, "medical_clinics");
  assert.match(facts.name.value || "", /د\.?\s*سامر|عيادتي/);
  assert.equal(isBannedSloganName(facts.name.value), false);
  assert.doesNotMatch(facts.name.value || "", /طفلك بخير|قلبك مرتاح/);
  assert.match(facts.place.value || "", /باقة الغربية/);
  assert.doesNotMatch(facts.place.value || "", /القدس|ירושלים|Jerusalem/);
  assert.ok(facts.phones.some((p) => /052-?8885800|972528885800/.test(p)));
  assert.ok(!facts.phones.some((p) => isBannedPhone(p)));

  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.length >= 20);
  assert.equal(assertDistinct(lines), true);
  assert.ok(lines.every((l) => !/القدس|ירושלים/.test(l.text)));
  assert.ok(lines.every((l) => !/طفلك بخير وقلبك مرتاح/.test(l.text)));
  assert.ok(lines.some((l) => /د\.?\s*سامر|عيادتي/.test(l.text)));
});

test("Jerusalem is never invented from a casual mention", () => {
  const { facts } = factsFromHtml(
    `<html lang="ar"><head><title>مقهى السطح</title></head><body>مطعم وقهوة. حقوق النشر القدس 2020</body></html>`,
    "https://example.com/cafe",
  );
  assert.equal(facts.niche, "restaurants");
  assert.notEqual(facts.place.value, "القدس");
  assert.doesNotMatch(facts.place.value || "", /القدس|ירושלים|Jerusalem/);
});

test("live drsamerped.ai.studio scan stays honest when the page is reachable", async () => {
  const outcome = await scanBusinessUrl("https://drsamerped.ai.studio", "ar");
  if (!outcome.facts) {
    assert.ok(outcome.error, "failure must be an error, not a silent sample");
    return;
  }
  assert.equal(outcome.facts.usedDemo, false);
  assert.equal(outcome.facts.niche, "medical_clinics");
  assert.match(outcome.facts.host, /drsamerped\.ai\.studio/i);
  assert.match(outcome.facts.name.value || "", /د\.?\s*سامر|عيادتي/);
  assert.doesNotMatch(outcome.facts.name.value || "", /طفلك بخير|قلبك مرتاح/);
  if (outcome.facts.place.value) {
    assert.match(outcome.facts.place.value, /باقة الغربية/);
    assert.doesNotMatch(outcome.facts.place.value, /القدس|ירושלים|Jerusalem/);
  }
  if (outcome.facts.phone.value) {
    assert.match(outcome.facts.phone.value, /052|8885800|97252/);
    assert.equal(isBannedPhone(outcome.facts.phone.value), false);
  }
});
