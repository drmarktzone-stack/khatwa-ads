# خطوة Ads / Khatwa Ads

Paste a local business URL → honest scan → a marketplace of **20+ distinct** Palestinian-Arabic lines (Hebrew / English via translation) and niche images → multi-select → copy pack + **1:1 and 9:16** ad frames.

Greenfield app. It does **not** use sawek-ad, OmniAd, AdBrain, or Base44.

Owner: [drmarktzone-stack](https://github.com/drmarktzone-stack)

## Product

One sitting. One green path: **URL → scan → pick → export**. No invented prices, phones, cities, hours, or ROAS. Missing fields stay “not found on the site”. Out-of-list businesses get a **soft gate** and general lines from the page only — never a fake specialty dump.

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

1. `/?lang=ar|he|en` — paste a URL and **امسح الموقع**. Niche tiles labeled **عيّنة** are a separate demo path.
2. `/scan` — honest business card with a **niche badge**, copy marketplace **grouped by niche angles**, image grid (site photos first, unique captions).
3. `/result` — selected lines, copy-all, `.txt` pack, **1:1 feed** and **9:16 story** frames with PNG download.

`ar` and `he` render RTL. Buttons never sit grey with no action: the primary CTA always continues (empty picks auto-fill).

**Scan vs عيّنة:** Pasting a real URL and clicking Scan calls `POST /api/scan` and keeps that business in `sessionStorage` + `localStorage`. An empty or live URL is **never** returned or shown as the built-in clinic sample. If the scan fails, **أعيد المحاولة** is the primary action (same URL stays in the box). Sample is only an explicit **عيّنة** tile or the secondary link **جرّب عيّنة منفصلة** — never a mid-scan button, and it does not overwrite the typed URL. `/scan` with no stored payload shows an error and returns home with the URL; it does not inject the demo clinic.

## Smart tools (all optional, all degrade)

| Tool | What it does | Without keys |
| --- | --- | --- |
| URL scan | Name, phones, WhatsApp, services, place, **hours**, site images — extract only | Domain name + “not found” |
| Copy | Per-niche warehouse + Vertex **gemini-2.5-flash** + Search Grounding, facts-only | ≥20 distinct Palestinian-AR lines from that niche’s warehouse |
| Images | Site images first; **per-niche motifs** + unique captions; optional **gemini-2.5-flash-image** / Imagen | Motif stock + unique captions |
| Translate | Cloud Translation or Gemini from the AR base | Facts-engine HE/EN |
| Export | Text pack + 1:1 / 9:16 frames | Always local |

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

Post-deploy: `GET /api/health`, then scan `https://drsamerped.ai.studio` — expect niche **عيادات أطفال** (`pediatric_clinics`), name **عيادتي**, place **باقة الغربية**, real clinic phones, slogan only as USP, no invented القدس. A dental demo and a restaurant demo must keep their own warehouse lines (not clinic hooks). Zero fake ROAS.

## License

Private product of drmarktzone-stack.
