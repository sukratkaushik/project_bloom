#!/usr/bin/env node
/*
 * Compose all logo-derived assets by EMBEDDING the canonical
 * logo/logo.png as a data: URI inside an SVG, then rendering via
 * Playwright. The logo PNG is never redrawn — only placed.
 *
 * Run from the repo root:
 *   cd ~/gitclones/Project_Bloom_Design
 *   npm install playwright  # one-time
 *   npx playwright install chromium  # one-time
 *   node BloomDesign/design-system/build-logo-assets.mjs
 *
 * All output paths are resolved relative to this file's parent (the
 * design-system folder), so it works regardless of cwd.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve everything relative to the design-system folder (this script's parent).
const DS_ROOT = __dirname;
const out = (p) => path.join(DS_ROOT, p);

const LOGO_PATH = out('logo/logo.png');
const logoBuf = await fs.readFile(LOGO_PATH);
const logoDataUri = `data:image/png;base64,${logoBuf.toString('base64')}`;

const FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Nunito:wght@400;600&display=swap" rel="stylesheet">';

const COLORS = {
  cream: '#FDFBF7',
  charcoal: '#2C3E50',
  medium: '#6B7A87',
  sage: '#8AB6A3',
};

// -- Helpers -------------------------------------------------------

function svgWrap({ width, height, bg = COLORS.cream, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${body}
</svg>`;
}

async function renderToPng({ svg, outPath, width, height, scale = 2 }) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}
    <style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
  </head><body>${svg}</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('svg');
  await el.screenshot({ path: outPath, omitBackground: false });
  await browser.close();
  console.log(`✓ ${outPath} (${width * scale}×${height * scale})`);
}

// -- Templates -----------------------------------------------------

/** 1. Mark only — just the canonical PNG, framed on Sandalwood. */
function svgMark({ size = 1024 }) {
  // Inset by 8% so there's clear space on a presentation card
  const inset = Math.round(size * 0.08);
  const inner = size - inset * 2;
  const body = `<image href="${logoDataUri}" x="${inset}" y="${inset}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet"/>`;
  return svgWrap({ width: size, height: size, body });
}

/** 2. Horizontal lockup — mark on left, Playfair italic wordmark on right. */
function svgLockupHorizontal({ width = 1800, height = 400 }) {
  // Mark fills the left ~22% with vertical centering
  const markSize = Math.round(height * 0.85);
  const markX = Math.round(height * 0.1);
  const markY = Math.round((height - markSize) / 2);
  const textX = markX + markSize + Math.round(height * 0.12);
  const textY = Math.round(height * 0.62);
  const fontSize = Math.round(height * 0.45);
  const body = `
    <image href="${logoDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${textX}" y="${textY}"
      font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500"
      font-size="${fontSize}" fill="${COLORS.charcoal}" letter-spacing="-0.5">Our Pregnancy</text>`;
  return svgWrap({ width, height, body });
}

/** 3. Stacked lockup — mark centered top, wordmark + tagline below. */
function svgLockupStacked({ width = 1200, height = 1200 }) {
  const markSize = Math.round(width * 0.5);
  const markX = Math.round((width - markSize) / 2);
  const markY = Math.round(height * 0.08);
  const wordX = width / 2;
  const wordY = markY + markSize + Math.round(height * 0.12);
  const tagY = wordY + Math.round(height * 0.06);
  const wordSize = Math.round(width * 0.085);
  const tagSize = Math.round(width * 0.028);
  const body = `
    <image href="${logoDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${wordX}" y="${wordY}" text-anchor="middle"
      font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500"
      font-size="${wordSize}" fill="${COLORS.charcoal}" letter-spacing="-0.5">Our Pregnancy</text>
    <text x="${wordX}" y="${tagY}" text-anchor="middle"
      font-family="'Nunito', sans-serif" font-weight="400"
      font-size="${tagSize}" fill="${COLORS.medium}" letter-spacing="0.02em">Your pregnancy companion</text>`;
  return svgWrap({ width, height, body });
}

