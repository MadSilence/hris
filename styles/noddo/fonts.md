# Fonts

The product uses one family: **Inter** for text up to 16 px, **Inter Tight** for headings from 18 px, **JetBrains Mono** for IDs, keys, HEX values and tokens. All three are free (SIL Open Font License). Font binaries are not bundled in this package; install them from npm or load them from Google Fonts.

| Role | Family | Weights | Where |
|---|---|---|---|
| Text, ≤ 16 px | Inter | 400, 500, 600 | body, cells, labels, hints, buttons, card titles |
| Headings, ≥ 18 px | Inter Tight | 500, 600 | greeting, page title, section title, big numbers |
| Code | JetBrains Mono | 400, 500 | employee IDs, API keys, HEX, token names, error IDs |
| Brand display | Instrument Sans | 400, 500, 600 | **website, slides, social only — never in the product** |
| Email fallback | Inter → Arial, sans-serif | | system emails |

Rules:
- MUST NOT use weight 700+. Max weight is 600.
- MUST NOT use italics (empty value = gray em dash; quotes = indent with a left rule).
- MUST use tabular figures (`font-variant-numeric: tabular-nums`) in tables, amounts, hours, dates and widgets.
- Negative numbers use the minus sign − (U+2212), not a hyphen.

## Required scripts (subsets)

Ship the **full** coverage for names in any workspace: `latin`, `latin-ext` (incl. Turkish, Lithuanian, Polish, Czech…), `cyrillic`, `cyrillic-ext` (incl. Kazakh, Ukrainian Ґ), `greek`, `vietnamese`. Inter and Inter Tight also have `greek-ext`; include it. CJK, Arabic and Hebrew fall back to system fonts; no mirrored (RTL) layout.

| Family | Subsets |
|---|---|
| Inter | latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese |
| Inter Tight | latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese |
| JetBrains Mono | latin, latin-ext, cyrillic, cyrillic-ext, greek, vietnamese |

## Option A — npm (recommended for the app)

Variable fonts, self-hosted, every subset included; browsers download only the subsets a page needs thanks to `unicode-range`.

```bash
npm i @fontsource-variable/inter @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono
```

```ts
// app entry
import '@fontsource-variable/inter';          // all subsets, wght 100–900 (we use 400–600)
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/jetbrains-mono';
```

The variable packages register the families as `"Inter Variable"`, `"Inter Tight Variable"` and `"JetBrains Mono Variable"`. Either alias them in your CSS or override the token stacks:

```css
:root {
  --font-text: "Inter Variable", "Inter", system-ui, sans-serif;
  --font-heading: "Inter Tight Variable", "Inter Tight", "Inter Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace;
}
```

Static alternative (smaller if you want to pick subsets explicitly): `@fontsource/inter`, `@fontsource/inter-tight`, `@fontsource/jetbrains-mono`, importing per subset and weight, e.g. `@fontsource/inter/latin-ext-400.css`, `@fontsource/inter/cyrillic-ext-500.css`, `@fontsource/inter-tight/greek-600.css`, `@fontsource/jetbrains-mono/vietnamese-400.css`.

## Option B — Google Fonts (prototypes, emails, examples)

Google Fonts serves every available subset automatically with `unicode-range`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Website/slides/social only (never in the product):

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

## Emails

Link Inter from Google Fonts in the `<head>`; clients that block web fonts fall back to `Arial, sans-serif`. Never rely on Inter Tight in email.
