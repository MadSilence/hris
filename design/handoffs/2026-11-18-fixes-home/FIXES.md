# Design fixes — round 1 (collecting, not sent yet)

For Petya's Claude Code. One iteration: after this round the built screens must match the design exactly.
Status: **collecting**. The package is sent when Ulia says it's complete.

## How to use this package

You don't have the design boards and you don't need them. Everything is in this package:

- **This file.** Every fix gives the exact values: px, hex, font size / line height / weight, the words.
- **`references/`** holds the approved design as static HTML, with a PNG of each. Name: `<screen>@<window width>.html`. Open the HTML in Chrome at that window width and inspect any element in DevTools for any value this file doesn't spell out. The HTML wins over a vague sentence; a number in this file wins over the HTML.
- **Sizes to check:** MacBook Air 15 — **1710 × 1112** (main), MacBook Air 13 — **1470 × 956**. These are CSS px, the browser window's content area. Older 1440 frames stay valid; their widths follow Part 3.
- **Change nothing that isn't listed here.**
- **"Exception"** means the design deliberately differs from `styles/noddo/SPEC.md`. Follow this file there.

**Colour values used below** (Wine workspace, light; for other presets the token names apply):

| Token | Value | Token | Value |
|---|---|---|---|
| `accent` / `accent-text` | #6E1630 | `text-primary` (Ink) | #0B0B0C |
| `accent-subtle` | #F6F1F3 | `text-secondary` | #45454A |
| `accent-muted` | #E9DCE0 | `text-tertiary` | #6B6B70 |
| `accent-ring` | #B78B98 | `border-divider` | #EAEAEC |
| `accent-tint` (Rose, text on the Color band) | #F2B8C6 | `border-field` | #DADADF |
| `mist` | #F3F3F5 | `border-strong` | #B4B4BA |
| Pending bg / text / icon | #FFF3DF / #7A4800 / #985A00 | Approved text | #135C3A |
| `shadow-0` | 0 1px 2px rgba(11,11,12,.05) | `shadow-2` (level 2) | 0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.08) |
| `shadow-1` (level 1) | 0 1px 2px rgba(11,11,12,.06), 0 2px 6px rgba(11,11,12,.06) | `shadow-3` / `shadow-4` | 0 8px 32px rgba(11,11,12,.14) / 0 12px 40px rgba(11,11,12,.18) |

Fonts: text is Inter; titles, big numbers and the greeting are Inter Tight. Sizes are written `font-size/line-height weight`, e.g. `13/20 500`.

---

## Part 1 — Answers to `design/QUESTIONS.md` (approved by Ulia, 2026-11-18)

When applying: delete each entry from `QUESTIONS.md` and write the answer where it lives.

### Q-1 — Segmented control
Accepted as built: height 32, radius 8, the picked segment white on Mist #F3F3F5 with `shadow-1`. The designers add `SegmentedControl` to the package with these values; nothing changes in the code. Home's Who's out and Edit home use a smaller one — see H10 and E7 / E11b.

### Q-2 — An approval's time-out option
The option reads **"Count as declined"** (replaces "Go on" and the interim "Treat it as declined"). It follows the Declined path.

### Q-7 — What was cut from the Home handoff
- **My time: build it.** Attendance is a module of the product. When a company has Attendance on, My time is a **required** widget on Home for everyone Attendance applies to. It is always there and cannot be removed in Edit home (no remove control), but it can still be moved and resized. When Attendance is off, it is not shown. People log their day through it: Start the day · Break · Back to work · Finish the day. Entering time by hand stays in the Attendance tab. Reference: `references/LW04-mytime@1710.html` (all its states) and `design/screens/home-widgets/spec.md` § 4.
- **To sign: build it.** E-signing exists now. Build To sign as in `references/LW07-tosign@1710.html` and `home-widgets/spec.md` § 7. "My documents" in the profile menu gets the Pending tag "{n} to sign" (H13).
- **Birthday:** the person's own choice — a switch in personal preferences, on by default. Personal settings are not designed yet; until they are, everyone's birthday shows.

