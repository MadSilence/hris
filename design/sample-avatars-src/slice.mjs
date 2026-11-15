// Cuts the sample-company portrait sheets into avatars.
//
// Input: this folder's `women-N.*` and `men-N.*` — AI-generated contact sheets, a 5×5 grid of head-and-shoulders
// portraits separated by white gaps (generated 2026-11-15; the prompt is in `README.md`).
// Output: `public/sample-avatars/f-01.webp … f-75.webp` and `m-01.webp … m-75.webp`, 256×256, numbered sheet by
// sheet, left to right, top to bottom; and two numbered contact sheets in this folder for review.
//
// Run from `hris/`: `node design/sample-avatars-src/slice.mjs`. The seeder picks by the prefix and the number
// (`UserSeeder.avatarFor`), so replacing a sheet keeps every other face where it was.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'design/sample-avatars-src';
const OUT = 'public/sample-avatars';
const SIZE = 256;

function runs(isGap, length) {
  const found = [];
  let start = -1;
  for (let a = 0; a < length; a++) {
    const gap = isGap(a);
    if (!gap && start < 0) start = a;
    if (gap && start >= 0) { found.push([start, a]); start = -1; }
  }
  if (start >= 0) found.push([start, length]);
  return found.filter(([a, b]) => b - a > 50);
}

async function cells(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const white = (x, y) => { const i = (y * W + x) * 3; return data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230; };
  const share = (n, of) => n / of > 0.9;
  const cols = runs(x => { let n = 0, t = 0; for (let y = 0; y < H; y += 4, t++) if (white(x, y)) n++; return share(n, t); }, W);
  const rows = runs(y => { let n = 0, t = 0; for (let x = 0; x < W; x += 4, t++) if (white(x, y)) n++; return share(n, t); }, H);
  if (cols.length !== 5 || rows.length !== 5) throw new Error(`${file}: expected a 5×5 grid, found ${cols.length}×${rows.length}`);
  return rows.flatMap(([y0, y1]) => cols.map(([x0, x1]) => {
    const side = Math.min(x1 - x0, y1 - y0);
    return { left: x0 + Math.floor((x1 - x0 - side) / 2), top: y0 + Math.floor((y1 - y0 - side) / 2), width: side, height: side };
  }));
}

async function contactSheet(prefix, files) {
  const per = 15, tile = 96, pad = 8, label = 16;
  const rowsN = Math.ceil(files.length / per);
  const circle = Buffer.from(`<svg width="${tile}" height="${tile}"><circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2}"/></svg>`);
  const layers = [];
  for (const [i, f] of files.entries()) {
    const left = (i % per) * (tile + pad) + pad, top = Math.floor(i / per) * (tile + pad + label) + pad;
    layers.push({ input: await sharp(f).resize(tile, tile).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer(), left, top });
    layers.push({ input: Buffer.from(`<svg width="${tile}" height="${label}"><text x="${tile / 2}" y="13" font-family="Arial" font-size="12" text-anchor="middle">${prefix}-${String(i + 1).padStart(2, '0')}</text></svg>`), left, top: top + tile });
  }
  await sharp({ create: { width: per * (tile + pad) + pad, height: rowsN * (tile + pad + label) + pad, channels: 4, background: '#ffffff' } })
    .composite(layers).png().toFile(path.join(SRC, `contact-${prefix}.png`));
}

fs.mkdirSync(OUT, { recursive: true });
for (const [prefix, word] of [['f', 'women'], ['m', 'men']]) {
  const sheets = fs.readdirSync(SRC).filter(f => new RegExp(`^${word}-\\d+\\.(png|jpe?g|webp)$`).test(f))
    .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
  const written = [];
  for (const sheet of sheets) {
    const file = path.join(SRC, sheet);
    for (const cell of await cells(file)) {
      const out = path.join(OUT, `${prefix}-${String(written.length + 1).padStart(2, '0')}.webp`);
      await sharp(file).extract(cell).resize(SIZE, SIZE).webp({ quality: 82 }).toFile(out);
      written.push(out);
    }
  }
  await contactSheet(prefix, written);
  console.log(`${word}: ${sheets.join(', ')} → ${written.length} avatars`);
}
