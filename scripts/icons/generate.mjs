// Draws the app icons: a late ticket, slightly tilted, on the theme's colour.
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

const W = 620;
const H = 440;
const BAND = 120;
const PERFORATION = 70; // below the middle

/** The ticket's outline with the two perforation notches cut out, as a mask. */
function ticketMask(id) {
  return `<mask id="${id}">
    <rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="40" fill="white"/>
    <circle cx="${-W / 2}" cy="${PERFORATION}" r="38" fill="black"/>
    <circle cx="${W / 2}" cy="${PERFORATION}" r="38" fill="black"/>
  </mask>`;
}

/** Barcode bars along the bottom: a fixed pattern so every icon matches. */
function barcode(color) {
  const widths = [8, 4, 12, 4, 6, 10, 4, 8, 4, 14, 6, 4, 10, 4, 8, 6, 12, 4, 6, 8, 4, 10, 4, 6];
  let x = -W / 2 + 60;
  return widths
    .map((w, i) => {
      const bar =
        i % 2 === 0
          ? `<rect x="${x}" y="${PERFORATION + 50}" width="${w}" height="70" fill="${color}"/>`
          : '';
      x += w + 6;
      return bar;
    })
    .join('');
}

/** The ticket centred on (0, 0) before rotation. Monochrome draws it in one colour. */
function ticket({ ticket, band }, id, mono = false) {
  const paper = mono ? 'white' : ticket;
  const ink = mono ? 'black' : band;
  return `
    ${ticketMask(id)}
    <g mask="url(#${id})">
      <rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="${paper}"/>
      <rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${BAND}" fill="${mono ? paper : ink}"/>
      <rect x="${-W / 2 + 60}" y="${-H / 2 + BAND + 46}" width="240" height="26" rx="13" fill="${ink}" opacity="${mono ? 1 : 0.18}"/>
      <rect x="${-W / 2 + 60}" y="${-H / 2 + BAND + 96}" width="160" height="26" rx="13" fill="${ink}" opacity="${mono ? 1 : 0.18}"/>
      <line x1="${-W / 2 + 50}" y1="${PERFORATION}" x2="${W / 2 - 50}" y2="${PERFORATION}" stroke="${ink}" stroke-width="10" stroke-dasharray="22 16" opacity="${mono ? 1 : 0.3}"/>
      ${barcode(ink)}
    </g>`;
}

function svg(body, background) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="22"/>
      <feOffset dx="0" dy="22"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${background ? `<rect width="${SIZE}" height="${SIZE}" fill="${background}"/>` : ''}
  ${body}
</svg>`;
}

const placed = (scale, inner) =>
  `<g transform="translate(${C} ${C + 10}) rotate(-8) scale(${scale})" filter="url(#shadow)">${inner}</g>`;

/** iOS (and the store listing): full square, no transparency. */
const fullIcon = (icon) => svg(placed(1.14, ticket(icon, 't')), icon.background);

/** Android adaptive foreground: the ticket inside the 66% safe zone, on transparent. */
const foreground = (icon) => svg(placed(0.86, ticket(icon, 't')));

/** Android themed (monochrome) icon: the ticket's silhouette with its details cut out. */
const monochrome = (icon) =>
  svg(`<mask id="m"><g transform="translate(${C} ${C}) rotate(-8) scale(0.86)">${ticket(icon, 'mt', true)}</g></mask>
  <rect width="${SIZE}" height="${SIZE}" fill="#FFFFFF" mask="url(#m)"/>`);

/** Splash: the ticket alone; the splash background colour comes from app.config.ts. */
const splash = (icon) => svg(placed(1.2, ticket(icon, 't')));

function render(source, file, size = SIZE) {
  const dir = join(tmpdir(), 'urlate-icons');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, 'icon.svg');
  writeFileSync(path, source);
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', file, path]);
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
