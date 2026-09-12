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
  lineRepeatsProperName,
  nicheLabel,
  pickHonestName,
  sanitizeGeneratedLines,
  termMatches,
} from "../lib/niches";
import { DEMOS, factsFromDemo, factsFromHtml, scanBusinessUrl } from "../lib/scan";

const here = dirname(fileURLToPath(import.meta.url));

const CLINIC_HOOKS = /عيادة هادية|موجوع؟|كرسي العلاج|موعد طبي/;

test("registry is exactly the 11 high-ad niches", () => {
  assert.deepEqual(SUPPORTED_NICHES, [
    "lawyers",
    "real_estate_agents",
    "medical_clinics",
    "pediatric_clinics",
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
    assert.equal(isBannedSloganName(facts.name.value), false);
    assert.ok(lines.every((l) => l.text.includes(facts.name.value || "") || l.text.length > 4));
    assert.ok(
      lines.every((l) => !lineRepeatsProperName(l.text, facts) && !lineRepeatsProperName(l.ctaLabel, facts)),
      `${demo.slug} duplicated brand/name or doctor`,
    );
    assert.ok(!lines.some((l) => /القدس|ירושלים|Jerusalem/.test(l.text)), `${demo.slug} invented Jerusalem`);
    if (demo.niche !== "pediatric_clinics") {
      assert.ok(!lines.some((l) => BANNED_NAME_SLOGANS.some((s) => l.text.includes(s))));
    }
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

  assert.ok(foodLines.some((l) => /طاولة|مطبخ|قائمة|قهوة|تعشى|مطعم/.test(l.text)));
  assert.ok(!foodLines.some((l) => CLINIC_HOOKS.test(l.text) || /عيادة الأسنان|كرسي الأسنان/.test(l.text)));
  assert.ok(!NICHE_REGISTRY.restaurants.copy.some((s) => CLINIC_HOOKS.test(`${s.ar} ${s.ctaAr}`)));

  const dentalCaps = imagesForFacts(factsFromDemo(dental), "ar").map((i) => i.caption);
  const foodCaps = imagesForFacts(factsFromDemo(restaurant), "ar").map((i) => i.caption);
  assert.ok(dentalCaps.some((c) => /سن|أسنان|dental|كرسي/.test(c)));
  assert.ok(foodCaps.some((c) => /قهوة|صالة|طبق|مطبخ|طاولة/.test(c)));
  assert.equal(new Set(dentalCaps).size, dentalCaps.length);
  assert.equal(new Set(foodCaps).size, foodCaps.length);
});

test("pediatric warehouse is parent-pain + WhatsApp — not general-medical dump", () => {
  const ped = DEMOS.find((d) => d.niche === "pediatric_clinics");
  assert.ok(ped);
  const facts = factsFromDemo(ped);
  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.some((l) => /ولد|أطفال|أم|حرارة|سخن/.test(l.text)));
  assert.ok(lines.some((l) => /واتساب/.test(l.text) || /واتساب/.test(l.ctaLabel)));
  assert.ok(lines.some((l) => /كلاليت/.test(l.text)));
  assert.ok(lines.some((l) => /طفلك بخير وقلبك مرتاح/.test(l.text) && /slogan|usp/.test(l.angle)));
  assert.ok(!lines.some((l) => l.text.trim() === "طفلك بخير وقلبك مرتاح"));
  assert.ok(NICHE_REGISTRY.pediatric_clinics.copy.some((s) => s.need === "slogan"));
  assert.ok(NICHE_REGISTRY.pediatric_clinics.copy.some((s) => s.need === "insurance"));
});

test("classifier maps sites onto one of the 11 — pediatric ≠ general medical", () => {
  assert.equal(detectNiche("عيادة طب الأطفال والعائلة كلاليت باقة الغربية"), "pediatric_clinics");
  assert.equal(detectNiche("طبيب عام عيادة طبية باطنية"), "medical_clinics");
  assert.equal(detectNiche("מרפאת שיניים הלבנה יישור"), "dental");
  assert.equal(detectNiche("مطعم منسف ومقهى قائمة الطعام"), "restaurants");
  assert.equal(detectNiche("مكتب محاماة استشارة قانونية"), "lawyers");
  assert.equal(detectNiche("وسيط عقارات شقة للبيع תיווך"), "real_estate_agents");
  assert.equal(detectNiche("صالون تجميل بوتوكس فيلر מספרה"), "beauty_aesthetic");
  assert.equal(detectNiche("مقاول ترميم تشطيب مطبخ שיפוץ"), "contractors");
  assert.equal(detectNiche("دروس خصوصية توجيهي رياضيات"), "tutoring");
  assert.equal(detectNiche("ستوديو يوغا بيلاتس إيمان شخصي"), "fitness");
  assert.equal(detectNiche("سباك طوارئ كهربائي تكييف נזילה"), "home_trades");
  assert.equal(classifySite({ title: "مكتبة الدرج", description: "كتب مستعملة" }), "out_of_niche");
  assert.equal(classifySite({ host: "drsamerped.ai.studio", title: "عيادة" }), "pediatric_clinics");
});

test("Samer / عيادتي brand: name is عيادتي — slogan never the name", () => {
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
  assert.equal(picked.value, "عيادتي");
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

test("drsamerped fixture → pediatric_clinics, عيادتي, slogan USP only, no القدس", () => {
  const html = readFileSync(join(here, "fixtures/drsamerped.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://drsamerped.ai.studio/");
  assert.equal(facts.niche, "pediatric_clinics");
  assert.equal(facts.name.value, "عيادتي");
  assert.equal(isBannedSloganName(facts.name.value), false);
  assert.doesNotMatch(facts.name.value || "", /طفلك بخير|قلبك مرتاح/);
  assert.match(facts.place.value || "", /باقة الغربية/);
  assert.doesNotMatch(facts.place.value || "", /القدس|ירושלים|Jerusalem/);
  assert.ok(facts.phones.some((p) => /052-?8885800|972528885800/.test(p)));
  assert.ok(!facts.phones.some((p) => isBannedPhone(p)));
  assert.equal(facts.slogan.value, "طفلك بخير وقلبك مرتاح");
  assert.match(facts.insurance.value || "", /كلاليت|כללית/);
  assert.match(facts.doctorName.value || "", /سامر/);

  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.length >= 20);
  assert.equal(assertDistinct(lines), true);
  assert.ok(lines.every((l) => !/القدس|ירושלים/.test(l.text)));
  assert.ok(lines.every((l) => l.text.trim() !== "طفلك بخير وقلبك مرتاح"));
  assert.ok(lines.some((l) => /عيادتي/.test(l.text)));
  assert.ok(lines.some((l) => /طفلك بخير وقلبك مرتاح/.test(l.text) && /slogan|usp/.test(l.angle)));
  assert.ok(lines.some((l) => /كلاليت|כללית/.test(l.text)));
  assert.ok(lines.some((l) => l.text === "هاي عيادتي في باقة الغربية"));
  assert.ok(lines.some((l) => l.text === "الولد سخن؟ عيادتي بتسمعك اليوم"));
  assert.ok(!lines.some((l) => /هاي عيادتي\s*[—–-]\s*عيادتي/.test(l.text) || /عيادتي\s+عيادتي/.test(l.text)));
  assert.ok(lines.every((l) => !lineRepeatsProperName(l.text, facts)));
});

test("diversity gate rejects duplicated brand/name — consecutive or «X — X»", () => {
  const html = readFileSync(join(here, "fixtures/drsamerped.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://drsamerped.ai.studio/");
  assert.equal(facts.name.value, "عيادتي");
  assert.match(facts.doctorName.value || "", /سامر/);

  assert.equal(lineRepeatsProperName("هاي عيادتي — عيادتي", facts), true);
  assert.equal(lineRepeatsProperName("هاي عيادتي - عيادتي", facts), true);
  assert.equal(lineRepeatsProperName("الولد سخن؟ عيادتي عيادتي بتسمعك اليوم", facts), true);
  assert.equal(lineRepeatsProperName("هاي عيادتي في باقة الغربية", facts), false);
  assert.equal(lineRepeatsProperName("الولد سخن؟ عيادتي بتسمعك اليوم", facts), false);
  assert.equal(lineRepeatsProperName("اسألي د. سامر عن الحرارة واسألي د. سامر كمان", facts), true);
  assert.equal(lineRepeatsProperName("اسألي د. سامر عن حرارة أو سعال", facts), false);

  const kept = sanitizeGeneratedLines(
    [
      { id: "bad-dash", kind: "headline", angle: "name-only", text: "هاي عيادتي — عيادتي", ctaLabel: "ادخل" },
      {
        id: "bad-consec",
        kind: "headline",
        angle: "today",
        text: "الولد سخن؟ عيادتي عيادتي بتسمعك اليوم",
        ctaLabel: "احجزي",
      },
      {
        id: "good-place",
        kind: "headline",
        angle: "name-place",
        text: "هاي عيادتي في باقة الغربية",
        ctaLabel: "شوف وين",
      },
      {
        id: "good-fever",
        kind: "headline",
        angle: "today",
        text: "الولد سخن؟ عيادتي بتسمعك اليوم",
        ctaLabel: "احجزي واتساب",
      },
    ],
    facts,
  );
  assert.deepEqual(
    kept.map((l) => l.id),
    ["good-place", "good-fever"],
  );

  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.some((l) => l.text === "هاي عيادتي في باقة الغربية"));
  assert.ok(lines.some((l) => l.text === "الولد سخن؟ عيادتي بتسمعك اليوم"));
  assert.ok(!lines.some((l) => /هاي عيادتي\s*[—–-]\s*عيادتي/.test(l.text)));
  assert.ok(!lines.some((l) => /عيادتي\s+عيادتي/.test(l.text)));
  assert.ok(lines.every((l) => !lineRepeatsProperName(l.text, facts)));
  assert.ok(lines.every((l) => !lineRepeatsProperName(l.ctaLabel, facts)));

  for (const [id, def] of Object.entries(NICHE_REGISTRY)) {
    for (const seed of def.copy) {
      for (const lang of ["ar", "he", "en"] as const) {
        const body = lang === "he" ? seed.he : lang === "en" ? seed.en : seed.ar;
        const nameSlots = body.match(/\{name\}/g)?.length ?? 0;
        const doctorSlots = body.match(/\{doctor\}/g)?.length ?? 0;
        assert.ok(nameSlots <= 1, `${id} ${seed.angle} ${lang} repeats {name}`);
        assert.ok(doctorSlots <= 1, `${id} ${seed.angle} ${lang} repeats {doctor}`);
        assert.ok(
          !( /عيادتي/.test(body) && /\{name\}/.test(body) ),
          `${id} ${seed.angle} ${lang} hardcodes عيادتي next to {name}`,
        );
      }
    }
    for (const motif of def.motifs) {
      assert.ok(
        !( /عيادتي/.test(motif.captionAr) && /\{name\}/.test(motif.captionAr) ),
        `${id} ${motif.id} caption hardcodes عيادتي next to {name}`,
      );
    }
  }
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

const CONTRACTOR_BLEED = /مقاول|مقاولات|تجديد بيت|شوف الشغل|كشف بيت/;
const FOOD_LINE = /طاولة|مطبخ|قائمة|قهوة|تعشى|مطعم|أكل|طبق|ذوق|احجز/;

test("Latin detect terms are whole words — tiling ⊂ IsSiteMultilingual is not a contractor hit", () => {
  assert.equal(termMatches("IsSiteMultilingual: false", "tiling"), false);
  assert.equal(termMatches("dmLinksMenu submenu", "menu"), false);
  assert.equal(termMatches("kitchen remodel and tiling this week", "tiling"), true);
  assert.equal(termMatches("See our Menu tonight", "menu"), true);
  assert.equal(termMatches("מסעדה בשרית בצפון", "מסעדה"), true);
  assert.equal(termMatches("מסעדת מלך הגריל", "מסעדת"), true);
});

test("food name / URL / body beats contractor chrome — grillking and lookalikes", () => {
  assert.equal(detectNiche("ملك الجريل جريل מלך הגריל"), "restaurants");
  assert.equal(detectNiche("King of the Grill BBQ restaurant"), "restaurants");
  assert.equal(detectNiche("مشاوي أبو أحمد شواء"), "restaurants");
  assert.equal(detectNiche("מסעדת הגריל באקה"), "restaurants");
  assert.equal(
    classifySite({
      name: "ملك الجريل",
      title: "מלך הגריל",
      host: "grillking.multiscreensite.com",
      blob: "window.Parameters = { IsSiteMultilingual: false }; nav Menu Home",
    }),
    "restaurants",
  );
  assert.equal(
    classifySite({
      name: "Shawarma House",
      title: "شاورما البيت",
      host: "shawarma-house.example",
      blob: "IsSiteMultilingual: false. Kitchen remodel brochure leftover.",
    }),
    "restaurants",
  );
  assert.equal(nicheLabel("restaurants", "ar"), "مطاعم ومقاهي");
  assert.notEqual(nicheLabel("restaurants", "ar"), nicheLabel("contractors", "ar"));
});

test("grillking fixture → restaurants, food-only AR copy, never contractor warehouse", () => {
  const html = readFileSync(join(here, "fixtures/grillking.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://grillking.multiscreensite.com/");
  assert.equal(facts.niche, "restaurants");
  assert.equal(nicheLabel(facts.niche, "ar"), "مطاعم ومقاهي");
  assert.notEqual(nicheLabel(facts.niche, "ar"), "مقاولون وتجديد");
  assert.match(facts.name.value || "", /מלך הגריל|ملك الجريل|Grill/i);
  assert.ok(facts.phones.some((p) => /053-?7932345|04-?6282282/.test(p)));
  assert.ok(!facts.phones.some((p) => isBannedPhone(p)));
  assert.ok(!facts.services.some((s) => /tiling|دهان|بلاط|שיפוץ/.test(s)));

  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.length >= 20);
  assert.equal(assertDistinct(lines), true);
  assert.ok(lines.some((l) => FOOD_LINE.test(l.text)));
  assert.ok(
    lines.every((l) => !CONTRACTOR_BLEED.test(l.text) && !CONTRACTOR_BLEED.test(l.ctaLabel)),
    "restaurant warehouse leaked contractor copy",
  );
  assert.ok(!NICHE_REGISTRY.restaurants.copy.some((s) => CONTRACTOR_BLEED.test(`${s.ar} ${s.ctaAr}`)));
  assert.ok(!lines.some((l) => /هاي مقاول|بيت في .+ عم يتجدّد|مقاولات /.test(l.text)));
});

test("real contractor site still classifies contractors despite Duda Menu + Multilingual chrome", () => {
  const html = readFileSync(join(here, "fixtures/contractor-duda.html"), "utf8");
  const { facts } = factsFromHtml(html, "https://beit-imara.multiscreensite.com/");
  assert.equal(facts.niche, "contractors");
  assert.equal(nicheLabel(facts.niche, "ar"), "مقاولون وتجديد");
  assert.match(facts.name.value || "", /مقاولات بيت العمارة/);
  const lines = buildCopyLines(facts, "ar");
  assert.ok(lines.length >= 20);
  assert.ok(lines.some((l) => /مقاول|تجديد|شوف الشغل/.test(l.text) || /شوف الشغل/.test(l.ctaLabel)));
  assert.equal(
    classifySite({
      name: "مقاولات بيت العمارة",
      title: "مقاول ترميم تشطيب",
      description: "שיפוץ דירה kitchen remodel",
      host: "renovate-hebron.example",
      blob: "IsSiteMultilingual: false. Menu. دهان بلاط جبس.",
    }),
    "contractors",
  );
  assert.equal(detectNiche("مقاول ترميم تشطيب مطبخ שיפוץ"), "contractors");
});

test("live grillking.multiscreensite.com scan is restaurants when the page is reachable", async () => {
  const outcome = await scanBusinessUrl("https://grillking.multiscreensite.com/", "ar");
  if (!outcome.facts) {
    assert.ok(outcome.error, "failure must be an error, not a silent sample");
    return;
  }
  assert.equal(outcome.facts.usedDemo, false);
  assert.equal(outcome.facts.niche, "restaurants");
  assert.match(outcome.facts.host, /grillking\.multiscreensite\.com/i);
  assert.match(outcome.facts.name.value || "", /מלך הגריל|ملك الجريل|Grill/i);
  if (outcome.facts.place.value) {
    assert.doesNotMatch(outcome.facts.place.value, /القدس|ירושלים|Jerusalem/);
  }
  const lines = buildCopyLines(outcome.facts, "ar");
  assert.ok(lines.every((l) => !CONTRACTOR_BLEED.test(l.text) && !CONTRACTOR_BLEED.test(l.ctaLabel)));
});

test("live drsamerped.ai.studio scan is pediatric_clinics when the page is reachable", async () => {
  const outcome = await scanBusinessUrl("https://drsamerped.ai.studio", "ar");
  if (!outcome.facts) {
    assert.ok(outcome.error, "failure must be an error, not a silent sample");
    return;
  }
  assert.equal(outcome.facts.usedDemo, false);
  assert.equal(outcome.facts.niche, "pediatric_clinics");
  assert.match(outcome.facts.host, /drsamerped\.ai\.studio/i);
  assert.equal(outcome.facts.name.value, "عيادتي");
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