### Q-29 — The package's preset list
Agreed: the next package version carries the nine presets (Wine, Cherry, Tangerine, Sunflower, Basil, Indigo, Ocean, Mulberry, Black; light and dark values; Sunflower with Graphite #2A2A2E on its fill) and drops the eight old ones. The designers prepare it.

### Q-30 — When a workspace counts as "red"
Purpose: in a red workspace the accent-filled buttons look like the red destructive button, so the confirm dialog's destructive button becomes a red outline.
- **Red presets: Cherry and Tangerine.** Wine, Mulberry and the other burgundy or dark colours are not red.
- **Rule for any colour (presets and "Your own"), in OKLCH:** red when hue is **10°–42°**, lightness **0.46–0.68**, chroma **≥ 0.12**. This replaces the HSL test (hue ± 25°, lightness ± 0.15) in `lib/theme/accent.ts`.
  Check values: Cherry #BE123C (L 0.51, C 0.198, h 17) red · Tangerine #C7501E (0.58, 0.163, 41) red · Wine #6E1630 (0.36, 0.122, 9) not red · #9B1B30 (0.45) not red · #F06A2A (h 43) not red · #C2185B (h 6) not red · #E53935 red.
- The quiet "Close to the color noddo uses for approvals" line in Appearance stays, for Approved only.

---

## Part 2 — New in Automations: "If it fails" on every step (approved by Ulia, 2026-11-18)

Screen: the step settings window in the automation editor (`design/screens/automations-steps`), plus run behaviour (`automations-run-history`).
References (1440 × 932, the editor's existing size):
- `references/S8-if-it-fails@1440.html` — default.
- `S8b-if-it-fails-skip@1440.html` — "Skip it and go on" picked.
- `S8c-if-it-fails-depends@1440.html` — a later step depends on it.

All three are the existing S2 "Create a task" screen with the settings window scrolled to its end.

**Where:** the last block of every step's settings window, after "Only if". Above it, a 1 px #EAEAEC divider running the full width of the window (`margin: 4px -20px 0`), the same as the one above "When". The settings window scrolls as it does today.

**What:**
- Label "If it fails", 13/18 500 Ink.
- Under it, a radio group of two with 12 between options. Radio: 16 × 16, picked = 5 px `accent` border, unpicked = 1.5 px #B4B4BA border, `margin-top: 2px`; 10 between radio and text.
- Each option is a 14/20 400 Ink line, then 2 px, then a hint 12/16 400 #6B6B70:
  - **Stop and tell the owner** — default — hint "The run waits until someone fixes it."
  - **Skip it and go on** — hint "The next steps run without it."

**Applies to:** every step kind. Approval and Wait until keep their own time-out settings. "If it fails" is about a step that can't be done (no one to assign, a person who left, a missing field), not about a time-out. Existing automations get "Stop and tell the owner", which is today's behaviour.

**The step card on the canvas** (S8b): with "Skip it and go on", the card gets a second meta line under its meta. It holds a skip icon 14 (`M5 5l8 7-8 7z` + `M19 5v14`, stroke 2), 6 px gap, then "Skipped if it fails" in 12/16 #6B6B70. The card grows from **96 to 116** high; the connector, "+" and every step below move down 20. With the default nothing is added.

**A later step depends on it** (S8c), e.g. Wait until "The task is done" waits for this step's task:
- **A note under "Skip it and go on":**
  - Indented 26 px to the option text; fill #FFF3DF, radius 8, padding 8 10.
  - A warning triangle icon 14 in #985A00, `margin-top: 1px`, 8 px gap.
  - Text 12/16 #7A4800: "Step {n} waits for this task. If this step is skipped, step {n} is skipped too."
- **On that later step's card:** a second meta line with the same warning icon 14 #985A00, text 12/16 **#7A4800**: "Skipped if step {n} is skipped". That card also grows 96 → 116.
- Nothing is blocked; the note is information only.

**In a run:**
- **Stop and tell the owner:** as today. The run is Failed, the owner is notified, and the actions are Skip this step / Choose an owner / Retry the run.
- **Skip it and go on:**
  - The step's status is **Skipped** (inactive tone: #F3F3F5 bg, #45454A text, #6B6B70 icon), with the reason line "This step failed, so it was skipped: {reason}".
  - The run continues and is not Failed. No notification.
  - A step skipped because the one it needs was skipped: Skipped + "Step {n} was skipped, so there was nothing to wait for."

**Words (all new):** If it fails · Stop and tell the owner · The run waits until someone fixes it. · Skip it and go on · The next steps run without it. · Skipped if it fails · Step {n} waits for this task. If this step is skipped, step {n} is skipped too. · Skipped if step {n} is skipped · This step failed, so it was skipped: {reason} · Step {n} was skipped, so there was nothing to wait for.

**Also in these references:** the Assignee hint reads "If there's no one to assign, the step fails." (drop "and the run tells you why"; the new block says what happens).

**Changes to SPEC:** none — existing radio, divider, hint, Pending tone (SPEC § 4.5).

---

## Part 3 — Home on different window widths (approved by Ulia, 2026-11-18)

References:
- `references/HF01-home-bold@1470.html`, `@1710`, `@1920`, `@2560`.
- `references/HF06-narrow@1280.html` (narrow).

Today the built Home centres a narrow column on a wide window and leaves empty fields beside the widgets. It must instead:
- **Always 4 columns** (`WidgetGrid`), so a person's Edit home layout is the same on every screen.
  - Columns are fluid: `grid-template-columns: repeat(4, minmax(0, 1fr))`, gap 24.
  - Widget heights never change: S 160, M/L 344 (`grid-auto-rows: 160px`).
- **The page fills the window.**
  - `main` keeps its padding of 56 left and right.
  - The header (My profile, date, greeting, AI box) and the grid share one container: `width: 100%; max-width: 1200px; margin: 0 auto`.
- **Wider than 1200 of content** (a monitor, or the browser zoomed out): the container stays 1200 and sits in the centre. The colour band (Color top), its ring and the page background always run the **full width** of `main`, never the container's.
- **Narrow** (content under 1000 px — a 1280 screen, or zoomed in): unchanged from the handoff, as `HF06-narrow@1280`. That means 3 columns, and the AI box drops under the greeting.

| Window | Sidebar | Content width | One column | Container left edge (from the window's left) |
|---|---|---|---|---|
| 1470 × 956 | 240 | 1118 | 261.5 | 296 |
| 1710 × 1112 | 240 | 1200 | 282 | 375 |
| 1920 × 1080 | 240 | 1200 | 282 | 480 |
| 2560 × 1440 | 240 | 1200 | 282 | 800 |

---

## Part 4 — Fixes to built screens

_The live app (local-sandbox) at 1710 × 1112 and 1470 × 956. Every control was clicked and measured in the DOM against the references. "Now" is what the live app does; "Must be" is the exact target._

### 4.0 Dates — product-wide (Ulia, 2026-11-18)
The app writes US dates ("Wed, Nov 18", "Nov 25–27") and starts weeks on Sunday for everyone. **The date format follows the company's location:**
- **Every company outside the US: European format** — day before month, no comma after the weekday: "18 Nov", "18 November 2026", "Wednesday, 18 November", "Wed 18 Nov"; ranges "25–27 Nov", "30 Nov – 2 Dec".
- **Companies located in the US: US format** — "Nov 18", "November 18, 2026", "Wednesday, November 18", "Wed, Nov 18"; ranges "Nov 25–27", "Nov 30 – Dec 2".
- **First day of the week: Monday by default** for every company. A company can switch it to Sunday in company settings, and every calendar, date picker and week view follows it.

Applies to every screen, toast, tooltip and email. Examples for a non-US company: the time-off dialog "Wed, Nov 25 – Fri, Nov 27" → "Wed 25 – Fri 27 Nov"; the Time off pill "Nov 25–27" → "25–27 Nov".

### 4.1 Home (`/dashboard`)
References:
- `references/HF01-home-bold@1710.html` / `@1470` (Color top).
- `HF02-home-light@…` (Light top).
- `HF03` / `HF04` (all widgets).
- `HF05-long-name@…`.
- `P01-profile-menu@…`.
- `A01-ai-open@…`, `A02-ai-long@…`.
- Widget states, one sheet per widget with empty / filled / loading / error: `LW01-waiting` … `LW10-automations`.

Matches already, no change:
- Widget cards: radius 28, padding 24 / 20, `shadow-widget`; heights 344 / 160.
- Widget titles: Inter Tight 20/26 500, letter-spacing −0.02em.
- Greeting: Inter Tight 52/56 500.
- The colour band, the Edit home button and the time-off request dialog.

The AI box shows its "Request time off" chip only when the person has a policy — correct.

| # | Where | Now | Must be |
|---|---|---|---|
| H1 | AI box, open | Re-checked live at 1710: the box widens to the left from 520 to **640 wide** (x 879), over the end of the greeting ("Good afternoon, Ulia" is cut; worse with a long name). The greeting and date stay visible. Padding 16, shadow `shadow-2`, no ring. Input text 14/20. Chips white, 13/18 500, padding 0 12. Adds a hint "Shift + Enter for a new line" (12/16). | `references/A01-ai-open@1710` (empty) and `A02-ai-long@1710` (long text); same at `@1470`.<br>**Box:**<ul><li>On focus it **takes the whole greeting row**, from the container's left edge to its right edge (the same container as the grid, Part 3).</li><li>Radius 18, white, padding 12 8 8 18, column with gap 10.</li><li>Shadow `0 0 0 3px #E9DCE0, 0 10px 32px rgba(11,11,12,.14)`.</li><li>Anchored to the **bottom of the row**: it grows upward on the same bottom line as the closed box, so nothing below moves.</li></ul>**Inside:**<ul><li>First row: spark ✦ 18 `accent`, 12 gap, input 18/26 400 Ink (placeholder #6B6B70); it wraps and grows upward with long text.</li><li>Second row, gap 8: three chips "Request time off", "Who’s out Friday?", "My balance". Each is 32 high, padding 0 12, radius full, 1 px #DADADF border, transparent, 13/20 500 #45454A.</li><li>Then the send button on the far right: 40 × 40, radius 12, `accent` fill, white arrow.</li></ul>**While the box is open, the date and the greeting fade out in place** (opacity 0, 150 ms, no movement). They fade back when it closes (blur / Escape / sent).<br>Suggestions and search results open as a list **under the box, over the widgets**, as today.<br>**Drop** the "Shift + Enter" hint.<br>Narrow layout (box under the greeting): the box keeps its full row; nothing fades. |
| H2 | Date above the greeting | `#FFFFFF` at 72 %, "Wednesday, Nov 18" | Color top: **#F2B8C6**; Light top: `accent-text` #6E1630. 14/20 500. Text **"Wednesday, 18 November"** (4.0). |
| H3 | This week · rows | Day as "Sat, Nov 21", so names cut to "Budi · 2 ye…"; avatar 28; name 14/20; "Later this week" 12/16 **600** | `references/LW06-week@1710`.<ul><li>**Date without the weekday: "21 Nov"** (today: "Today"), 13/22 500 #6E1630, `flex: none`.</li><li>Avatar **24**.</li><li>Name and what **13/22**.</li><li>Group label "Later this week" 12/16 **500** #6B6B70.</li></ul> |
| H4 | This week · logic | "Later this week" lists Mon 23 Nov (next week) | Only the rest of this week, up to the last day of the company's week (4.0). If the widget shows the next 7 days instead, the label is **"Coming up"**. |
| H5 | Processes · rows | "3/7" sits right of the name | `references/LW09-processes@1710`. The count sits **right of the progress bar, on the same line**, 12/16 #6B6B70, 8 px gap. |
| H6 | Next time off · empty | Only "No time off booked" | `references/LW03-next@1710`, empty state:<ul><li>Calendar illustration, size S.</li><li>Title "No time off booked", 15/22 600.</li><li>Line "Plan your next break.", 13/18 400 #45454A.</li><li>Button "Request time off" — secondary, 36 high (H20).</li></ul> |
| H7 | Next time off · date badge | 36 × 40, radius 8, month 12/16 600, day Inter 15/22 600 | **42 × 46, radius 12**. Month 11/18 600 on #F6F1F3; day **Inter Tight 18/26 500**. Label "days to your vacation" **13/18** #45454A. |
| H8 | Time off · request pill | 32 high | **36 high**, radius full. A pending request: 1.5 px dashed `accent` border, white fill. |
| H9 | Time off · no policy | "Ask HR to add you to one." | **"You're not added to one yet."** (product rule: no "HR" in system text). Same line in `home-widgets/spec.md`. |
| H10 | Who's out · switch "My team / Everyone" | `SegmentedControl` 32 (segments 28, 13/18, both 500) | **Exception — a small switch:**<ul><li>Group **28 high**, padding 2, track #F3F3F5, radius full.</li><li>Segments 24 high, padding 0 10, 12/20.</li><li>Picked: white fill, Ink, 500, shadow `0 1px 2px rgba(11,11,12,.05)`.</li><li>The other: no fill, 400 #45454A.</li></ul> |
| H11 | Who's out · days | Day number Inter 14/20 | Day number **Inter Tight 16/16**. Tooltip date in European format: "Annual leave · Wed 18 – Fri 20 Nov". |
| H12 | Who's out · bars | Avatar 28, padding 0 12 0 2 | `references/LW05-whosout@1710`.<ul><li>Avatar **26**.</li><li>Bar padding **0 3**.</li><li>Text 13/20 500 (H21).</li><li>Free space under the bars shows **"Upcoming"** (name · type · dates) when there is some.</li></ul> |
| H13 | My profile menu | Re-checked live 2026-11-18 at 1710: starts with "Ulia Tykoon" (12/16 500) and a divider; has an "Edit home" item; **no divider between My attendance and Personal settings** | `references/P01-profile-menu@1710`.<ul><li>**No name header — the menu starts with the actions.**</li><li>**No "Edit home" item.** Edit home is only the button at the end of Home.</li><li>Order: My profile · My time off · My documents · My attendance — divider — Personal settings — divider — Log out.</li><li>"My documents" gets the Pending tag "{n} to sign" when there is something to sign. "My attendance" shows only with Attendance on.</li><li>Items 32 high, padding 0 8, radius 8; icon 16 #45454A; text 14/20 400 Ink.</li><li>Menu 260 wide, padding 4, radius 10, `shadow-2`, 1 px #EAEAEC border. Dividers 1 px #EAEAEC, margin 4 0.</li></ul>Already correct: item size, icon, menu box. |
| H14 | Time off · no-policy state | The "My time off" link is missing | Keep the "My time off" link in the title row in every state. |
| H15 | Links in widget title rows (Inbox, My time off, Calendar, See all, All) | 13/18 500 | **13/20 500** #6E1630 (row height 20). |
| H16 | AI box, closed | Shadow `shadow-2`; chip "Request time off" white, 13/18, padding 0 12 | Box shadow **`0 10px 32px rgba(11,11,12,.10)`** only.<br>Chip: **transparent**, 1 px #DADADF border, radius full, 32 high, **12/20 500 #45454A, padding 0 10**. |
| H17 | My profile pill (top right) | Text 15/22 **600** | Text **16 px 500**, `line-height: normal`, white. Pill unchanged: 44 high, padding 0 14 0 4, radius full, fill white 14 %, 1 px white 26 % border. |
| H18 | Time off · numbers and pill text | Big number Inter Tight 52/**56**; pill dates 13/18; status 12/16 **600** | `references/LW02-timeoff@1710`.<ul><li>Big number Inter Tight **52/52 400**.</li><li>Pill dates **13/20 500**.</li><li>Status word **12/20 500** in its status colour (Approved #135C3A, Pending #7A4800), with its 14 icon.</li></ul> |
| H19 | Processes · rows and counter | Counter "1" in **Inter Tight** 12/16 600; name 14/20; type line 12/16; avatar initials 12/16 500 | <ul><li>Counter: **Inter** 12/16 600 #6E1630 on #F6F1F3, radius full, height 22, padding 0 7.</li><li>Name **14/18 500**.</li><li>Type line **12/18 400** #6B6B70, or #7A4800 when overdue.</li><li>Avatar 28 with initials **11/20 600**.</li></ul> |
| H20 | Empty states inside widgets (Waiting on you, My tasks, Automations, Next time off …) | Line under the title 14/20; action button 32 high, 13/18 | Empty states in `references/LW01-waiting`, `LW08-tasks`, `LW10-automations`, `LW03-next`.<ul><li>Title 15/22 600 (unchanged).</li><li>Line **13/18 400** #45454A.</li><li>Action button: **secondary, 36 high, 14/20 500, padding 0 14**, radius 8, white, 1 px #DADADF.</li></ul> |
| H21 | Who's out · bar text | 13/18 500 | **13/20 500**, in the leave type's text colour. |
| H22 | Next time off · big number | Inter Tight 44/48 | Inter Tight **44/44 400**. |
| H23 | Date size | — | Keep **14/20 500**. The reference HTML renders it at 16 because the font size was not set there; this number wins. |
| H24 | Automations · empty-state line | "Let noddo do the routine work." | **"Let noddo handle the routine."** (Ulia, 2026-11-18). Same line in `home-widgets/spec.md`. |

### 4.2 Edit home
References:
- `references/EF01-open@1710.html` / `@1470` (open).
- `EF02-all`, `EF03-size`, `EF05-search`, `EF06-no-results`.
- `EF09-drag`, `EF10-added`, `EF11-widget-size`, `EF12-removed-light`, `EF13-reset`, `EF14-discard`.
- `EF15-saving`, `EF16-saved`, `EF17-light`.
- Loading / error / long name: `EF04-loading`, `EF07-error`, `EF08-long`.
- The entry button at the end of Home: `E01-edit-entry`.

All of these are at both sizes.

Works as designed, no change:
- Opening from the "Edit home" button at the end of Home.
- Size popover.
- Remove with toast + Undo; add with "+".
- Reset to default + Undo.
- Color/Light switch.
- Cancel with changes → the confirm dialog (matches EF14).
- Save → "Home saved".
- Waiting on you locked (no remove).
- The remove button and size tag on the zoomed page scale with the page, as in the reference.

**Edit bar (the header)**

| # | Where | Now | Must be |
|---|---|---|---|
| E1 | Opening from the end of the page | The page stays scrolled to the bottom; "Edit home", Cancel and Save are off-screen | Scroll to the top when edit mode opens. |
| E2 | Width of the edit bar vs the page | The bar runs to x 1190 while the zoomed grid ends at x 889 — they don't line up | The edit bar spans from the page's left padding (56 from the sidebar) to **520 from the window's right edge** (the 480 panel + 40). The zoomed grid spans **exactly the same width**.<br>Edit bar width: 1710 → **894**; 1470 → **654**. |
| E3 | Zoom and the colour band | Zoom 0.56 at every width (~300 px empty right of the grid at 1710); the band ends exactly at the bottom of the first row of widgets | **Zoom = edit-bar width ÷ Home's content width (Part 3).** 1710: 894 ÷ 1200 = **0.745**. 1470: 654 ÷ 1118 = **0.585**. 1440: 0.56.<br>**The band ends part-way down the first row**, never on a widget edge. Band height = 189 + 198 × zoom: **337** at 1710, **305** at 1470, 300 at 1440. |
| E4 | Subtitle "Try things out. Nothing changes until you press Save." | Color top: white 72 %. Light top: #45454A | 13/18 400. Color top **#F2B8C6**; Light top **#6B6B70** (`EF17-light`). |
| E5 | Cancel and Save | Cancel: white fill, Ink text, 1 px #DADADF border, 36 high. Save: 110 wide (space kept for "Saving…"), padding 0 14 | **Cancel — exception:**<ul><li>On the Color band: transparent, 1 px border white 40 %, **white** text 14/20 500, **38** high, radius 8, padding 0 14 (76 wide).</li><li>Light top (`EF17-light`): the same shape — **transparent**, 1 px #DADADF border, Ink text, 38 high, padding 0 14. Live it is white and 36 high.</li></ul>**Save:**<ul><li>On the Color band: white fill, Ink 14/20 500, **36 high, padding 0 16, as wide as its word (65)**.</li><li>Light top: #6E1630 fill, white text, the same 36 high, padding 0 16, 65 wide. Live it is 82 wide.</li><li>While saving it reads "Saving…" with the spinner ring (`EF15-saving`).</li></ul>8 px between Cancel and Save. |
| E6 | "Reset to default" | A 36-high button, Ink 14/20 on wine (unreadable), padding 0 14 | A **plain text link, no button box**: 13/20 500, **white** on the Color band, Ink on Light; underline on hover. Right-aligned to the edit bar's right edge, on the same line as "Header". |
| E7 | "Header" label and the Color/Light switch | Label 13/18. Switch: Mist track on wine, segments 13/18 500, padding 0 12, picked with `shadow-1`; unpicked "Light" #45454A on wine (unreadable). The word reads **"Colour"** | **Word: "Color"** (US spelling, as everywhere in the product).<br>"Header" **12/20 500**, white (Ink on Light).<br>**Switch:**<ul><li>**28 high**, padding 2, radius full, as wide as its two words (**103** at these sizes).</li><li>Track **white 16 %** on the Color band; **#EAEAEC** on Light (not Mist).</li><li>Segments 24 high, **12/20**, padding **0 10**.</li><li>Picked: white fill, Ink, **500**, no shadow.</li><li>Unpicked: **white, 400** on Color; #45454A, 400 on Light.</li></ul> |
| E18 | Widgets inside edit mode | Their buttons and switches turn grey and disabled ("Request time off" #9C9CA3 on Mist; "My team / Everyone" grey) | Widgets look **exactly as on Home** (normal colours, accent buttons). They are just not clickable in edit mode: `pointer-events: none` on the widget content. Nothing is ever shown disabled (product rule). |
| E21 | Divider between the title row and the "Header" row | Padding 16 above the second row; divider white 20 % | **Padding 12**; divider 1 px **white 18 %**. |

**Panel (right, "Widgets")**

| # | Where | Now | Must be |
|---|---|---|---|
| E8 | Category chips | White with a 1 px border, 14/20, the picked one with a ✓ | **Exception:**<ul><li>32 high, radius full, gap 8, padding 0 12.</li><li>Unpicked: **#F3F3F5 fill, no border**; label 13/20 500 #45454A, count 13/20 **400**.</li><li>Picked: **Ink #0B0B0C fill, white text**, no ✓.</li></ul> |
| E9 | "Pick a size, then drag the widget onto your home or click +" | 13/18 500 | **12/20 400** #6B6B70. |
| E10 | Widget rows · text | Name 15/22 600; description 13/18 500 #45454A | Name **14/18 500** Ink; description **12/18 400** #6B6B70. |
| E11 | "+" (add) | A "+" character, off-centre | **32 × 32, radius 8, 1 px #6E1630 border, transparent**, with a **plus icon 16** (stroke 2, #6E1630) centred: `<path d="M12 5v14M5 12h14"/>` in a 24 viewBox. It is an icon, not a "+" character.<br>Placed on the right of the row, vertically centred to the preview. "On your home" (E20) replaces it when the widget is already on the page. |
| E11b | Size switch in the panel rows and in the widget's size popover (Small · Medium · Large) | Segments 12/16, **all 500**, padding 0 12, picked with `shadow-1`; group 140 wide | <ul><li>Group **28 high, padding 2, #F3F3F5 track, radius full** (≈ 173 wide with three sizes).</li><li>Segments **24 high, 12/20, padding 0 10**.</li><li>Picked: white fill, Ink, **500**, shadow `0 1px 2px rgba(11,11,12,.05)` only.</li><li>Unpicked: #45454A, **400**, no fill.</li></ul>In the popover (`EF11-widget-size`) the same switch is followed by a 1 px #EAEAEC divider and a red trash icon button 32. |
| E11c | The panel's corners and edge | Radius 20 on the left corners, no border | **Square corners (radius 0)**, a 1 px #EAEAEC border on its left edge, shadow `0 8px 32px rgba(11,11,12,.14)`, white, padding 24, full window height, **480 wide**. |
| E12 | Search field | Re-checked live: the field is a 36-high box with a 1 px **#EAEAEC** border even while focused; the clear button is a 24 × 24 box | `references/EF05-search` / `EF06-no-results`.<ul><li>One field 36 high, full panel width (431), radius 8, padding 0 12.</li><li>Search icon 16 #6B6B70 on the left; text 14/20 400 Ink starting 37 from the field's left edge.</li><li>Border 1 px #DADADF; **focused or with text: 1 px #6E1630**.</li><li>Clear: a plain × 16 #6B6B70 **inside** the field, 12 from its right edge, no box.</li></ul> |
| E13 | Search · no results | Re-checked live: the empty state sits right under the field (title at y 212). Title "No widgets match “{query}”" 14/20 500; "Try another word." 14/20 400 #6B6B70; "Clear search" 32 high, 13/18, padding 0 12 | `references/EF06-no-results`.<ul><li>**Centred vertically** in the panel's list area (product rule).</li><li>Illustration 96 × 60 (as now), then the title **15/22 600** Ink.</li><li>"Try another word." **13/18 400 #45454A**.</li><li>"Clear search": secondary button, **14/20 500, padding 0 14**, height 36 (SPEC button), radius 8, 1 px #DADADF.</li></ul> |
| E19 | Panel rows · box | Radius 12, padding 12 8, no divider | **No radius**; padding 12 0; a 1 px #EAEAEC line between rows.<br>Hover: #F3F3F5 fill on that row only, and the "+" border and icon stay #6E1630. |
| E20 | "On your home" | 13/18 500 | **12/20 400** #6B6B70. |

**Drag and drop**

| # | Where | Now | Must be |
|---|---|---|---|
| E14 | Dragging **from the panel** onto the page | **Not built.** Panel rows can't be dragged; only "+" adds | **Drag and drop from the panel** (Ulia, 2026-11-18); see `EF09-drag`.<ol><li>Press on a row's preview and drag it onto the page.</li><li>It becomes the widget at the size picked in that row, lifted: `shadow-4`, rotate 2°.</li><li>A **drop place opens under the pointer**, snapped to grid cells, at the widget's size: dashed 1.5 px #E9DCE0, radius 28.</li><li>Release → the widget lands there.</li><li>Toast: "“{name}” added · Undo".</li></ol> |
| E15 | Dragging **on the page** | The order changes only through native HTML drag events: no lifted widget, no drop place, nothing moves aside (Ulia: "there is no drag and drop") | **Drag and drop on the page** (Ulia, 2026-11-18).<br>Press and drag the widget itself, no click first. It lifts: `shadow-4`, rotate 2°, 3 px #6E1630 outline. A **drop place** at its size follows the pointer in grid cells (same style as E14). Release → it lands there.<br>Use pointer events (mouse and trackpad), not the HTML drag API.<br>**Empty cells are allowed** (new decision; replaces "nothing ever leaves a hole" in the `home` spec and the dense flow):<ul><li>Each widget keeps the cell where it was dropped: store column + row per widget, and don't re-pack the grid.</li><li>A widget dropped on another one pushes that one down.</li><li>Role defaults are still placed without holes.</li></ul> |

**Toasts and movement**

| # | Where | Now | Must be |
|---|---|---|---|
| E16 | Toasts | A toast from a cancelled session ("Home reset to default · Undo") stays and stacks under new ones after Discard | Discard, Cancel and Save clear this session's toasts. Never offer Undo for a discarded session. |
| E17 | Removing a widget | The page jumps up and the other widgets re-pack | Its cells stay **empty** (holes are allowed, E15). Nothing else moves; the page does not scroll. |

### Not checked live yet (no data in the sandbox)
These have references; check them against these once there is data:
- Waiting on you with cards (`LW01b-cards`, `LW01c-approve-motion`, `LW01d-skip-motion`).
- My tasks with tasks (`LW08-tasks`).
- Processes with several (`LW09-processes`).
- Automations with runs (`LW10-automations`).
- This week with a birthday today (`LW06-week`).
- To sign and My time (`LW07-tosign`, `LW04-mytime` — not built yet).
- Loading and error states of every widget (each LW sheet).

### Seen outside Home (for the next screens, no fix in this round)
- A time-off request Ulia created on 2026-11-18 did not reach anyone as something to approve: nothing in Waiting on you or Inbox → Needs action. Please check where requests go and who gets them.
- Organization → person → Manager field: the open list has its own search box. Product rule: the field itself is the search.
- The 404 page has no app sidebar.
