import type { Lang, PublishDest } from "./types";

export interface DestDef {
  id: PublishDest;
  name: Record<Lang, string>;
  hint: Record<Lang, string>;
  /** User-driven open URL — never a login form that collects passwords in Khatwa. */
  openUrl: string;
  how: Record<Lang, string>;
}

export const PUBLISH_DESTS: DestDef[] = [
  {
    id: "facebook",
    name: { ar: "فيسبوك / Meta Ads", he: "פייסבוק / Meta Ads", en: "Facebook / Meta Ads" },
    hint: {
      ar: "حمّل الـ PNG وافتح Ads Manager — إلصق الكابشن هناك.",
      he: "הורידו PNG ופתחו את Ads Manager — הדביקו את הכיתוב שם.",
      en: "Download the PNG and open Ads Manager — paste the caption there.",
    },
    openUrl: "https://adsmanager.facebook.com/",
    how: {
      ar: "1) حمّل الإطار 1:1 و9:16. 2) انسخ الكابشن. 3) افتح Meta Ads من جهازك. 4) ارفع الصورة والصق النص. ما منطلبش باسورد فيسبوك.",
      he: "1) הורידו 1:1 ו-9:16. 2) העתיקו כיתוב. 3) פתחו Meta Ads אצלכם. 4) העלו והדביקו. אנחנו לא מבקשים סיסמה.",
      en: "1) Download 1:1 and 9:16. 2) Copy the caption. 3) Open Meta Ads on your device. 4) Upload and paste. We never ask for your Facebook password.",
    },
  },
  {
    id: "instagram",
    name: { ar: "إنستغرام", he: "אינסטגרם", en: "Instagram" },
    hint: {
      ar: "ستوري 9:16 أو بوست 1:1 — من التطبيق، مش من باسورد عندنا.",
      he: "סטורי 9:16 או פוסט 1:1 — מהאפליקציה, בלי סיסמה אצלנו.",
      en: "9:16 story or 1:1 post — from the app, never a password here.",
    },
    openUrl: "https://www.instagram.com/",
    how: {
      ar: "1) حمّل الـ PNG. 2) افتح إنستغرام. 3) منشور أو ستوري → اختار الملف من المعرض. 4) الصق الكابشن. ما منطلبش باسورد إنستغرام.",
      he: "1) הורידו PNG. 2) פתחו אינסטגרם. 3) פוסט/סטורי מהגלריה. 4) הדביקו כיתוב. לא מבקשים סיסמת אינסטגרם.",
      en: "1) Download the PNG. 2) Open Instagram. 3) Post or story from your gallery. 4) Paste the caption. We never ask for your Instagram password.",
    },
  },
  {
    id: "whatsapp",
    name: { ar: "واتساب", he: "וואטסאפ", en: "WhatsApp" },
    hint: {
      ar: "مشاركة wa.me بالنص والرابط — إنت بتختار لمين.",
      he: "שיתוף wa.me עם טקסט וקישור — אתם בוחרים למי.",
      en: "wa.me share with text + link — you pick the recipient.",
    },
    openUrl: "https://wa.me/",
    how: {
      ar: "بنفتح واتساب بنص الإعلان ورابط المحل. إنت بتبعت. ما بنبعتش لحالك وما منطلبش باسورد.",
      he: "נפתח וואטסאפ עם הטקסט והקישור. אתם שולחים. בלי שליחה שקטה ובלי סיסמה.",
      en: "We open WhatsApp with the ad text and site link. You send it. No silent send, no password.",
    },
  },
  {
    id: "tiktok",
    name: { ar: "تيك توك", he: "טיקטוק", en: "TikTok" },
    hint: {
      ar: "ارفع الستوري 9:16 أو صوّر الريل من النص الفيروسي.",
      he: "העלו סטורי 9:16 או צלמו ריל מהסקריפט.",
      en: "Upload the 9:16 frame or film a Reel from the viral script.",
    },
    openUrl: "https://www.tiktok.com/upload",
    how: {
      ar: "1) حمّل 9:16. 2) افتح تيك توك → رفع. 3) الصق الكابشن. أو صوّر ريل من شمائل النصوص. ما منطلبش باسورد تيك توك.",
      he: "1) הורידו 9:16. 2) טיקטוק → העלאה. 3) הדביקו כיתוב. או צלמו ריל מהסקריפטים. בלי סיסמה.",
      en: "1) Download 9:16. 2) TikTok → Upload. 3) Paste the caption. Or film a Reel from the scripts tool. We never ask for your TikTok password.",
    },
  },
];

export function getDest(id: PublishDest): DestDef {
  return PUBLISH_DESTS.find((d) => d.id === id) || PUBLISH_DESTS[0];
}

/** WhatsApp share-to-anyone. Never posts silently. */
export function whatsappShareUrl(text: string): string {
  const body = (text || "").trim();
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

export function sharePayload(opts: { title: string; text: string; url: string }): { title: string; text: string; url: string } {
  return {
    title: opts.title.slice(0, 120),
    text: opts.text.slice(0, 2000),
    url: opts.url,
  };
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** True only if copy asks the user to type a social password into Khatwa. Mentions of “we never ask” are fine. */
export function collectsPassword(text: string): boolean {
  return /enter (your )?password|أدخل(?:ي)? (?:ال)?باسورد|كلمة ال(?:سر|مرور) هنا|הזינו סיסמ|type your password|password\s*:|باسورد\s*:/i.test(
    text,
  );
}
