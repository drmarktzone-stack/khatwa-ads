/** Localities we may copy from a page. Jerusalem is NOT in this casual list. */
export const PLACE_HINTS = [
  "باقة الغربية",
  "باقة الغربيه",
  "باقة",
  "جت",
  "زيمر",
  "أم الفحم",
  "ام الفحم",
  "الطيبة",
  "الطيبه",
  "الطيرة",
  "الطيراه",
  "قلنسوة",
  "كفر قاسم",
  "كفر قرع",
  "عرعرة",
  "عارة",
  "معاوية",
  "جسر الزرقاء",
  "الفريديس",
  "رام الله",
  "البيرة",
  "نابلس",
  "الخليل",
  "بيت لحم",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "أريحا",
  "غزة",
  "رفح",
  "خان يونس",
  "حيفا",
  "يافا",
  "عكا",
  "الناصرة",
  "الناصره",
  "اللد",
  "الرملة",
  "بئر السبع",
  "سخنين",
  "شفاعمرو",
  "أم الفحم",
  "באקה אל-גרביה",
  "באקה",
  "ג'ת",
  "זמר",
  "אום אל-פחם",
  "טייבה",
  "טירה",
  "קלנסווה",
  "כפר קאסם",
  "כפר קרע",
  "ערערה",
  "רמאללה",
  "חיפה",
  "תל אביב",
  "נצרת",
  "עכו",
  "באר שבע",
  "חברון",
  "שכם",
  "בית לחם",
  "Baqa al-Gharbiyye",
  "Baqa al-Gharbiya",
  "Baqa",
  "Ramallah",
  "Nablus",
  "Hebron",
  "Bethlehem",
  "Haifa",
  "Nazareth",
  "Gaza",
];

const JERUSALEM_HINTS = ["القدس", "ירושלים", "Jerusalem", "Al-Quds", "Al Quds"];

const ADDRESS_NEAR =
  /(?:في|بـ|ب|حي|شارع|مجمع|عيادة|مكتب|משרד|מרפאה|רחוב|בקריה|near|in|at)\s{0,6}$/i;

export function findPlaceHint(blob: string): { value: string; snippet: string } | null {
  for (const hint of PLACE_HINTS) {
    const idx = blob.indexOf(hint);
    if (idx >= 0) return { value: canonicalPlace(hint), snippet: hint };
  }
  return null;
}

/** Jerusalem only when it sits in an address-shaped phrase — never a default city. */
export function findExplicitJerusalem(blob: string): { value: string; snippet: string } | null {
  for (const hint of JERUSALEM_HINTS) {
    const idx = blob.indexOf(hint);
    if (idx < 0) continue;
    const before = blob.slice(Math.max(0, idx - 24), idx);
    const after = blob.slice(idx + hint.length, idx + hint.length + 28);
    const addressShaped =
      ADDRESS_NEAR.test(before) ||
      /شارع|Street|רחוב|مجمع|عيادة|משרד|מרפאה|address|locality/i.test(before + after);
    if (addressShaped) return { value: "القدس", snippet: hint };
  }
  return null;
}

export function canonicalPlace(hint: string): string {
  const map: Record<string, string> = {
    "باقة الغربيه": "باقة الغربية",
    باقة: "باقة الغربية",
    "באקה אל-גרביה": "باقة الغربية",
    באקה: "باقة الغربية",
    "Baqa al-Gharbiyye": "باقة الغربية",
    "Baqa al-Gharbiya": "باقة الغربية",
    Baqa: "باقة الغربية",
  };
  return map[hint] || hint;
}
