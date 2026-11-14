// Draws the images the backend's login emails reference by absolute URL (design/screens/sign-in-emails): the noddo
// wordmarks, the ring rows of the moment band and the slim band, the notice icons and the button arrow. Mail apps do
// not draw SVG and run no CSS colour functions, so every colour is baked into a PNG, three times its shown size.
//
//   node design/email-images.mjs
//
// Writes public/email/ from scratch; never edit a file there by hand. The backend's names for these files are in
// hris-api `EmailImages` — a renamed file here is a broken image there. The presets are `AccentPreset`'s; a preset
// added there needs a line here. A company's own HEX, and the logo's colours in Light, have no image: the band is
// drawn without its rings (Q-28 — "the band works without it").
//
// The renderer is `sharp`, which Next.js installs for its image optimiser — no dependency of our own.

import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'email');
const SCALE = 3;

const WHITE = '#FFFFFF';
const INK = '#0B0B0C';
const WINE = '#6E1630';
const WINE_500 = '#9E2F4F';
const ROSE = '#F2B8C6';
const GRAPHITE = '#2A2A2E';
const GRAY_200 = '#DADADF';
const MIST = '#F3F3F5';
const SECONDARY = '#45454A';
const PENDING_BG = '#FFF3DF';
const PENDING_ICON = '#985A00';

const PRESETS = {
  wine: '#6E1630',
  cherry: '#BE123C',
  tangerine: '#C7501E',
  sunflower: '#F5C518',
  basil: '#2E7D32',
  indigo: '#4338CA',
  ocean: '#0369A1',
  mulberry: '#5B2A6E',
  black: '#0B0B0C',
  graphite: '#2A2A2E',
};

