export interface GcpConfig {
  project: string;
  location: string;
  model: string;
  imageModel: string;
  imagenModel: string;
  apiKey: string;
  translateKey: string;
  grounding: boolean;
}

export function gcpConfig(): GcpConfig {
  return {
    project:
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCP_PROJECT ||
      process.env.VERTEX_PROJECT ||
      "",
    location:
      process.env.GOOGLE_CLOUD_LOCATION ||
      process.env.VERTEX_LOCATION ||
      process.env.GCP_LOCATION ||
      "me-west1",
    model: process.env.VERTEX_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash",
    imageModel: process.env.VERTEX_IMAGE_MODEL || "gemini-2.5-flash-image",
    imagenModel: process.env.IMAGEN_MODEL || "imagen-3.0-generate-002",
    apiKey:
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.VERTEX_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      "",
    translateKey:
      process.env.GOOGLE_TRANSLATE_API_KEY ||
      process.env.TRANSLATE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "",
    grounding: (process.env.VERTEX_GROUNDING ?? "1") !== "0",
  };
}

export function toolsAvailable() {
  const c = gcpConfig();
  return {
    gemini: Boolean(c.apiKey || c.project),
    translate: Boolean(c.translateKey || c.apiKey || c.project),
    imagen: Boolean(c.apiKey || c.project),
    grounding: Boolean(c.grounding && (c.apiKey || c.project)),
  };
}

async function metadataToken(): Promise<string | null> {
  try {
    const res = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(1500),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function vertexAuth(): Promise<{ bearer?: string; key?: string } | null> {
  const c = gcpConfig();
  if (c.apiKey && c.project) return { key: c.apiKey };
  const token = c.project ? await metadataToken() : null;
  if (token) return { bearer: token };
  if (c.apiKey) return { key: c.apiKey };
  return null;
}

function vertexUrls(model: string, method: "generateContent" | "predict"): string[] {
  const c = gcpConfig();
  const urls: string[] = [];
  if (c.project) {
    const loc = c.location || "me-west1";
    if (loc === "global") {
      urls.push(
        `https://aiplatform.googleapis.com/v1/projects/${c.project}/locations/global/publishers/google/models/${model}:${method}`,
      );
    } else {
      urls.push(
        `https://${loc}-aiplatform.googleapis.com/v1/projects/${c.project}/locations/${loc}/publishers/google/models/${model}:${method}`,
      );
      urls.push(
        `https://aiplatform.googleapis.com/v1/projects/${c.project}/locations/global/publishers/google/models/${model}:${method}`,
      );
    }
  }
  return urls;
}

export async function vertexGenerate(opts: {
  model?: string;
  prompt: string;
  grounding?: boolean;
  temperature?: number;
}): Promise<string | null> {
  const c = gcpConfig();
  const auth = await vertexAuth();
  const model = opts.model || c.model;
  const body = {
    contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
    generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: 4096 },
    tools: opts.grounding && c.grounding ? [{ googleSearch: {} }] : undefined,
  };

  if (auth?.bearer || (auth?.key && c.project)) {
    for (const url of vertexUrls(model, "generateContent")) {
      const qs = auth.key ? `${url}?key=${encodeURIComponent(auth.key)}` : url;
      const res = await fetch(qs, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth.bearer ? { Authorization: `Bearer ${auth.bearer}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(14000),
      }).catch(() => null);
      const text = await readGenerateText(res);
      if (text) return text;
    }
  }

  if (c.apiKey) {
    const studio = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(c.apiKey)}`;
    const res = await fetch(studio, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: body.generationConfig,
        tools: opts.grounding ? [{ google_search: {} }] : undefined,
      }),
      signal: AbortSignal.timeout(14000),
    }).catch(() => null);
    const text = await readGenerateText(res);
    if (text) return text;
  }

  return null;
}

async function readGenerateText(res: Response | null): Promise<string | null> {
  if (!res || !res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function vertexPredict(model: string, payload: unknown): Promise<unknown | null> {
  const c = gcpConfig();
  const auth = await vertexAuth();
  if (!c.project || !auth) return null;
  for (const url of vertexUrls(model, "predict")) {
    const qs = auth.key ? `${url}?key=${encodeURIComponent(auth.key)}` : url;
    const res = await fetch(qs, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth.bearer ? { Authorization: `Bearer ${auth.bearer}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(18000),
    }).catch(() => null);
    if (res?.ok) return res.json();
  }
  return null;
}
