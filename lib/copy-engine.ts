import type { BusinessFacts, CopyKind, CopyLine, Lang, Niche } from "./types";

function nameOf(facts: BusinessFacts): string {
  return facts.name.value || facts.host;
}

function placeOf(facts: BusinessFacts, lang: Lang): string | null {
  return facts.place.value;
}

function serviceOf(facts: BusinessFacts, i: number): string | null {
  if (!facts.services.length) return null;
  return facts.services[i % facts.services.length];
}

function phoneOf(facts: BusinessFacts): string | null {
  return facts.phone.value;
}

interface Seed {
  kind: CopyKind;
  angle: string;
  ar: string;
  he: string;
  en: string;
  ctaAr: string;
  ctaHe: string;
  ctaEn: string;
}

function fill(template: string, facts: BusinessFacts, lang: Lang, index: number): string {
  const name = nameOf(facts);
  const place = placeOf(facts, lang);
  const service = serviceOf(facts, index);
  const phone = phoneOf(facts);
  const placeBit =
    place ||
    (lang === "ar" ? "من الموقع" : lang === "he" ? "מהאתר" : "from the site");
  const serviceBit =
    service ||
    (lang === "ar" ? "اللي مكتوب عندهم" : lang === "he" ? "מה שכתוב אצלם" : "what the page lists");
  const phoneBit =
    phone ||
    (lang === "ar" ? "من صفحة التواصل" : lang === "he" ? "מדף יצירת הקשר" : "via the contact page");

  return template
    .replaceAll("{name}", name)
    .replaceAll("{place}", placeBit)
    .replaceAll("{service}", serviceBit)
    .replaceAll("{phone}", phoneBit);
}

