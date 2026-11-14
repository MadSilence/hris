---
status: built
screen: sign-in-appearance
owner: Ulia
updated: 2026-11-13
---

# Settings → General → Appearance (L)

## What it is for
The company picks its logo and its colour; they go on the login page, in every email and all over noddo. It is one of the first pages a trial owner sees, so it is half landing, half settings: it sells, and the stage on the right shows the real result before Save.

## Where it lives
`<company>.<root>/settings/general/customisation` (as today), `PageGate SETTINGS.GENERAL VIEW`; changing needs the edit right (else view only). Behaviour: Notion § 14.11, changed by the owner (2026-11-13):
- **No background photo** for the login and **no custom headline / sub-heading** — the login is always the company's colour, logo and name, and "Log in to Acme". → remove the image upload, both switches and the two text fields (and their `company_appearance` fields, or leave them unused).
- **The logo moves here** from Company (Q-23).
- Frames are drawn at a MacBook Pro 14" screen, **1512 × 982**.

## Layout
App sidebar 240 (Settings active). No title row — the back button (40 circle) alone, then the page itself, two columns: left 420, gap 56, then the stage.

**Left column** (a flex column; Save is pinned to its bottom):
- Heading "Make noddo / feel like Acme" (Inter Tight 600 44/46); the second line is in the colour being tried — the exact picked colour, a light one included. Lead: "Your logo and color go on the login page, in every email and all over noddo."
- **1 Add your logo** (step number in an accent-subtle 24 circle). A drop zone (dashed 1.5 border-strong, radius 16, padding 16): the logo tile 56 (white, 1 px divider — **a logo without its own background always sits on white**, here, in the sidebar, on the login and in emails), the file name, "Drop a new one or choose a file." and "Remove" (destructive text). The size hint "Square PNG, JPEG or SVG, 256 × 256 px or more. Saved on upload." shows **only while there is no logo**.
- **2 Pick your color**. With a logo: "From your logo" (13/18 tertiary) and up to three rings taken from the file — near-white, near-black and greys are skipped; only the picked one shows its HEX under it (JetBrains Mono 11/16). Then a 1 px divider, then our presets: nine rings 44 / 9 px stroke in a 5-column grid with names under them, and a tenth, "Your own", a conic gradient ring. Picked: the ring nods 7 px down, gets a 2.5 px ring of its own colour with a 4 px white gap (Your own: Ink), its name 600 in a Mist pill. With "Your own": "Your own · {#HEX}" under the grid; clicking it opens a picker popover (radius 10, level 2, 260 wide, **beside the rings, over the left edge of the stage, so nothing below moves**): a saturation/brightness square 150 high, a hue bar 12, a "Color code" field (#rrggbb, with or without #) with a chip of the colour.
- **3 Pick a background** — one line: the step heading on the left, a pill segmented control on the right (36 high, 3 px padding, the picked half white with a hairline and a soft shadow): **Your color · Light**. No thumbnails; the stage shows the result. Default: Your color.
- **Save** (lg, primary — never disabled, product rule) and a status beside it: "All changes are saved." / "You have unsaved changes." / busy "Saving…" / "Saved. Everyone at Acme sees it now." The Save button takes the colour being tried. Save and its status are **pinned to the bottom of the column**, so they do not move when the rings above change.

**Right — the stage:** Mist background, radius 32 on its left corners, a quiet grey ring grid (#DADADF; the nodding ring in the accent) — neutral, so the company colour on the previews is the only colour. Pills on top: "Inside noddo" · "Login page" · "Email" (picked = accent fill). "Not saved yet" chip top-right while there is a draft. Centred in the stage: Inside noddo = the real Home (`screens/home`, HF01 Colour top or HF02 Light top) in a browser frame; Login page = the company login (RC2) in a browser frame + the phone login (3 px frame) overlapping it; Email = the invitation email (M2). Foot: "Live — this is what Acme sees".

**Draft vs saved:** picking repaints the stage, the heading's second line and the Save button; the rest of the page (sidebar, links) keeps the saved colour until Save (the stage is an island — DESIGN_SYSTEM § 2).

## The presets (final, 2026-11-13)
Nine on the grid, in this order, plus "Your own". Wine is what a company starts with.

| # | Name | HEX | Text on it |
|---|---|---|---|
| 1 | Wine | #6E1630 | white |
| 2 | Cherry | #BE123C | white |
| 3 | Tangerine | #C7501E | white |
| 4 | Sunflower | #F5C518 | **Graphite #2A2A2E** |
| 5 | Basil | #2E7D32 | white |
| 6 | Indigo | #4338CA | white |
| 7 | Ocean | #0369A1 | white |
| 8 | Mulberry | #5B2A6E | white |
| 9 | Black | #0B0B0C | white |
| — | Your own | any #rrggbb | by contrast |

- Graphite stays in the code as a value, off the grid.
- **A light colour** (Sunflower, or a light "Your own"): the buttons, the login pane, Save and the active tab take Graphite #2A2A2E; links and text on white take the same hue darkened until 4.5 : 1. Decided by contrast, never by a list — exactly as `accent.ts` does it.
- Every other preset carries white text at 4.5 : 1 or better.

## Light — the background (for every company)
"Light" changes what sits **behind the logo**, where outsiders look:
- **Login page** (computer and phone): the pane and the phone's top strip become **Gray 50** with **Gray 200** rings; the nodding rings take the company colour, or **the logo's colours** when the logo has several. The white side and every state of the login are untouched.
- **Emails**: the band (both the big one and the slim one) becomes Gray 50; the canvas around the card turns **white** and the card gets a **1 px Gray 200 border** — many inboxes are grey, and mail apps drop shadows.
- **Home**: not redrawn. The company's choice sets the **default** of Home's own Colour / Light top (`screens/home` HF01 / HF02) for everyone at Acme; each person can still switch it for themselves.
- Everything else keeps the company colour: buttons, links, the active item, charts, focus.
- **Auto-Light:** when an uploaded logo turns out to have two or three colours and the company has never changed its background, Light goes into the draft (the stage shows it) and is saved only with Save. A background the company already chose is never touched.

## A colour close to a status colour
Statuses are never themed (SPEC § 4.5): Approved stays Pine, Declined red, Pending amber, and a status is always icon + word. Three rules keep a company colour and a status apart:
1. A status never takes the accent.
2. Status pills are always soft (light bg, dark text, icon). Solid fills only for counters and toast icons.
3. In a workspace whose accent is a red (Cherry, Tangerine, or a "Your own" within 25° of Declined #C42B1C), the destructive button in a confirm dialog becomes a **red outline** instead of a red fill; everywhere else it keeps its fill.

In Appearance, when the picked colour is within 25° of a status hue, a quiet line shows under the rings (14/14 icon, 13/18 tertiary): "Close to the color noddo uses for approvals. Statuses always show an icon and a word, so they stay readable." Nothing is blocked. After the preset swap none of the nine is inside 25° (the closest are Basil 29° from Approved and Indigo 20° from In progress), so the line is mainly for a colour from "Your own". Frames: L8-Close, L8-Rules.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Skeletons with shimmer (the drop zone, the ring grid, the stage window). | L6-Loading |
| Empty | No logo yet: the drop zone "Drop your logo here / or choose a file. Until then, the first letter of Acme stands in." with the size hint; "From your logo" is absent; the previews show the first letter. | L1-NoLogo |
| No results | — | — |
| Error | Wrong code: the field's error "Enter a color as #rrggbb, like #2f63c4.", the chip and "Your own" keep the last good colour, the stage too. Refused logo: red dashed zone + "That file can’t be used. Upload a PNG, JPEG or SVG up to 5 MB." (Q-25). Save failed and the version conflict: **in the place of the status beside Save**, red with an icon — "We couldn’t save your changes. Try again." / "Someone else saved first. Reload to see their changes, then make yours." (Reload is the underlined word). Couldn't load: `ErrorState` (something-broke) "We couldn’t load Appearance" / "Something went wrong on our side. Try again in a moment." / "Try again". | L3-Invalid, L4-Refused, L5-Failed, L5-Conflict, L6-Failed |
| No permission | View only: Mist `Banner` "Only people who can manage company settings can change Appearance.", the rings and the segmented control dimmed, the logo read-only, no Save; the stage still works. | L6-ReadOnly |
| Normal | Saved (all three tabs); Basil picked (draft); picker open; a light colour, where the adjustment is said in the picked line itself — "Text and links a little darker to stay readable" (quiet, with an info icon, so nothing below moves); logo drag-over ("Drop it here / It replaces the current logo."), uploading ("Uploading {file}…" / "It appears everywhere as soon as it’s in."); saving; saved (the whole page turns to the new colour). | L1-*, L2-*, L3-*, L4-*, L5-* |
| Light picked | The login page, the email and Home in Light; a logo with several colours. | L7-Light-Login, L7-Light-Mail, L7-Light-App, L7-Light-Multi |
| Long content | A long company name: the heading wraps; the previews follow `sign-in-company-login` long. | — |

Each screen in both backgrounds, side by side: `LT1`…`LT7` (login computer, login phone, email with a big band, email with a slim band, Home, a multi-colour logo on the login and on Home).

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Pick a ring | step 2 | Draft colour; the stage, the heading line and Save repaint. | no |
| A colour from the logo | step 2 | The same; it is the accent, nothing else changes. | no |
| Your own | step 2 | Opens the picker; a valid code is the draft. | no |
| Drop / choose a file | step 1 | Uploads and saves the logo at once (no Save); every preview shows it; its colours appear under "From your logo". | no |
| Remove | step 1 | Removes the logo at once; the first letter comes back. | no |
| Your color / Light | step 3 | Draft background; the stage repaints. | no |
| Save | left, bottom | Saves the colour and the background (version-checked). Nothing changed → nothing happens. Wrong code → the field's error. | no |
| Reload | the conflict status | Reloads the page with the colleague's values. | no |
| Inside noddo / Login page / Email | stage | Switches the preview. | no |

## Words
Quoted above; full list `words.md`. Preset names: Wine, Cherry, Tangerine, Sunflower, Basil, Indigo, Ocean, Mulberry, Black, Your own.

## Values
Page 1512 × 982. Left column 420, gap 56 to the stage; heading 44/46; rings 44 / 9, grid of 5, gaps 16/6; the logo colours' rings the same size; divider 1 px border-divider, 16 above and below; drop zone radius 16; segmented control 36 high, pills radius 999, the picked half white + 1 px divider + shadow 0 1px 2px rgba(11,11,12,.08); steps 40 apart; Save pinned to the bottom with 24 above it; stage radius 32; browser frames radius 14, bar 24; stage tabs 34 pills. Light: Gray 50 (#F7F7F8) with Gray 200 (#DADADF) rings; the email card's border 1 px Gray 200. Rest SPEC § 6, § 13.

## Changes to SPEC
- Display heading 44/46 on a settings page; the rings as colour swatches; the Mist stage with the ring grid; the custom-HEX picker. Approved by the owner as the "selling" settings page.
- **The preset list changes** (SPEC § 4.3 / tokens): Wine, Cherry, Tangerine, Sunflower, Basil, Indigo, Ocean, Mulberry, Black replace Wine, Brick, Terracotta, Sun, Forest, Teal, Denim, Iris, Raspberry. Graphite stays as a value, off the grid.
- **A light accent** writes Graphite #2A2A2E, not Ink, on fills (SPEC § 4.4 says "dark text"; this fixes which dark).
- **Light background** is a new company-wide setting beside the accent (login pane, email band, Home's default top).
- **A red workspace** turns the destructive fill into an outline (SPEC § 4.6).

## New components
- **Ring swatches** (radiogroup) with the nod, in two groups: from the logo and ours.
- **Colour picker popover** (square, hue, code field).
- **Drop zone** (shared with `first-run-welcome`).
- **Preview stage** (tabs + framed previews in a draft accent).
- **Segmented control** (pill, two halves) — the kit's, as on Home.

## Open questions
- Q-25 — logo formats and size limit (the code's answer is in `QUESTIONS.md`). Blocks nothing.
- Q-29 — the package still carries the old ten presets. Blocks nothing.
- Q-30 — "close to a status" by hue and lightness; the quiet line for approvals only. Blocks nothing.

## Built
- **Where to see it:** `/settings/general/customisation`. Code: `components/modules/settings/modules/general/companyAppearance`
  (`AppearancePage`, `LogoDropZone`, `ColorRings` with `ColorPicker`, `AppearanceStage` with `AppearancePreviews`),
  the accent in `lib/theme/accent.ts`, the page's styles in `styles/globals.css` (`.appearance-*`).
- **Answered on the way:** Q-23 — Company shows the logo read-only with "Change it in Appearance". Q-24 — the nine
  presets replace the old ones everywhere (`accent.ts`, the backend's `AccentPreset` and its CHECK, the catalogue).
  Q-26 — a person's own Colour / Light top is stored as before; when they never chose one (or pressed Reset in Edit
  home) Home takes the company's background. Q-27 — the backend takes the colours when the logo is uploaded (PNG
  and JPEG; a WebP gives none): pixels sampled, transparent, near-white, near-black and greys skipped, quantised,
  shades merged, at most three with 5 % of the colourful pixels or more; removing the logo removes them.
- **Differs from the design:** the formats say PNG, JPEG or WebP and no SVG (Q-25). The logo's file name is shown
  only for a file uploaded in this visit; otherwise the tile reads "Your logo" (the stored logo keeps no name for the
  page). "Inside noddo" is the shell and Home's top in the draft — the sidebar, the greeting, the band and quiet
  widget cards — not the live Home with a person's data. The login preview is the real `AuthSplit` with a still form;
  the phone is the strip and the form. The invitation email is drawn in the page, not rendered by the backend (the
  emails are the next batch). The segmented control is the kit's, at 36. The quiet line shows only near Approved, and a
  "red workspace" is measured by hue and lightness (Q-30).
- **Images of the real screen:** not taken yet — the screen has not been walked.