// ── colour, exactly as AccentColors.java and lib/theme/accent.ts derive it ──────────────────────────────────────
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
/** Like CSS `color-mix(in srgb, a, b t)`: `t` is the share of `b`. */
function mix(a, b, t) {
  const x = rgb(a);
  const y = rgb(b);
  return '#' + x.map((v, i) => Math.max(0, Math.min(255, Math.round(v * (1 - t) + y[i] * t))).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function accentText(accent) {
  const backgrounds = [WHITE, mix(WHITE, accent, 0.06), mix(WHITE, accent, 0.15)];
  for (let i = 0; i <= 100; i++) {
    const c = mix(accent, '#000000', i / 100);
    if (backgrounds.every((bg) => contrast(c, bg) >= 4.5)) return c;
  }
  return '#000000';
}

// ── drawing ─────────────────────────────────────────────────────────────────────────────────────────────────────
async function png(name, svg, width, height) {
  await sharp(Buffer.from(svg), { density: 72 * SCALE })
    .resize(Math.round(width * SCALE), Math.round(height * SCALE))
    .png({ compressionLevel: 9 })
    .toFile(join(out, name));
}

// The wordmark's heavy cut (NoddoWordmark.tsx): it is shown 26 px high, under 120 px wide.
const LETTERS =
  'M-1 20H9V22.111A21 21 0 0 1 41 40V60H31V40A11 11 0 0 0 9 40V60H-1ZM47 40A21 21 0 1 1 89 40A21 21 0 1 1 47 40ZM57 40A11 11 0 1 0 79 40A11 11 0 1 0 57 40ZM95 40A21 21 0 1 1 137 40A21 21 0 1 1 95 40ZM105 40A11 11 0 1 0 127 40A11 11 0 1 0 105 40ZM127 0H137V60H127ZM143 40A21 21 0 1 1 185 40A21 21 0 1 1 143 40ZM153 40A11 11 0 1 0 175 40A11 11 0 1 0 153 40ZM175 0H185V60H175Z';
const NOD = 'M191 47A21 21 0 1 1 233 47A21 21 0 1 1 191 47ZM201 47A11 11 0 1 0 223 47A11 11 0 1 0 201 47Z';
const wordmark = (letters, nod) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 0 234 68" width="234" height="68"><path fill="${letters}" d="${LETTERS}"/><path fill="${nod}" d="${NOD}"/></svg>`;

/** The moment band's row: six rings, r 20, the second and fifth light, the fifth dropped 9 px — cut by the band's edge. */
const band = (ring, hot) => {
  const xs = [23.0, 133.8, 244.6, 355.4, 466.2, 577.0];
  const circles = xs
    .map((x, i) => {
      const isHot = i === 1 || i === 4;
      return `<circle cx="${x}" cy="${i === 4 ? 32 : 23}" r="20" fill="none" stroke="${isHot ? hot : ring}" stroke-width="6"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 36" width="600" height="36">${circles}</svg>`;
};

/** The slim band's row: four rings, r 11, the second light and dropped — the fourth cut in half by the card's edge. */
const slim = (ring, hot) => {
  const xs = [13, 75, 137, 199];
  const circles = xs
    .map((x, i) => `<circle cx="${x}" cy="${i === 1 ? 22 : 13}" r="11" fill="none" stroke="${i === 1 ? hot : ring}" stroke-width="4"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 199 36" width="199" height="36">${circles}</svg>`;
};

const STROKE = 'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const ICONS = {
  lock: `<path d="M12 14.5V17.5M13 14.5C13 15.0523 12.5523 15.5 12 15.5C11.4477 15.5 11 15.0523 11 14.5C11 13.9477 11.4477 13.5 12 13.5C12.5523 13.5 13 13.9477 13 14.5Z"/><path d="M16.5 9V6.5C16.5 4.01472 14.4853 2 12 2C9.51471 2 7.49999 4.01472 7.49999 6.5V9"/><path d="M4.2678 18.8447C4.49268 20.515 5.87612 21.8235 7.55965 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.8789 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55965 9.09909C5.87612 9.17649 4.49268 10.485 4.2678 12.1553C4.12104 13.2453 3.99999 14.3624 3.99999 15.5C3.99999 16.6376 4.12104 17.7547 4.2678 18.8447Z"/>`,
  password: `<path d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12105 13.2453 4 14.3624 4 15.5C4 16.6376 4.12105 17.7547 4.26781 18.8447Z"/><path d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9"/><path d="M12.125 15.5H12M12.25 15.5C12.25 15.6381 12.1381 15.75 12 15.75C11.8619 15.75 11.75 15.6381 11.75 15.5C11.75 15.3619 11.8619 15.25 12 15.25C12.1381 15.25 12.25 15.3619 12.25 15.5Z"/><path d="M8.125 15.5H8M8.25 15.5C8.25 15.6381 8.13807 15.75 8 15.75C7.86193 15.75 7.75 15.6381 7.75 15.5C7.75 15.3619 7.86193 15.25 8 15.25C8.13807 15.25 8.25 15.3619 8.25 15.5Z"/><path d="M16.125 15.5H16M16.25 15.5C16.25 15.6381 16.1381 15.75 16 15.75C15.8619 15.75 15.75 15.6381 15.75 15.5C15.75 15.3619 15.8619 15.25 16 15.25C16.1381 15.25 16.25 15.3619 16.25 15.5Z"/>`,
  mail: `<path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6"/><path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"/>`,
  check: `<path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"/><path d="M8 12.5L10.5 15L16 9"/>`,
  unlink: `<path d="M16.8463 14.6095L19.4558 12C21.5147 9.94113 21.5147 6.60303 19.4558 4.54416C17.397 2.48528 14.0589 2.48528 12 4.54416L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.397 2.48528 14.0589 4.54416 12L7.1537 9.39045"/><path d="M22 17H19.9211M17 22L17 19.9211"/><path d="M2 7H4.07889M7 2L7 4.07889"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 8V12L14 14"/>`,
  alert: `<path d="M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z"/><path d="M12 9V13"/><path d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z"/><path d="M21 15H3"/><path d="M21 9H3"/>`,
};
/** Which icons a good-news notice wears (M8 on, M9, M15 connected) — only those get one image per preset. */
const GOOD = ['password', 'check', 'globe'];

/** The 48 px circle with its 24 px icon, the circle baked in so Outlook does not draw a square. */
const icon = (paths, bg, color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="24" fill="${bg}"/><g transform="translate(12 12)" stroke="${color}" ${STROKE}>${paths}</g></svg>`;

/** M18's three steps: noddo's own email, so Wine only — a 44 px accent-subtle tile with a hairline of the accent. */
const STEPS = {
  look: `<path d="M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z"/><path d="M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z"/>`,
  company: `<path d="M12 2H6C3.518 2 3 2.518 3 5V22H15V5C15 2.518 14.482 2 12 2Z"/><path d="M18 8H15V22H21V11C21 8.518 20.482 8 18 8Z"/><path d="M8 6L10 6M8 9L10 9M8 12L10 12"/><path d="M11.5 22V18C11.5 17.0572 11.5 16.5858 11.2071 16.2929C10.9142 16 10.4428 16 9.5 16H8.5C7.55719 16 7.08579 16 6.79289 16.2929C6.5 16.5858 6.5 17.0572 6.5 18V22"/>`,
  team: `<path d="M18.5 7C18.5 9.20914 16.7091 11 14.5 11C12.2909 11 10.5 9.20914 10.5 7C10.5 4.79086 12.2909 3 14.5 3C16.7091 3 18.5 4.79086 18.5 7Z"/><path d="M8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5"/><path d="M14.5 14C9.8125 14 7 16.5 7 19C7 20.1046 7.83947 21 8.875 21H20.125C21.1605 21 22 20.1046 22 19C22 16.5 19.1875 14 14.5 14Z"/><path d="M4 19.9992H3.5C2.67157 19.9992 2 19.2317 2 18.2849C2 16.673 3.27307 15.0612 5.5 14.3613"/>`,
};
const step = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44"><circle cx="22" cy="22" r="21.25" fill="${mix(WHITE, WINE, 0.06)}" stroke="${mix(WHITE, WINE, 0.22)}" stroke-width="1.5"/><g transform="translate(12 12) scale(0.8333)" stroke="${accentText(WINE)}" ${STROKE}>${paths}</g></svg>`;

/** The warning line's own icon (M4's note), on the pending background. */
const warn = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g stroke="${PENDING_ICON}" ${STROKE}>${ICONS.alert}</g></svg>`;

const arrow = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><g stroke="${color}" ${STROKE}><path d="M18.5 12L4.99997 12"/><path d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"/></g></svg>`;

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'rings'), { recursive: true });
mkdirSync(join(out, 'icons'), { recursive: true });

await png('noddo-white.png', wordmark(WHITE, ROSE), (26 * 234) / 68, 26);
await png('noddo-ink.png', wordmark(INK, WINE), (26 * 234) / 68, 26);
await png('arrow-white.png', arrow(WHITE), 18, 18);
await png('arrow-graphite.png', arrow(GRAPHITE), 18, 18);
await png('icons/warning.png', warn, 18, 18);
for (const [name, paths] of Object.entries(STEPS)) {
  await png(`icons/step-${name}.png`, step(paths), 44, 44);
}

// noddo's own emails (M1, M6, M18): Wine 500 rings, the Rose ones nod.
await png('rings/band-noddo.png', band(WINE_500, ROSE), 600, 36);

for (const [key, accent] of Object.entries(PRESETS)) {
  // A company's colour: the rings are its tints (the login pane's), Light: Gray 200 with the colour nodding.
  await png(`rings/band-${key}.png`, band(mix(WHITE, accent, 0.72), mix(WHITE, accent, 0.3)), 600, 36);
  await png(`rings/band-${key}-light.png`, band(GRAY_200, accent), 600, 36);
  await png(`rings/slim-${key}.png`, slim(mix(WHITE, accent, 0.72), mix(WHITE, accent, 0.3)), 199, 36);
  await png(`rings/slim-${key}-light.png`, slim(GRAY_200, accent), 199, 36);
  for (const name of GOOD) {
    await png(`icons/${name}-${key}.png`, icon(ICONS[name], mix(WHITE, accent, 0.06), accentText(accent)), 48, 48);
  }
}
for (const [name, paths] of Object.entries(ICONS)) {
  await png(`icons/${name}-neutral.png`, icon(paths, MIST, SECONDARY), 48, 48);
  await png(`icons/${name}-pending.png`, icon(paths, PENDING_BG, PENDING_ICON), 48, 48);
}

console.log(`Wrote ${out}`);
