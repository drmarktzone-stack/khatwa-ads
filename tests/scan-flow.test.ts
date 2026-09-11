import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptScanPayload, liveUrlMustNotBeSample, resolveMarketplacePayload } from "../lib/scan-accept";
import {
  DEMOS,
  SAMPLE_CLINIC_ID,
  SAMPLE_CLINIC_NAME,
  factsFromDemo,
  findExplicitDemo,
  isExplicitDemoUrl,
  isSampleBusiness,
  scanBusinessUrl,
} from "../lib/scan";
import type { ScanPayload } from "../lib/types";

const LIVE_CASES = [
  {
    url: "https://www.ram.dental/",
    host: /ram\.dental/i,
    name: /רם|Ram|אלון|Alon/i,
    phone: /8345346|054-7407712|04-834/,
    place: /חיפה|Haifa|حيفا/i,
  },
  {
    url: "https://dr-halloun.com/lp/",
    host: /dr-halloun\.com/i,
    name: /הלון|Halloun|אליאס|Elias/i,
    phone: /0778043095|0545358348|04-8386758/,
    place: /חיפה|Haifa|حيفا/i,
  },
] as const;

function demoPayload(): ScanPayload {
  const facts = factsFromDemo(DEMOS[0]);
  return {
    facts,
    baseLines: [],
    lines: [],
    images: [],
    outOfNiche: false,
    tools: { gemini: false, grounding: false, translate: false, imagen: false, siteImages: false },
    notice: "demo",
    lang: "ar",
  };
}

function liveishPayload(url: string, name: string): ScanPayload {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return {
    facts: {
      url,
      host,
      businessId: `site:${host}`,
      name: { value: name, evidence: "on_page" },
      phone: { value: "059-000-0000", evidence: "on_page" },
      phones: ["059-000-0000"],
      whatsapp: { value: null, evidence: "missing" },
      place: { value: "حيفا", evidence: "on_page" },
      hours: { value: null, evidence: "missing" },
      services: [],
      servicesEvidence: "missing",
      description: { value: null, evidence: "missing" },
      niche: "clinic",
      fetched: true,
      usedDemo: false,
      sourceTitle: name,
    },
    baseLines: [],
    lines: [],
    images: [],
    outOfNiche: false,
    tools: { gemini: false, grounding: false, translate: false, imagen: false, siteImages: false },
    notice: "ok",
    lang: "ar",
  };
}

test("explicit demo match is exact URL or slug — not a substring like clinic/other", () => {
  assert.equal(isExplicitDemoUrl("https://www.ram.dental/"), false);
  assert.equal(isExplicitDemoUrl("https://dr-halloun.com/lp/"), false);
  assert.equal(isExplicitDemoUrl("https://www.best-clinic.com/other-fitness"), false);
  assert.equal(isExplicitDemoUrl("https://demo.khatwa.ads/clinic-ramallah"), true);
  assert.equal(isExplicitDemoUrl("demo:clinic"), true);
  assert.ok(findExplicitDemo("clinic"));
  assert.equal(findExplicitDemo("https://example.com/clinic"), undefined);
  assert.equal(findExplicitDemo("https://another-site.com"), undefined);
});

test("empty URL is an error — API never silently returns the sample clinic", async () => {
  const empty = await scanBusinessUrl("", "ar");
  assert.equal(empty.facts, null);
  assert.equal(empty.error, "empty_url");
  assert.equal(empty.noticeKey, "empty_url");
  assert.notEqual(empty.noticeKey, "empty_used_demo");

  const invalid = await scanBusinessUrl("not a url at all", "ar");
  assert.equal(invalid.facts, null);
  assert.equal(invalid.error, "invalid_url");
  assert.notEqual(invalid.noticeKey, "empty_used_demo");

  const slugTrap = await scanBusinessUrl(
    "https://no-such-khatwa-clinic-test.invalid/other-fitness-restaurant",
    "ar",
  );
  assert.equal(slugTrap.facts, null, "substring slugs must not load a demo business");
  assert.ok(slugTrap.error);
  assert.notEqual(slugTrap.noticeKey, "demo");
  assert.notEqual(slugTrap.noticeKey, "empty_used_demo");
});

