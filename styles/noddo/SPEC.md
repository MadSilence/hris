# noddo design spec (product UI)

Version 1 · November 2026. This is the complete rulebook for redesigning the noddo product UI. Values here match `tokens/tokens.json` and `tokens/tokens.css`. When this spec and an older noddo document or brand-kit card disagree, this spec wins.

**MUST** = never break without a design review. **SHOULD** = the default; break it only with a written reason. Components read tokens, never raw HEX values.

---

## 1. Principles and voice

noddo is a template-based HRIS. The idea: noddo = nod + do. A nod is the shortest way to say yes; every HR yes turns straight into work done. The product sounds like a calm colleague who has already handled it: plain, brief, human, decisive. The site is loud, the product is quiet.

- MUST use sentence case everywhere: headings, buttons, menus, module names ("Time off requests", "My preferences", "Add your photo"). Capitals only for proper names and other companies' products.
- MUST write "noddo" in lowercase, always, even at the start of a sentence. Never "Noddo", "NODDO", "noddo's app". No branded feature names ("NodFlow"); the AI is "AI" or "noddo AI", never a persona.
- MUST use US English. Dates: `3 Nov 2026` or `Mon, 3 Nov` (never `11/03`). Time: 24-hour, with time zone for distributed teams (`14:00 CET`). Durations in text `7h 30m`, in a timesheet grid `7:30`.
- MUST label AI-written content "Drafted by AI — review before sending". The yes always stays human.
- MUST keep sensitive moments (exits, sick leave, bereavement) quiet and neutral: no jokes, no emoji, no exclamation marks.
- MUST use at most one exclamation mark in the whole product.
- SHOULD lead with the outcome; one idea per sentence, one action per screen.
- SHOULD use names, not IDs; write to "you", as "we"; never "the system".
- Buttons: verb + object ("Create template"). Confirmations name the action ("Delete 3 requests").
- Toasts: past tense, max 6 words ("Time off approved").
- Loading copy ends in "-ing…" ("Approving…", "Importing people…"), never "Please wait".
- Errors: what happened + how to fix + whether work is safe. No error codes in headlines, no "Oops!", no blame.
- Empty states and success may be warm ("All caught up"). Errors, forms and data stay neutral.
- Do not repeat the tagline ("Every yes, handled.") in the UI. Use the word "nod" only where approval is meant.
- Inclusive language: "they", "parental leave", "emergency contact", "first name · last name". Pronouns and preferred name are optional fields shown wherever the name is.

| Say | Instead of |
|---|---|
| approve, nod | authorize, validate |
| time off | leave of absence, absence entitlement |
| people, team | human resources, staff |
| template | workflow configuration |
| set up | implement, onboard (a tool) |
| teammate | employee record |
| sick day | illness absence |

| Moment | Tone | Example |
|---|---|---|
| Approval | crisp, done | Approved. Lena's off on Friday. |
| Win | warm, a little light | All 12 reviews are in. Nice work. |
| Error | calm, owns it, gives a fix | We couldn't save the template. Check your connection and try again. |
| Empty state | inviting, one next step | No templates yet. Start from onboarding. |
| Sensitive | quiet, neutral | Sam's last working day is set for 28 November. |

---

## 2. Brand boundary: noddo vs. the workspace

Each company (workspace) picks an accent colour. **The company colour changes everything accent; everything else is always noddo.**

Changes with the workspace accent (`--accent*`):
- primary button; Approve button (always with the nod ring); links and accent text; focus ring; text selection; caret
- active navigation item; selected table row; selected tab underline; toggles, checkboxes, radio dots
- navigation counters; unread dot in the notification feed
- the ring in every illustration; the loader ring; wizard current step
- first chart series and the sequential chart scale
- calendar "today" marker; drop-target highlight
- company logo fallback tile and favicon fallback; `theme_color` in the workspace `site.webmanifest`

Always noddo (never themed): fonts, radii, spacing, grays, text colours, status colours, the tag palette, icons, illustration style, the noddo logo itself.

- MUST: Approved is always Pine `#1E7A4F`; errors are always red `#C42B1C`, even in a green or red workspace. Status and error always come with an icon and a word, which is why red- or yellow-ish workspace colours are allowed.
- MUST: components read `--accent*` tokens, never a Wine HEX. Only the noddo logo hard-codes Wine.
- noddo inside the app: the noddo wordmark, 12 px high, gray (`--sidebar-wordmark`), at the bottom of the sidebar **above** the divider that separates the profile block. Nowhere else in the app chrome.
- Sign-in on `acme.noddo.so` (sign-in, 2-step verification, password reset, SSO): company logo and colour; "powered by noddo" in the footer. On `app.noddo.so` every screen is noddo-branded. SSO buttons are secondary buttons with the provider logo.
- Trial sign-up and the company setup wizard are noddo-branded (no company yet). The colour-picking step shows a live preview. The first welcome is already in the company brand (Onboarding illustration).
- New-hire pre-boarding page: the company's page (logo, colour, HR welcome, team, first-day plan); noddo only as "powered by noddo" in the footer. Works on a phone.
- "powered by noddo" lockup: 12 px gray label + 12 px-high wordmark. Three versions: on white, on dark, on company colour (mono white or Ink).
- MUST NOT place the noddo logo next to the company logo; the company logo is always primary and noddo lives elsewhere on the screen.
- Session expired: dialog over the app, "You've been signed out"; after signing in, the person stays on the same page.
- Page title: `Acme · noddo`. Link preview image: white background, company logo, a ring in the company colour, small "on noddo" at the bottom. Favicon: company mark if uploaded, else first letter on the accent (see 4.7).

