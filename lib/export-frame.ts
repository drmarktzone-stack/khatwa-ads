import type { AdLayoutId, Lang, NicheImage } from "./types";

export interface FrameDrawOpts {
  ratio: "1:1" | "9:16";
  layoutId?: AdLayoutId;
  name: string;
  headline: string;
  cta: string;
  place?: string;
  phone?: string;
  image?: NicheImage;
  lang?: Lang;
}

export async function renderAdPng(opts: FrameDrawOpts): Promise<string | null> {
  const [w, h] = opts.ratio === "1:1" ? [1080, 1080] : [1080, 1920];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rtl = opts.lang === "ar" || opts.lang === "he";
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";

  ctx.fillStyle = "#145C39";
  ctx.fillRect(0, 0, w, h);
  await paintPhoto(ctx, w, h, opts.image);

  const layout = opts.layoutId || (opts.ratio === "9:16" ? "story_stack" : "feed_bold");
  if (layout === "feed_card") drawFeedCard(ctx, w, h, opts, rtl);
  else if (layout === "feed_split") drawFeedSplit(ctx, w, h, opts, rtl);
  else if (layout === "story_banner") drawStoryBanner(ctx, w, h, opts, rtl);
  else if (layout === "story_glass") drawStoryGlass(ctx, w, h, opts, rtl);
  else drawBold(ctx, w, h, opts, rtl, opts.ratio === "9:16");

  return canvas.toDataURL("image/png");
}

export async function downloadAdPng(opts: FrameDrawOpts): Promise<void> {
  const data = await renderAdPng(opts);
  if (!data) return;
  const a = document.createElement("a");
  a.href = data;
  a.download = `khatwa-${(opts.layoutId || opts.ratio).replace(":", "x")}.png`;
  a.click();
}

async function paintPhoto(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  image?: NicheImage,
): Promise<void> {
  if (!image?.src || image.src.startsWith("data:")) return;
  try {
    const img = await loadImage(image.src);
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } catch {
    /* keep green fill */
  }
}

function fadeBottom(ctx: CanvasRenderingContext2D, w: number, h: number, from = 0.42) {
  const fade = ctx.createLinearGradient(0, h * from, 0, h);
  fade.addColorStop(0, "rgba(20,48,40,0)");
  fade.addColorStop(1, "rgba(20,48,40,0.9)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);
}

function yellowBar(ctx: CanvasRenderingContext2D, w: number) {
  ctx.fillStyle = "#F5C518";
  ctx.fillRect(0, 0, w, 18);
}

function limeBar(ctx: CanvasRenderingContext2D, w: number, y: number, h: number) {
  ctx.fillStyle = "#D6F26A";
  ctx.fillRect(0, y, w, h);
}

function drawBold(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: FrameDrawOpts,
  rtl: boolean,
  tall: boolean,
) {
  fadeBottom(ctx, w, h, tall ? 0.5 : 0.45);
  yellowBar(ctx, w);
  const x = rtl ? w - 64 : 64;
  ctx.fillStyle = "#D6F26A";
  ctx.font = `800 ${tall ? 36 : 40}px Cairo, Heebo, sans-serif`;
  wrapText(ctx, opts.name, x, tall ? 90 : 80, w - 128, 48, rtl);
  const meta = [opts.place, opts.phone].filter(Boolean).join(rtl ? "  ·  " : "  ·  ");
  if (meta) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 32px Cairo, Heebo, sans-serif";
    wrapText(ctx, meta, x, h - (tall ? 520 : 360), w - 128, 40, rtl);
  }
  ctx.fillStyle = "#FFF6D4";
  ctx.font = `800 ${tall ? 70 : 62}px Cairo, Heebo, sans-serif`;
  wrapText(ctx, opts.headline, x, h - (tall ? 420 : 280), w - 128, 78, rtl);
  drawCta(ctx, w, h, opts.cta, rtl);
}

function drawFeedCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: FrameDrawOpts,
  rtl: boolean,
) {
  yellowBar(ctx, w);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, h * 0.58, w, h * 0.42);
  const x = rtl ? w - 64 : 64;
  ctx.fillStyle = "#143028";
  ctx.font = "800 40px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.name, x, h * 0.58 + 64, w - 128, 46, rtl);
  ctx.fillStyle = "#4F6B5E";
  ctx.font = "700 30px Cairo, Heebo, sans-serif";
  const meta = [opts.place, opts.phone].filter(Boolean).join("  ·  ");
  if (meta) wrapText(ctx, meta, x, h * 0.58 + 118, w - 128, 38, rtl);
  ctx.fillStyle = "#143028";
  ctx.font = "800 48px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.headline, x, h * 0.58 + 180, w - 128, 54, rtl);
  drawCta(ctx, w, h, opts.cta, rtl, 48);
}

