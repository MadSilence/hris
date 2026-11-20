# What changed in the code — for the designers

Newest first. One line per change a designer should know about: a new shared component, a changed
rule in `rules/`, a deviation from SPEC (it is also in `rules/DESIGN_SYSTEM.md` § 7), a new package
version taken in.

- **2026-11-19** — **The design leftovers built and walked.** For the package: **every email from the local and the
  deployed sandbox now goes to Petya and Ulia** (the subject starts `[to: …]`; Ulia is on her noddo address); **50 wrong
  passwords from one IP in an hour hold that IP's password logins for 30 minutes** (Q-54's table); **D3 "Set up again"**
  works (`sign-in-second-step`); **no "HR" in automations** (`automations-list`); a signing Wait card says "… is
  signed" (`automations-editor`); the trigger's company line names the zone (`automations-triggers`); the 4 px
  `scroll-thumb` (`automations-run-history`); W15's two lines and CM01's "past the deadline" in the proposed words,
  final in DQ-22 (`home-widgets`, `company-hub-manage`); initials at 28 read 10; the documents-expiry widget is M only
  for an employee (`documents-expiry`); Appearance's Email stage drawn like the real email (`sign-in-appearance`);
  notification sentences and the calendar export write a weekday date with the comma ("Mon, 2 Nov 2026"); the
  personal time format is gone. Later the same day: the signing wait's words in the sentence and the run window too;
  *New page* in a hub with no section makes "New section"; an empty folder shows no upload line to someone who cannot
  upload. On 2026-11-20: **on Documents the selection bar takes the view tabs' row** (`documents-tab`), and the shared
  `SelectionBar` no longer adds a gap above itself in any list.
