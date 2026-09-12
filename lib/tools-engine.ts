import { looksLikeChrome } from "./guards";
import { lineInventsFacts, lineRepeatsProperName, nicheLabel, safeDisplayName } from "./niches";
import type {
  AdPack,
  BioVariant,
  CalendarDay,
  CarouselSlide,
  Lang,
  NicheId,
  StoryBeat,
  ToolSlug,
  ToolsBundle,
  ViralScript,
} from "./types";

export const TOOL_SLUGS: ToolSlug[] = ["scripts", "carousel", "calendar", "bio", "stories"];

export const TOOL_CARDS: Array<{
  slug: ToolSlug;
  title: Record<Lang, string>;
  blurb: Record<Lang, string>;
}> = [
  {
    slug: "scripts",
    title: { ar: "نصوص فيروسية", he: "סקריפטים ויראליים", en: "Viral short scripts" },
    blurb: {
      ar: "٧ سكربتات ريلز/تيك توك باللهجة — من وقائع الباقة المقفولة، مش من الخيال.",
      he: "7 סקריפטי ריל/טיקטוק בניב — מעובדות החבילה, לא מהדמיון.",
      en: "7 dialect Reels/TikTok scripts from the locked pack — never invented.",
    },
  },
  {
    slug: "carousel",
    title: { ar: "كاروسيل", he: "קרוסלה", en: "Carousel" },
    blurb: {
      ar: "١٠ شرائح: عنوان + كابشن + فكرة بصرية من الاسم والمكان والخطوط.",
      he: "10 שקופיות: כותרת, כיתוב ורעיון ויזואלי מהעובדות.",
      en: "10 slides: title, caption, and a visual beat from the facts.",
    },
  },
  {
    slug: "calendar",
    title: { ar: "تقويم ٣٠ يوم", he: "לוח 30 יום", en: "30-day calendar" },
    blurb: {
      ar: "رزنامة محتوى من مستودع التخصص — زاوية كل يوم، من غير اختراع.",
      he: "לוח תוכן ממחסן הנישה — זווית ליום, בלי המצאות.",
      en: "A niche-warehouse calendar — one honest angle a day.",
    },
  },
  {
    slug: "bio",
    title: { ar: "محسّن البايو", he: "משפר ביו", en: "Bio optimizer" },
    blurb: {
      ar: "٣ بايوهات: قصير، واتساب، ومكان — من الكرت الصادق فقط.",
      he: "3 ביו: קצר, וואטסאפ ומקום — רק מהכרטיס הכנה.",
      en: "3 bios: short, WhatsApp-forward, place-forward — facts only.",
    },
  },
  {
    slug: "stories",
    title: { ar: "قوالب ستوري", he: "תבניות סטורי", en: "Story templates" },
    blurb: {
      ar: "سلسلة تشويق لخمسة أيام — ستوري ورا ستوري من نفس الباقة.",
      he: "סדרת טיזר ל-5 ימים — סטורי אחרי סטורי מאותה חבילה.",
      en: "A 5-day teaser series — story after story from the same pack.",
    },
  },
];

export function isToolSlug(value: string | undefined): value is ToolSlug {
  return Boolean(value && TOOL_SLUGS.includes(value as ToolSlug));
}

function nameOf(pack: AdPack): string {
  return safeDisplayName(pack.facts);
}

