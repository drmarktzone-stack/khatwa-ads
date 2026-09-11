"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LANGS, langLabel, type Lang } from "@/lib/lang";

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setLang(next: Lang) {
    const q = new URLSearchParams(params.toString());
    q.set("lang", next);
    router.push(`${pathname}?${q.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/80 p-1 border border-khatwa-line">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
            l === lang ? "bg-khatwa-green text-white" : "text-khatwa-mute hover:text-khatwa-ink"
          }`}
        >
          {langLabel(l)}
        </button>
      ))}
    </div>
  );
}