test("acceptScanPayload: non-empty URL never yields sample business id/name", () => {
  const sample = demoPayload();
  const liveUrls = [
    "https://www.ram.dental/",
    "https://dr-halloun.com/lp/",
    "https://www.best-clinic.com/other",
  ];

  for (const url of liveUrls) {
    const rejected = acceptScanPayload(url, true, sample);
    assert.equal(rejected.ok, false);
    if (!rejected.ok) assert.equal(rejected.reason, "rejected_demo");
    assert.equal(liveUrlMustNotBeSample(url, sample), false);
    assert.equal(sample.facts.businessId, SAMPLE_CLINIC_ID);
    assert.equal(sample.facts.name.value, SAMPLE_CLINIC_NAME);
  }

  const emptyRejected = acceptScanPayload("", true, sample);
  assert.equal(emptyRejected.ok, false);
  if (!emptyRejected.ok) assert.equal(emptyRejected.reason, "rejected_demo");

  const explicitOk = acceptScanPayload(DEMOS[0].url, true, sample);
  assert.equal(explicitOk.ok, true);

  const live = liveishPayload("https://www.ram.dental/", "ד\"ר אלון רם");
  const accepted = acceptScanPayload("https://www.ram.dental/", true, live);
  assert.equal(accepted.ok, true);
  if (accepted.ok) {
    assert.equal(accepted.payload.facts.usedDemo, false);
    assert.notEqual(accepted.payload.facts.businessId, SAMPLE_CLINIC_ID);
    assert.notEqual(accepted.payload.facts.name.value, SAMPLE_CLINIC_NAME);
  }
});

test("scan flow with live clinic URLs never yields the sample clinic", async (t) => {
  for (const site of LIVE_CASES) {
    await t.test(site.url, async () => {
      const outcome = await scanBusinessUrl(site.url, "ar");
      if (!outcome.facts) {
        assert.ok(outcome.error, "failure must be an error, not a silent sample");
        assert.notEqual(outcome.noticeKey, "demo");
        assert.notEqual(outcome.noticeKey, "empty_used_demo");
        assert.notEqual(outcome.noticeKey, "invalid_used_demo");
        return;
      }
      assert.equal(outcome.facts.usedDemo, false);
      assert.notEqual(outcome.facts.businessId, SAMPLE_CLINIC_ID);
      assert.notEqual(outcome.facts.name.value, SAMPLE_CLINIC_NAME);
      assert.equal(isSampleBusiness(outcome.facts), false);
      assert.match(outcome.facts.host, site.host);
      assert.ok(outcome.facts.name.value && site.name.test(outcome.facts.name.value), `name ${outcome.facts.name.value}`);
      if (outcome.facts.phone.value) {
        assert.match(outcome.facts.phone.value, site.phone);
      }
      if (outcome.facts.place.value) {
        assert.match(outcome.facts.place.value, site.place);
      }
      const accepted = acceptScanPayload(site.url, true, {
        ...demoPayload(),
        facts: outcome.facts,
        notice: "ok",
      });
      assert.equal(accepted.ok, true);
    });
  }
});

test("marketplace never auto-injects the sample clinic", () => {
  assert.equal(resolveMarketplacePayload(null, "https://www.ram.dental/").kind, "empty");
  assert.equal(resolveMarketplacePayload(null, "").kind, "empty");
  assert.equal(resolveMarketplacePayload(demoPayload(), "").kind, "rejected_demo");
  assert.equal(resolveMarketplacePayload(demoPayload(), null).kind, "rejected_demo");
  const hijack = resolveMarketplacePayload(demoPayload(), "https://www.ram.dental/");
  assert.equal(hijack.kind, "rejected_demo");
  const explicit = resolveMarketplacePayload(demoPayload(), DEMOS[0].url);
  assert.equal(explicit.kind, "ok");
  const live = liveishPayload("https://www.ram.dental/", "ד\"ר אלון רם");
  const ok = resolveMarketplacePayload(live, "https://www.ram.dental/");
  assert.equal(ok.kind, "ok");
  if (ok.kind === "ok") {
    assert.equal(ok.payload.facts.usedDemo, false);
    assert.notEqual(ok.payload.facts.name.value, SAMPLE_CLINIC_NAME);
  }
});
