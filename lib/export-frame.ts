import type { CopyLine, NicheImage } from "./types";

export async function downloadAdPng(opts: {
  ratio: "1:1" | "9:16";
  name: string;
  headline: string;
  cta: string;
  image?: NicheImage;
}): Promise<void> {
  const [w, h] = opts.ratio === "1:1" ? [1080, 1080] : [1080, 1920];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#145C39";
  ctx.fillRect(0, 0, w, h);

  if (opts.image?.src && !opts.image.src.startsWith("data:")) {
    try {
      const img = await loadImage(opts.image.src);
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } catch {
      /* keep green fill */
    }
  }

  const fade = ctx.createLinearGradient(0, h * 0.45, 0, h);
  fade.addColorStop(0, "rgba(20,48,40,0)");
  fade.addColorStop(1, "rgba(20,48,40,0.88)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#F5C518";
  ctx.fillRect(0, 0, w, 18);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${opts.ratio === "1:1" ? 42 : 36}px Cairo, Heebo, sans-serif`;
  wrapText(ctx, opts.name, 64, 80, w - 128, 48);

  ctx.fillStyle = "#FFF6D4";
  ctx.font = `800 ${opts.ratio === "1:1" ? 64 : 72}px Cairo, Heebo, sans-serif`;
  wrapText(ctx, opts.headline, 64, h - (opts.ratio === "1:1" ? 280 : 420), w - 128, 78);

  const pillW = Math.min(w - 128, 520);
  const pillH = 88;
  const pillX = 64;
  const pillY = h - 160;
  roundRect(ctx, pillX, pillY, pillW, pillH, 28, "#1B7F4E");
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 36px Cairo, Heebo, sans-serif";
  ctx.fillText(opts.cta, pillX + 28, pillY + 56);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `khatwa-${opts.ratio.replace(":", "x")}.png`;
  a.click();
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
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
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function frameCopy(headline?: CopyLine, cta?: CopyLine): { headline: string; cta: string } {
  return {
    headline: headline?.text || "",
    cta: cta?.ctaLabel || headline?.ctaLabel || "",
  };
}