function seedsFor(niche: Niche): Seed[] {
  const commonOpeners: Seed[] = [
    {
      kind: "headline",
      angle: "name-trust",
      ar: "{name}: كلام الموقع، مش شعارات فاضي",
      he: "{name}: מה שכתוב באתר, בלי סיסמאות",
      en: "{name}: what’s on the site, not empty slogans",
      ctaAr: "افتح صفحة المحل",
      ctaHe: "פתחו את האתר",
      ctaEn: "Open the site",
    },
    {
      kind: "headline",
      angle: "place-near",
      ar: "قريب من {place} — {name}",
      he: "קרוב ל{place} — {name}",
      en: "Near {place} — {name}",
      ctaAr: "شوف وين المحل",
      ctaHe: "בדקו איפה זה",
      ctaEn: "See the location",
    },
    {
      kind: "headline",
      angle: "service-led",
      ar: "{service} عند {name}",
      he: "{service} אצל {name}",
      en: "{service} at {name}",
      ctaAr: "اقرأ الخدمات",
      ctaHe: "קראו את השירותים",
      ctaEn: "Read the services",
    },
    {
      kind: "headline",
      angle: "honest",
      ar: "ما منخترعلك سعر ولا رقم — بس {name}",
      he: "בלי מחיר מומצא — רק {name}",
      en: "No invented price — just {name}",
      ctaAr: "اقرأ اللي مكتوب",
      ctaHe: "קראו מה שכתוב",
      ctaEn: "Read what’s written",
    },
    {
      kind: "headline",
      angle: "today",
      ar: "بدك تخلّص موضوعك اليوم مع {name}؟",
      he: "רוצים לסגור את זה היום עם {name}?",
      en: "Want this settled today with {name}?",
      ctaAr: "يلا من الموقع",
      ctaHe: "יאללה מהאתר",
      ctaEn: "Go from the site",
    },
    {
      kind: "headline",
      angle: "question",
      ar: "وينك عن {name}؟",
      he: "איפה אתם מ{name}?",
      en: "Where have you been, {name} is here",
      ctaAr: "ادخل وشوف",
      ctaHe: "כנסו לראות",
      ctaEn: "Come take a look",
    },
    {
      kind: "headline",
      angle: "community",
      ar: "محل ناس {place}: {name}",
      he: "עסק של {place}: {name}",
      en: "A {place} neighborhood name: {name}",
      ctaAr: "احكي مع ناس المحل",
      ctaHe: "דברו עם המקום",
      ctaEn: "Talk to the business",
    },
    {
      kind: "headline",
      angle: "first-visit",
      ar: "أول زيارة لـ {name} — بلا لف",
      he: "ביקור ראשון ב{name} — בלי סיבובים",
      en: "First visit to {name} — no runaround",
      ctaAr: "احجز من الصفحة",
      ctaHe: "קבעו מהעמוד",
      ctaEn: "Book from the page",
    },
    {
      kind: "headline",
      angle: "clear",
      ar: "{name} بوضحلك {service} زي ما هو",
      he: "{name} מסביר/ה את {service} כמו שזה",
      en: "{name} spells out {service} as written",
      ctaAr: "كمّل قراءة",
      ctaHe: "המשיכו לקרוא",
      ctaEn: "Keep reading",
    },
    {
      kind: "headline",
      angle: "no-roas",
      ar: "إعلان {name} — بدون حكايا ROAS",
      he: "מודעת {name} — בלי סיפורי ROAS",
      en: "{name} ad — no ROAS fairy tales",
      ctaAr: "خد النص زي ما هو",
      ctaHe: "קחו את הטקסט כמו שהוא",
      ctaEn: "Take the line as-is",
    },
    {
      kind: "hook",
      angle: "pain-q",
      ar: "زهقت تدور؟ {name} مكتوب قدامك.",
      he: "נמאס לחפש? {name} כתוב מולכם.",
      en: "Tired of hunting? {name} is on the page.",
      ctaAr: "اسأل من الموقع",
      ctaHe: "שאלו מהאתר",
      ctaEn: "Ask from the site",
    },
    {
      kind: "hook",
      angle: "neighbor",
      ar: "جارك في {place} بمرّق على {name}.",
      he: "השכן ב{place} כבר מכיר את {name}.",
      en: "Your neighbor in {place} already knows {name}.",
      ctaAr: "اسأل عن المواعيد",
      ctaHe: "שאלו על תורים",
      ctaEn: "Ask about times",
    },
    {
      kind: "hook",
      angle: "whatsapp-easy",
      ar: "ما في فورم تيه: احكي لـ {name} على {phone}.",
      he: "בלי טפסים: דברו עם {name} ב{phone}.",
      en: "No scavenger form: reach {name} at {phone}.",
      ctaAr: "ابعت رسالة هسا",
      ctaHe: "שלחו הודעה עכשיו",
      ctaEn: "Send a message now",
    },
    {
      kind: "hook",
      angle: "who-for",
      ar: "إذا بتدور {service} — هاي صفحة {name}.",
      he: "אם אתם מחפשים {service} — זה העמוד של {name}.",
      en: "If you need {service}, this is {name}’s page.",
      ctaAr: "اختار الخدمة",
      ctaHe: "בחרו שירות",
      ctaEn: "Pick a service",
    },
    {
      kind: "hook",
      angle: "this-week",
      ar: "هالأسبوع فيك تمرّ على {name} في {place}.",
      he: "השבוע אפשר לעבור ב{name} ב{place}.",
      en: "This week you can stop by {name} in {place}.",
      ctaAr: "خطّط الزيارة",
      ctaHe: "תכננו ביקור",
      ctaEn: "Plan a visit",
    },
    {
      kind: "hook",
      angle: "from-site",
      ar: "اللي هون متلوح من موقع {name} — مش مخترع.",
      he: "השורות האלה מהאתר של {name} — לא המצאה.",
      en: "These lines come from {name}’s site — not invented.",
      ctaAr: "رجّع للمصدر",
      ctaHe: "חזרו למקור",
      ctaEn: "Back to the source",
    },
    {
      kind: "hook",
      angle: "family",
      ar: "خذ أهلك على {name} إذا {service} يعنيكم.",
      he: "קחו את המשפחה ל{name} אם {service} רלוונטי.",
      en: "Bring family to {name} if {service} matters.",
      ctaAr: "احكي مع العيلة",
      ctaHe: "דברו עם המשפחה",
      ctaEn: "Talk it over at home",
    },
    {
      kind: "hook",
      angle: "scroll-stop",
      ar: "وقّف السكرول: {name} في {place}.",
      he: "עצרו את הגלילה: {name} ב{place}.",
      en: "Stop the scroll: {name} in {place}.",
      ctaAr: "كمّل للإعلان",
      ctaHe: "המשיכו למודעה",
      ctaEn: "Continue to the ad",
    },
  ];

  const nicheExtra: Record<Niche, Seed[]> = {
    clinic: [
      {
        kind: "cta",
        angle: "book",
        ar: "احجز موعدك من صفحة {name}",
        he: "קבעו תור מעמוד {name}",
        en: "Book from {name}’s page",
        ctaAr: "احجز موعد",
        ctaHe: "קבעו תור",
        ctaEn: "Book a visit",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل على {phone} واسأل عن أقرب وقت",
        he: "התקשרו ל{phone} ושאלו מתי פנוי",
        en: "Call {phone} and ask the next opening",
        ctaAr: "اتّصل هسا",
        ctaHe: "התקשרו עכשיו",
        ctaEn: "Call now",
      },
      {
        kind: "cta",
        angle: "consult",
        ar: "اطلب استشارة مكتوبة — بلا سعر مخترع",
        he: "בקשו ייעוץ כתוב — בלי מחיר מומצא",
        en: "Ask for a written consult — no invented fee",
        ctaAr: "اطلب استشارة",
        ctaHe: "בקשו ייעוץ",
        ctaEn: "Request a consult",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "افتح الخريطة لمحل {name} في {place}",
        he: "פתחו מפה ל{name} ב{place}",
        en: "Open the map for {name} in {place}",
        ctaAr: "افتح الخريطة",
        ctaHe: "פתחו מפה",
        ctaEn: "Open the map",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "ابعت واتساب لـ {name} على {phone}",
        he: "שלחו וואטסאפ ל{name} ב{phone}",
        en: "WhatsApp {name} at {phone}",
        ctaAr: "واتساب العيادة",
        ctaHe: "וואטסאפ למרפאה",
        ctaEn: "WhatsApp the clinic",
      },
      {
        kind: "cta",
        angle: "smile",
        ar: "اسأل عن {service} قبل ما تقرّر",
        he: "שאלו על {service} לפני שמחליטים",
        en: "Ask about {service} before you decide",
        ctaAr: "اسأل قبل القرار",
        ctaHe: "שאלו לפני ההחלטה",
        ctaEn: "Ask before deciding",
      },
      {
        kind: "hook",
        angle: "clinic-pain",
        ar: "سنانك موجعاك؟ صفحة {name} فيها {service}.",
        he: "כואב? בעמוד של {name} מופיע {service}.",
        en: "In pain? {name}’s page lists {service}.",
        ctaAr: "اقرأ العلاج المذكور",
        ctaHe: "קראו את הטיפול",
        ctaEn: "Read the listed care",
      },
      {
        kind: "headline",
        angle: "clinic-calm",
        ar: "عيادة هادية في {place}: {name}",
        he: "מרפאה רגועה ב{place}: {name}",
        en: "A calmer clinic in {place}: {name}",
        ctaAr: "شوف العيادة",
        ctaHe: "ראו את המרפאה",
        ctaEn: "See the clinic",
      },
    ],
    tutoring: [
      {
        kind: "cta",
        angle: "book",
        ar: "احجز حصة تجريبية من صفحة {name}",
        he: "קבעו שיעור ניסיון מעמוד {name}",
        en: "Book a trial lesson on {name}’s page",
        ctaAr: "احجز حصة",
        ctaHe: "קבעו שיעור",
        ctaEn: "Book a lesson",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل {phone} واسأل عن {service}",
        he: "התקשרו {phone} ושאלו על {service}",
        en: "Call {phone} about {service}",
        ctaAr: "اسأل عن الحصص",
        ctaHe: "שאלו על שיעורים",
        ctaEn: "Ask about lessons",
      },
      {
        kind: "cta",
        angle: "plan",
        ar: "اطلب خطة أسبوع من {name}",
        he: "בקשו תוכנית שבוע מ{name}",
        en: "Ask {name} for a weekly plan",
        ctaAr: "اطلب الخطة",
        ctaHe: "בקשו תוכנית",
        ctaEn: "Ask for a plan",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "آدي العنوان في {place}",
        he: "הכתובת ב{place}",
        en: "Here’s the {place} address",
        ctaAr: "خد الاتجاه",
        ctaHe: "קחו ניווט",
        ctaEn: "Get directions",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "واتساب للمدرس: {phone}",
        he: "וואטסאפ למורה: {phone}",
        en: "WhatsApp the tutor: {phone}",
        ctaAr: "واتساب الدرس",
        ctaHe: "וואטסאפ לשיעור",
        ctaEn: "WhatsApp the tutor",
      },
      {
        kind: "cta",
        angle: "parent",
        ar: "ابعِت اسم المادة لـ {name}",
        he: "שלחו את המקצוע ל{name}",
        en: "Send the subject to {name}",
        ctaAr: "ابعت المادة",
        ctaHe: "שלחו מקצוע",
        ctaEn: "Send the subject",
      },
      {
        kind: "hook",
        angle: "exam",
        ar: "قبل الامتحان: {service} مع {name}.",
        he: "לפני המבחן: {service} עם {name}.",
        en: "Before the exam: {service} with {name}.",
        ctaAr: "رتّب الحصة",
        ctaHe: "סדרו שיעור",
        ctaEn: "Set the lesson",
      },
      {
        kind: "headline",
        angle: "tutor-clear",
        ar: "شرح {service} على مهلك — {name}",
        he: "הסבר של {service} בקצב שלכם — {name}",
        en: "{service} explained at your pace — {name}",
        ctaAr: "شوف أسلوبهم",
        ctaHe: "ראו את הסגנון",
        ctaEn: "See their style",
      },
    ],
    restaurant: [
      {
        kind: "cta",
        angle: "book",
        ar: "احجز طاولة من صفحة {name}",
        he: "הזמינו שולחן בעמוד {name}",
        en: "Reserve a table on {name}’s page",
        ctaAr: "احجز طاولة",
        ctaHe: "הזמינו שולחן",
        ctaEn: "Reserve a table",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل {phone} واسأل شو فاتح",
        he: "התקשרו {phone} ושאלו מה פתוח",
        en: "Call {phone} and ask what’s open",
        ctaAr: "اسأل الدوام",
        ctaHe: "שאלו שעות",
        ctaEn: "Ask the hours",
      },
      {
        kind: "cta",
        angle: "menu",
        ar: "افتح قائمة {service} عند {name}",
        he: "פתחו את {service} אצל {name}",
        en: "Open the {service} list at {name}",
        ctaAr: "شوف القائمة",
        ctaHe: "ראו תפריט",
        ctaEn: "See the menu",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "اتجه على {name} في {place}",
        he: "נווטו ל{name} ב{place}",
        en: "Head to {name} in {place}",
        ctaAr: "خذني هناك",
        ctaHe: "קחו אותי לשם",
        ctaEn: "Take me there",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "واتساب للمطعم: {phone}",
        he: "וואטסאפ למקום: {phone}",
        en: "WhatsApp the restaurant: {phone}",
        ctaAr: "اطلب بالواتساب",
        ctaHe: "הזמינו בוואטסאפ",
        ctaEn: "Order on WhatsApp",
      },
      {
        kind: "cta",
        angle: "tonight",
        ar: "مرّ الليلة إذا كنت بـ {place}",
        he: "עברו הערב אם אתם ב{place}",
        en: "Stop by tonight if you’re in {place}",
        ctaAr: "مرّ الليلة",
        ctaHe: "עברו הערב",
        ctaEn: "Stop by tonight",
      },
      {
        kind: "hook",
        angle: "craving",
        ar: "جاعان على {service}؟ {name} بـ {place}.",
        he: "בא לכם {service}? {name} ב{place}.",
        en: "Craving {service}? {name} in {place}.",
        ctaAr: "اطلب من الصفحة",
        ctaHe: "הזמינו מהעמוד",
        ctaEn: "Order from the page",
      },
      {
        kind: "headline",
        angle: "table",
        ar: "طاولة لسا فاضية عند {name}",
        he: "עדיין יש שולחן אצל {name}",
        en: "A table still open at {name}",
        ctaAr: "احجز قبل ما تطلع",
        ctaHe: "הזמינו לפני היציאה",
        ctaEn: "Reserve before you go",
      },
    ],
    renovation: [
      {
        kind: "cta",
        angle: "book",
        ar: "اطلب كشف بيت من صفحة {name}",
        he: "בקשו ביקור בית מעמוד {name}",
        en: "Request a house visit on {name}’s page",
        ctaAr: "اطلب كشف",
        ctaHe: "בקשו ביקור",
        ctaEn: "Request a visit",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل {phone} ووصف الشغل",
        he: "התקשרו {phone} ותארו את העבודה",
        en: "Call {phone} and describe the job",
        ctaAr: "وصف الشغل",
        ctaHe: "תארו את העבודה",
        ctaEn: "Describe the job",
      },
      {
        kind: "cta",
        angle: "photos",
        ar: "ابعِت صور الزاوية لـ {name}",
        he: "שלחו תמונות לפינה ל{name}",
        en: "Send photos of the room to {name}",
        ctaAr: "ابعت صور",
        ctaHe: "שלחו תמונות",
        ctaEn: "Send photos",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "المقاول في {place}: {name}",
        he: "הקבלן ב{place}: {name}",
        en: "The contractor in {place}: {name}",
        ctaAr: "حدد المنطقة",
        ctaHe: "סמנו אזור",
        ctaEn: "Mark the area",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "واتساب المقاول {phone}",
        he: "וואטסאפ לקבלן {phone}",
        en: "WhatsApp the contractor {phone}",
        ctaAr: "واتساب المقاول",
        ctaHe: "וואטסאפ לקבלן",
        ctaEn: "WhatsApp contractor",
      },
      {
        kind: "cta",
        angle: "scope",
        ar: "اسأل إذا بعملوا {service}",
        he: "שאלו אם הם עושים {service}",
        en: "Ask if they do {service}",
        ctaAr: "أكّد الخدمة",
        ctaHe: "אשרו שירות",
        ctaEn: "Confirm the service",
      },
      {
        kind: "hook",
        angle: "wall",
        ar: "الحيط بده {service}؟ اسأل {name}.",
        he: "הקיר צריך {service}? שאלו את {name}.",
        en: "Wall need {service}? Ask {name}.",
        ctaAr: "اسأل المقاول",
        ctaHe: "שאלו את הקבלן",
        ctaEn: "Ask the contractor",
      },
      {
        kind: "headline",
        angle: "home",
        ar: "بيت في {place} عم يتجدّد مع {name}",
        he: "בית ב{place} מתחדש עם {name}",
        en: "A home in {place} refreshing with {name}",
        ctaAr: "شوف شغلهم المذكور",
        ctaHe: "ראו את העבודה הכתובה",
        ctaEn: "See the listed work",
      },
    ],
    fitness: [
      {
        kind: "cta",
        angle: "book",
        ar: "احجز حصة من صفحة {name}",
        he: "קבעו שיעור בעמוד {name}",
        en: "Book a class on {name}’s page",
        ctaAr: "احجز حصة",
        ctaHe: "קבעו שיעור",
        ctaEn: "Book a class",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل {phone} واسأل عن {service}",
        he: "התקשרו {phone} ושאלו על {service}",
        en: "Call {phone} about {service}",
        ctaAr: "اسأل الجدول",
        ctaHe: "שאלו מערכת",
        ctaEn: "Ask the timetable",
      },
      {
        kind: "cta",
        angle: "trial",
        ar: "جرّب حصة أولى — التفاصيل من الموقع",
        he: "נסו שיעור ראשון — הפרטים באתר",
        en: "Try a first class — details on the site",
        ctaAr: "جرّب حصة",
        ctaHe: "נסו שיעור",
        ctaEn: "Try a class",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "الاستوديو في {place}",
        he: "הסטודיו ב{place}",
        en: "The studio is in {place}",
        ctaAr: "خذ الاتجاه",
        ctaHe: "קחו ניווט",
        ctaEn: "Get directions",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "واتساب الاستوديو {phone}",
        he: "וואטסאפ לסטודיו {phone}",
        en: "WhatsApp the studio {phone}",
        ctaAr: "واتساب الحصة",
        ctaHe: "וואטסאפ לשיעור",
        ctaEn: "WhatsApp the class",
      },
      {
        kind: "cta",
        angle: "mat",
        ar: "احجز مات لـ {service}",
        he: "שמרו מזרן ל{service}",
        en: "Hold a mat for {service}",
        ctaAr: "احجز مات",
        ctaHe: "שמרו מזרן",
        ctaEn: "Hold a mat",
      },
      {
        kind: "hook",
        angle: "breath",
        ar: "بدك تتنفس شوي؟ {service} عند {name}.",
        he: "צריכים לנשום רגע? {service} אצל {name}.",
        en: "Need a breath? {service} at {name}.",
        ctaAr: "ادخل الجدول",
        ctaHe: "כנסו למערכת",
        ctaEn: "Open the schedule",
      },
      {
        kind: "headline",
        angle: "boutique",
        ar: "ستوديو صغير في {place}: {name}",
        he: "סטודיו קטן ב{place}: {name}",
        en: "A small studio in {place}: {name}",
        ctaAr: "شوف الحصص",
        ctaHe: "ראו שיעורים",
        ctaEn: "See classes",
      },
    ],
    out_of_niche: [
      {
        kind: "cta",
        angle: "book",
        ar: "تواصل مع {name} من موقعهم",
        he: "צרו קשר עם {name} מהאתר",
        en: "Contact {name} from their site",
        ctaAr: "تواصل من الموقع",
        ctaHe: "צרו קשר מהאתר",
        ctaEn: "Contact from the site",
      },
      {
        kind: "cta",
        angle: "call",
        ar: "اتّصل {phone} إذا الرقم ظاهر",
        he: "התקשרו ל{phone} אם המספר מופיע",
        en: "Call {phone} if the number is listed",
        ctaAr: "اتّصل إن وُجد",
        ctaHe: "התקשרו אם יש",
        ctaEn: "Call if listed",
      },
      {
        kind: "cta",
        angle: "read",
        ar: "اقرأ وصف {name} زي ما هو",
        he: "קראו את התיאור של {name} כמו שהוא",
        en: "Read {name}’s description as written",
        ctaAr: "اقرأ الوصف",
        ctaHe: "קראו תיאור",
        ctaEn: "Read the description",
      },
      {
        kind: "cta",
        angle: "maps",
        ar: "دور على {name} في {place}",
        he: "חפשו את {name} ב{place}",
        en: "Find {name} in {place}",
        ctaAr: "ابحث بالمكان",
        ctaHe: "חפשו במקום",
        ctaEn: "Search the place",
      },
      {
        kind: "cta",
        angle: "whatsapp",
        ar: "راسل {name} على {phone}",
        he: "כתבו ל{name} ב{phone}",
        en: "Message {name} at {phone}",
        ctaAr: "راسل المحل",
        ctaHe: "כתבו לעסק",
        ctaEn: "Message the business",
      },
      {
        kind: "cta",
        angle: "site",
        ar: "ارجع لرابط {name}",
        he: "חזרו לקישור של {name}",
        en: "Return to {name}’s link",
        ctaAr: "افتح الرابط",
        ctaHe: "פתחו קישור",
        ctaEn: "Open the link",
      },
      {
        kind: "hook",
        angle: "soft-out",
        ar: "هالمحّل مش من تخصصاتنا، بس هاد اللي مكتوب عن {name}.",
        he: "העסק מחוץ לנישות שלנו, אבל זה מה שכתוב על {name}.",
        en: "Outside our niches — this is only what {name}’s page says.",
        ctaAr: "كمّل بحذر",
        ctaHe: "המשיכו בזהירות",
        ctaEn: "Continue carefully",
      },
      {
        kind: "headline",
        angle: "generic",
        ar: "{name} في {place} — نص عام من الموقع",
        he: "{name} ב{place} — טקסט כללי מהאתר",
        en: "{name} in {place} — general lines from the site",
        ctaAr: "استخدم بحذر",
        ctaHe: "השתמשו בזהירות",
        ctaEn: "Use with care",
      },
    ],
  };

  return [...commonOpeners, ...nicheExtra[niche]];
}

