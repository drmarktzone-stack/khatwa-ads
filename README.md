# خطوة Ads / Khatwa Ads

Paste a local business URL → honest scan → a marketplace of **20+ distinct** Palestinian-Arabic lines (Hebrew / English via translation) and niche images → multi-select → copy pack + **1:1 and 9:16** ad frames.

Greenfield app. It does **not** use sawek-ad, OmniAd, AdBrain, or Base44.

Owner: [drmarktzone-stack](https://github.com/drmarktzone-stack)

## Product

One sitting. One green path: **URL → scan → pick → export**. No invented prices, phones, cities, hours, or ROAS. Missing fields stay “not found on the site”. Out-of-niche businesses get a soft message and general lines from the page only.

**Niches:** clinics / dental / aesthetic, tutoring, restaurants & cafés, renovation / contractors, boutique fitness.

Arabic (`ar`) is Palestinian colloquial and the generation base. `he` / `en` are translations of that base (Cloud Translation or Gemini when keys exist; otherwise the facts engine in that language).

## Journey

1. `/?lang=ar|he|en` — paste a URL (or tap a niche sample) and scan.
2. `/scan` — honest business card + copy marketplace + image grid (site photos first, unique captions).
3. `/result` — selected lines, copy-all, `.txt` pack, **1:1 feed** and **9:16 story** frames with PNG download.

`ar` and `he` render RTL. Buttons never sit grey with no action: the primary CTA always continues (empty picks auto-fill; empty URL uses a clinic sample).

## Smart tools (all optional, all degrade)

| Tool | What it does | Without keys |
| --- | --- | --- |
| URL scan | Name, phones, WhatsApp, services, place, **hours**, site images — extract only | Domain name + “not found” |
| Copy | Vertex **gemini-2.5-flash** + Search Grounding, facts-only | ≥20 distinct Palestinian-AR lines (name / place / WhatsApp / pain / USP) |
| Images | Site images first; niche stock with unique captions; optional **gemini-2.5-flash-image** / Imagen | Stock + unique captions |
| Translate | Cloud Translation or Gemini from the AR base | Facts-engine HE/EN |
| Export | Text pack + 1:1 / 9:16 frames | Always local |

No engine-chrome slogans in the ad lines. No identical caption on every tile. No scavenger forms.

## Stack

Next.js App Router, TypeScript, Tailwind. Cloud Run ready (`PORT=8080`). Works offline.

## Local

```bash
npm install
npm run dev
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

## License

Private product of drmarktzone-stack.
