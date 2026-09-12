import type { AdLayoutId, Lang } from "./types";

export interface AdLayoutDef {
  id: AdLayoutId;
  ratio: "1:1" | "9:16";
  name: Record<Lang, string>;
  blurb: Record<Lang, string>;
}

export const AD_LAYOUTS: AdLayoutDef[] = [
  {
    id: "feed_bold",
    ratio: "1:1",
    name: { ar: "فيد جريء", he: "פיד נועז", en: "Bold feed" },
    blurb: {
      ar: "مربع 1:1 — صورة كاملة، اسم، مكان، تلفون، ودعوة واضحة.",
      he: "1:1 — תמונה מלאה, שם, מקום, טלפון ו-CTA.",
      en: "1:1 — full photo with name, place, phone, and a clear CTA.",
    },
  },
  {
    id: "feed_card",
    ratio: "1:1",
    name: { ar: "كرت أبيض", he: "כרטיס לבן", en: "White card" },
    blurb: {
      ar: "مربع 1:1 — صورة فوق وكرت معلومات تحت (زي كرت المحل).",
      he: "1:1 — תמונה למעלה וכרטיס פרטים למטה.",
      en: "1:1 — photo on top, business-card facts below.",
    },
  },
  {
    id: "feed_split",
    ratio: "1:1",
    name: { ar: "فيد مقسوم", he: "פיד מפוצל", en: "Split feed" },
    blurb: {
      ar: "مربع 1:1 — نص أخضر من جهة وصورة من جهة.",
      he: "1:1 — טקסט ירוק מצד ותמונה מצד.",
      en: "1:1 — green copy panel beside the photo.",
    },
  },
  {
    id: "story_stack",
    ratio: "9:16",
    name: { ar: "ستوري طبقات", he: "סטורי שכבות", en: "Stacked story" },
    blurb: {
      ar: "ستوري 9:16 — اسم ومكان وتلفون وعنوان فوق بعض.",
      he: "סטורי 9:16 — שם, מקום, טלפון וכותרת בשכבות.",
      en: "9:16 story — name, place, phone, and headline stacked.",
    },
  },
  {
    id: "story_banner",
    ratio: "9:16",
    name: { ar: "ستوري لافتة", he: "סטורי באנר", en: "Banner story" },
    blurb: {
      ar: "ستوري 9:16 — شريط اسم فوق ودعوة تحت.",
      he: "סטורי 9:16 — פס שם למעלה ו-CTA למטה.",
      en: "9:16 story — name bar on top, CTA strip below.",
    },
  },
  {
    id: "story_glass",
    ratio: "9:16",
    name: { ar: "ستوري زجاج", he: "סטורי זכוכית", en: "Glass story" },
    blurb: {
      ar: "ستوري 9:16 — كرت شفاف بالنص فوق الصورة.",
      he: "סטורי 9:16 — כרטיס שקוף מעל התמונה.",
      en: "9:16 story — glass card of facts over the photo.",
    },
  },
];

export function getLayout(id: AdLayoutId | string | null | undefined): AdLayoutDef {
  return AD_LAYOUTS.find((l) => l.id === id) || AD_LAYOUTS[0];
}

export function pairLayout(id: AdLayoutId): AdLayoutDef {
  const pair: Record<AdLayoutId, AdLayoutId> = {
    feed_bold: "story_stack",
    feed_card: "story_banner",
    feed_split: "story_glass",
    story_stack: "feed_bold",
    story_banner: "feed_card",
    story_glass: "feed_split",
  };
  return getLayout(pair[id]);
}

export function layoutsByRatio(ratio: "1:1" | "9:16"): AdLayoutDef[] {
  return AD_LAYOUTS.filter((l) => l.ratio === ratio);
}
