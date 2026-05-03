import sharp from "sharp";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const TEMPLATE_PATHS = [
  path.resolve(process.cwd(), "client/public/share-card-template.png"),
  path.resolve(process.cwd(), "dist/public/share-card-template.png"),
  path.resolve(process.cwd(), "server/public/share-card-template.png"),
];

// Simple in-memory LRU-ish cache for rendered cards.
const CACHE_LIMIT = 200;
const cache = new Map<string, { png: Buffer; etag: string }>();

function cacheGet(key: string) {
  const v = cache.get(key);
  if (v) {
    cache.delete(key);
    cache.set(key, v);
  }
  return v;
}

function cacheSet(key: string, value: { png: Buffer; etag: string }) {
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

export function shareCardKey(jobId: number, jobTitle: string): string {
  return `${jobId}:${crypto
    .createHash("sha1")
    .update(jobTitle)
    .digest("hex")
    .slice(0, 12)}`;
}

let cachedTemplate: Buffer | null = null;

function loadTemplate(): Buffer | null {
  if (cachedTemplate) return cachedTemplate;
  for (const p of TEMPLATE_PATHS) {
    if (fs.existsSync(p)) {
      cachedTemplate = fs.readFileSync(p);
      return cachedTemplate;
    }
  }
  return null;
}

function getDynamicFontSize(title: string): number {
  const len = title.length;
  if (len <= 14) return 56;
  if (len <= 20) return 46;
  if (len <= 28) return 38;
  if (len <= 38) return 30;
  if (len <= 50) return 24;
  return 20;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  // Pre-split long unbroken tokens (no whitespace longer than maxCharsPerLine).
  const safeTokens: string[] = [];
  for (const tok of text.split(/\s+/)) {
    if (tok.length <= maxCharsPerLine) {
      safeTokens.push(tok);
    } else {
      for (let i = 0; i < tok.length; i += maxCharsPerLine) {
        safeTokens.push(tok.slice(i, i + maxCharsPerLine));
      }
    }
  }

  const lines: string[] = [];
  let current = "";
  for (const w of safeTokens) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  const consumedTokenCount = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (lines.length === maxLines && safeTokens.length > consumedTokenCount) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] =
      last.length > maxCharsPerLine - 1 ? last.slice(0, maxCharsPerLine - 1) + "…" : last + "…";
  }
  return lines;
}

function buildOverlaySvg(jobTitle: string): Buffer {
  const upper = (jobTitle || "JOB OPPORTUNITY").toUpperCase();
  const fontSize = getDynamicFontSize(upper);

  // Card dimensions: 1080x1080. Pill at top:39%, left:26%, width:50%, height:12% (min)
  const cardW = 1080;
  const cardH = 1080;
  const pillX = Math.round(cardW * 0.26);
  const pillY = Math.round(cardH * 0.39);
  const pillW = Math.round(cardW * 0.5);
  const pillBaseH = Math.round(cardH * 0.12);

  // Approximate chars per line based on pill width and font size
  // (rough heuristic: avg char width ~ fontSize * 0.55 for bold uppercase)
  const charWidthPx = fontSize * 0.55;
  const usableWidth = pillW - 56; // subtract padding
  const maxCharsPerLine = Math.max(6, Math.floor(usableWidth / charWidthPx));
  const lines = wrapText(upper, maxCharsPerLine, 3);

  const lineHeight = Math.round(fontSize * 1.15);
  const textBlockH = lines.length * lineHeight;
  const verticalPadding = 32;
  const pillH = Math.max(pillBaseH, textBlockH + verticalPadding * 2);

  // Center text vertically within pill
  const textStartY = pillY + (pillH - textBlockH) / 2 + fontSize * 0.85;

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${pillX + pillW / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="20" ry="20" fill="#1a1a1a" filter="url(#shadow)"/>
  <text
    x="${pillX + pillW / 2}"
    y="${textStartY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    fill="#ffffff"
    text-anchor="middle"
    letter-spacing="1"
  >${tspans}</text>
</svg>`;

  return Buffer.from(svg);
}

export async function generateShareCardPng(
  jobId: number,
  jobTitle: string
): Promise<{ png: Buffer; etag: string } | null> {
  const key = shareCardKey(jobId, jobTitle);
  const hit = cacheGet(key);
  if (hit) return hit;

  const template = loadTemplate();
  if (!template) {
    console.error("[share-card] template image not found in any expected path");
    return null;
  }
  try {
    const overlay = buildOverlaySvg(jobTitle);
    const png = await sharp(template)
      .resize(1080, 1080, { fit: "cover" })
      .composite([{ input: overlay, top: 0, left: 0 }])
      .png({ compressionLevel: 8, quality: 90 })
      .toBuffer();
    const etag = `"${key}"`;
    const result = { png, etag };
    cacheSet(key, result);
    return result;
  } catch (err) {
    console.error("[share-card] generation failed:", err);
    return null;
  }
}
