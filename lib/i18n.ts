import type { Lang } from "./types";
import type { NoticeKey } from "./scan";

type Dict = Record<string, Record<Lang, string>>;

const D: Dict = {
  brand: { ar: "خطوة Ads", he: "חַטְוַה Ads", en: "Khatwa Ads" },
  tagline: {
    ar: "لزّق رابط محلك — وطلّع دزينة إعلانات لـ Meta بجلسة وحدة",
    he: "הדביקו קישור — עשרות שורות מודעה ל-Meta בישיבה אחת",
    en: "Paste a business URL — dozens of Meta lines in one sitting",
  },
  sub: {
    ar: "مسح صادق: اسم، تلفون، خدمات، مكان. بلا اختراع أسعار وبلا ROAS كاذب. عربي فلسطيني، عبري، وإنجليزي.",
    he: "סריקה כנה: שם, טלפון, שירותים, מקום. בלי מחירים מומצאים ובלי ROAS מזויף.",
    en: "Honest scan: name, phone, services, place. No invented prices, no fake ROAS.",
  },
  urlPh: {
    ar: "https://عيادتك أو مقهاك أو مركز الدرس…",
    he: "https://העסק שלכם…",
    en: "https://your-clinic-cafe-or-studio…",
  },
  scan: { ar: "امسح الموقع", he: "סרקו את האתר", en: "Scan the site" },
  scanning: { ar: "عم نقرأ الصفحة…", he: "קוראים את העמוד…", en: "Reading the page…" },
  nichesTitle: { ar: "التخصصات اللي منخدمها", he: "הנישות שלנו", en: "Niches we serve" },
  nClinic: { ar: "عيادات وتجميل وأسنان", he: "מרפאות, אסתטיקה, שיניים", en: "Clinics, dental, aesthetic" },
  nTutor: { ar: "دروس خصوصية", he: "שיעורים פרטיים", en: "Tutoring" },
  nFood: { ar: "مطاعم ومقاهي", he: "מסעדות ובתי קפה", en: "Restaurants & cafés" },
  nReno: { ar: "ترميم ومقاولات", he: "שיפוץ וקבלנות", en: "Renovation & contractors" },
  nFit: { ar: "لياقة بوتيك", he: "כושר בוטיק", en: "Boutique fitness" },
  samples: { ar: "أو جرّب عيّنة جاهزة", he: "או נסו דוגמה מוכנה", en: "Or try a ready sample" },
  promise1: { ar: "سوق نصوص ≥ 20 سطر مختلف", he: "שוק של 20+ שורות שונות", en: "Marketplace of 20+ distinct lines" },
  promise2: { ar: "صور مجال بتعليق فريد", he: "תמונות נישה עם כיתוב ייחודי", en: "Niche images with unique captions" },
  promise3: { ar: "تصدير الباقة + إطارات 1:1 و 9:16", he: "ייצוא + פריימים 1:1 ו-9:16", en: "Export pack + 1:1 and 9:16 frames" },
  hours: { ar: "الدوام", he: "שעות", en: "Hours" },
  whatsapp: { ar: "واتساب", he: "וואטסאפ", en: "WhatsApp" },
  step1: { ar: "1. الرابط", he: "1. קישור", en: "1. URL" },
  step2: { ar: "2. السوق", he: "2. שוק", en: "2. Pick" },
  step3: { ar: "3. التصدير", he: "3. ייצוא", en: "3. Export" },
  trySample: { ar: "عيّنة — كمّل بعيادة جاهزة", he: "דוגמה — המשיכו עם מרפאה", en: "Sample — continue with a clinic" },
  sampleBadge: { ar: "عيّنة", he: "דוגמה", en: "Sample" },
  retry: { ar: "أعيد المحاولة", he: "נסו שוב", en: "Retry" },
  scanError: {
    ar: "ما قدرنا نمسح هالرابط. الرابط بعدو هون — أعيد المحاولة. ما رح نحمّل العيّنة مكان موقعك.",
    he: "לא הצלחנו לסרוק את הקישור. הכתובת נשארה — נסו שוב. לא נחליף בדוגמה.",
    en: "We could not scan that URL. Your link is still here — retry. We will not load the sample instead.",
  },
  scanRejectedDemo: {
    ar: "المسح رجّع عيّنة بالغلط. ما كمّلناك عليها — أعيد المحاولة على نفس الرابط.",
    he: "הסריקה החזירה דוגמה בטעות. לא המשכנו איתה — נסו שוב את אותו קישור.",
    en: "The scan returned a sample by mistake. We did not continue with it — retry the same URL.",
  },
  pasteOrSample: {
    ar: "لزّق رابط موقعك فوق، أو اضغط «عيّنة» إذا بدك تجربة توضيحية.",
    he: "הדביקו קישור למעלה, או לחצו «דוגמה» לניסיון.",
    en: "Paste your site URL above, or tap “Sample” for a labeled demo.",
  },
  frame11: { ar: "إطار مربع 1:1", he: "פריים 1:1", en: "1:1 feed frame" },
  frame916: { ar: "إطار ستوري 9:16", he: "פריים 9:16", en: "9:16 story frame" },
  downloadFrame: { ar: "حمّل الإطار", he: "הורדת הפריים", en: "Download frame" },
  fromSiteImg: { ar: "من الموقع", he: "מהאתר", en: "From the site" },
  stockImg: { ar: "ستوك المجال", he: "סטוק נישה", en: "Niche stock" },
  genImg: { ar: "مولَّدة", he: "נוצר", en: "Generated" },
  allKinds: { ar: "الكل", he: "הכל", en: "All" },
  translating: { ar: "عم نترجمه من العربي…", he: "מתרגמים מערבית…", en: "Translating from Arabic…" },
  noStuck: {
    ar: "ما بنعلّقك: زر أخضر واحد، والفراغات بتنتعبى من الدليل.",
    he: "בלי פינות מתות: כפתור ירוק אחד, וחסרים מתמלאים לפי הראיות.",
    en: "Never stuck: one green CTA, gaps auto-filled from evidence.",
  },
  cardTitle: { ar: "كرت المحل", he: "כרטיס העסק", en: "Business card" },
  name: { ar: "الاسم", he: "שם", en: "Name" },
  phone: { ar: "التلفون", he: "טלפון", en: "Phone" },
  place: { ar: "المكان", he: "מקום", en: "Place" },
  services: { ar: "الخدمات", he: "שירותים", en: "Services" },
  missing: { ar: "ما انذكرش بالموقع", he: "לא מופיע באתר", en: "Not found on the site" },
  fromSite: { ar: "من الموقع", he: "מהאתר", en: "From the site" },
  fromHost: { ar: "من اسم الدومين", he: "משם הדומיין", en: "From the domain" },
  fromDemo: { ar: "عيّنة توضيحية", he: "דוגמה להמחשה", en: "Illustrated sample" },
  marketplace: { ar: "سوق النصوص", he: "שוק השורות", en: "Copy line marketplace" },
  marketHint: {
    ar: "اختار عناوين وخطافات ودعوات إجراء — كل زر مختلف، مش نفس الـ CTA على كل كرت.",
    he: "בחרו כותרות, הוקים ו-CTA — כל כפתור אחר, לא אותו CTA על כל כרטיס.",
    en: "Pick headlines, hooks, and CTAs — a different button on every card.",
  },
  images: { ar: "صور المجال", he: "תמונות הנישה", en: "Niche images" },
  imagesHint: {
    ar: "كل قول عليه تعليق لحاله — مش ستوك أعمى بنفس الجملة.",
    he: "לכל תמונה כיתוב משלה — לא סטוק זהה.",
    en: "Each frame has its own caption — no identical stock lines.",
  },
  selected: { ar: "مختار", he: "נבחרו", en: "selected" },
  continue: { ar: "كمّل على المختار", he: "המשיכו עם הנבחרים", en: "Continue with selection" },
  selectAll: { ar: "اختار الكل", he: "בחרו הכל", en: "Select all" },
  selectSome: { ar: "رجّع الاختيار الآلي", he: "בחירה אוטומטית", en: "Restore smart pick" },
  headline: { ar: "عنوان", he: "כותרת", en: "Headline" },
  hook: { ar: "خطّاف", he: "הוק", en: "Hook" },
  cta: { ar: "دعوة إجراء", he: "CTA", en: "CTA" },
  resultTitle: { ar: "باقة الإعلان", he: "חבילת המודעה", en: "Ad pack" },
  resultSub: {
    ar: "النصوص والصور اللي اخترتها — انسخ الكل أو حمّل ملف جاهز لـ Ads Manager.",
    he: "השורות והתמונות שבחרתם — העתיקו הכל או הורידו קובץ ל-Ads Manager.",
    en: "Your picked lines and images — copy all or download a pack for Ads Manager.",
  },
  copyAll: { ar: "نسخ الكل", he: "העתק הכל", en: "Copy all" },
  copied: { ar: "اننسخت!", he: "הועתק!", en: "Copied!" },
  download: { ar: "حمّل باقة النصوص", he: "הורדת חבילת הטקסט", en: "Download text pack" },
  mock: { ar: "إطارات الإعلان", he: "פריימי מודעה", en: "Ad frames" },
  sponsored: { ar: "إعلان", he: "מודעה", en: "Ad" },
  newScan: { ar: "امسح رابط ثاني", he: "סרקו קישור אחר", en: "Scan another URL" },
  backMarket: { ar: "ارجع للسوق", he: "חזרו לשוק", en: "Back to marketplace" },
  geminiOn: { ar: "التوليد اشتغل على وقائع الصفحة", he: "היצירה התבססה על העמוד", en: "Generation used page facts" },
  geminiOff: { ar: "التوليد من الوقائع الظاهرة — بدون مفتاح", he: "יצירה מהעובדות — בלי מפתח", en: "Built from visible facts — no key" },
  notice_ok: { ar: "مسحنا الصفحة وما زوّدناشي من عندنا.", he: "סרקנו את העמוד בלי להמציא.", en: "We scanned the page and added nothing extra." },
  notice_demo: { ar: "هاي عيّنة توضيحية — الوقائع موسومة إنها مش من موقع حي.", he: "זו דוגמה — העובדות מסומנות כלא-חיות.", en: "Illustrated sample — facts are marked as not live." },
  notice_empty_used_demo: {
    ar: "ما لزّقت رابط — كمّلناك بعيّنة عيادة عشان ما تعلق.",
    he: "לא הודבק קישור — המשכנו עם דוגמת מרפאה כדי לא לתקוע.",
    en: "No URL pasted — we filled a clinic sample so you are not stuck.",
  },
  notice_invalid_used_demo: {
    ar: "الرابط ما انقرأ — كمّلناك بعيّنة عيادة. جرّب رابط أوضح لما تحب.",
    he: "הקישור לא נקלט — המשכנו עם דוגמת מרפאה.",
    en: "That did not look like a URL — we continued with a clinic sample.",
  },
  notice_invalid_url: {
    ar: "هالحقل مش رابط واضح. لزّق عنوان الموقع (مثال: https://عيادتك.ps) وجرّب المسح مرة ثانية.",
    he: "זה לא נראה כמו קישור. הדביקו כתובת אתר ונסו לסרוק שוב.",
    en: "That does not look like a URL. Paste a site address and scan again.",
  },
  notice_fetch_failed: {
    ar: "ما قدرنا نفتح الصفحة (شبكة أو حجب). الرابط بعدو محفوظ — أعيد المحاولة. ما حمّلناش العيّنة.",
    he: "לא הצלחנו לפתוח את העמוד. הקישור נשמר — נסו שוב. לא טענו דוגמה.",
    en: "Could not open the page. Your URL is kept — retry. We did not load the sample.",
  },
  notice_out_of_niche: {
    ar: "هالمحّل مش من التخصصات اللي منركّز عليها (عيادات، دروس، مطاعم، ترميم، فتنس). طلّعلك أفكار عامة من المكتوب — من غير اختراع.",
    he: "העסק מחוץ לנישות שלנו (מרפאות, שיעורים, מסעדות, שיפוץ, כושר). בנינו שורות כלליות רק ממה שכתוב.",
    en: "This business is outside our niches (clinics, tutoring, restaurants, renovation, fitness). We built general lines only from what is written.",
  },
  evidenceNote: {
    ar: "الفراغات اتعبّت بصراحة: «ما انذكرش» — مش باسم مدينة ولا رقم.",
    he: "שדות חסרים מולאו בכנות: «לא מופיע» — בלי עיר או מספר מומצאים.",
    en: "Gaps are filled honestly as “not found” — never a fake city or number.",
  },
  like: { ar: "إعجاب", he: "אהבתי", en: "Like" },
  comment: { ar: "تعليق", he: "תגובה", en: "Comment" },
  share: { ar: "مشاركة", he: "שיתוף", en: "Share" },
  emptyPick: {
    ar: "ما اخترت إشي — منكمّل بأحسن ٦ نصوص و٣ صور.",
    he: "לא נבחר כלום — נמשיך עם 6 שורות ו-3 תמונות.",
    en: "Nothing picked — we continue with the top 6 lines and 3 images.",
  },
  owner: { ar: "صاحب المشروع: drmarktzone-stack", he: "בעלים: drmarktzone-stack", en: "Owner: drmarktzone-stack" },
};

export function t(key: keyof typeof D, lang: Lang): string {
  return D[key][lang];
}

export function noticeText(key: NoticeKey, lang: Lang): string {
  return t(`notice_${key}` as keyof typeof D, lang);
}