export function buildCopyLines(facts: BusinessFacts, lang: Lang): CopyLine[] {
  const seeds = seedsFor(facts.niche);
  const seen = new Set<string>();
  const lines: CopyLine[] = [];

  seeds.forEach((seed, index) => {
    const raw = lang === "he" ? seed.he : lang === "en" ? seed.en : seed.ar;
    let text = fill(raw, facts, lang, index);
    if (seen.has(text)) text = `${text} (${index + 1})`;
    seen.add(text);
    const ctaLabel = fill(
      lang === "he" ? seed.ctaHe : lang === "en" ? seed.ctaEn : seed.ctaAr,
      facts,
      lang,
      index,
    );
    lines.push({
      id: `${seed.kind}-${seed.angle}`,
      kind: seed.kind,
      text,
      angle: seed.angle,
      ctaLabel,
    });
  });

  if (lines.length < 20) {
    const extras = extraFills(facts, lang, lines.length);
    for (const extra of extras) {
      if (lines.length >= 24) break;
      if (seen.has(extra.text)) continue;
      seen.add(extra.text);
      lines.push(extra);
    }
  }

  return lines;
}

function extraFills(facts: BusinessFacts, lang: Lang, start: number): CopyLine[] {
  const name = nameOf(facts);
  const extras: Array<[CopyKind, string, string]> = [];
  if (lang === "ar") {
    extras.push(
      ["headline", "short-name", name],
      ["hook", "host", `المصدر: ${facts.host}`],
      ["cta", "refresh", "امسح الرابط من جديد إذا تغيّر الموقع"],
      ["headline", "services-count", facts.services.length ? `خدمات ظاهرة: ${facts.services.join("، ")}` : `${name} — الخدمات ما انذكرتش`],
    );
  } else if (lang === "he") {
    extras.push(
      ["headline", "short-name", name],
      ["hook", "host", `מקור: ${facts.host}`],
      ["cta", "refresh", "סרקו שוב אם האתר התעדכן"],
      ["headline", "services-count", facts.services.length ? `שירותים באתר: ${facts.services.join(", ")}` : `${name} — אין שירותים כתובים`],
    );
  } else {
    extras.push(
      ["headline", "short-name", name],
      ["hook", "host", `Source: ${facts.host}`],
      ["cta", "refresh", "Scan again if the site changed"],
      ["headline", "services-count", facts.services.length ? `Listed services: ${facts.services.join(", ")}` : `${name} — no services written`],
    );
  }
  return extras.map(([kind, angle, text], i) => ({
    id: `extra-${angle}-${start + i}`,
    kind,
    text,
    angle,
    ctaLabel: text,
  }));
}

export function assertDistinct(lines: CopyLine[]): boolean {
  const texts = lines.map((l) => l.text);
  const ctas = lines.filter((l) => l.kind === "cta").map((l) => l.ctaLabel);
  return new Set(texts).size === texts.length && new Set(ctas).size === ctas.length && lines.length >= 20;
}