---

## 3. Logo

Files: `assets/logo/`. The wordmark is drawn, not typeset: stroke 8 at an x-height of 40, every bowl the same diameter, the last "o" dropped by 7/40 of the x-height. That drop is the nod.

- MUST use the supplied files only; never retype "noddo" in a font as the logo.
- MUST NOT align the last "o" to the baseline, recolour it outside the rules below, stretch, squash, outline, add effects or rotate.
- The nod colour: Wine `#6E1630` on white/light; Rose `#F2B8C6` on Wine or Ink. On any other colour the whole wordmark is one colour, white or Ink (`*_mono-*` files). The nod never takes the workspace accent.
- Clear space: half an "o" (the bowl's outer radius) on every side.
- Minimum size: wordmark 72 px wide, mark 16 px. Below 120 px wide use the `_heavy` files (stroke 10).
- Mark = the nodding "o" in a tile, ring 8% below centre. App icon: Wine tile, Rose ring. Favicons use heavier rings at 32 and 16 px.
- Co-branding (marketing only): noddo, a thin rule or "×", then the partner logo at equal visual weight.
- File naming: `brand_asset_variant_format`, lowercase (`noddo_wordmark_ink.svg`, `noddo_mark_tile_wine.svg`).
- Splash screens (the only full-screen loaders): A = Wine background, white wordmark with Rose nodding "o", app start, max 2 s. B = white, Ink wordmark, Wine ring, progress bar, first load of a new workspace.

---

## 4. Colour

### 4.1 Proportions
The interface is almost all white and Ink. One accent does the talking: approx. white 60 / Ink 22 / accent 12 / tint 6. Large accent fills only on splash screens and the tinted dark sidebar.

### 4.2 Grays (light theme)

| Role | Token | Value | Contrast on white |
|---|---|---|---|
| Text primary | `--text-primary` | #0B0B0C (Ink) | 19:1 |
| Text secondary | `--text-secondary` | #45454A | 9.5:1 |
| Text tertiary, placeholder, column header | `--text-tertiary` | #6B6B70 | 5.3:1 |
| Disabled text, decorative icons only | `--text-disabled` | #9C9CA3 | 2.7:1 (not for meaningful text) |
| Page, card, popover background | `--surface-page` / `--surface-card` / `--surface-overlay` | #FFFFFF | |
| Light sidebar, row hover, canvas | `--surface-subtle` / `--surface-row-hover` / `--surface-canvas` | #F7F7F8 | |
| Mist: chips, skeletons, email background | `--surface-mist` | #F3F3F5 | |
| Hairline divider, card border | `--border-divider` | #EAEAEC | |
| Field border | `--border-field` | #DADADF | |
| Strong border, field hover | `--border-strong` | #B4B4BA | |

- MUST NOT use zebra striping; rows are divided by hairlines.
- MUST NOT use warm/beige grays.
- Scrim under dialogs: Ink 40% (`--scrim`). Search match: bold text + `#FFF1B8` background. Editor canvas: `#F7F7F8` with a `#DADADF` dot grid every 16 px.

### 4.3 Workspace themes
Ten presets (set `data-accent="<name>"` on `<html>`). Higher plans may enter any custom HEX (use `tokens/accent.js`).

| Theme | HEX | Text on fill |
|---|---|---|
| Wine (default) | #6E1630 | white |
| Brick | #C2413B | white |
| Terracotta | #C25423 | white |
| Sun | #C48A08 | white **semibold** — documented AA exception (3:1) |
| Forest | #2E8055 | white |
| Teal | #12807A | white |
| Denim | #2F63C4 | white |
| Iris | #6A4FC7 | white |
| Raspberry | #C23D74 | white |
| Graphite | #2A2A2E | white |

### 4.4 Accent roles (derived from one HEX)

| Token | Rule | Use | Wine |
|---|---|---|---|
| `--accent` | the HEX as given | primary/Approve fill, counters, checkbox, toggle, tab underline, focus outline, chart 1, illustration ring | #6E1630 |
| `--on-accent` | white or Ink, whichever passes 4.5:1 (white preferred; Sun = white semibold exception) | text/icons on accent fill | #FFFFFF |
| `--accent-hover` | accent + 12% black | hover on filled buttons | #61132A |
| `--accent-strong` | accent + 25% black | pressed | #531124 |
| `--accent-subtle` | 6% accent on white | selected row, menu item hover, drop target | #F6F1F3 |
| `--accent-muted` | 15% accent on white | active nav item, soft badge, text selection, field focus halo | #E9DCE0 |
| `--accent-ring` | 50% accent on white | selected border, drop-target dashed outline | #B78B98 |
| `--accent-text` | accent darkened (mixed with black) until 4.5:1 on white, subtle and muted | links, accent text, active nav label | #6E1630 |
| `--approve-ring` | 72% on-accent + 28% accent | the nod ring inside Approve | — |

- Mixing is sRGB, identical in `tokens.css` (`color-mix(in srgb, …)`) and `accent.js`.
- Sun: links and accent text darken to `#8C6000`.
- Custom HEX: on-accent is always achievable; if `--accent-text` had to be darkened, show the admin "We adjusted your colour for readability."
- MUST NOT put accent on Ink (fails at 1.6:1).
- In the dark theme the fill is lifted (mixed with white) until 3:1 against `#17171A`; tints mix into the dark surface (12/24/60%); accent text is lightened until 4.5:1.

### 4.5 Status colours (never themed)
Each status has five values: fill, bg (soft), text, border, icon (`--status-<name>-fill|bg|text|border|icon`).

| Status | Fill | Soft bg / text | Meaning | Icon |
|---|---|---|---|---|
| Approved / Done | Pine #1E7A4F | #E6F4EC / #135C3A | approved, signed, completed, submitted, paid | checkmark-circle-02 |
| Pending | Amber #985A00 | #FFF3DF / #7A4800 | waiting on a decision or information | hourglass |
| In progress | #2F55C8 | #EAF0FD / #2342A0 | started, in review | loading-03 (static) |
| Scheduled | #0E6A70 | #E3F3F3 / #0B5257 | starts later | calendar-03 |
| Declined / Error | #C42B1C | #FDEDEB / #A12215 | declined, overdue, expired, failed | cancel-circle |
| Draft | gray #6B6B70 | white + **dashed** #9C9CA3 border / #45454A | not started, only the author sees it | pencil-edit-02 |
| Inactive | gray | #F3F3F5 / #45454A | inactive | remove-01 |
| Archived / Cancelled | gray | #F3F3F5 / #45454A | kept for history | archive-02 |
| Info | #2F63C4 | #ECF1FA / #2F63C4 | information (not Wine, because Wine is the accent) | help-circle |

- MUST: status = icon + word; colour is the third signal, never the only one.
- MUST: Approved is never Wine (or any accent) and never red. A yes must look like a yes.
- MUST NOT have a "Needs your nod" / "Your turn" status. What awaits a person's decision is shown by the Approve button; the request itself is Pending.
- SHOULD use subtle pills (soft bg + dark text). Solid fills only for counts and toast icons.
- Lifecycles — time off: Pending → Approved | Declined; cancelled = gray. Employee: before start = Scheduled-blue family (In progress colour for onboarding with progress); active = Approved green; leaving = Pending amber; left = Inactive gray. Onboarding: Draft → Scheduled → In progress → Done. Reviews: Scheduled → In review → Submitted · Overdue. Documents: Pending → Signed · Expired.
- Dark-theme status sets are in `tokens.css` under `[data-theme="dark"]` (e.g. Approved bg #12301F / text #74D19F).

### 4.6 Destructive actions
- A normal "Remove" is a secondary button with red text, or a red-text menu item at the bottom of the menu, separated by a divider.
- A red-filled button exists only inside the confirmation dialog, and that dialog has no primary (accent) button next to it.
- Red appears only on the failed field, the destructive label and the toast icon. Banners and full pages stay neutral.

### 4.7 Tag palette (user-chosen colours)
Eight colours for teams, locations, skills, leave types, calendars. Each is a triplet: chip bg, text, bar (calendar bar / dot).

| Tag | bg | text | bar |
|---|---|---|---|
| Gray | #F3F3F5 | #45454A | #6B6B70 |
| Berry | #F1E4EB | #661642 | #8E1F5C |
| Plum | #ECE6EF | #441F56 | #5E2B78 |
| Indigo | #E7E8F5 | #2A2D79 | #3A3FA8 |
| Ocean | #E4EBF2 | #14426B | #1C5C94 |
| Teal | #E2EDEE | #0A4C51 | #0E6A70 |
| Cocoa | #EDE8E6 | #4D2D21 | #6B3E2E |
| Bronze | #EFEAE2 | #583C0C | #7A5410 |

- MUST NOT use status colours (green, red, amber) or the accent for tags.
- MUST always show the tag name; colour is never the only signal.
- Avatars without a photo: initials on the soft tag colour, chosen by a stable hash of the name (`avatarColor()` in `accent.js`), never the accent. No photo placeholders/silhouettes.
- Company logo not uploaded: first letter of the company name on an accent square, radius 8.
- Before shipping, check the palette for colour-vision deficiencies and that Berry does not read as Wine next to the default accent.

---

## 5. Typography

| Role | Size / line (px) | Weight | Tracking | Family | Token |
|---|---|---|---|---|---|
| Home greeting | 32 / 40 | 600 | −0.02em | Inter Tight | `--type-greeting` |
| Page title | 24 / 32 | 600 | −0.02em | Inter Tight | `--type-page` |
| Section title | 18 / 26 | 600 | −0.01em | Inter Tight | `--type-section` |
| Card title | 15 / 22 | 600 | 0 | Inter | `--type-card` |
| Body, table cell | 14 / 20 | 400 | 0 | Inter | `--type-body` |
| Field label | 13 / 18 | 500 | 0 | Inter | `--type-label` |
| Hint, caption, tooltip | 12 / 16 | 400 | 0 | Inter | `--type-hint` |
| Column header | 12 / 16 | 500, #6B6B70, no uppercase | 0 | Inter | `--type-column` |
| Big number (widgets) | 32 / 40 | 500, tabular | −0.02em | Inter Tight | `--type-number` |
| Code, IDs, HEX | 13 / 18 | 400–500 | 0 | JetBrains Mono | `--type-mono` |

- MUST: Inter for text ≤ 16 px, Inter Tight for headings ≥ 18 px, JetBrains Mono for identifiers, keys, HEX and tokens.
- MUST NOT use Instrument Sans in the product (website, slides, social only) or any display font.
- MUST NOT use weight 700+ or italics. Empty value = gray em dash "—"; quotes = indented with a left rule.
- MUST NOT use all caps (including section labels and column headers).
- MUST use tabular figures in tables, amounts, hours, dates and widgets. Negative numbers use "−" (U+2212).
- Currency: locale symbol (zł, €, $); if one table mixes currencies, use ISO codes (PLN, EUR).
- Long names: table row / person chip = one line + ellipsis + full name in a tooltip; org chart node = up to 2 lines then ellipsis; profile header = wraps freely. Mixed scripts in one line are fine.
- Design for +40% text length (German, Lithuanian). UI is English-only at launch. Latin with any diacritics, Cyrillic and Greek are guaranteed for names; CJK/Arabic/Hebrew fall back to system fonts, no RTL mirroring.
- See `fonts.md` for loading and subsets.

---

## 6. Layout, spacing and density

- Spacing scale (4-based), the only allowed values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (`--space-*`).
- Page padding 32 px; 24 px when the viewport is narrower than 1280 px.
- Content width: forms and reading text max 720 px; tables and calendars full width; home max 1440 px.
- Sidebar 240 px; collapsed 64 px (icons with tooltips, company logo becomes a 32×32 mark).
- Side panel 480 px, wide 640 px. Dialogs 400 (confirm) / 560 (form) / 800 (complex picker).
- Density (app, denser than the website):

| Element | Size |
|---|---|
| Controls small / default / large | 32 / **36** / 44 px |
| Table row | 44 px; compact 36 px (a per-table toggle; there is no app-wide compact mode) |
| People list row | 36 px, avatar 22 px, job title on the same line |
| Controls above a list | 32 px |
| Body text | 14 px (website 16 px) |
| Status pill / tag | 24 px |
| Filter chip | 32 px |

- Touch/hit targets: at least 24×24 px on desktop and 44×44 px on touch, even when the visible element is smaller.
- Website only: 12 columns, gutter 24; margins 64 (≥ 1200), 40 (960–1199), 32 (600–959, 8 columns), 16 (< 600, 4 columns); section spacing 120.

---

## 7. Depth and shadows

Shadows are neutral, Ink-based, never tinted. Page zones (navigation, canvas) are separated by background, not shadow.

| Level | Used for | Value | Token |
|---|---|---|---|
| 0 | cards, widgets, the table container | 1px `#EAEAEC` border + `0 1px 2px rgba(11,11,12,.05)` | `--shadow-0` |
| 1 | card hover, canvas/org-chart node, pinned table columns while scrolled | border + `0 1px 2px 6%` + `0 2px 6px 6%` | `--shadow-1` |
| 2 | menus, popovers, toasts, tooltips, chart tooltips | `0 1px 2px 6%` + `0 4px 12px 8%` | `--shadow-2` |
| 3 | dialogs, side panels | `0 8px 32px 14%` | `--shadow-3` |
| 4 | dragged item | `0 12px 40px 18%` | `--shadow-4` |

- MUST keep rows, cells, chips, fields and menu items flat (no shadow).

## 8. Radii

Only these values; do not introduce new ones.

| Radius | Where | Token |
|---|---|---|
| 6 | tag | `--radius-tag` |
| 8 | button, field, menu item, company logo tile | `--radius-control` |
| 10 | popover, menu, toast, tooltip, org-chart node, banner | `--radius-popover` |
| 16 | card, widget | `--radius-card` |
| 20 | dialog, side panel (outer corners only), bottom sheet top corners | `--radius-panel` |
| pill | status, filter chip, counter, toggle, avatar, progress bar | `--radius-pill` |

- MUST NOT use pill-shaped buttons in the product (website only).
- Exception for small glyph controls: the 16 px row checkbox uses a 4 px corner (see 13.12). This is a glyph detail, not a surface radius.

---

## 9. Icons

See `icons.md` for the full list (96 icons in 8 groups, React import names) and the custom nod icon.
- MUST use Hugeicons Stroke Rounded (free, MIT) via `@hugeicons/react` + `@hugeicons/core-free-icons`; never mix sets.
- Stroke 1.75; sizes 16 / 20 (default) / 24.
- Icons inherit text colour; status icons take the status colour; only the nod icon uses the accent.

---

## 10. Illustrations

Files: `assets/illustrations/*.svg` (59 SVGs: 46 scenes + size and on-Wine variants), and `assets/illustrations/404/` (the 404 page's own drawing, moving and still). Canvas 240×150. Ring elements use `stroke="currentColor"`; Ink, gray, baseline and white knock-outs read CSS variables with fallbacks (`--illustration-ink`, `--illustration-support`, `--illustration-support-light`, `--illustration-baseline`, `--illustration-knockout`), so the same files work in the dark theme when inlined.

- MUST: one object drawn in Ink, exactly one ring element in the accent (the person or the "answer"), gray support lines, one baseline. No faces, fills, gradients, shadows or perspective.
- MUST NOT have sharp corners, in every illustration in the product and the package. Every corner of a shape is rounded with a small curve (about 4–6 units on the 240×150 canvas) on top of the round line joins; positions and stroke widths do not change. Allowed to stay: simple line ends, checkmarks, and a tear or zigzag that is the point of the drawing (the torn page).
- MUST: the ring takes the workspace accent in every scene, including success. No green in illustrations.
- MUST inline the SVG (or use it as a React component) and set `color: var(--accent)` on it; as an `<img>` the ring renders black.
- On Wine or Ink backgrounds: Ink → white, ring → Rose, gray → Wine 500 (`onboarding-on-wine.svg` shows the recipe).
- Sizes: S 96 px (panels, dropdowns, module headers; drop support lines), M 160–256 px (empty pages and tabs, default), L 320–480 px (onboarding, success, website). Strokes scale; never thinner than 2 px on screen.
- MUST NOT show an illustration alone: illustration → title → short text → action(s), centred.
- Illustrations are static (the nod belongs to loaders and Approve only). The 404 page is not an empty-state illustration and is the one exception: its drawing (480 px, 5 px lines) plays once on load — five balls fall, bounce, roll apart and stay — and is still under `prefers-reduced-motion: reduce`.
- Photography (marketing only): real people at real work, daylight, cool neutral grade; no stock handshakes or thumbs-up.

Scene index:

| File | Use |
|---|---|
| documents | empty folder, document library |
| signing | contracts, policies to acknowledge |
| onboarding | first day, welcome checklist, first-login welcome |
| offboarding | last day, handover, exit checklist |
| time-off (+ `-s`, `-m`, `-l`) | no upcoming leave, balance page |
| sick-day | sick leave request |
| reviews-and-one-on-ones (+ `-s`) | review cycle, feedback inbox |
| hiring | no open roles, candidate pipeline |
| payroll | payslips, compensation, expenses |
| team-and-org | org chart, empty team, invites |
| calendar | holidays, events, nothing scheduled |
| all-caught-up | empty inbox, nothing to approve |
| no-results (+ `-s`) | a search with nothing found |
| no-match (+ `-s`) | a filter that left nothing |
| 404/404-balls (animated, static) | the **404** page — a page design of its own, see "Illustrations are static" |
| something-broke | errors, offline, failed sync; **500** |
| policies | handbook, compliance; **403** (no access) |
| all-approved (+ `-l`) | success screens, setup complete |
| goals-and-growth | OKRs, goals |
| attendance (+ `-s`) | clock-ins, shifts, timesheets |
| analytics | reports, dashboards |
| company-hub | company info, the setup wizard |
| automations | triggers, rules, scheduled actions |
| notes | 1:1 notes, private notes |
| forms (+ `-s`) | requests, surveys, custom forms |
| announcements | company news, updates |
| benefits | perks, allowances, insurance |
| equipment | laptops, devices, assets |
| learning | trainings, courses, certificates |
| surveys | pulse checks, eNPS |
| celebrations | birthdays, work anniversaries |
| integrations | Slack, calendars, payroll, SSO |
| onboarding-on-wine | onboarding on a Wine/Ink background |
| coming-soon | every "coming soon" placeholder |
| archive | the archived view of any list |
| trash | a trash, deleted files |
| history (+ `-s`) | logs, versions, ledgers, change history |
| career (+ `-s`) | career tracks, position history |
| templates | template catalogues |
| office | offices, locations |
| tasks | to-do lists, task templates |
| people (+ `-s`) | people lists, assigned people |
| review-cycle | review cycle participants |
| nomination | peer nomination |
| welcome | preboarding, the new hire's page |
| legal-entity | legal entities |
| job-families | job families, groups |
| notifications | notification settings |

---

## 11. Motion

The brand has one motion: the nod. Everything else is still, so the nod gets noticed.

| What | Duration | Curve | Token |
|---|---|---|---|
| Hover, press | 100 ms | linear | `--duration-hover`, `--ease-hover` |
| Menu, popover, tooltip | 150 ms | cubic-bezier(.2,0,0,1) | `--duration-menu`, `--ease-standard` |
| Toast | 200 ms | cubic-bezier(.2,0,0,1) | `--duration-toast` |
| Dialog, side panel | 250 ms | cubic-bezier(.2,0,0,1) | `--duration-dialog` |
| Reordering blocks | 300 ms | cubic-bezier(.2,0,0,1) | `--duration-reorder` |
| Closing any of the above | 70% of opening | cubic-bezier(.4,0,1,1) | `--duration-*-exit`, `--ease-exit` |

The nod: the ring moves down 7/40 of the x-height with a +2/40 overshoot, settles, holds, returns. Easing `cubic-bezier(.5,0,.3,1)`. Keyframes (percent of the ring's own height): `0% −17.5% · 22% +5% · 32% 0 · 84% 0 · 94–100% −17.5%`. Loop 2.8 s for the logo (splash), 1.1 s for loaders.

- MUST use the nod only for: loaders, one nod on Approve after success (600 ms), Approve hover (the ring dips), splash screens.
- Screens cut or fade; no bounces, slides of whole screens or parallax.
- MUST respect `prefers-reduced-motion: reduce`: only fades remain; the ring stays in its dropped (resting) position; skeletons stop shimmering.

---

## 12. Loading, errors, empty states

| Wait | Show |
|---|---|
| < 300 ms | nothing |
| 0.3–2 s | one nodding ring in the accent (content area or inside the block), or the button's "-ing…" state |
| 2–10 s | skeleton matching the real layout (Mist shapes, soft shimmer, no pulsing) |
| > 10 s | progress bar in the accent + what is happening + how much is left; let people leave |

- MUST NOT use three dots or a classic spinner anywhere.
- MUST keep the sidebar and top bar during in-app page loads; only the content area loads.
- MUST NOT block the whole screen for a single save; load in place. The only full-screen loaders are splash A and B.
- Button in progress: label becomes "Saving…" / "Approving…", the ring nods, width stays fixed, a second click is ignored.
- Error pages (404, 500, 403): M illustration (404: its own drawing, § 10), short title, one line of max 6 words, one primary + one secondary action. Never a dead end. 500 shows an error ID in small mono text. Examples: "We can't find this page / The link may be broken. [Go to home] [Search]"; "Something broke on our side / Your work is saved. Try again. [Try again] [Status page]"; "This page is private / Ask an admin for access. [Request access] [Go back]".
- Field error: red border, alert icon and text under the field that says how to fix it ("Add the domain, like lena@company.com"). The error replaces the hint.
- Offline banner: Mist background, gray icon, Ink text ("You're offline. Changes will sync when you're back."). Never yellow or red.
- Empty state: illustration → title → at most 2 sentences of up to 8 words, each on its own line → one action (optionally one secondary). Centred.

---

## 13. Components

Every component needs these states: default, hover, focus-visible, active/pressed, selected (if applicable), disabled, loading (if async), error (if input), empty (if it holds content). `examples/components.html` shows working references.

### 13.1 Focus (`:focus-visible` only)
| Where | Style |
|---|---|
| Buttons, links, chips, toggles, swatches | 2px `--accent` outline, 2px offset |
| Fields | border becomes `--accent` + 3px `--accent-muted` halo, no offset |
| Table cells, menu items, nav items | 2px `--accent` outline inset (−2px offset) so neighbours are untouched |
| Dark sidebar | 2px white outline inset |

MUST NOT remove focus without a replacement. Every flow works by keyboard alone, in a logical order.

### 13.2 Buttons
| Kind | Look | When |
|---|---|---|
| Primary | `--accent` fill, `--on-accent` text | the main action of an area |
| Approve | primary look + nod ring before the label | approvals only |
| Secondary | white, 1px `#DADADF` border | other actions, Decline, Not now, SSO |
| Ghost | no background, Mist on hover | toolbars, Cancel |
| Destructive | secondary with red text (red fill only in the confirm dialog) | remove, terminate |
| Link | `--accent-text`, underline on hover | inside text, "View all" |
| Icon button | square (width = height), always with a tooltip and an accessible name | toolbars, rows |
| Menu button | label + `arrow-down-01` | several variants of one action |

- Heights 32 / 36 (default) / 44; radius 8; label 14/20 500 (13 px at 32, 15 px at 44); horizontal padding 12 / 14 / 18; icon 16–20 with 8 px gap.
- Hover `--accent-hover`, pressed `--accent-strong`, disabled Mist fill + disabled text.
- MUST: one primary button per area (page header, dialog, card). One decision = one Approve per card, email or message. Decline / Not now is secondary, never filled.
- MUST: the Approve button uses the workspace accent and always carries the nod ring, in every size and channel. In Sun, button labels are semibold.

### 13.3 Fields
- Label always above the field (13/18 500); the placeholder never replaces the label.
- Optional fields say "(optional)" after the label; no asterisks (most HR fields are required).
- Hint under the field, 12 px `#6B6B70`. Error replaces the hint (see 12).
- Height 36, radius 8, border `--border-field`, hover `--border-strong`, caret `--accent`, focus per 13.1, disabled `--surface-subtle` bg + disabled text.
- "Scheduled from date": info chip under the field with a calendar icon, e.g. "Changes to Senior Designer on 1 Dec".
- Cover all types: text, textarea, number, money with currency (amount + currency addon/select, tabular), date, date range/period, select, multi-select, person picker (person chips inside the field; Backspace removes the last), phone, email, file upload, toggle, checkbox, radio.

### 13.4 Chips and badges (the shape tells the kind)
| Kind | Shape | Where |
|---|---|---|
| Status | pill 24 px, 14 px icon + 12/16 600 label on the status soft bg | read-only, one per object |
| Tag | soft square, radius 6, 24 px, 6 px colour dot + 12/16 500 label, tag palette | teams, locations, skills; max 3 visible then "+n" |
| Filter | white pill 32 px with border and arrow; selected = Ink fill + check | above tables and lists |
| Person (input) | Mist pill with 22 px avatar left and × | people and values inside fields |
| Counter | small pill with a number, accent fill | navigation, tabs |

Sizes for tags/chips: S 20 (dense tables), M 24 (default), L 32 (filters).

### 13.5 Tables
- Container = card level 0 (border + micro-shadow, radius 16); rows flat, separated by hairlines; no zebra.
- Sticky header, 36 px, column headers 12/16 500 tertiary, no caps. Sort arrow only on the active column and on hover.
- Rows 44 px (compact toggle 36 px). Hover `--surface-row-hover`; selected `--accent-subtle` + checked checkbox.
- Pinned columns get a level-1 shadow edge only while scrolled horizontally.
- Above the table: saved views as tabs, search, filter chips; on the right column settings and density. Pagination below: "1–50 of 1,380" + arrows.
- Row menu: "more-horizontal" icon button, visible on row hover/focus. Dangerous items last, red text, after a divider.
- Bulk actions: a dark (Ink / inverse) floating bar at the bottom of the screen: "214 of 1,380 selected · Select all" + actions.
- Empty result: S illustration + "No one matches these filters" + "Clear filters". Loading: skeleton rows.
- Numbers right-aligned and tabular; people never shown for groups under 5 in aggregated data.

### 13.6 Navigation
- Sidebar (top to bottom): company logo slot (up to 160×32) + company switcher; search (⌘K); items (icon 20 + label 14/20 500, 32 px high, radius 8); spacer; settings; **noddo wordmark 12 px gray**; divider; profile block (avatar, name, email).
- Light theme (launch): bg `#F7F7F8`, right border `#EAEAEC`, active item bg `--accent-muted` + text `--accent-text`, counters accent fill.
- Dark theme (after launch): tinted, `#17171A` mixed with 16% of the company colour (Denim → `#1B2335`, Wine → `#25171E`); never black. Active item = white text on 8% white + a 3 px left bar of the lightened accent; counters accent fill; white logo; focus 2 px white inset. Warm themes (Sun) look brownish; that is accepted.
- The sidebar follows the app theme (no dark sidebar in the light theme).
- Collapsed (64 px): icons only with tooltips; logo becomes a 32×32 mark.
- Tabs: 2 px `--accent` underline on the selected tab; selected label primary, others tertiary.
- Breadcrumbs only for hierarchies deeper than two levels.
- Command palette (⌘K): 560 px dialog near the top; groups: people, pages, actions.

### 13.7 Dialogs, panels, popovers, toasts, banners
| Surface | When and how |
|---|---|
| Dialog | short blocking task; radius 20, level 3, padding 24; 400/560/800 |
| Confirm destructive | 400 px; title names the object ("Remove 3 employees?"), a one-line consequence, the button repeats the verb ("Remove 3 employees", red fill); Cancel secondary; no accent button |
| Side panel | view/edit without losing the list; 480/640, radius 20 on outer corners, level 3 |
| Popover | quick pick or person preview; radius 10, level 2 |
| Tooltip | explanation only; Ink bg, white 12 px text, radius 10 (inverted in dark theme) |
| Toast | white card, 1px border, level 2, radius 10, round status icon (Pine success, red error), one text action (Undo, Retry); bottom left, 5 s; never black toasts |
| Page banner | state of the whole page; neutral Mist |
| Inline alert | soft status bg + icon, inside a form |
| Notification feed | side panel; unread items have an accent dot; approvals have the Approve button right in the feed |

Menus: radius 10, level 2, 4 px padding; items 32 px, radius 8, hover `--accent-subtle`.

### 13.8 Org chart and canvas
- Nodes: cards with radius 10 and level-1 shadow; name up to two lines then ellipsis.
- Connectors: 1.5 px `#B4B4BA` lines with rounded corners; selected connector `--accent`.
- Canvas background `#F7F7F8` with a `#DADADF` dot grid every 16 px. Drag = level 4; valid drop = dashed `--accent-ring` + `--accent-subtle`; invalid = `not-allowed` cursor, no highlight.

### 13.9 Home widgets
Cards, radius 16, level 0 (level 1 on hover if clickable). Title (card title) + one big number (32/40 500 tabular) **or** a list of up to 5 rows + a "View all" link. Greeting at the top: 32/40 Inter Tight 600.

### 13.10 Wizard and onboarding progress
Steps are rings: empty gray ring = ahead, accent ring = current, accent ring with check = done. One question per step; primary "Continue", secondary "Back".

### 13.11 Tasks, checklists, activity
- Task/checklist checkboxes are round (like the ring); square checkboxes only for row selection.
- Comments and activity log: vertical feed — avatar, name, action, time in gray on the right.

### 13.12 Selection controls
- Row checkbox 16 px, 1.5 px `--border-strong`, 4 px corner; checked = accent fill + on-accent check.
- Toggle 32×20 pill; on = accent.
- Radio 16 px circle; selected = accent dot.

### 13.13 Time off calendar
| What | Look |
|---|---|
| Weekends, holidays | column bg `#F7F7F8`; holiday name in the header |
| Today | date in an accent circle + thin accent vertical line |
| Approved leave | solid bar in the leave type's colour (tag palette bar) |
| Pending leave | solid 1.5 px edge in the type colour, light tint of the type colour, 4 px dot pattern on top |
| Understaffed | amber marker with icon in the team row above the affected days |
| Hidden details | gray bar labelled "Away", no type |
| B/W print | type abbreviation in the bar (VAC, SICK); pending dots stay |

### 13.14 Mobile (employee flows only)
- On phones: profile and photo, time-off request, Approve from email, inbox, new-hire page.
- Patterns: top bar with menu, cards instead of tables, bottom sheet instead of dialog (radius 20 top corners, level 3, grab handle), 44 px controls, 44×44 targets.
- Admin screens (tables, org chart, editors) are desktop-only.

---

## 14. Email, chat, print, export

- Template: 600 px white card on Mist, table-based layout (Outlook-safe). Header = company logo, else the noddo logo (never both).
- Subject = who + what + when, max 50 characters, no "noddo:" prefix. Example: "Sam asked for 3 days off — 12–14 Nov".
- One email = one decision = one accent button (44 px, radius 8, table-built); Approve carries the ring as an image. Secondary actions are outlined links.
- Footer: "Sent by noddo on behalf of Acme", postal address, link to notification settings.
- Dark-mode mail: logos as PNG with transparency and a thin white outline; content stays on the white card; text `#0B0B0C`.
- Font: Inter where web fonts load, else Arial, sans-serif. Every email has a plain-text version.
- Batch everything else into one daily digest. No tracking pixels on personal matters.
- Slack/Teams: Approve keeps the ring; after the decision the buttons are replaced by "Approved by Lena · 10:43".
- PDF (later): shared template — company logo header, export date, page numbers. Calendar print: A4 landscape, company logo top left, small noddo in the footer, B/W rules from 13.13.
- Spreadsheet exports: bold header, frozen first row, auto column widths, correct cell types (dates, money); no colour, no brand font.
- `site.webmanifest`: one for the product and one per workspace (company name and icon, `theme_color` = accent).

---

## 15. Data visualisation

- MUST: one chart answers one question; the title states the takeaway, the subtitle the unit and period.
- Categorical: up to 6 colours — series 1 is the workspace accent (`--chart-1`), then the fixed order Ocean `#1C5C94`, Bronze `#7A5410`, Plum `#5E2B78`, Teal `#0E6A70`, Cocoa `#6B3E2E` (`--chart-2…6`). More than 6: fold the rest into "Other" in gray. SHOULD keep to 4 series; label lines directly instead of a legend when possible.
- Context in gray, the highlighted value in the accent.
- Sequential (heatmaps, absence calendars): 5 steps of the accent at 15/30/50/75/100% (`--chart-seq-1…5`).
- Diverging: blue `#2F63C4` (plus) — gray `#DADADF` — terracotta `#C25423` (minus). Never green vs. red.
- Status colours are never a data scale.
- Utility: gridlines `#EAEAEC` hairlines, axis labels `#6B6B70`, tooltip = white card with level-2 shadow.
- Bars start at zero; horizontal bars for names, vertical for time; no chart borders, no 3D, no pies over 3 slices. Tabular figures.
- MUST NOT show people data for groups under 5 people.

---

## 16. Accessibility

WCAG 2.2 AA is the target for the whole interface, with documented exceptions. A new exception exists only once it is added to this list.

**Exceptions list:** 1) White semibold text on the Sun fill (3:1). Links and accent text in Sun darken to `#8C6000`.

- Contrast: text 4.5:1; large text and icons 3:1. `--text-disabled` is for disabled/decorative use only.
- Never colour alone: statuses have words, errors have icons, leave types have names.
- Targets: ≥ 24×24 px desktop, ≥ 44×44 px touch.
- Keyboard: every flow works by keyboard only; visible focus (13.1); dialogs trap focus and return it on close; Esc closes overlays.
- Screen readers: status changes are announced (`role="status"` / live regions, e.g. "Approved"); icon buttons have names; decorative rings and illustrations in empty states are `aria-hidden` when the title says the same.
- Usable at 200% zoom and 320 px width. Respect reduced motion (section 11).
- Dates, first weekday and public holidays follow the teammate's country, not the company's.

---

## 17. Tokens and theming (implementation)

- `tokens/tokens.json` is the source of truth (W3C Design Tokens format): primitives + semantic roles for light and dark.
- `tokens/tokens.css` contains only custom properties under `:root`, `[data-theme]`, `[data-accent]`. No element selectors, no resets. (Website global styles live in a separate `site.css`, never loaded in the product.)
- Put `data-theme="light|dark"` and `data-accent="<preset>"` on the same element (normally `<html>`). A nested themed island must carry both attributes too.
- Custom HEX: `applyAccent(document.documentElement, hex)` from `tokens/accent.js`; it sets the contrast-checked inputs, and `tokens.css` derives the rest.
- Dark theme ships after launch, but every component MUST be built on semantic tokens now so it works when `data-theme="dark"` is set. Dark surfaces start at `#17171A` (page) → `#1E1E22` (card) → `#26262B` (overlay); never `#000` or Ink.
- If a value is not a token, it should not be in the code.

---

## 18. Do / don't

Do
- Use one accent for the one thing that matters on a screen.
- Pair every status with an icon and a word.
- Put the nod ring on every Approve button, everywhere.
- Use borders + micro-shadow for cards; keep rows and fields flat.
- Load in place with one nodding ring; skeletons for longer waits.
- Write short, sentence-case, outcome-first copy.

Don't
- Don't hard-code Wine or any HEX in components; read `--accent*` and role tokens.
- Don't colour Approved with the accent, or anything "approved" in Wine.
- Don't add a "Needs your nod" status.
- Don't use pill buttons, Instrument Sans, italics, 700 weight or all caps in the product.
- Don't use spinners, three dots, black toasts, red/yellow banners or full-screen loaders for a save.
- Don't tint shadows, use zebra rows, or invent radii and spacing values.
- Don't use status colours or the accent for tags, avatars or data scales.
- Don't put accent colour on Ink, or the noddo logo next to the company logo.
- Don't mix icon sets or draw custom icons beyond the nod.
- Don't animate illustrations or use bounces, slides or parallax.
