# Design fixes — Automations (round 1) + two new steps

For Petya's Claude Code. Same rules as the Home package (`design-fixes-round-1/FIXES.md`). After this round the Automations screens must match the design exactly.

## How to use this package

You don't have the design boards and you don't need them. Everything is in this package:

- **This file.** Every fix gives the exact values: px, hex, font size / line height / weight, and the words.
- **`references/`** holds the approved screens as static HTML, with a PNG of each:
  - `<screen>@1710.html` — MacBook Air 15, 1710 × 1112. This is the main size.
  - `<screen>@1470.html` — MacBook Air 13, 1470 × 956.
  - `<screen>@1440.html` — the drawing as it was made.

  Open the HTML in Chrome at that window width and inspect any element for a value this file doesn't spell out. **Open menus and popovers keep their 1440 position in the 1710/1470 files.** Take their position from the trigger, and their size and style from the file. The canvas content also keeps its 1440 position; the dashed line to the settings window is stretched so it still ends on the window (C1b).
- **`new-screens/`** holds two new steps with their own `spec.md`: Send for signature and Split by a condition (section N below).
- **Precedence:**
  - The HTML wins over a vague sentence.
  - A number in this file wins over the HTML.
  - Where `design/screens/automations-*/spec.md` and a drawing disagree, this file says which one wins.
- **Change nothing that isn't listed here.** Several fixes are in shared parts (step window, tool window, filter chip, search box). They are marked **shared**: fix them once and every screen that uses them follows.
- Colours and shadows are those in the table at the top of the Home `FIXES.md`. The ones used here:

| Name | Value |
|---|---|
| Ink | #0B0B0C |
| text-secondary | #45454A |
| text-tertiary | #6B6B70 |
| step number | #9C9CA3 |
| mist | #F3F3F5 |
| surface-subtle | #F7F7F8 |
| border-divider | #EAEAEC |
| border-field | #DADADF |
| border-strong | #B4B4BA |
| accent | #6E1630 |
| accent-subtle | #F6F1F3 |
| accent-muted | #E9DCE0 |
| accent-ring | #B78B98 |
| shadow-0 | `0 1px 2px rgba(11,11,12,.05)` |
| shadow-1 | `0 1px 2px rgba(11,11,12,.06), 0 2px 6px rgba(11,11,12,.06)` |
| shadow-2 | `0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.08)` |
| shadow-3 | `0 8px 32px rgba(11,11,12,.14)` |

Checked live on local-sandbox, 2026-11-18, at 1710 × 1112. The list grid was re-checked at 1470 × 956 (3 fluid columns, 378 each — matches). Sizes of windows and dialogs don't change between the two widths.

"Now" is what the live app does; "Must be" is the target.

---

## A. Automations list (`/automations`)

