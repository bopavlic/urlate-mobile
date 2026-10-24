// Draws the app icons: a referee's card with a stopwatch face, on a pitch at night.
// One set per icon in assets/icons/icons.json. Run `node scripts/icons/generate.mjs`
// after changing the art; it needs rsvg-convert (`brew install librsvg`). The PNGs are committed.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = 'assets/icons';

// The icon list (ids, labels, colours) is shared with app.config.ts and the app's picker.
const ICONS = JSON.parse(readFileSync('assets/icons/icons.json', 'utf8'));

const SIZE = 1024;
const C = SIZE / 2;

/** The card with a stopwatch on it, centred on (0, 0), before rotation. */
function cardMark({ card, face }, { cutOut = false } = {}) {
  const w = 400;
  const h = 540;
  const r = 140; // stopwatch face
  const ink = cutOut ? 'black' : face;
  // Hand at "a few minutes past": the whole joke.
  const hand = { x: Math.sin(Math.PI / 5) * (r - 46), y: -Math.cos(Math.PI / 5) * (r - 46) };
  return `
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="48" fill="${cutOut ? 'white' : card}"/>
    ${cutOut ? '' : `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="48" fill="url(#sheen)"/>`}
    <g transform="translate(0 28)">
      <rect x="-28" y="${-r - 52}" width="56" height="46" rx="10" fill="${ink}"/>
      <circle r="${r}" fill="none" stroke="${ink}" stroke-width="30"/>
      <line x1="0" y1="0" x2="${hand.x}" y2="${hand.y}" stroke="${ink}" stroke-width="30" stroke-linecap="round"/>
      <circle r="22" fill="${ink}"/>
    </g>`;
}

const defs = `
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="28"/>
      <feOffset dx="0" dy="26" result="blur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

/** Mowing stripes, the halfway line and the centre circle. */
function pitch() {
  const stripes = Array.from({ length: 8 }, (_, i) =>
    i % 2 ? `<rect x="${i * 128}" y="0" width="128" height="${SIZE}" fill="#FFFFFF" fill-opacity="0.035"/>` : '',
  ).join('');
  return `${stripes}
    <g fill="none" stroke="#FFFFFF" stroke-opacity="0.13" stroke-width="12">
      <line x1="0" y1="${C}" x2="${SIZE}" y2="${C}"/>
      <circle cx="${C}" cy="${C}" r="330"/>
    </g>`;
}

/** iOS (and the store listing): full square, no transparency. */
function fullIcon(icon) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${defs}
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${icon.top}"/><stop offset="1" stop-color="${icon.bottom}"/>
  </linearGradient>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  ${pitch()}
  <g transform="translate(${C} ${C + 10}) rotate(-10)" filter="url(#shadow)">${cardMark(icon)}</g>
</svg>`;
}

/** Android adaptive foreground: the mark inside the 66% safe zone, on transparent. */
function foreground(icon) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${defs}
  <g transform="translate(${C} ${C + 8}) rotate(-10) scale(0.8)" filter="url(#shadow)">${cardMark(icon)}</g>
</svg>`;
}

/** Android themed (monochrome) icon: the card's silhouette with the stopwatch cut out. */
function monochrome(icon) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <mask id="m"><g transform="translate(${C} ${C + 8}) rotate(-10) scale(0.8)">${cardMark(icon, { cutOut: true })}</g></mask>
  <rect width="${SIZE}" height="${SIZE}" fill="#FFFFFF" mask="url(#m)"/>
</svg>`;
}

/** Splash: the mark alone; the splash background colour comes from app.config.ts. */
function splash(icon) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${defs}
  <g transform="translate(${C} ${C}) rotate(-10) scale(0.9)">${cardMark(icon)}</g>
</svg>`;
}

function render(svg, file, size = SIZE) {
  const dir = join(tmpdir(), 'urlate-icons');
  mkdirSync(dir, { recursive: true });
  const source = join(dir, 'icon.svg');
  writeFileSync(source, svg);
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', file, source]);
}

mkdirSync(OUT, { recursive: true });
for (const icon of ICONS) {
  render(fullIcon(icon), join(OUT, `${icon.id}.png`));
  render(foreground(icon), join(OUT, `${icon.id}-foreground.png`));
  // Small copies for the picker in the app.
  render(fullIcon(icon), join(OUT, `${icon.id}-preview.png`), 180);
}
const classic = ICONS[0];
render(monochrome(classic), join(OUT, 'monochrome.png'));
render(splash(classic), join(OUT, 'splash.png'));
console.log(`Wrote ${ICONS.length} icons to ${OUT}/`);
