# خطوة Ads / Khatwa Ads

Paste a local business URL → honest scan (name, phone, services, place) → a marketplace of **20+ distinct** Palestinian-Arabic / Hebrew / English Meta lines and niche images → multi-select → copy pack + a simple ad mock.

Greenfield app. It does **not** use or depend on sawek-ad, OmniAd, AdBrain, or Base44.

Owner: [drmarktzone-stack](https://github.com/drmarktzone-stack)

## Promise

One sitting. One primary green CTA. No invented prices, phones, cities, or ROAS. Out-of-niche businesses get a clear soft message and general lines built only from what is on the page.

**Niches:** medical / dental / aesthetic clinics, tutoring, restaurants & cafés, renovation / contractors, boutique fitness.

## Journey

1. Home `/?lang=ar|he|en` — paste a URL and **Scan** (or tap a sample).
2. `/scan` — business card + copy marketplace + image grid (unique captions).
3. `/result` — selected creatives, copy-all, download `.txt` pack, Meta-style mock.

Arabic (`ar`) is Palestinian colloquial. `ar` and `he` render RTL.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Optional Vertex / Gemini via env — **facts-only**. If the key is missing or the model refuses the guardrails, the built-in copy engine is used.
- Works offline / without AI: domain-name facts + demo samples + template lines.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (add `?lang=he` or `?lang=en` to switch).

```bash
npm run build
PORT=8080 npm start
```

## Environment (all optional)

Copy `.env.example`. The app never requires a model key.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Google AI Studio Gemini rewrite (facts only) |
| `GOOGLE_CLOUD_PROJECT` + `VERTEX_API_KEY` | Vertex Gemini on Cloud Run |
| `VERTEX_LOCATION` | default `us-central1` |
| `VERTEX_MODEL` | default `gemini-2.0-flash` |
| `PORT` | default `8080` (Cloud Run) |

## Cloud Run

The image listens on `0.0.0.0:$PORT` (Docker `PORT=8080`).

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/khatwa-ads
gcloud run deploy khatwa-ads \
  --image REGION-docker.pkg.dev/PROJECT/REPO/khatwa-ads \
  --region REGION \
  --port 8080 \
  --allow-unauthenticated
```

`Dockerfile` uses Next.js `output: "standalone"`. Health check: `GET /api/health`.

If Gemini is not configured on the service, scans still succeed with the facts fallback.

## Honest scan

The scanner reads the live HTML when the network allows it (title / JSON-LD / `tel:` / visible place names / listed services). Missing fields are labeled **not found on the site** — they are never filled with a guessed city or number. If the fetch fails, only the domain name is used.

## License

Private product of drmarktzone-stack.