- **2026-11-19** — **Two briefs are yours**: `briefs/DOCUMENTS_TEMPLATES_BRIEF.md` (the template editor — the most urgent: Send for signature, the Sign task and "Open the template" wait on it) and `briefs/NOTIFICATIONS_BRIEF.md` (its § 11 holds seven questions). Open questions after the fix rounds, written out with where to look: `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
- **2026-11-19** — **Corrections to the lines below, and the documents answers built.** The 2026-11-18 line "The Upload
  dialog (M3) is not redrawn yet" is no longer true: the documents build's answers of 2026-11-18 (batch 11) landed —
  **our own `PdfViewer`** on pdf.js in the signing screens and the tab's preview (not the browser's viewer); **"Their
  manager · {name}"** first in the signer picker, a one-click button that adds today's manager as a person;
  **the upload window as drawn (M3)**, 800 wide in two columns; **dropping files onto a folder tile**, with its
  drop-target state; **Sign in a running process** (Add task offers it; the document goes out when the task opens);
  **a Home card for every signing waiting on you**, sent from a profile too; the automation step's **meta line** and
  A01's **New** mark. What differs is the "Built" of `documents-tab`, `documents-send-for-signature`,
  `documents-signing`, `automations-send-for-signature` and `process-sign-task`. The nine `sign-in-*` login screens are
  now `built` (they were built and walked on 2026-11-13; each "Built" says what differs). Home round 1's package is
  filed at `handoffs/2026-11-18-fixes-home`. New questions Q-56–Q-63.
- **2026-11-19** — **Login fixes round 1 built and walked** (`handoffs/2026-11-19-fixes-login`; what differs is the "Built" of
  `sign-in-root`, `sign-in-registration`, `sign-in-company-login`; your answers Q-54, your question Q-55). For the package:
  **a refusal on any login form is one `InlineAlert` (declined) at the head of the form**; field errors are Error text
  #A12215 with the alert icon, 8 under the field; **`CodeInput` fills the form width** (60 × 56); **the trial lives at
  `/signup`**; **an unknown company address never shows a login form**; **no dialog draws an outline around itself** (the
  shared dialog, every dialog in the product); **an email address inside an email is never a link**. A second local
  company, `live-sandbox`, is live, for invitations and first logins.
- **2026-11-19** — **Company hub fixes round 1 and Home widgets fixes round 1 built and walked** (`handoffs/2026-11-19-fixes-*`;
  what differs is the "Built" of `company-hub`, `company-hub-page`, `company-hub-manage`, `home-widgets`, `home-edit`;
  your questions Q-49–Q-53). For the package: **a dropdown is its own search** — the shared `Combobox` (single, multiple,
  multiple with chips inside the field) under every searchable select; **initials follow one rule** inside the avatar
  itself (a type role sized to the avatar, 600, a per-person tag tint from berry, ocean, indigo, teal, bronze, plum —
  never gray); **dates with a weekday take a comma** ("Fri, 20 Nov"), the weekday alone inside this week, relative times
  "15h ago"; the **`saved` scene** is in; **`<Illustration size="s">` draws a scene without `-s` at 160** (Home widgets
  keep 96); **every date picker** now greys refused and other-month days (it drew them in Ink); post types are gone; the
  login ring grid has 4 px of room (C3 of the misc round is closed).
- **2026-11-19** — **Automations fixes round 1 and misc fixes round 1 built and walked** (`design-fixes-automations-1`,
  `design-fixes-misc-1`, kept in `handoffs/2026-11-18-fixes-*`; what differs is the "Built" of each `automations-*`
  screen, `home-widgets` and the new `automations-split` and `profile-finish`). Your questions are Q-45–Q-48. For the
  package: **`SearchBox` has two sizes** (`sm` 32 / 13 for toolbars — the default — and `md` 36 / 14), **`FilterChip`
  carries a count** and can drop its check, **every dropdown menu is the A11 menu** (min 210, rows 32, gap 2, Ink icons,
  a divider line before the last), **every confirmation dialog is one column 16 apart**, **`SegmentedControl` has a
  `window` size** (C9), new type roles `text-avatar-xs` (10/10 600) and `text-avatar-s` (11/16 600), shadows
  `--shadow-segment` and `--shadow-bar`, and This week's `--confetti-2` / `--confetti-light`. The no-results magnifier
  has the solid ring everywhere. **Conditions are one flat AND list everywhere**, the trigger's "Only when" included.
  **Every email is from "noddo <no-reply@noddo.so>"** (Q-21 closed). **Times follow the company's country** like dates:
  12-hour in the US, 24-hour elsewhere. Split works in the current build — "it adds nothing" was the sandbox you checked,
  which was older.
- **2026-11-18** — **Home fixes, round 1 built** (`design-fixes-round-1`; what differs is the "Built" of `home`,
  `home-edit` and `home-widgets`). For the package: **`SegmentedControl` has a small size** (`size="sm"`: a pill 28 high,
  segments 24, 12/20, the picked one 500 — on Mist with level 0, on white with no shadow, on the band white 16 %) — Q-1's
  control stays as built, and Who's out, Edit home's Color/Light and the size switch use the small one. New Home-only
  type roles (`text-home-input` 18/26, `-badge-day` 18/26 500, `-day` 16/16, `-micro` 11/18 600, `-pill` 16 500) and
  shadows (`--shadow-ai-box`, `--shadow-ai-box-open`); `--text-hero-l` is 52/52 and `--text-hero-s` 44/44. **`--band-tint`**
  is Rose on Wine and the accent mixed into what sits on the band for any other colour — the package names it
  `accent-tint`; put it in the next version. **Empty cells on Home are allowed** (each widget keeps its cell); **dates
  follow the company's country** (US month first, everyone else day first; nobody picks it) and **weeks start on the
  company's first day**. **To sign** is built; **My time stays out** (the owner). An approval's time-out reads **"Count as
  declined"** (Q-2). "Red" is measured in OKLCH (Q-30). Q-29 — the nine presets — waits for your next package version.
- **2026-11-18** — **The documents round built** (nine screens `built`; what differs is each spec's "Built"). New shared components to carry into the package: **`ColumnPicker`** (a header icon and a menu of checkboxes, tinted while a column is hidden), **`InlineRename`** (a preview's title that renames in place, the extension outside the field), **FolderTile** with its **Icon and color** window. **The selection bar is restyled product-wide** as you drew it — white, 48, a hairline and a shadow tinted with the company colour (`--shadow-selection`), above the list — so People's bar changed too. The Upload dialog (M3) is not redrawn yet.
- **2026-11-18** — **The documents round taken in** (`handoffs/2026-11-17-documents`, nine screens `ready`). The
  owner took it as drawn: everything it asks of the code is built as designed (`QUESTIONS.md` Q-31–Q-43, answered).
  **Russian stays** in the product (Q-42), so every string of the round gets its Russian. **The drawn signature** is
  in, the pad and the phone. **Templates are written in noddo's editor**, not uploaded (Q-44) — the Templates
  round's brief follows. The round's product rules are in `rules/` now (`DESIGN_SYSTEM.md` §§ 4 and 7, `NAMING.md`
  § 5, `FORMS_AND_FIELDS.md` § 7, `TABLES_AND_LISTS.md` § 3); the selection bar's earlier rule (Mist, in the
  toolbar's place) is replaced by yours.
- **2026-11-13** — **Appearance built** (`screens/sign-in-appearance`, `built`). The presets are the nine (Q-24);
  the package still has the old ten, so seven of the nine are derived in code meanwhile (Q-29). **A light accent writes
  Graphite, not Ink**, on its fill, product-wide. **A red workspace** (Cherry, Tangerine, a close "Your own") turns the
  confirm dialog's destructive button into a red outline — `data-accent-tone="red"` beside the accent, the rule in
  `styles/globals.css` (Q-30 says how "close" is measured). The company **background** (Your color · Light) paints the
  login pane and sets Home's default top. New components to carry into the package: the **ring swatches** with the nod,
  the **colour picker** (square, hue bar, Color code), the **logo drop zone**, the **preview stage**.
- **2026-11-11** — **Home built from the handoff** (`screens/home`, `home-edit`, `home-widgets`, all `built`; what
  differs is each spec's "Built"). The owner left out **My time** and **To sign**, made the AI box a stub and the
  birthday a person's own choice (`QUESTIONS.md` Q-7). Deviations from SPEC follow each spec's "Changes to SPEC" and
  are tokens in `styles/globals.css`, for Home only: `rounded-widget` 28, `rounded-ai-box` 18, `rounded-tint` 12,
  `shadow-widget`, `shadow-deck`, `text-home-greeting`, `text-widget-title`, `text-deck-line`, `text-hero-s/m/l/xl/xxl`,
  the band and its ring. New components to carry into the package: **`WidgetCard`**, **`WidgetGrid`**,
  **`HomeHeader`** (band, greeting, My profile), **`AiBox`**, **`DecisionCard`** and its deck, **`EditHome`** with
  the widget catalogue row. The settings page Settings → General → Home is gone. Q-3 to Q-6 are answered as you
  recommended: sizes in the same layout list, the header beside it, the skip order per person on the server, one
  read for the automations week.
- **2026-11-06** — **Automations built from the handoff** (`screens/automations-*`, all eight `built`). New shared
  components to carry into the package: **`SegmentedControl`** (`components/ui/SegmentedControl` — built from the
  frames: 32 high, radius 8, the picked segment white on Mist at level 1; `QUESTIONS.md` Q-1), the canvas
  **`StepCard`**, **`CanvasToolBlock`** with its joined tool window, **`WhoSeesWhat`**, **`ReadRows`**, the
  **`ConditionBuilder`**, the **`PeoplePicker` with roles**, **`TokenTextField`**, **`AutomationCard`**,
  **`AiPromptField`**, **`TestRunResult`**, **`RunRow`**. Deviations from SPEC follow each spec's "Changes to SPEC";
  what was built differently is each spec's "Built". The app shell gained a canvas mode: the sidebar folds to 64 px
  and opens over the page on hover (`components/layout/AppFrame`).
- **2026-11-06** — **Settings → Automation → Workflows is gone**: it was only a "coming soon" page, and
  Automations already is what the word means. Seven "coming soon" pages remain, not eight
  (`screens/empty-state-illustrations/spec.md`, row 66).
- **2026-11-06** — `empty-state-illustrations` built. Package change, approved by Ulia: SPEC § 10 gains the
  rule **"no sharp corners in illustrations"**, sixteen new scenes and seven S cuts, the redrawn automations
  and the six rounded scenes (all-caught-up, policies, goals-and-growth, announcements, signing, surveys),
  and the 404 page's own drawing, the one illustration that moves (§ 10, § 12). The package's SVGs now live
  in the repo, in `styles/noddo/assets/illustrations/`, and `components/illustrations/scenes.tsx` is
  generated from them (`npm run illustrations`): a new drawing is a new file there and one command. Carry
  the same files into the package itself. `ListEmptyState` gained `filtered` — a filter that left nothing
  shows no-match-s — and its archived view now always shows the archive box.
- **2026-11-05** — This folder started. The current deviations from SPEC — light tooltip, the range
  band, the Mist selection bar, white dialogs, accent for every positive action, no wordmark in the
  sidebar, twelve policy colours and the policy marker, the decision bar — are in
  `rules/DESIGN_SYSTEM.md` § 7, for the next package version.
