import type { Lang, Niche } from "./types";

export const SUPPORTED_NICHES: Exclude<Niche, "out_of_niche">[] = [
  "clinic",
  "tutoring",
  "restaurant",
  "renovation",
  "fitness",
];

const KEYWORDS: Record<Exclude<Niche, "out_of_niche">, string[]> = {
  clinic: [
    "عيادة",
    "طبيب",
    "دكتور",
    "أسنان",
    "اسنان",
    "تجميل",
    "بشرة",
    "جلدية",
    "أسنان",
    "orthodont",
    "dental",
    "dentist",
    "clinic",
    "aesthetic",
    "dermatolog",
    "skin clinic",
    "بوتوكس",
    "ليزر",
    "مارפאה",
    "מרפאה",
    "רופא",
    "שיניים",
    "אסתטיקה",
    "קוסמטי",
    "טיפול שיניים",
  ],
  tutoring: [
    "دروس",
    "درس خصوصي",
    "مدرس",
    "معلّم",
    "معلم",
    "تعزيز",
    "tutoring",
    "tutor",
    "private lesson",
    "math tutor",
    "homework",
    "בגרויות",
    "שיעורים פרטיים",
    "מורה פרטי",
    "הוראה",
    "בגרות",
    "توجيهي",
    "رياضيات",
    "انجليزي",
    "فيزياء",
  ],
  restaurant: [
    "مطعم",
    "مقهى",
    "كافيه",
    "قهوة",
    "منسف",
    "مسخن",
    "restaurant",
    "café",
    "cafe",
    "bistro",
    "kitchen",
    "delivery",
    "قائمة الطعام",
    "menu",
    "מסעדה",
    "בית קפה",
    "קפה",
    "אוכל",
    "משלוחים",
  ],
  renovation: [
    "ترميم",
    "مقاول",
    "دهان",
    "بلاط",
    "تشطيب",
    "ديكور",
    "renovation",
    "contractor",
    "remodel",
    "painting",
    "tiling",
    "kitchen remodel",
    "שיפוץ",
    "קבלן",
    "צביעה",
    "שיפוצים",
    "אינסטלציה",
  ],
  fitness: [
    "نادي رياضي",
    "لياقة",
    "جيم",
    "يوغا",
    "بيلاتس",
    "كروسفت",
    "gym",
    "fitness",
    "yoga",
    "pilates",
    "boutique fitness",
    "personal train",
    "חדר כושר",
    "יוגה",
    "פילאטיס",
    "אימון אישי",
    "כושר",
  ],
};

export function detectNiche(text: string): Niche {
  const hay = text.toLowerCase();
  let best: Niche = "out_of_niche";
  let score = 0;
  for (const niche of SUPPORTED_NICHES) {
    const hits = KEYWORDS[niche].filter((k) => hay.includes(k.toLowerCase())).length;
    if (hits > score) {
      score = hits;
      best = niche;
    }
  }
  return score > 0 ? best : "out_of_niche";
}

export function nicheLabel(niche: Niche, lang: Lang): string {
  const map: Record<Niche, Record<Lang, string>> = {
    clinic: { ar: "عيادة / تجميل / أسنان", he: "מרפאה / אסתטיקה / שיניים", en: "Clinic / dental / aesthetic" },
    tutoring: { ar: "دروس خصوصية", he: "שיעורים פרטיים", en: "Tutoring" },
    restaurant: { ar: "مطعم / مقهى", he: "מסעדה / בית קפה", en: "Restaurant / café" },
    renovation: { ar: "ترميم / مقاولات", he: "שיפוץ / קבלנות", en: "Renovation / contractor" },
    fitness: { ar: "لياقة بوتيك", he: "כושר בוטיק", en: "Boutique fitness" },
    out_of_niche: { ar: "برّا التخصص", he: "מחוץ לתחום", en: "Outside our niches" },
  };
  return map[niche][lang];
}