/** 4. Favicon — mark inside a rounded Sandalwood tile. */
function svgFavicon({ size = 512 }) {
  const radius = Math.round(size * 0.23);
  const inset = Math.round(size * 0.08);
  const inner = size - inset * 2;
  const body = `
    <defs><clipPath id="r"><rect width="${size}" height="${size}" rx="${radius}"/></clipPath></defs>
    <g clip-path="url(#r)">
      <rect width="${size}" height="${size}" fill="${COLORS.cream}"/>
      <image href="${logoDataUri}" x="${inset}" y="${inset}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet"/>
    </g>`;
  // Use transparent body wrapper so the rounded corners cut cleanly
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${body}</svg>`;
}

/** 5b. Instagram knowledge tip (1080×1350) */
function svgInstaKnowledgeTip({ width = 1080, height = 1350 }) {
  const markSize = 110;
  const markX = 80;
  const markY = 70;
  const wordX = markX + markSize + 24;
  const wordY = markY + 80;
  // Body card
  const cardX = 100;
  const cardY = 660;
  const cardW = width - cardX * 2;
  const cardH = 480;
  return svgWrap({ width, height, body: `
    <image href="${logoDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${wordX}" y="${wordY}" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500" font-size="44" fill="${COLORS.charcoal}">Our Pregnancy</text>

    <text x="${width/2}" y="290" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="700" font-size="24" letter-spacing="3" fill="${COLORS.sage}">WEEK 9 · DAILY KNOWLEDGE DROP</text>

    <text x="${width/2}" y="510" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500" font-size="180" fill="${COLORS.charcoal}">2.3 cm</text>
    <text x="${width/2}" y="570" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="600" font-size="32" fill="${COLORS.medium}">Your baby this week</text>

    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="24" fill="#E9F5E9"/>
    <text x="${width/2}" y="${cardY+100}" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="500" font-size="46" fill="${COLORS.charcoal}">From a cell to a brain</text>
    <text x="${width/2}" y="${cardY+155}" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="500" font-size="46" fill="${COLORS.charcoal}">in 9 weeks.</text>
    <text x="${width/2}" y="${cardY+260}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="400" font-size="28" fill="${COLORS.charcoal}">The heart is now fully formed</text>
    <text x="${width/2}" y="${cardY+304}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="400" font-size="28" fill="${COLORS.charcoal}">with four chambers — and you</text>
    <text x="${width/2}" y="${cardY+348}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="400" font-size="28" fill="${COLORS.charcoal}">might be feeling the changes too.</text>

    <text x="${width/2}" y="${height-90}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="600" font-size="22" fill="${COLORS.medium}">ourpregnancy.in · Made for Indian mothers 🇮🇳</text>
  `});
}

/** 5c. LinkedIn stat card (1200×627) */
function svgLinkedinStat({ width = 1200, height = 627 }) {
  const markSize = 70;
  const markX = 60;
  const markY = 50;
  const wordX = markX + markSize + 20;
  const wordY = markY + 50;
  return svgWrap({ width, height, body: `
    <image href="${logoDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${wordX}" y="${wordY}" font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500" font-size="36" fill="${COLORS.charcoal}">Our Pregnancy</text>

    <text x="${width/2}" y="340" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="500" font-size="180" fill="${COLORS.charcoal}">27M</text>
    <text x="${width/2}" y="410" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="600" font-size="34" fill="${COLORS.charcoal}">pregnancies in India every year</text>
    <text x="${width/2}" y="455" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="400" font-size="22" fill="${COLORS.medium}">Source: Govt of India MOHFW, 2024</text>

    <text x="${width-72}" y="${height-50}" text-anchor="end" font-family="'Nunito', sans-serif" font-weight="600" font-size="20" fill="${COLORS.medium}">ourpregnancy.in</text>
  `});
}

/** 5. OG image (1200×630) — stacked lockup with domain pill. */
function svgOgImage({ width = 1200, height = 630 }) {
  const markSize = 200;
  const markX = (width - markSize) / 2;
  const markY = 80;
  const wordX = width / 2;
  const wordY = markY + markSize + 70;
  const tagY = wordY + 50;
  const pillW = 200;
  const pillH = 48;
  const pillX = (width - pillW) / 2;
  const pillY = tagY + 40;
  const body = `
    <image href="${logoDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${wordX}" y="${wordY}" text-anchor="middle"
      font-family="'Playfair Display', Georgia, serif" font-style="italic" font-weight="500"
      font-size="60" fill="${COLORS.charcoal}" letter-spacing="-0.5">Our Pregnancy</text>
    <text x="${wordX}" y="${tagY}" text-anchor="middle"
      font-family="'Nunito', sans-serif" font-weight="400"
      font-size="24" fill="${COLORS.medium}">Your pregnancy companion — secure &amp; synced.</text>
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${pillH/2}" fill="${COLORS.sage}"/>
    <text x="${wordX}" y="${pillY + 32}" text-anchor="middle"
      font-family="'Nunito', sans-serif" font-weight="700"
      font-size="20" fill="#FFFFFF">ourpregnancy.in</text>`;
  return svgWrap({ width, height, body });
}

// -- Build queue ---------------------------------------------------

const targets = [
  {
    name: 'mark',
    svg: svgMark({ size: 1024 }),
    out: out('logo/mark.png'),
    width: 1024, height: 1024,
  },
  {
    name: 'lockup-horizontal',
    svg: svgLockupHorizontal({ width: 1800, height: 400 }),
    out: out('logo/lockup-horizontal.png'),
    width: 1800, height: 400,
  },
  {
    name: 'lockup-stacked',
    svg: svgLockupStacked({ width: 1200, height: 1200 }),
    out: out('logo/lockup-stacked.png'),
    width: 1200, height: 1200,
  },
  {
    name: 'favicon',
    svg: svgFavicon({ size: 512 }),
    out: out('logo/favicon.png'),
    width: 512, height: 512,
  },
  {
    name: 'og-image',
    svg: svgOgImage({ width: 1200, height: 630 }),
    out: out('assets/templates/web/og-image-1200x630.png'),
    width: 1200, height: 630,
  },
  {
    name: 'instagram-knowledge-tip',
    svg: svgInstaKnowledgeTip({ width: 1080, height: 1350 }),
    out: out('assets/templates/social-instagram/template-A-knowledge-tip.png'),
    width: 1080, height: 1350,
  },
  {
    name: 'linkedin-stat-card',
    svg: svgLinkedinStat({ width: 1200, height: 627 }),
    out: out('assets/templates/social-linkedin/template-stat-card.png'),
    width: 1200, height: 627,
  },
];

// Also save the source SVGs (these embed the real PNG via data: URI — no recreation)
for (const t of targets) {
  await fs.mkdir(path.dirname(t.out), { recursive: true });
  await renderToPng({ svg: t.svg, outPath: t.out, width: t.width, height: t.height, scale: 2 });
}

console.log('\nDone.');
