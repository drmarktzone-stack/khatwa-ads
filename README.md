# خطوة Ads / Khatwa Ads

Paste a local business URL → honest scan → a marketplace of **20+ distinct** Palestinian-Arabic lines (Hebrew / English via translation) and niche images → **lock an AdPack** → choose a design → preview → publish anywhere (WhatsApp / native share / PNG / Meta·IG·TikTok instructions). Plus a **شمائل** tools hub (viral scripts, carousel, 30-day calendar, bio, story templates).

Greenfield app. It does **not** use sawek-ad, OmniAd, AdBrain, or Base44.

Owner: [drmarktzone-stack](https://github.com/drmarktzone-stack)

## Product

One sitting. One green path: **URL → scan → pick → lock → design → preview → publish**. The result page is never a cul-de-sac. No invented prices, phones, cities, hours, or ROAS. Missing fields stay “not found on the site”. Out-of-list businesses get a **soft gate** and general lines from the page only — never a fake specialty dump.

**Owner hard rule:** Khatwa never asks for or stores Facebook / Instagram / Google passwords, and never posts silently as the user. Share, download, and open-the-platform only.

Arabic (`ar`) is Palestinian colloquial and the generation base. `he` / `en` are translations of that base (Cloud Translation or Gemini when keys exist; otherwise the facts engine in that language).

## The 11 niches (only)

| id | AR | HE | EN |
| --- | --- | --- | --- |
| `lawyers` | محامون | עורכי דין | Lawyers |
| `real_estate_agents` | وسطاء عقارات محليون | תיווך | Local real-estate agents |
| `medical_clinics` | عيادات طبية | מרפאות | Medical clinics |
| `pediatric_clinics` | عيادات أطفال | מרפאות ילדים | Pediatric clinics |
| `dental` | عيادات أسنان | שיניים | Dental |
| `beauty_aesthetic` | تجميل وصالونات | אסתטיקה ומספרות | Beauty & aesthetic |
| `contractors` | مقاولون وتجديد | שיפוצים | Contractors & renovation |
| `tutoring` | دروس خصوصية | שיעורים פרטיים | Tutoring |
| `restaurants` | مطاعم ومقاهي | מסעדות | Restaurants & cafés |
| `fitness` | صالات ومدربون | כושר | Gyms & trainers |
| `home_trades` | خدمات بيت طارئة | שירותי בית דחופים | Urgent home trades (plumb / elec / HVAC) |

Registry: `lib/niches/` — labels, detect keywords, **≥30** copy templates per niche (`{name}` `{place}` `{phone}` `{service}` `{doctor}` `{slogan}` `{insurance}`), image motifs + stock query packs, scan-field priority, CTA style (WhatsApp / call). Scan maps a site to **one** of the 11.

**Pediatric brand law:** on Samer / عيادتي sites the name is **عيادتي**. «طفلك بخير وقلبك مرتاح» is USP/description only — never `name`. Clalit/insurance only if evidenced. Never invent **القدس / Jerusalem**. Never treat **100 / 101 / 911** as the shop phone.

Hard check: `https://drsamerped.ai.studio` → `pediatric_clinics`, name `عيادتي`, place `باقة الغربية`, real phones only.

## Journey

Never stuck after marketplace selection. Primary result CTA is **اقفل الإعلان وكمل** (not only «ارجع للسوق»).

1. `/?lang=ar|he|en` — paste a URL and **امسح الموقع**. Niche tiles labeled **عيّنة** are a separate demo path. Home also lists **شمائل** start cards.
2. `/scan` — honest business card with a **niche badge**, copy marketplace **grouped by niche angles**, image grid (site photos first, unique captions).
3. `/result` — selected lines + images plus an **AdCreative-style gallery** (headlines × images × 1:1/9:16 — no fake scores). **اقفل الإعلان وكمل** freezes an immutable AdPack (session + localStorage snapshot). Copy / `.txt` remain secondary. Back-to-market and new-scan are never the only buttons.
4. `/design` — carousel of **≥4 layouts** (1:1 feed + 9:16 story): photo + name + place + phone + CTA overlays.
5. `/preview` — full poster, **editable caption**, **نشر الآن** + **حفظ كمسودة** (draft stays on-device).
6. `/publish` — أين تريد النشر؟ Facebook / Instagram / WhatsApp / TikTok:
   - WhatsApp: `wa.me` share with text + link
   - Native Web Share API when the browser has it
   - Download PNG (selected layout + paired 1:1 / 9:16) + copy pack (`.txt`)
   - Deep-link / how-to to open Meta Ads, Instagram, TikTok with assets ready
   - **No passwords. No silent posting.**
7. `/tools` — Mohtawak-class شمائل (also linked from the header and home):
   - نصوص فيروسية / viral Reels–TikTok scripts **1→7** (UGC, niche-aware)
   - كاروسيل (10-slide outline + captions)
   - تقويم ٣٠ يوم from the niche warehouse
   - محسّن البايو (3 variants)
   - قوالب ستوري (5-day teaser series)

Each tool uses scan facts + locked lines. Gemini when keys exist; facts/warehouse fallback otherwise. Niche-aware across all 11 niches (including `pediatric_clinics` / عيادتي brand law).

`ar` and `he` render RTL. Lime/green/white energy, Khatwa brand. Buttons never sit grey with no action: the primary CTA always continues (empty picks auto-fill, missing pack auto-locks from the current scan).

**Scan vs عيّنة:** Pasting a real URL and clicking Scan calls `POST /api/scan` and keeps that business in `sessionStorage` + `localStorage`. An empty or live URL is **never** returned or shown as the built-in clinic sample. If the scan fails, **أعيد المحاولة** is the primary action (same URL stays in the box). Sample is only an explicit **عيّنة** tile or the secondary link **جرّب عيّنة منفصلة** — never a mid-scan button, and it does not overwrite the typed URL. `/scan` with no stored payload shows an error and returns home with the URL; it does not inject the demo clinic.

## Smart tools (all optional, all degrade)

| Tool | What it does | Without keys |
| --- | --- | --- |
| URL scan | Name, phones, WhatsApp, services, place, **hours**, site images — extract only | Domain name + “not found” |
| Copy | Per-niche warehouse + Vertex **gemini-2.5-flash** + Search Grounding, facts-only | ≥20 distinct Palestinian-AR lines from that niche’s warehouse |
| Images | Site images first; **per-niche motifs** + unique captions; optional **gemini-2.5-flash-image** / Imagen | Motif stock + unique captions |
| Translate | Cloud Translation or Gemini from the AR base | Facts-engine HE/EN |
| Export / publish | Text pack + layout PNG 1:1 / 9:16 + wa.me / Web Share | Always local |
| شمائل | 7 UGC scripts, carousel, 30-day calendar, bios, stories from the locked AdPack | Facts + warehouse; Gemini optional |

No engine-chrome slogans in the ad lines. No identical caption on every tile. No scavenger forms.

## Stack

Next.js App Router, TypeScript, Tailwind. Cloud Run ready (`PORT=8080`). Works offline.

## Local

```bash
npm install
npm run dev
npm test
npm run build
PORT=8080 npm start
```

## Environment

Copy `.env.example`. **Nothing is required.** Aliases match other GCP services the owner already uses.

| Variable | Default / notes |
| --- | --- |
| `GOOGLE_CLOUD_PROJECT` / `GCP_PROJECT` / `VERTEX_PROJECT` | Vertex + Translation + Imagen |
| `GOOGLE_CLOUD_LOCATION` / `VERTEX_LOCATION` / `GCP_LOCATION` | **`me-west1`** — if the model is not in-region, the client retries the **global** endpoint |
| `VERTEX_MODEL` / `GEMINI_MODEL` | `gemini-2.5-flash` |
| `VERTEX_IMAGE_MODEL` | `gemini-2.5-flash-image` |
| `IMAGEN_MODEL` | `imagen-3.0-generate-002` |
| `VERTEX_GROUNDING` | `1` — Google Search grounding when Vertex is up |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `VERTEX_API_KEY` / `GOOGLE_AI_API_KEY` | AI Studio or Vertex API key |
| `GOOGLE_TRANSLATE_API_KEY` / `TRANSLATE_API_KEY` | Cloud Translation |
| Cloud Run ADC | metadata server token, no key file |

On Cloud Run, attach a service account with Vertex + Translation. If the call fails, the facts fallback still returns a full marketplace.

## Cloud Run

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/khatwa-ads
gcloud run deploy khatwa-ads \
  --image REGION-docker.pkg.dev/PROJECT/REPO/khatwa-ads \
  --region me-west1 \
  --port 8080 \
  --allow-unauthenticated
```

`Dockerfile` uses Next.js `output: "standalone"`. Health: `GET /api/health` (also reports which tools look configured).

**Deploy note:** this repo may not auto-deploy to Cloud Run. After merge to `main`, the owner deploys service `khatwa-ads` in project `project-8fd8a005-ae6d-4139-ab4`, region `me-west1` (live: `https://khatwa-ads-308665814452.me-west1.run.app`).

```bash
gcloud builds submit --tag me-west1-docker.pkg.dev/project-8fd8a005-ae6d-4139-ab4/khatwa/khatwa-ads
gcloud run deploy khatwa-ads \
  --image me-west1-docker.pkg.dev/project-8fd8a005-ae6d-4139-ab4/khatwa/khatwa-ads \
  --region me-west1 \
  --port 8080 \
  --allow-unauthenticated
```

Post-deploy: `GET /api/health`, then scan `https://drsamerped.ai.studio` — expect niche **عيادات أطفال** (`pediatric_clinics`), name **عيادتي**, place **باقة الغربية**, real clinic phones, slogan only as USP, no invented القدس. From `/scan` pick lines → `/result` must show **اقفل الإعلان وكمل** (not only back-to-market). Lock → `/design` (≥4 layouts) → `/preview` (نشر الآن / حفظ كمسودة) → `/publish` (FB / IG / WA / TikTok). `/tools` must render five start cards. A dental demo and a restaurant demo must keep their own warehouse lines (not clinic hooks). Zero fake ROAS. Never a Facebook/Instagram password field.

## License

Private product of drmarktzone-stack.
