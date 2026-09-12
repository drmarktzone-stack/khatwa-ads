import assert from "node:assert/strict";
import { test } from "node:test";
import { collectsPassword, PUBLISH_DESTS, sharePayload, whatsappShareUrl } from "../lib/publish";

test("publish destinations are user-driven — no password collection", () => {
  const ids = PUBLISH_DESTS.map((d) => d.id).sort();
  assert.deepEqual(ids, ["facebook", "instagram", "tiktok", "whatsapp"]);
  for (const dest of PUBLISH_DESTS) {
    assert.ok(dest.openUrl.startsWith("https://"));
    for (const lang of ["ar", "he", "en"] as const) {
      assert.equal(collectsPassword(dest.how[lang]), false);
      assert.equal(collectsPassword(dest.hint[lang]), false);
      assert.match(dest.how[lang], /باسورد|סיסמ|password/i);
    }
  }
});

test("WhatsApp share is wa.me with text + link — never a silent post", () => {
  const url = whatsappShareUrl("هاي عيادتي في باقة الغربية\nhttps://drsamerped.ai.studio");
  assert.match(url, /^https:\/\/wa\.me\/\?text=/);
  const decoded = decodeURIComponent(url.split("text=")[1] || "");
  assert.match(decoded, /عيادتي/);
  assert.match(decoded, /https:\/\/drsamerped\.ai\.studio/);
  assert.equal(url.includes("password"), false);
});

test("native share payload stays short and includes the site URL", () => {
  const payload = sharePayload({
    title: "عيادتي",
    text: "هاي عيادتي في باقة الغربية",
    url: "https://drsamerped.ai.studio",
  });
  assert.equal(payload.title, "عيادتي");
  assert.match(payload.text, /عيادتي/);
  assert.equal(payload.url, "https://drsamerped.ai.studio");
});
