# Sample portraits — the source

The faces of the example company's people (`DECISIONS.md` A2: our own set, not a third-party service). Generated in
ChatGPT on 2026-11-15 as six contact sheets of 25, cut into `public/sample-avatars/` by `slice.mjs`.

| File | What |
|---|---|
| `women-1…3.jpg`, `men-1…3.jpg` | the sheets: a 5×5 grid with white gaps, numbered left to right, top to bottom |
| `slice.mjs` | cuts every sheet into 256×256 WebP — `f-01…f-75`, `m-01…m-75` — and writes the contact sheets |
| `contact-f.png`, `contact-m.png` | every avatar in a circle with its number, for review |

The seeder (`hris-api` → `UserSeeder`) takes a face by its prefix and number, and the prefix decides the first name:
`f` a woman's, `m` a man's. **The number of faces per sex is `UserSeeder.PORTRAITS_PER_SEX`** — change it with the
set.

## Replacing a face or a sheet

Regenerate the sheet (or edit it), keep its name, run `node design/sample-avatars-src/slice.mjs` from `hris/`, and look
at the contact sheets. A new sheet is `women-4.jpg` / `men-4.jpg`; the faces are numbered on after the last one.

## The prompt

One sheet per message, ideally each in a new chat. The common part:

```
Create one square image: a contact sheet of 25 corporate headshots arranged in a strict 5×5 grid.
All cells exactly the same size, separated by thin white gaps of equal width. No text, no numbers, no borders, no logos.

Every portrait in the same photo session style:
- head and shoulders, face centered in the cell, small margin above the head and below the chin
- looking at the camera, natural relaxed expression, slight smile
- soft even studio light, plain light-grey seamless background, identical in every cell
- smart-casual office clothes in muted colours, no visible logos, no jewelry brands
- photorealistic, natural skin texture, 85mm portrait look, sharp focus

Every person must be clearly different — no two faces alike, no twins, no celebrities.
The 25 people, left to right, top to bottom:
```

followed by 25 lines of one sex, each naming an age (24–62), an origin and a hair style or a detail (glasses, a
beard, a headscarf) — every sheet with a different spread, so no face repeats across sheets.