function honest(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function cleanLine(text: string, pack: AdPack): boolean {
  if (!text.trim()) return false;
  if (looksLikeChrome(text)) return false;
  if (lineInventsFacts(text, pack.facts)) return false;
  if (lineRepeatsProperName(text, pack.facts)) return false;
  return true;
}

function nicheVoice(niche: NicheId, lang: Lang): { pain: string; offer: string; visit: string } {
  const table: Record<NicheId, Record<Lang, { pain: string; offer: string; visit: string }>> = {
    lawyers: {
      ar: { pain: "في مشكلة قانونية؟", offer: "استشارة من المكتوب على الصفحة", visit: "احكي للمحامي" },
      he: { pain: "יש עניין משפטי?", offer: "ייעוץ לפי מה שכתוב בעמוד", visit: "דברו עם עורך הדין" },
      en: { pain: "Legal snag?", offer: "Advice from what the page actually says", visit: "Talk to the lawyer" },
    },
    real_estate_agents: {
      ar: { pain: "بتدور على بيت؟", offer: "عقار من اللي مكتوب", visit: "اسأل الوسيط" },
      he: { pain: "מחפשים בית?", offer: "נכס לפי מה שכתוב", visit: "שאלו את המתווך" },
      en: { pain: "Looking for a place?", offer: "Listings from the page", visit: "Ask the agent" },
    },
    medical_clinics: {
      ar: { pain: "موجوع ومحتار؟", offer: "عيادة حسب المكتوب", visit: "احجز من الصفحة" },
      he: { pain: "כואב ולא בטוחים?", offer: "מרפאה לפי הכתוב", visit: "קבעו לפי העמוד" },
      en: { pain: "Hurting and unsure?", offer: "Clinic facts from the page", visit: "Book from the site" },
    },
    pediatric_clinics: {
      ar: { pain: "الولد سخن؟", offer: "عيادة أطفال — الوقائع من الصفحة", visit: "ابعتي واتساب" },
      he: { pain: "לילד חום?", offer: "מרפאת ילדים — רק מהעמוד", visit: "שלחו וואטסאפ" },
      en: { pain: "Kid running a fever?", offer: "Pediatric facts from the page", visit: "Send WhatsApp" },
    },
    dental: {
      ar: { pain: "الضرس بوجّع؟", offer: "أسنان حسب الموقع", visit: "احجز كرسي" },
      he: { pain: "שן כואבת?", offer: "שיניים לפי האתר", visit: "קבעו כיסא" },
      en: { pain: "Tooth acting up?", offer: "Dental facts from the site", visit: "Book a chair" },
    },
    beauty_aesthetic: {
      ar: { pain: "بدك تجديد؟", offer: "خدمة من القائمة المكتوبة", visit: "احجزي موعد" },
      he: { pain: "רוצות רענון?", offer: "שירות מהרשימה הכתובה", visit: "קבעו תור" },
      en: { pain: "Want a refresh?", offer: "A service listed on the page", visit: "Book a slot" },
    },
    contractors: {
      ar: { pain: "البيت بدّو ترميم؟", offer: "شغل من اللي مكتوب", visit: "اسأل المقاول" },
      he: { pain: "הבית צריך שיפוץ?", offer: "עבודה לפי הכתוב", visit: "שאלו את הקבלן" },
      en: { pain: "House needs work?", offer: "A job listed on the page", visit: "Ask the contractor" },
    },
    tutoring: {
      ar: { pain: "الدرس مش ماشي؟", offer: "مادة من الموقع", visit: "احجزي حصة" },
      he: { pain: "החומר לא נכנס?", offer: "מקצוע מהאתר", visit: "קבעו שיעור" },
      en: { pain: "Stuck on the material?", offer: "A subject from the site", visit: "Book a lesson" },
    },
    restaurants: {
      ar: { pain: "جعان هالليلة؟", offer: "طبق من القائمة المكتوبة", visit: "احجز طاولة" },
      he: { pain: "רעבים הערב?", offer: "מנה מהתפריט הכתוב", visit: "קבעו שולחן" },
      en: { pain: "Hungry tonight?", offer: "A dish from the written menu", visit: "Reserve a table" },
    },
    fitness: {
      ar: { pain: "بدك تتحرك؟", offer: "تمرين من المكتوب", visit: "جرّب حصة" },
      he: { pain: "רוצים לזוז?", offer: "אימון לפי הכתוב", visit: "נסו אימון" },
      en: { pain: "Need to move?", offer: "A session from the page", visit: "Try a class" },
    },
    home_trades: {
      ar: { pain: "صار عطل بالبيت؟", offer: "خدمة طارئة من الصفحة", visit: "اتّصل هلق" },
      he: { pain: "תקלה בבית?", offer: "שירות דחוף מהעמוד", visit: "התקשרו עכשיו" },
      en: { pain: "Something broke at home?", offer: "An urgent trade from the page", visit: "Call now" },
    },
    out_of_niche: {
      ar: { pain: "بدك تعرف المحل؟", offer: "الكلام من الصفحة فقط", visit: "ادخل شوف" },
      he: { pain: "רוצים להכיר את העסק?", offer: "רק מה שכתוב בעמוד", visit: "כנסו לראות" },
      en: { pain: "Want to know the shop?", offer: "Only what the page says", visit: "Come see" },
    },
  };
  return table[niche][lang];
}

function firstLine(pack: AdPack, kind: "headline" | "hook" | "cta"): string {
  return pack.lines.find((l) => l.kind === kind)?.text || "";
}

function ctaOf(pack: AdPack): string {
  return pack.lines.find((l) => l.kind === "cta")?.ctaLabel || firstLine(pack, "cta") || nameOf(pack);
}

function L(lang: Lang, ar: string, he: string, en: string): string {
  return lang === "he" ? he : lang === "en" ? en : ar;
}

function placeLine(name: string, place: string, lang: Lang): string {
  if (place) return L(lang, `${name} في ${place}`, `${name} ב${place}`, `${name} in ${place}`);
  return L(
    lang,
    "المكان: ما انذكرش بالموقع — شوف الصفحة",
    "המקום: לא מופיע באתר — בדקו בעמוד",
    "Place: not on the site — check the page",
  );
}

function phoneLine(phone: string, lang: Lang): string {
  if (phone) return L(lang, `التلفون من الموقع: ${phone}`, `טלפון מהאתר: ${phone}`, `Phone from the site: ${phone}`);
  return L(
    lang,
    "ما منلفّقش رقم — إذا مش مكتوب، اسأل على الصفحة",
    "לא ממציאים מספר — אם אין, שאלו בעמוד",
    "No invented number — ask on the page if missing",
  );
}

function hoursLine(hours: string, lang: Lang): string {
  if (hours) return L(lang, `الدوام: ${hours}`, `שעות: ${hours}`, `Hours: ${hours}`);
  return L(
    lang,
    "الدوام: ما انذكرش — شوف الصفحة",
    "שעות: לא מופיע — בדקו בעמוד",
    "Hours: not on the page — check the site",
  );
}

function serviceLine(service: string, voiceOffer: string, lang: Lang): string {
  if (service) return L(lang, `خدمة مكتوبة: ${service}`, `שירות כתוב: ${service}`, `Listed service: ${service}`);
  return voiceOffer;
}

/** IsraModel / Shotto-class local UGC: seven talking-to-camera scripts, niche-aware, facts only. */
export function buildViralScripts(pack: AdPack, lang: Lang): ViralScript[] {
  const name = nameOf(pack);
  const place = honest(pack.facts.place.value);
  const phone = honest(pack.facts.phone.value || pack.facts.whatsapp.value);
  const hours = honest(pack.facts.hours.value);
  const service = pack.facts.services[0] || "";
  const serviceTwo = pack.facts.services[1] || service;
  const voice = nicheVoice(pack.facts.niche, lang);
  const headline = firstLine(pack, "headline") || name;
  const hook = firstLine(pack, "hook") || voice.pain;
  const cta = ctaOf(pack);
  const placeBeat = placeLine(name, place, lang);
  const phoneBeat = phoneLine(phone, lang);
  const hoursBeat = hoursLine(hours, lang);
  const serviceBeat = serviceLine(service, voice.offer, lang);
  const honestBeat = L(
    lang,
    "الكلام من مسح الصفحة — بلا أسعار مخترَعة",
    "הטקסט מסריקת העמוד — בלי מחירים מומצאים",
    "Copy from the page scan — no invented prices",
  );

  const drafts: ViralScript[] = [
    {
      id: "ugc-1-pain",
      n: 1,
      title: L(lang, "١ · وجع → محل", "1 · כאב → עסק", "1 · Pain → shop"),
      hook,
      beats: [
        L(lang, "كاميرا تيك توك: احكي الوجع بجملة وحدة", "מצלמת טיקטוק: הכאב במשפט אחד", "TikTok cam: one-sentence pain"),
        placeBeat,
        serviceBeat,
      ],
      cta,
      durationSec: 18,
    },
    {
      id: "ugc-2-proof",
      n: 2,
      title: L(lang, "٢ · اسم + دليل", "2 · שם + הוכחה", "2 · Name + proof"),
      hook: headline,
      beats: [placeBeat, phoneBeat, honestBeat],
      cta,
      durationSec: 15,
    },
    {
      id: "ugc-3-walk",
      n: 3,
      title: L(lang, "٣ · امشي معي", "3 · בואו איתי", "3 · Walk with me"),
      hook: L(lang, `امشي معي على ${name}`, `בואו איתי אל ${name}`, `Walk with me to ${name}`),
      beats: [
        placeBeat,
        hoursBeat,
        L(lang, "صوّر الواجهة أو الاستقبال من صور الموقع إن وُجدت", "צלמו חזית או קבלה מתמונות האתר אם יש", "Film the storefront or reception from site photos if they exist"),
      ],
      cta: voice.visit,
      durationSec: 20,
    },
    {
      id: "ugc-4-neighbor",
      n: 4,
      title: L(lang, "٤ · جار بيحكي", "4 · שכן מספר", "4 · Neighbor says"),
      hook: voice.pain,
      beats: [
        place
          ? L(lang, `ناس ${place} بيسألوا عن ${name}`, `אנשים ב${place} שואלים על ${name}`, `People in ${place} ask about ${name}`)
          : L(lang, `ناس الصفحة بيسألوا عن ${name}`, `אנשי העמוד שואלים על ${name}`, `People from the page ask about ${name}`),
        serviceBeat,
        honestBeat,
      ],
      cta,
      durationSec: 16,
    },
    {
      id: "ugc-5-hours",
      n: 5,
      title: L(lang, "٥ · اليوم / الدوام", "5 · היום / שעות", "5 · Today / hours"),
      hook: hoursBeat,
      beats: [placeBeat, phoneBeat, voice.visit],
      cta,
      durationSec: 12,
    },
    {
      id: "ugc-6-service",
      n: 6,
      title: L(lang, "٦ · تفصيل الخدمة", "6 · פרט השירות", "6 · Service close-up"),
      hook: serviceTwo
        ? L(lang, serviceTwo, serviceTwo, serviceTwo)
        : voice.offer,
      beats: [
        L(lang, `هاي من صفحة ${name} — مش اختراع`, `זה מעמוד ${name} — לא המצאה`, `This is from ${name}’s page — not invented`),
        placeBeat,
        phoneBeat,
      ],
      cta,
      durationSec: 14,
    },
    {
      id: "ugc-7-save",
      n: 7,
      title: L(lang, "٧ · احفظ الرقم", "7 · שמרו מספר", "7 · Save the number"),
      hook: phone
        ? L(lang, `احفظ رقم ${name} لليلة`, `שמרו את המספר של ${name} ללילה`, `Save ${name}’s number for tonight`)
        : L(lang, `افتح صفحة ${name} هسا`, `פתחו את העמוד של ${name} עכשיו`, `Open ${name}’s page now`),
      beats: [phoneBeat, placeBeat, L(lang, "إنت بتبعت — ما في إرسال صامت", "אתם שולחים — אין שליחה שקטה", "You send it — no silent post")],
      cta,
      durationSec: 12,
    },
  ];

  const kept: ViralScript[] = [];
  for (const script of drafts) {
    if (!cleanLine(script.hook, pack)) continue;
    if (!script.beats.every((b) => cleanLine(b, pack))) continue;
    if (!cleanLine(script.cta, pack)) continue;
    kept.push(script);
  }

  if (kept.length < 7) {
    for (const line of pack.lines) {
      if (kept.length >= 7) break;
      if (!cleanLine(line.text, pack) || !cleanLine(line.ctaLabel, pack)) continue;
      if (kept.some((s) => s.hook === line.text)) continue;
      const padBeats = [placeBeat, serviceBeat, voice.visit].filter((b) => cleanLine(b, pack));
      if (padBeats.length < 2) continue;
      kept.push({
        id: `ugc-pad-${line.id}`,
        n: kept.length + 1,
        title: L(lang, `${kept.length + 1} · من الباقة`, `${kept.length + 1} · מהחבילה`, `${kept.length + 1} · From the pack`),
        hook: line.text,
        beats: padBeats.slice(0, 3),
        cta: line.ctaLabel || cta,
        durationSec: 12,
      });
    }
  }

  return kept.slice(0, 7).map((s, i) => ({ ...s, n: i + 1 }));
}

export function buildCarousel(pack: AdPack, lang: Lang): CarouselSlide[] {
  const name = nameOf(pack);
  const place = honest(pack.facts.place.value);
  const phone = honest(pack.facts.phone.value);
  const hours = honest(pack.facts.hours.value);
  const services = pack.facts.services.slice(0, 3);
  const headline = firstLine(pack, "headline") || name;
  const hook = firstLine(pack, "hook");
  const cta = ctaOf(pack);
  const missing = lang === "ar" ? "ما انذكرش بالموقع" : lang === "he" ? "לא מופיע באתר" : "Not found on the site";

  const slides: Array<Omit<CarouselSlide, "n">> = [
    {
      title: lang === "ar" ? "غلاف" : lang === "he" ? "שער" : "Cover",
      caption: headline,
      visual: lang === "ar" ? `صورة ${name} + اسم كبير` : lang === "he" ? `תמונת ${name} + שם גדול` : `Photo of ${name} + big name`,
    },
    {
      title: lang === "ar" ? "وين" : lang === "he" ? "איפה" : "Where",
      caption: place ? (lang === "ar" ? `${name} في ${place}` : lang === "he" ? `${name} ב${place}` : `${name} in ${place}`) : missing,
      visual: lang === "ar" ? "خريطة أو واجهة من صور الموقع" : lang === "he" ? "מפה או חזית מהאתר" : "Map or storefront from site photos",
    },
    {
      title: lang === "ar" ? "خدمة" : lang === "he" ? "שירות" : "Offer",
      caption: services[0] || nicheVoice(pack.facts.niche, lang).offer,
      visual: lang === "ar" ? "لقطة شغل حقيقية" : lang === "he" ? "צילום עבודה אמיתי" : "A real work shot",
    },
    {
      title: lang === "ar" ? "خطّاف" : lang === "he" ? "הוק" : "Hook",
      caption: hook || headline,
      visual: lang === "ar" ? "وجه قريب / تفصيل" : lang === "he" ? "פרט קרוב" : "Close detail",
    },
    {
      title: lang === "ar" ? "دوام" : lang === "he" ? "שעות" : "Hours",
      caption: hours || missing,
      visual: lang === "ar" ? "ساعة أو لافتة دوام إن وُجدت" : lang === "he" ? "שלט שעות אם יש" : "Hours sign if it exists",
    },
    {
      title: lang === "ar" ? "تواصل" : lang === "he" ? "קשר" : "Contact",
      caption: phone || honest(pack.facts.whatsapp.value) || missing,
      visual: lang === "ar" ? "زر واتساب / اتصال" : lang === "he" ? "כפתור וואטסאפ / שיחה" : "WhatsApp / call button",
    },
    {
      title: lang === "ar" ? "تفاصيل" : lang === "he" ? "עוד" : "More",
      caption: services[1] || pack.images[0]?.caption || name,
      visual: pack.images[0]?.caption || name,
    },
    {
      title: lang === "ar" ? "ناس" : lang === "he" ? "אנשים" : "People",
      caption: services[2] || (lang === "ar" ? `ناس ${name}` : lang === "he" ? `אנשי ${name}` : `${name} people`),
      visual: lang === "ar" ? "استقبال أو فريق من الموقع" : lang === "he" ? "קבלה או צוות מהאתר" : "Reception or team from the site",
    },
    {
      title: lang === "ar" ? "صدق" : lang === "he" ? "כנות" : "Honest",
      caption:
        lang === "ar"
          ? "الوقائع من الموقع — بلا سعر مخترَع"
          : lang === "he"
            ? "העובדות מהאתר — בלי מחיר מומצא"
            : "Facts from the site — no invented price",
      visual: lang === "ar" ? "كرت الوقائع" : lang === "he" ? "כרטיס עובדות" : "Facts card",
    },
    {
      title: lang === "ar" ? "دعوة" : lang === "he" ? "CTA" : "CTA",
      caption: cta,
      visual: lang === "ar" ? "زر أخضر كبير" : lang === "he" ? "כפתור ירוק גדול" : "Big green button",
    },
  ];

  return slides
    .map((s, i) => ({ n: i + 1, ...s }))
    .filter((s) => cleanLine(s.caption, pack));
}

const CHANNELS: CalendarDay["channel"][] = ["reel", "story", "feed", "whatsapp"];

export function buildCalendar(pack: AdPack, lang: Lang): CalendarDay[] {
  const name = nameOf(pack);
  const place = honest(pack.facts.place.value);
  const phone = honest(pack.facts.phone.value || pack.facts.whatsapp.value);
  const hours = honest(pack.facts.hours.value);
  const services = pack.facts.services.length ? pack.facts.services : [nicheVoice(pack.facts.niche, lang).offer];
  const lines = pack.lines.length ? pack.lines : [{ text: name, ctaLabel: name, id: "n", kind: "headline" as const, angle: "name" }];
  const niche = nicheLabel(pack.facts.niche, lang);

  const seeds: Array<{ theme: string; caption: string }> = [];
  const push = (theme: string, caption: string) => {
    if (cleanLine(caption, pack)) seeds.push({ theme, caption });
  };

  push(lang === "ar" ? "تعارف" : lang === "he" ? "היכרות" : "Hello", lines.find((l) => l.kind === "headline")?.text || name);
  if (place) {
    push(
      lang === "ar" ? "مكان" : lang === "he" ? "מקום" : "Place",
      lang === "ar" ? `${name} في ${place}` : lang === "he" ? `${name} ב${place}` : `${name} in ${place}`,
    );
  }
  if (phone) {
    push(lang === "ar" ? "تواصل" : lang === "he" ? "קשר" : "Contact", phone);
  }
  if (hours) {
    push(lang === "ar" ? "دوام" : lang === "he" ? "שעות" : "Hours", hours);
  }
  for (const service of services) {
    push(lang === "ar" ? "خدمة" : lang === "he" ? "שירות" : "Service", service);
  }
  for (const line of lines) {
    push(line.angle || niche, line.text);
  }
  push(
    lang === "ar" ? "صدق" : lang === "he" ? "כנות" : "Honest",
    lang === "ar"
      ? `${niche} — الوقائع من الصفحة، بلا أرقام اختراع`
      : lang === "he"
        ? `${niche} — עובדות מהעמוד, בלי מספרים מומצאים`
        : `${niche} — page facts, no invented numbers`,
  );

  if (!seeds.length) {
    push(name, name);
  }

  const days: CalendarDay[] = [];
  for (let day = 1; day <= 30; day++) {
    const seed = seeds[(day - 1) % seeds.length];
    days.push({
      day,
      theme: seed.theme,
      caption: seed.caption,
      channel: CHANNELS[(day - 1) % CHANNELS.length],
    });
  }
  return days;
}

export function buildBios(pack: AdPack, lang: Lang): BioVariant[] {
  const name = nameOf(pack);
  const place = honest(pack.facts.place.value);
  const phone = honest(pack.facts.phone.value);
  const wa = honest(pack.facts.whatsapp.value) || phone;
  const niche = nicheLabel(pack.facts.niche, lang);
  const service = pack.facts.services[0] || "";
  const missing = lang === "ar" ? "ما انذكرش بالموقع" : lang === "he" ? "לא מופיע באתר" : "Not found on the site";

  const short =
    lang === "ar"
      ? [name, niche, place].filter(Boolean).join(" · ")
      : lang === "he"
        ? [name, niche, place].filter(Boolean).join(" · ")
        : [name, niche, place].filter(Boolean).join(" · ");

  const contact =
    lang === "ar"
      ? `${name}${place ? ` — ${place}` : ""}\n${wa ? `واتساب: ${wa}` : `تواصل: ${missing}`}${service ? `\n${service}` : ""}`
      : lang === "he"
        ? `${name}${place ? ` — ${place}` : ""}\n${wa ? `וואטסאפ: ${wa}` : `קשר: ${missing}`}${service ? `\n${service}` : ""}`
        : `${name}${place ? ` — ${place}` : ""}\n${wa ? `WhatsApp: ${wa}` : `Contact: ${missing}`}${service ? `\n${service}` : ""}`;

  const placeForward =
    lang === "ar"
      ? `${name}${place ? ` في ${place}` : ""}\n${niche}${phone ? `\n${phone}` : ""}\n${pack.facts.url}`
      : lang === "he"
        ? `${name}${place ? ` ב${place}` : ""}\n${niche}${phone ? `\n${phone}` : ""}\n${pack.facts.url}`
        : `${name}${place ? ` in ${place}` : ""}\n${niche}${phone ? `\n${phone}` : ""}\n${pack.facts.url}`;

  const bios: BioVariant[] = [
    { id: "short", tone: lang === "ar" ? "قصير" : lang === "he" ? "קצר" : "Short", text: short },
    { id: "whatsapp", tone: lang === "ar" ? "واتساب" : lang === "he" ? "וואטסאפ" : "WhatsApp", text: contact },
    { id: "place", tone: lang === "ar" ? "مكان" : lang === "he" ? "מקום" : "Place", text: placeForward },
  ];
  return bios.filter((b) => cleanLine(b.text, pack));
}

export function buildStories(pack: AdPack, lang: Lang): StoryBeat[] {
  const name = nameOf(pack);
  const place = honest(pack.facts.place.value);
  const phone = honest(pack.facts.phone.value || pack.facts.whatsapp.value);
  const hours = honest(pack.facts.hours.value);
  const voice = nicheVoice(pack.facts.niche, lang);
  const headline = firstLine(pack, "headline") || name;
  const hook = firstLine(pack, "hook") || voice.pain;
  const cta = ctaOf(pack);
  const missing = lang === "ar" ? "ما انذكرش بالموقع" : lang === "he" ? "לא מופיע באתר" : "Not found on the site";

  const beats: StoryBeat[] = [
    {
      day: 1,
      headline: lang === "ar" ? "يوم ١ — تعارف" : lang === "he" ? "יום 1 — היכרות" : "Day 1 — hello",
      body: headline,
      cta,
    },
    {
      day: 2,
      headline: lang === "ar" ? "يوم ٢ — الوجع" : lang === "he" ? "יום 2 — הכאב" : "Day 2 — pain",
      body: hook,
      cta: voice.visit,
    },
    {
      day: 3,
      headline: lang === "ar" ? "يوم ٣ — وين" : lang === "he" ? "יום 3 — איפה" : "Day 3 — where",
      body: place ? (lang === "ar" ? `${name} في ${place}` : lang === "he" ? `${name} ב${place}` : `${name} in ${place}`) : missing,
      cta: lang === "ar" ? "شوف الصفحة" : lang === "he" ? "בדקו את העמוד" : "See the page",
    },
    {
      day: 4,
      headline: lang === "ar" ? "يوم ٤ — دوام" : lang === "he" ? "יום 4 — שעות" : "Day 4 — hours",
      body: hours || missing,
      cta: phone || cta,
    },
    {
      day: 5,
      headline: lang === "ar" ? "يوم ٥ — كمّل" : lang === "he" ? "יום 5 — המשיכו" : "Day 5 — go",
      body:
        lang === "ar"
          ? `${name}${place ? ` — ${place}` : ""}. الوقائع من الموقع.`
          : lang === "he"
            ? `${name}${place ? ` — ${place}` : ""}. עובדות מהאתר.`
            : `${name}${place ? ` — ${place}` : ""}. Site facts.`,
      cta,
    },
  ];
  return beats.filter((b) => cleanLine(b.body, pack) && cleanLine(b.cta, pack));
}

export function buildToolsBundle(pack: AdPack, lang: Lang, usedGemini = false): ToolsBundle {
  const carousel = buildCarousel(pack, lang);
  const paddedCarousel =
    carousel.length >= 10
      ? carousel.slice(0, 10)
      : [
          ...carousel,
          ...Array.from({ length: 10 - carousel.length }, (_, i) => ({
            n: carousel.length + i + 1,
            title: nameOf(pack),
            caption: firstLine(pack, "headline") || nameOf(pack),
            visual: nameOf(pack),
          })),
        ];

  return {
    scripts: buildViralScripts(pack, lang).slice(0, 7),
    carousel: paddedCarousel.slice(0, 10).map((s, i) => ({ ...s, n: i + 1 })),
    calendar: buildCalendar(pack, lang),
    bios: buildBios(pack, lang).slice(0, 3),
    stories: buildStories(pack, lang),
    usedGemini,
    notice: null,
  };
}

export function sanitizeBundle(bundle: ToolsBundle, pack: AdPack): ToolsBundle {
  const keep = (text: string) => cleanLine(text, pack);
  return {
    ...bundle,
    scripts: bundle.scripts.filter((s) => keep(s.hook) && s.beats.every(keep)),
    carousel: bundle.carousel.filter((s) => keep(s.caption)),
    calendar: bundle.calendar.filter((s) => keep(s.caption)),
    bios: bundle.bios.filter((s) => keep(s.text)),
    stories: bundle.stories.filter((s) => keep(s.body) && keep(s.cta)),
  };
}