function drawFeedSplit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: FrameDrawOpts,
  rtl: boolean,
) {
  ctx.fillStyle = "rgba(20,92,57,0.92)";
  if (rtl) ctx.fillRect(0, 0, w * 0.5, h);
  else ctx.fillRect(w * 0.5, 0, w * 0.5, h);
  limeBar(ctx, w, 0, 18);
  const x = rtl ? w * 0.5 - 48 : w * 0.5 + 48;
  const max = w * 0.5 - 96;
  ctx.fillStyle = "#D6F26A";
  ctx.font = "800 34px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.name, x, 90, max, 42, rtl);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 52px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.headline, x, 180, max, 60, rtl);
  const meta = [opts.place, opts.phone].filter(Boolean).join("\n");
  if (meta) {
    ctx.font = "700 28px Cairo, Heebo, sans-serif";
    wrapText(ctx, meta, x, h - 280, max, 38, rtl);
  }
  const pillW = Math.min(max, 420);
  const pillX = rtl ? x - pillW : x;
  roundRect(ctx, pillX, h - 160, pillW, 80, 24, "#D6F26A");
  ctx.fillStyle = "#143028";
  ctx.font = "800 30px Cairo, Heebo, sans-serif";
  ctx.fillText(opts.cta, rtl ? pillX + pillW - 24 : pillX + 24, h - 108);
}

function drawStoryBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: FrameDrawOpts,
  rtl: boolean,
) {
  limeBar(ctx, w, 0, 168);
  const x = rtl ? w - 56 : 56;
  ctx.fillStyle = "#143028";
  ctx.font = "800 42px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.name, x, 72, w - 112, 50, rtl);
  if (opts.place) {
    ctx.font = "700 30px Cairo, Heebo, sans-serif";
    wrapText(ctx, opts.place, x, 126, w - 112, 36, rtl);
  }
  fadeBottom(ctx, w, h, 0.62);
  ctx.fillStyle = "#FFF6D4";
  ctx.font = "800 64px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.headline, x, h - 360, w - 112, 74, rtl);
  if (opts.phone) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 32px Cairo, Heebo, sans-serif";
    wrapText(ctx, opts.phone, x, h - 220, w - 112, 40, rtl);
  }
  drawCta(ctx, w, h, opts.cta, rtl);
}

function drawStoryGlass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: FrameDrawOpts,
  rtl: boolean,
) {
  const cardW = w - 96;
  const cardH = 620;
  const cardX = 48;
  const cardY = h * 0.28;
  roundRect(ctx, cardX, cardY, cardW, cardH, 40, "rgba(20,48,40,0.72)");
  const x = rtl ? cardX + cardW - 40 : cardX + 40;
  ctx.fillStyle = "#D6F26A";
  ctx.font = "800 36px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.name, x, cardY + 70, cardW - 80, 44, rtl);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 56px Cairo, Heebo, sans-serif";
  wrapText(ctx, opts.headline, x, cardY + 150, cardW - 80, 64, rtl);
  ctx.fillStyle = "#E7F6EE";
  ctx.font = "700 30px Cairo, Heebo, sans-serif";
  const meta = [opts.place, opts.phone].filter(Boolean).join("  ·  ");
  if (meta) wrapText(ctx, meta, x, cardY + 400, cardW - 80, 40, rtl);
  const pillW = Math.min(cardW - 80, 480);
  const pillX = rtl ? x - pillW : x;
  roundRect(ctx, pillX, cardY + cardH - 110, pillW, 72, 22, "#D6F26A");
  ctx.fillStyle = "#143028";
  ctx.font = "800 28px Cairo, Heebo, sans-serif";
  ctx.fillText(opts.cta, rtl ? pillX + pillW - 22 : pillX + 22, cardY + cardH - 62);
}

function drawCta(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cta: string,
  rtl: boolean,
  bottom = 64,
) {
  const pillW = Math.min(w - 128, 560);
  const pillH = 88;
  const pillX = rtl ? w - 64 - pillW : 64;
  const pillY = h - bottom - pillH;
  roundRect(ctx, pillX, pillY, pillW, pillH, 28, "#1B7F4E");
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 34px Cairo, Heebo, sans-serif";
  ctx.fillText(cta, rtl ? pillX + pillW - 28 : pillX + 28, pillY + 56);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  lh: number,
  rtl = false,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lh;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  void rtl;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function frameCopy(
  headline?: { text?: string; ctaLabel?: string },
  cta?: { ctaLabel?: string },
): { headline: string; cta: string } {
  return {
    headline: headline?.text || "",
    cta: cta?.ctaLabel || headline?.ctaLabel || "",
  };
}
