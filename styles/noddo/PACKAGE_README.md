# noddo design system package

Code-first package for redesigning the noddo product UI with an AI coding assistant. Everything is in English.

## Source of truth

1. **`SPEC.md`** wins for rules and behaviour.
2. **`tokens/tokens.json`** wins for values. `tokens.css` and `accent.js` are generated to match it exactly.
3. `examples/components.html` is a reference implementation of the spec, not a contract. If it disagrees with SPEC.md, follow SPEC.md.

Older noddo docs and the brand-kit site (noddo-brand.vercel.app) are partly outdated. Where they conflict with this package, this package wins.

## Load order for the assistant

Give it the files in this order, with an instruction like: *"Redesign the UI to follow SPEC.md exactly. Use only tokens from tokens.css. Do not invent colours, radii, spacing or fonts."*

1. `SPEC.md`: the rules (MUST/SHOULD), components and do/don't lists.
2. `tokens/tokens.css`: import it once at the app root. It defines custom properties only, with no global styles.
3. `tokens/accent.js`: for workspaces with a custom HEX colour.
4. `icons.md` and `fonts.md`: install `@hugeicons/react` + `@hugeicons/core-free-icons` and the fonts.
5. `examples/components.html`: open it in a browser to see buttons, fields, chips, the table with a bulk bar, light and dark sidebars, toasts, the dialog, the empty state, loaders and widgets in every accent.
6. `assets/`: logo, icons and illustrations.

## Wiring

```html
<html data-theme="light" data-accent="wine">   <!-- 10 presets: wine brick terracotta sun forest teal denim iris raspberry graphite -->
```
```js
import { applyAccent } from './tokens/accent.js';
const { adjusted } = applyAccent(document.documentElement, '#B5E61D'); // custom HEX
// adjusted === true → tell the admin "We adjusted your colour for readability."
```
- Put `data-theme` and `data-accent` on the same element. Dark theme ships after launch, but the tokens exist now, so build every component on semantic tokens.
- Components read `--accent*`, `--text-*`, `--surface-*`, `--border-*`, `--status-*`, `--tag-*`, never raw HEX.

## Contents

| Path | What |
|---|---|
| `SPEC.md` | the complete design spec |
| `tokens/tokens.json` | W3C Design Tokens: primitives (palette, grays, status, tags, 10 themes) + semantic roles for light and dark |
| `tokens/tokens.css` | custom properties only (`:root`, `[data-theme]`, `[data-accent]`); accent derivatives use `color-mix()` |
| `tokens/accent.js` | `deriveAccent(hex)`, `applyAccent(el, hex)`, `contrast()`, `avatarColor(name)` |
| `examples/components.html` | self-contained reference page (only Google Fonts is external) |
| `assets/logo/` | outlined wordmarks (ink, white, mono-ink, mono-white, plus `_heavy` for widths under 120px), marks, app icons, favicons; `source/` holds the stroke construction |
| `assets/icons/` | custom nod icon and the Approve ring |
| `assets/illustrations/` | 36 ring illustrations (30 scenes + size and on-Wine variants), ring = `currentColor` |
| `icons.md` | Hugeicons list by group with React import names |
| `fonts.md` | Inter, Inter Tight, JetBrains Mono: packages, subsets, URLs |

## Asset notes

- **Logo**: the brand kit draws the wordmark with strokes. These files are true outlined fills (no strokes), rebuilt from the exact kit geometry: arcs and rectangles with nonzero winding. They render pixel-identical to the stroke source. Overlapping letter parts are separate subpaths; they have not been boolean-merged into one contour. Keep that in mind if a vendor needs a single merged path (for example, for cutting or embroidery).
- **Illustrations**: inline them, or import them as SVG components, and set `color: var(--accent)`. As an `<img>` the ring renders black. Ink, gray and knock-out colours read `--illustration-*` variables with fallbacks, so the same files work in dark mode.
- PNG versions of logos and app icons, social templates and slide masters are not included. Export them from the SVGs.