References (the archived view `E5` was checked live with Ulia's archived automation — only A7–A9, A11, A13, A15 apply): `E1-List`, `E2-List-empty`, `E3-List-loading`, `E4-List-no-results`, `E5-List-archived`, `E6-List-view-only`, `E7-List-error`, `W3-Owner-bottom-right`.

| # | Where | Now | Must be |
|---|---|---|---|
| A1 | Page subtitle "Routine HR work that runs by itself." | #45454A | **#6B6B70**, 14/20 400. |
| A2 | "Add automation" | Plus icon, 158 wide | **No icon**: text only, 36 high, padding 0 14, 136 wide. |
| A3 | Tabs Automations / Activity | Each tab is 44 high with its own 2 px bottom border; no line under the row | <ul><li>Label 14/20 500 with padding-bottom 10 (tab 30 high).</li><li>Picked: Ink text + a 2 px #6E1630 underline (`box-shadow: inset 0 -2px 0 #6E1630`).</li><li>Other tab: #6B6B70. 24 between tabs.</li><li>**A 1 px #EAEAEC line under the whole row**, full width.</li></ul> |
| A4 | Vertical spacing | Header → tabs 24, tabs → toolbar 24 | Header (56) → **20** → tabs (31) → **20** → toolbar (32) → **20** → grid. |
| A5 | Search box (**shared** — also Activity) | 260 × 36, text 14/20, icon at 14, padding-left 40; 12 to the chips | **240 × 32**, radius 8, 1 px #DADADF, padding 0 10, search icon 16 #6B6B70 then 8 px gap, text/placeholder **13/20** 400 (placeholder #6B6B70). **8** between the box and the first chip. Focused: 1 px #6E1630 + `0 0 0 3px #E9DCE0` (already correct). |
| A6 | Filter chips (**shared**) | 14/20 500, check icon 16 | **13/18 500**, 32 high, radius full, padding 0 12, gap 6 inside, 8 between chips. Picked: Ink fill, white text, **check icon 14**. Not picked: white, 1 px #DADADF. "Starts when" chevron 14 Ink. |
| A7 | Card — spacing | Rows at 17 / 61 / 105 / 158 from the card's top | The card is a column with **gap 8**: status row (32) at 17, icon + name (36) at 57, "starts when" line (20) at 101, footer at 158. Name padding-top **7** (live 6). Card 212 high, radius 16, padding 16, 1 px #EAEAEC, `shadow-0` (correct). |
| A8 | Card — Draft pill (**shared** — also the editor header and the Name dialog preview) | 24 high, white fill | **22 high, transparent**, 1 px dashed #9C9CA3, radius full, padding 0 8, pen icon 14 #6B6B70, gap 4, 12/16 600 #45454A. |
| A9 | Card — ⋯ button and the icon tile | Icons #6B6B70 | ⋯: 32 × 32 ghost, radius 8, icon 16 **#45454A**. Icon tile: 36 × 36 #F3F3F5, radius 8, icon 20 **#45454A**. |
| A10 | Card — owner avatar | Initials 12/16 500 | Avatar 24, initials **10/10 600**, in the person's avatar colours (or their photo). |
| A11 | Card ⋯ menu (**shared** menu style) | 160 wide, rows padding 6 10, no gap, icons #6B6B70, separator before Delete #F3F3F5 edge to edge | <ul><li>Menu **min 210 wide**, padding 4, radius 10, 1 px #EAEAEC, `shadow-2`, **gap 2** between rows.</li><li>Rows 32 high, padding **0 8**, radius 8, gap 10, icon 16 **Ink**, 14/20 400 Ink. Hover #F6F1F3.</li><li>Before Delete: a 1 px **#EAEAEC** line, margin 4 0.</li><li>Delete: icon and text #C42B1C.</li></ul> |
| A13 | "Archived" toggle (right of the toolbar) | "Archived (1)" in one string, 14/20, with a check icon when on | The word and the count apart: **"Archived"** 13/18 500 + count **13/18 400 #6B6B70** (on: white 70 %), archive icon 16, no brackets, no check icon. A6 chip style. |
| A14 | Card footer — last run | "Last run today, 03:58 PM · 1 run" | As drawn: "Last run today, 09:00 CET · 312 runs" — **with the time zone**. Time in the company's time format (Q-4); this sandbox shows 12-hour — if the company is set to 24-hour, it is a bug. |
| A15 | Archived card footer | "Archived Nov 18 by … · 0 runs" | European date (4.0): **"Archived 18 Nov 2026 by {name} · {n} runs"**. |
| A12 | No results (search or filters) | Content right under the toolbar; title 14/20 500; line #6B6B70; "Clear filters" 32 high, 13/18 | `E4-List-no-results`.<ul><li>The empty state sits **inside a card**: 1 px #EAEAEC, radius 16, `shadow-0`, from the toolbar down to the page's bottom padding.</li><li>Content centred vertically, gap 12.</li><li>Title **Inter Tight 18/26 600** Ink; line 14/20 **#45454A**.</li><li>"Clear filters": secondary, **36** high, **14/20** 500, padding 0 14.</li><li>Picture: the no-match scene for chips/filters, no-results-s for a plain search.</li></ul> |

## B. Editor — canvas and header

References: `J2-Floating-tools-closed`, `S2-Step-create-task`, `D2`–`D5`, `H4-Long-content`, `R3`/`R4` (read mode).

| # | Where | Now | Must be |
|---|---|---|---|
| B1 | Header — "Test run" icon | 16 | Play icon **20** (buttons are 36 high, padding 0 14, gap 8). The Draft pill is A8. |
| B2 | Tool block (left) | 48 wide, padding 4, gap 4, no border | **52 wide**, padding **6**, gap **8**, radius 16, **1 px #EAEAEC**, `shadow-1`. Buttons 40 × 40, radius 8, icon 20 #45454A. Picked tool: #E9DCE0 fill, icon #6E1630. When a tool window is open the block takes `shadow-3` and its right corners become square (joined to the window, E1). |
| B3 | Sentence card | Padding 20 24; text Ink; 16 below the canvas top | Padding **16 20**; text Inter Tight 18/26 600 (spec; the drawing's 28 is not the target) in **#45454A**; highlighted parts #6E1630 on #F6F1F3 (picked part on #E9DCE0), radius 6, padding 0 4. **24** below the canvas top. 720 wide, radius 16, 1 px #EAEAEC, `shadow-0`. |
| B4 | Step cards | Kind line 12/16 **400**, icon gap 6; meta line at 66; cards 98 / 78 high | Card 320 wide, radius 10, padding 16, 1 px #EAEAEC, `shadow-1`, a column with **gap 8**: kind line 12/16 **500** #6B6B70 with icon 16 and **gap 8**; name 15/22 600 Ink; meta 12/16 400 #6B6B70. Heights: **96** with meta, **80** without. Step number 12/16 500 #9C9CA3, 15 from the top and 17 from the right. Selected: 1.5 px #6E1630 + `0 0 0 3px #E9DCE0`. |
| B5 | "+" between steps | 20 × 20, 1 px #EAEAEC, icon 12 #6B6B70 | **24 × 24**, white, 1 px **#B4B4BA**, radius full, plus icon **14 #45454A**. The connector is 1.5 px #B4B4BA. |
| B7 | **New — save status in the header** (Ulia, 2026-11-18) | Nothing tells whether an edit is saved; after typing a message you can't tell if closing keeps it | Right after the status pill (12 px gap), one line of text, 13/18 400 #6B6B70, no box:<ul><li>**"All changes saved"** — nothing unsaved (also right after Save draft / Save changes).</li><li>**"Unsaved changes"** — something was edited since the last save. Text #7A4800 (Pending text) so it is noticed.</li><li>**"Saving…"** — while a save is going.</li></ul>Shown in edit mode only (not in read mode). It changes the moment a field changes, typing included. The "Save your changes?" dialog on leaving (G12) stays. |
| B6 | Zoom control | 130 × 36; buttons 36 × 34 radius 10; "100%" a 56-wide button 13/18 500 | **130 × 42**, padding 4, gap 4, radius 10, 1 px #EAEAEC, `shadow-2`. Buttons **32 × 32, radius 8**, icon 16 #45454A. "100%" is **text, not a button**: 48 wide, **12/20 400** #45454A, tabular numbers. 24 from the canvas's right and bottom edges. |

## C. Step settings window (right, 340) — **shared by every step**

References: `S1-Step-notify`, `S1b`, `S1c`, `S2`–`S7`, and `S8`, `S8b`, `S8c` (the "If it fails" block, already in the Home package Part 2; now also at 1710 and 1470 here).

| # | Where | Now | Must be |
|---|---|---|---|
| C1 | The window | 1 px #EAEAEC, `shadow-2` | **1.5 px #B78B98** (`accent-ring`), radius 16, **`shadow-3`**. 16 from the canvas top and right; it ends above the zoom control and scrolls inside. |
| C1b | The dashed line from the selected card to the window | 1 px, #6E1630, dash 4 4, and it **stops 16 px before the window** | It runs at the card's vertical middle from 3 px right of the card (outside its focus ring) **to the window's left edge exactly** (touching the window's border). **1.5 px, #B78B98** (`accent-ring`), dashes like a CSS `1.5px dashed` border (SVG: `stroke-width 1.5`, `stroke-dasharray 4.5 4.5`). The trigger's line is the same. Ulia checked it on screen 2026-11-18. **The line never ends in empty space** (Ulia, 2026-11-18): when a step is selected, the canvas pans so the card's vertical middle lands within the height of the step window — if the window is shorter than where the card is, the flow moves up, past the top edge if needed — and the line always ends on the window's border. Same on every step and the trigger. |
| C2 | Header | Eyebrow "Step 1 · Send a notification" 12/16 **400**; title = the step's own name ("Tell their manager"); padding 16 20 12 | As `spec.md` § Layout 7: <ul><li>**Eyebrow "Step N"** (the trigger: "What starts it"), 12/16 **500** #6B6B70, the step-type icon 16 before it, gap 8.</li><li>**Title = the step type**, 15/22 600 Ink ("Send a notification", "Create a task").</li><li>The step's own name is edited in the fields, not shown here.</li></ul>Padding **16 12 12 20**, 1 px #EAEAEC line under it. Note: `D5-Both-panels` shows the old header and is outdated here. |
| C3 | Header buttons | ⋯ #6B6B70; the trigger window has only × | **⋯ and ×** on every window, the trigger's too. 32 × 32 ghost, radius 8, gap 4, icons 16 **Ink**. |
| C4 | Body and fields | Padding 16 20; label → control 6; a grey "*" after required labels | Padding **16 20 20**, gap 16 between fields. Label 13/18 500 Ink, then **8**, then the control. **No "*"** — the step can't be saved without them anyway. |
| C5 | Select (**shared**) | Content gap 6 | 36 high, radius 8, 1 px #DADADF, padding 0 12, content gap **8**, chevron 16 #6B6B70. |
| C6 | Person / role chips in a field ("Who gets it") | 24 high, radius 6, 13/18 **500**, × 16 in a 20 box | **26 high, radius full**, #F3F3F5, padding 0 8, gap 6, **13/20 400** Ink, × icon **12** #6B6B70 with no box. Field: 1 px #DADADF, radius 8, padding 4 6, gap 6. |
| C7 | Message field | Text 14/24, padding 8 12 | Text **14/22**, padding **10 12**, min 88 high. Tokens stay as they are (13/18 500 #6E1630 on #F6F1F3, radius 6, padding 0 6 — the spec's value). Hint under it "Type @ to insert a field." 12/16 #6B6B70. |
| C8 | When — radios | 12 between options | **10** between options. The radio itself is the product's radio (no change). |
| C9 | "Later" — Before / After switch | Segments radius 8, 13/18; picked with `shadow-1` | Track #F3F3F5, radius 8, padding 2, gap 2, 170 × 32. Segments 28 high, **radius 6**, **13/20 500**. Picked: white, Ink, shadow **`0 1px 2px rgba(11,11,12,.08)`** only. Other: #45454A. |
| C10 | "Later" — "each person's time zone" | #6B6B70 | 14/20 **#45454A**. |
| C11 | "Add a condition" (**shared** — trigger, steps, Who it runs for) | A 32-high ghost button, #45454A, icon 16 | **A text link**: 13/18 500 **#6E1630**, plus icon **14** #6E1630, gap 6, no box (18 high). |
| C12 | "Who sees what" — header | A 76-high toggle button; the title wraps to two lines ("Who sees / what") | **A plain header, not a toggle**, padding 16 20 12. Eye icon 20 #45454A, gap 8, title 15/22 600 **on one line**, hint "Example · nothing is sent" 12/16 #6B6B70 on the right. Card radius 16, 1 px #EAEAEC, `shadow-1`, 12 under the step window. |
| C13 | "Who sees what" — inside | Label 12/16 **400**, icon 16 #6B6B70; the preview is text only | Well #F3F3F5, radius 10, margin 0 12 12, padding 12, gap 8. Label "In {name}'s inbox · {who}" **12/16 500 #45454A**, icon **14 #45454A**. The preview card (white, 1 px #EAEAEC, radius 10, padding 12, gap 8) starts with the **sender's avatar 24** (initials 11/20 500), then the message 14/20 Ink. |
| C14 | Ask for approval — the no-answer row | [3 days] "then" [select] | **No word "then"**: number field 104 wide, then the select filling the rest (gap 8). |
| C15 | Ask for approval — "Remind them every day" | A checkbox on the left | A **toggle on the right** (32 × 20, #6E1630 when on), the text 14/20 400 Ink on the left, one row. |
| C16 | Wait until — labels | The two radios and the people field have no labels | Label **"Wait until"** above "A task from this run is done / A field is filled", and label **"Tell"** above the people field under "Stop and tell someone" (13/18 500, 8 above the control). |
| C17 | Assign / Grant policy — the "already have it" note | Icon 16 #6B6B70 | #F3F3F5, radius 8, padding 10 12, gap 8; info icon **14 #45454A**; text 13/18 400 #45454A. |
| C18 | Send an email — "Insert a field" | A 32-high grey ghost button under the message | A small link **on the right of the "Message" label row**: 24 high, 13/18 500 #6E1630, plus icon 14, no border. |
| C19 | Step ⋯ menu (Duplicate step · Skip for now · Remove step) | Items correct | Menu style as A11 (200 wide, rows padding 0 8, gap 2, icons Ink, #EAEAEC line before Remove step). |
| C20 | Date trigger (T1) — "Every year" | Label 13/18 500 | **14/20 400** Ink, the toggle on the right, hint under it 12/16 #6B6B70. |
| C21 | Section headings inside a window (**shared**): "If the date has already passed" (T1), "If the change starts later" (T2), "When someone stops matching" (T5) | A field label 13/18 500, no line | **A section of its own**: a 1 px #EAEAEC line above it across the whole window, padding 16 20 0, title **12/16 600 #45454A**, then the radios. |
| C24 | Time off trigger (T3) — "Time off is" | A label above a 4-part switch (Requested · Approved · Declined · Cancelled) | **One row**: "Time off is" 14/20 500 Ink on the left, a **select** on the right (216 wide, 36): Requested / Approved / Declined / Cancelled — four options are a dropdown, not a switch. "Count step days from" stays a 3-part switch (C9 style). |
| C25 | Schedule trigger (T4) — the day of the month | Separate bordered buttons 36 × 32, 13/18 500; the picked day filled #6E1630 | **One grid box**: 1 px #EAEAEC, radius 10, padding 8, gap 2. Cells 40 × 32, 13/20 **400** Ink, no borders. Picked day: a **28 × 28 circle #E9DCE0**, 13/20 **600** #6E1630 (as the date picker). "Last day" spans four cells, #45454A, radius 8. Hint under the box "For months with fewer days, it runs on the last day." 12/16 #6B6B70. "Every" switch: C9 style. |
| C26 | Schedule trigger (T4) — Time zone | A hint under it "Each person gets it at this time where they are." | **No hint** (it repeats the option). |
| C27 | Joins a group trigger (T5) — top | A plain 14/20 paragraph with "Everyone" in bold; "Change it in Who it runs for." under it | <ul><li>A **#F3F3F5 note**, radius 8, padding 10 12, gap 8, info icon 14 #45454A: "It starts when someone begins to match **Who it runs for**: {rule}." 13/18 400 #45454A, "Who it runs for" 600.</li><li>Then a field **"Who it runs for"** (label 13/18 500) with a secondary button 32 showing the rule ("Department is Engineering", 13/18 500, icon 16) that opens the Who it runs for window; hint "Change it in Who it runs for." 12/16 #6B6B70.</li><li>Then the section "When someone stops matching" (C21).</li></ul> |
| C22 | New automation from scratch — the empty "Starts when" card | "Starts when" 12/16 **400**, icon gap 6 | **12/16 500** #6E1630, icon 16, gap **8**. Card as drawn (#F6F1F3, 1 px dashed #B78B98, radius 10, padding 16, gap 8). |
| C23 | New automation from scratch — "Describe it to noddo AI" | 32 high, 13/18, padding 0 12 | Secondary button **36 high, 14/20 500, padding 0 14**, spark icon 16, gap 8. |
| C28 | Schedule trigger (T4, `T4a`–`T4d`) — layout | A 1 px #EAEAEC line across the window before "At"; the "At" time field 96 wide | **No line** before "At" (fields are 16 apart like the rest, C4). Time field **104 wide**, 36 high, padding 0 12, 14/20 400. |
| C29 | Schedule — Every week (`T4b`), "On" day buttons | Picked: #6E1630 fill, white text; others white with a border; 13/18 | 7 buttons 39 × 32, gap 4, radius 8, **13/20 500**. Picked: **#E9DCE0 fill, #6E1630 text, no border**. Others: transparent, 1 px #DADADF, Ink. Several days can be picked (works). |
| C30 | Schedule — Every quarter (`T4c`) | No label above the day grid; hint "Runs on Jan 1, Apr 1, Jul 1, and Oct 1." | Label **"Day"** (13/18 500, 8 above) over the day grid; the grid is C25. "Month of the quarter" switch C9 style. Hint 12/16 #6B6B70, European dates, no comma before "and": **"Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct."** (it follows the picked month and day). |
| C31 | Schedule — Every year (`T4d`) | A month select ("January") plus an always-open day grid, the hint under them | **One date field** (298 × 36, radius 8, 1 px #DADADF, padding 0 12, 14/20 400 Ink) showing the date without a year: **"1 March"**. It opens a date picker popover: 300 wide, white, 1 px #EAEAEC, radius 12, padding 12, shadow `0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.06)`. Inside: a header row 36 high (padding-bottom 8) — prev / next month buttons 28 × 28 radius 8 at the edges, month name **"March" 14/20 600** Ink in the middle, no year; then the day grid (cells 39 × 32, gap 2, 13/20 400 Ink; picked day as C25: 28 circle #E9DCE0, 13/20 600 #6E1630); then the hint **inside the popover**, padding 8 4 0, 12/16 #6B6B70: "No year: it repeats every year. 29 February runs on 28 February in other years." The field has the focus ring while open (1 px #6E1630 + `0 0 0 3px #E9DCE0`). |
| C32 | Schedule — Time zone list (all periods, `T4a`) | A search row on top (40 high); one-line options 32 high with an icon on the right | **No search row** (three options). List: padding 4, gap 2, radius 10, 1 px #EAEAEC, `shadow-2`. Each option: padding 6 8, radius 8, two lines with gap 2 — name 14/20 400 Ink and a line 12/16 #6B6B70; **no icon**. Picked: #F6F1F3. A 1 px #EAEAEC line before the last option. Lines: "Each person's time zone" — "{Person} in {city} gets it at {09:00} {city} time" (a real person of the company, e.g. "Lena in Warsaw gets it at 09:00 Warsaw time"); "Company time zone" — "{Europe/Vilnius} · everyone at the same moment"; "Pick a time zone" — "Any city or UTC offset". |

### C-read. The same window in read mode (Active / Paused, before "Edit")
Reference: `R3-Read-icon-rows`, `R4-Read-who-icon-rows`. Checked live on the active "Onboarding completed".

| # | Where | Now | Must be |
|---|---|---|---|
| CR1 | Window frame and header | As C1–C3 (1 px #EAEAEC, `shadow-2`, name as title, only ×) | Same fixes as C1–C3: 1.5 px #B78B98, `shadow-3`, "Step N" + step type, ⋯ and ×. |
| CR2 | Icon rows | Body padding 16 20, rows 16 apart | Body padding **16 20 20**, rows **18** apart. Each row: icon 16 #6B6B70, gap 12, line 1 14/20 500 Ink, line 2 13/18 400 #6B6B70, gap 2. Tokens in a message keep their chip look (13/18 500 #6E1630 on #F6F1F3, radius 6, padding 0 6). |
| CR3 | Header buttons in read mode | Test run + Edit (secondary) | Matches the spec ("Read mode: Edit (secondary) only", Test run stays). The `R3` drawing shows Turn off + a primary Edit; the spec wins. |

## D. Trigger window and conditions — **shared** (trigger "Only when", step "Only if", Who it runs for)

**Conditions are a flat list joined by AND, everywhere** (Ulia, 2026-11-18): Who it runs for, a step's "Only if", a split's paths **and a trigger's "Only when"**. People conditions already work so. **Change in the trigger's event conditions:** remove the And / Or switch and "Add a group"; their conditions join by AND like the rest. The references `G3`, `G3b`, `T3`, `T3b`, `T6` are redrawn to this.

References: `T1`–`T6`, `T3-Trigger-event-conditions`, `T6-Trigger-process`, `G3-Who-it-runs-for`, `G3b-Who-add-condition`.

| # | Where | Now | Must be |
|---|---|---|---|
| D1 | Conditions box | Gap 8 between condition boxes | 1 px #EAEAEC, radius 10 (spec — the drawing's 12 is not the target; live is correct), padding 12, gap **10**. |
| D2 | A condition group | Padding 8 | #F3F3F5, radius 10, padding **8 6 8 8**, gap 6. |
| D3 | Selects inside a group | Chevron 16; the remove button 32 × 32 with icon 16 | 28 high, white, 1 px #DADADF, radius 8, padding **0 8 0 10**, 13/18 400 Ink, chevron **12** #6B6B70. Remove: **28 × 28**, icon **14** #6B6B70. |
| D4 | Second row (operator + value) | Operator 112 wide; the value is a 138-wide input with a #F7F7F8 fill | Two selects in one row with **padding-right 34**, so they end under the field select. Operator **108**, value **110** (at 340). White like every select. |
| D5 | Before a field is picked | The operator select at **50 % opacity**; the value field greyed | Product rule: **nothing is shown disabled**. Both look normal; picking them first opens the field list. |
| D6 | Between conditions | People conditions: the word "and" between two lines (correct); a trigger's event conditions: an And / Or switch | **Everywhere, the trigger's "Only when" included:** "and" 12/16 400 #6B6B70, centred between two 1 px #EAEAEC lines, gap 8 — exactly what people conditions show today. **No And / Or switch anywhere.** |
| D7 | Under the conditions | 32-high grey ghost buttons, #45454A, icon 16; the trigger's event conditions also have "Add a group" | **Only "Add a condition"**, everywhere — remove "Add a group" from the trigger's event conditions. A **text link**, C11 style (13/18 500 #6E1630, plus icon 14, gap 6, no box). |

## E. Tool windows (left) — **shared**: Add a step, Who it runs for, Run history, Versions, noddo AI

References: `D4-Quick-add`, `D5-Both-panels` (left window only), `G3-Who-it-runs-for`, `G2-Run-history`, `V1`–`V5`, `H1-AI-edge-cases`, `J4-Step-open-left-hides`.

| # | Where | Now | Must be |
|---|---|---|---|
| E1 | The window | No border, `shadow-2` | 320 wide (noddo AI 400), joined to the tool block: radius 0 16 16 16, **1 px #EAEAEC**, **`shadow-3`**. Full height with 16 margins (as now). |
| E2 | Window header | 57 high, padding 12 20, × icon 16 | **53 high**, padding **0 8 0 16**, 1 px #EAEAEC line under it. Title 15/22 600. × 32 × 32 ghost with icon **20** Ink. |
| E3 | **Run history and Versions** | A 244-high card with four round corners, a header without the line (padding 12 16 8), top-aligned empty state | **The same full-height joined window as E1–E2.** Empty state **centred vertically**: picture (spec: scene S), title **15/22 600**, line 14/20 400 #6B6B70, max 240 wide, centred, gap 12. |
| E3b | Run history — with runs (`G2`, `V1`) | Search 36 high (padding-left 40, 14/20); chips "All 1" as one string 14/20 with a check icon; rows: avatar 28 (initials 12/16 500), line 2 "On Nov 18" | Top block padding 12 20, gap 10: search **as A5** (32, 13/20), then chips (gap 6) as H2 — word 13/18 500 + count 13/18 400 #6B6B70 (#DADADF on the picked one), no check icon. Rows: padding 10 8, radius 8, gap 12, avatar **24** (initials 11/20 500), name 14/20 500, line 2 **what the run is about** 12/16 #6B6B70 (time off: "Vacation, 9–27 Dec"; a field change: the field and new value, e.g. "Last name: Novak"); right: status pill + date under it 12/16 #6B6B70 ("Today", "4 Nov"). |
| E3c | Versions — with versions (`V5`) | Rows radius 8, padding 8, gap 10, 4 apart, no lines; badge 24 × 24 radius 6, 12/16; "View" a plain text link 13/18; date "Today, 03:58 PM" | List padding **8 12 0** (8 above the first row). Rows: padding **12 8**, gap **12**, **1 px #EAEAEC line under each row**, no gap between rows. Badge **28 × 28, radius 8**, **12/20 600**: the current version #E6F4EC with #135C3A, older ones #F3F3F5 with #45454A. Line 1 14/20 500 Ink, line 2 12/16 #6B6B70 "{name} · {when}" — "today, 14:20" (lowercase after "·"), older ones European ("28 Oct"); time in the company's format. Under line 2, when runs are still on an old version: "{n} runs still on this version" 12/16 **#7A4800**. "View": **a ghost button 32 high**, padding 0 12, 13/18 500 #6E1630, on the right, top-aligned. The window itself is E1–E3. |
| E4 | Add a step — search | Field padding-left 40 | Wrapper padding 16 20 8. Field 36, radius 8, padding 0 12, icon 16 #6B6B70, gap 8, 14/20. |
| E5 | Add a step — list | Rows 40 high, 280 wide; group labels 12/16 **400** | List padding **8 12**, gap 2. Rows **44 high**, full width (294), padding 0 8, radius 8, icon 20 #45454A, gap 12, 14/20 400 Ink. Hover / keyboard focus #F6F1F3. Group labels 12/16 **500** #6B6B70, padding 8 8 4 (first) and 16 8 4 (next). |
| E6 | Add a step — hint | Right after the list | "Drag a step onto the canvas, or click it to add after the selected step." **pinned to the bottom of the window**: 1 px #EAEAEC line above, padding 16 20, 12/16 #6B6B70. |
| E7 | Who it runs for — body | Padding 16 20; radios 12 apart | Padding **20**, gap 16; radios **10** apart. |
| E8 | Who it runs for — "N people match" box | 44 high; avatars 20, grey #F3F3F5 with initials 12/16 500 #45454A; the whole line 14/20 500; "See who" 13/18 500 | #F6F1F3, radius 10, padding 12, gap 12 (64 high). Avatars **28**, each in its person's avatar colours (or their photo), initials 11/20 500, a 2 px #F6F1F3 ring, overlapping (step 20). Text: "**48 people**" 14/20 **600** + " match" 14/20 400. "See who": a link, 13/20 **400** #6E1630. |
| E9 | noddo AI — composer | A 106-high box with a "Draft with AI" text button shown greyed (#9C9CA3 on #F3F3F5) | Pinned to the bottom of the window, 1 px #EAEAEC line above, padding 16 20 20. Field: 1 px #DADADF, radius 8, padding 10 12, gap 8. Placeholder "Ask for a change" 14/20 #6B6B70. Send: **32 × 32 icon button**, #6E1630 fill, white arrow-up 16, radius 8. Never greyed (product rule). |

## F. Test run

References: `G1a-Test-run-start`, `G1b-Test-run-full`, `G1m-Test-run-dialog`, `G1-Preview-run`.

| # | Where | Now | Must be |
|---|---|---|---|
| F1 | Where it opens | A 400-wide **left** tool window | **The right window** (340, where step settings open; same frame as C1 but 1 px #EAEAEC). The header's "Test run" button shows **pressed** (#F3F3F5 fill). Over the top-left of the canvas, next to the tool block, sits a small bar: white, radius 10, 1 px #EAEAEC, shadow `0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.06)`, padding 10 12 10 16, gap 12; play icon 20 #45454A, "Test run · nothing is sent" 14/20 400 Ink, a secondary "Close" button (32 high, 13/18 500, padding 0 12). |
| F2 | Window header | Title "Test run · nothing is sent"; subtitle 12/16 in a row of its own; icons 16 | Title **"Test run"** 15/22 600, and under it **"Nothing is sent or changed."** 13/18 400 #6B6B70 (gap 2). Expand and × buttons 32 × 32 with icons **20**, gap 2. Padding 16 12 12 20 with the line under it. |
| F3 | "Try it on" | Plain select | Select 36, padding 0 12: the **person's avatar 24** + "Name · dates" 14/20. Hint 12/16 #6B6B70. |
| F4 | The prompt | "Pick a case, then run the test." as plain 14/20 text | A **#F3F3F5 box**, radius 8, padding 12, **13/18 400 #45454A**. |
| F5 | "Run test" | 107 wide with a play icon | **Full width** (298), 36, **no icon**. |
| F6 | "What would happen" | Badges 20; line 1 = the step's name 14/20 **500**; "Send it to me" a 32-high ghost button on the right | <ul><li>Each row: padding 10 0, **1 px #EAEAEC line under it**, gap 10.</li><li>Badge **24 × 24**, radius 6, #6B6B70 (skipped #C9C9CE), number 11/16 600 white; the trigger's badge shows its icon 14.</li><li>Line 1: **what happens**, 14/20 **400** ("HR Admin gets a notification", "Marta gets a task").</li><li>Line 2: 12/16 #6B6B70.</li><li>"Send it to me": a small link-button **under the lines**, 24 high, 12/16 500 #6E1630, icon 14. After sending: "Sent to you" 12/16 #135C3A with a check 14.</li></ul> |
| F7 | After something was sent | — | A strip at the bottom: #F3F3F5, radius 8, padding 8 8 8 12: "{n} test item(s) sent to you" 13/18 #45454A + "Delete test items" (secondary 32, trash icon 14). |

## G. Dialogs

References: `Main` (New automation, 1440 only), `D1-Build-with-AI`, `F0-New-empty`, `F2-Start-from-scratch`, `I1-Name-and-icon`, `O1-Change-owner-pick`, `O2-Change-owner-picked`, `H2-Leave-unsaved`, `H3-Delete`, `H5-Delete-draft`, `H6-Make-me-owner`.

| # | Where | Now | Must be |
|---|---|---|---|
| G1 | New automation — size | 800 wide, 1048 high | **960 wide**, height fits the content (820 at a 900-high window; it scrolls inside the template grid when the window is smaller). |
| G2 | New automation — header | × 32, icon #6B6B70; padding 24 24 16 | Padding **24 24 0**. × **36 × 36**, icon 20 **#45454A**. |
| G3 | New automation — "Draft with AI" | Greyed (#9C9CA3 on #F3F3F5) while the field is empty | **Always the accent button**: #6E1630 fill, white, 32 high, padding 0 12, spark icon 16. With an empty field it puts the focus in the field (product rule: nothing shown disabled). |
| G4 | New automation — "Or start from a template" | 14/20 600 | **15/22 600**, padding-top 24, a 1 px #EAEAEC line after it (gap 12). Category chips: A6 style, **"All" without a check icon**. |
| G5 | New automation — template cards | Radius 10, no shadow, gap 4 inside | **3 per row** (296 at 960), gap 12. Each card: radius **16**, 1 px #EAEAEC, **`shadow-0`**, padding 16, gap **10** between category / name / lines. All cards in a row the same height. |
| G6 | Name your automation | Sections 20 apart; × icon #6B6B70 | 560 wide, padding 24, sections **16** apart, label → control **8**. × 32, icon 20 **Ink**. |
| G7 | Name — icon grid | Icons 16, 10 per row (3 rows); picked tile #F6F1F3 | Tiles 40 × 40, radius 8, #F3F3F5, icon **20** #45454A, **8 per row**, gap 8. Picked: **#E9DCE0** + 1 px #6E1630, icon #6E1630. |
| G8 | Name — fields | No hint under Name; Description 80 high | Under Name: **"Suggested from the steps."** 12/16 #6B6B70. Description **64** high. |
| G9 | Name — "How it looks in the list" | Box #F3F3F5; a card of its own (288 wide, gap 12, white icon tile with a border, trigger line 13/18 500) | Box **#F7F7F8**, radius 10, padding 12. The preview **is the list card** (A7–A10): 300 wide, gap 8, `shadow-0`, Draft pill 22 transparent, icon tile #F3F3F5 36 with icon 20, name 15/22 600 with padding-top 7, trigger line 14/20 400 #45454A with icon 16, gap 8. |
| G10 | Name — buttons on a draft | "Save" | **"Save draft"**. |
| G11 | Change owner | 400 wide; groups 24 apart; current owner box #F7F7F8; initials 12/16 500 | **560 wide**, padding 24, one column with gap **16**. Current owner box **#F3F3F5**, radius 10, padding 10 12, gap 10, avatar 28, initials **11/16 600**. Picker list as `O1` (rows 56, avatar 28, name 14/20 400, "{job title} · {office}" 12/16 #6B6B70, hover #F6F1F3, group label "People who can manage automations" 12/16 500). "Change owner" stays grey until someone is picked (spec — correct). |
| G12 | Confirm dialogs — Save your changes?, Delete, Archive, Duplicate (**shared** `ConfirmActionModal`) | Title and text grouped with gap 8, then 24 to the buttons; two paragraphs 8 apart | One column with **gap 16** everywhere: title → text 16, paragraph → paragraph 16, text → buttons 16. 400 wide, padding 24, radius 20, `shadow-3`. Words are correct. |
| G14 | Turn on dialogs (F4, V6) — checked from Ulia's screenshots | Title → body 24 | Spacing as G12: one column, **gap 16** (title → body 16). Everything else matches: 560 wide, rows with 20 px icons 12 apart, "Test run first" link on the left, Cancel ghost (as the spec says; the drawing's bordered Cancel is not the target), Turn on primary, the radio list with 13/18 hints. |
| G13 | Archive dialog — Cancel | White secondary with a border | **Ghost**: transparent, no visible border, Ink text (the Archive button itself — grey #6B6B70 fill — is correct). |

## H. Activity tab

Reference: `V8-Activity`, `V8b-Activity-one-automation`. The search box and chips are A5–A6.

| # | Where | Now | Must be |
|---|---|---|---|
| H1 | Toolbar | "Filters" icon 16; "All automations" chevron 16 #6B6B70 | Icon **14** Ink; chevron **14** Ink. |
| H2 | Status chips (All · Needs attention · Waiting · Next 7 days) | Gap 8; "All" with a check icon; counts 14/20 500 (on All: white 70 %) | Gap **6**. **No check icon** on these chips (they carry a count). Counts **13/18 400** #6B6B70; on the picked chip **#DADADF**. |
| H3 | Spacing | Toolbar → chips 16, chips → table 16 | **20** and **20**. |
| H5 | Rows (`V8`) | Cells vertically centred, padding 0 12, header 36; avatar initials 12/16 500, gap 12; line 2 "A field changes, Nov 18"; When "Today, 03:58 PM" | Header cells padding **8 12** (33 high). Cells padding **12**, content at the top, 1 px #EAEAEC line under each row (61 high). Avatar 28, initials **11/16 600**, gap **10**. Line 2 = **what the run is about**, as E3b ("Vacation, 12 days"; field change: "Last name: Novak"), dates European (4.0). When: in the company's time format (drawn 24-hour: "Today, 10:02"). |
| H4 | Empty tab "Nothing has run yet" | The picture and text sit 48 px under the chips (top-aligned) | **Centred vertically** in the space under the chips (rule I1). Words are correct. |
| H6 | Activity for one automation (`V8b`) — toolbar | "Filters" 14/20 500, padding 0 12 0 10, icon 16; the picked-automation pill 14/20 with chevron and × 16 and a 36-wide × area; 12 between the search box and Filters | Gap **8** between all toolbar items. "Filters": **13/18 500**, padding 0 12, icon 14 (H1). Pill: **32 high**, radius full, #F6F1F3, 1 px #B78B98, padding 0 12, gap 6: "Automation:" **13/18 400** #45454A, the name **13/18 500** #6E1630, chevron **14** #6E1630, a 1 × 14 #B78B98 divider, × icon **14** #6E1630 (no extra box around it). "Open in editor" is correct. The automation picker that "All automations" opens has no drawing — no change. |

---

## I. Product-wide rules (Ulia, 2026-11-18)

| # | Rule |
|---|---|
| I1 | **An illustration with a caption (and an action) always sits in the centre of its area** — horizontally and vertically — never pinned to the top. Area = the page's content under its toolbar, the panel or window under its header, or the card it is drawn in. Applies to every empty, no-results, error and no-access state in the product. Live today it is pinned to the top in: the Activity tab (H4), Run history and Versions (E3), the list's no-results (A12), the Edit home widget panel (Home package E13). |
| I2 | **"Nothing found" pictures (Ulia, 2026-11-18), everywhere in the product:** <ul><li>**A search found nothing** → the magnifier **with a solid ring**: `illustrations/no-results-s.svg` in this package (the package's file with the dashed ring replaced by a solid `r=12` ring in `--illustration-ring`). Replace the old dashed-ring file in the package and in the code.</li><li>**A filter found nothing** (chips, filter pills, conditions) → the funnel `no-match-s.svg` (in the package; copy in `illustrations/`), with "Clear filters".</li><li>Search and filters together → the funnel.</li></ul>Places: every list search, Inbox search, person / country / column dropdowns, the Edit home widget panel, Add a step, Activity, run history. |

## N. New screens — Send for signature, Split by a condition

Approved by Ulia on 2026-11-18. Everything is in `new-screens/spec.md` with references `S9`–`S9e` and `S10`–`S10c` (1710, 1470, 1440 + PNG). Build them on the shared parts fixed above (B–D). Send a survey is not designed (no surveys module).

## Words (exact text, sentence case)

| Where | Now | Must be |
|---|---|---|
| Trigger window title, process trigger | "A process is completed" | **"Process is completed"** (as T6). |
| Run history, empty, line 2 | "It runs when: An onboarding is completed." | **"It runs the next time {trigger sentence}."** e.g. "It runs the next time an onboarding is completed." |
| Test run hint when there was nothing in 30 days | "No requests in the last 30 days. Try it on a made-up one." (also on non-time-off triggers) | **"No {things} in the last 30 days."** — the noun follows the trigger, no "Try …". Onboarding: **"No onboardings completed in the last 30 days."** (Ulia, 2026-11-18). Time off: "No requests in the last 30 days." |
| Ask for approval — no-answer option | "Treat it as declined" | **"Count as declined"** (Q-2, approved). |
| Canvas step card title with a field in it | "Welcome Full name to the team" — the field's name as plain words | The field shows as a token (as in the fields: accent-subtle chip, 13/18 500), or the title is written without the field. |
| New automation — template cards, line 2 | The message text with raw field names: "Welcome, First name", "Welcome Full name to the team", "Collect the equipment of Full name" | **What it does**: "Email the new teammate", "Task for their manager", "Tell HR", "Approval from their manager", "Tell their team" … — one short action line per template, as `Main`. |
| Turn on (F4) — who it runs for | "It runs for everyone." | With the count in bold, as the spec: **"It runs for {57 people}."** (no filter) or "It runs for {48 people} in {Poland and Lithuania}." |
| Turn on (V6) — the waiting items | "Only new cases" / "Also the 53 cases already waiting" / "Sent before today and not yet decided. They start right away." on a **Someone is hired** automation | The noun and the hint follow the trigger; "Sent before today and not yet decided" is time-off wording and is wrong here. Time off (spec): "Only new requests" / "Also the {n} requests already waiting" / "Sent before today and not yet decided. They start right away." Someone is hired (approved by Ulia): "Only new hires" / "Also the {n} people already hired" / "Hired before today, first day still ahead. They start right away." Other triggers follow the same pattern: the noun of the trigger, and a hint that says which items already match. |
| Change owner — current owner line 2 | "Owner now" | **"Owner now · {role}"**, e.g. "Owner now · HR Admin". |
| Name dialog — under Name | — | "Suggested from the steps." |
| Name dialog — primary button on a draft | "Save" | "Save draft" |
| Schedule, every quarter — hint | "Runs on Jan 1, Apr 1, Jul 1, and Oct 1." | "Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct." (C30) |

## Bugs seen

- **"Who sees what" shows an unfilled field.** In the example under a notification step it reads "Ingrid Bakke has completed [Process]." The Process field must be filled with a sample value.

## Check on your side (Petya)

These can't be reached in the sandbox from the check session. Put an automation into each state on your side and compare it with the reference, at 1710 and 1470:

| State | How to get it | Reference |
|---|---|---|
| Paused card in the list | Pause any active automation | `E1-List@1710.html` / `@1470` (the Paused card) |
| Failed card in the list (last run failed, failed footer) | Make one run fail | `E1-List@1710.html` / `@1470` (the failed card) |
| Failed run window | Open that failed run | `V1b-Run-failed-retry@1710.html` / `@1470` |
| Turn on — warning box "This sends {240 messages} right away." + "I understand, send them" | Turn on an automation that already matches many people (choose "Also the … already waiting") | `V6-Turn-on-already-match@1710.html` / `@1470` |

Same rules as the rest of this file: sizes, colours and words exactly as in the reference.

## Not checked live yet (lower priority)

These have references; check them against these once the screens can be reached:

- Needs details (`F3`), Save with runs going (`V7`) — the check session can't press Turn on. The Turn on dialogs F4 and V6 themselves were checked from Ulia's screenshots (G14); read mode on the automation Ulia turned on (C-read).
- **AI draft** (`D1`, `H1` results) — needs a real AI answer.
- **Make me the owner** (`H6` drawing), view-only (`E6`) — need an automation paused by the system and a viewer account.
- **Loading and error** of the list, editor, run history, Activity (`E3`, `E7`, `F1`, `V4`, `V4b`) — can't be triggered live.

## What was checked live

- Every screen and state above that has a fix number.
- **Filled lists:** checked with Ulia's "Last name changes" (1 run, 1 version) and one archived automation (A13–A15, E3b, E3c, H5, H6, archived view).
- **Triggers:** all checked in an unsaved new automation (T1–T6, every schedule period T4a–T4d, time off with conditions T3b).
- Air 13 (1470 × 956): list grid and the editor with a step open — same layout, same issues; the windows keep their widths.
