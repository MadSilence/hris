# Design fixes — Company hub (round 1)

For Petya's Claude Code. Same rules as the Home and Automations packages. After this round, the Company hub screens must match the design exactly.

> **Also in this zip: `edit-home/`** — two small fixes to Edit home (EH1, EH2), not part of the hub. Read `edit-home/FIXES-edit-home-2.md`; its screenshots are next to it.

## How to use this package

You don't have the design boards, and you don't need them. Everything is in this package.

- **This file.** Every fix gives exact values: px, hex, font size / line height / weight, and the words.
- **`references/`** holds the approved screens as static HTML, each with a PNG:
  - `<screen>@1710.html` — MacBook Air 15, 1710 × 1112. This is the main size.
  - `<screen>@1470.html` — MacBook Air 13, 1470 × 956.
  - `<screen>@1440.html` — the drawing as it was made.

  Open the HTML in Chrome at that window width and inspect any element for a value this file doesn't spell out. Dialogs (CM05, CM07) keep their 1440 position in the 1710/1470 files; take their size and style from the file.

  | File | Screen | Route |
  |---|---|---|
  | CH01-hub-home | Hub home | `/hub` |
  | CH01-handbook-empty | Hub home, Handbook column empty — **new, see S1** | `/hub` |
  | CH02-all-news | All news | `/hub/news` |
  | CH03-pages-need-your-yes | Pages need your yes | `/hub/to-agree` |
  | CP01-handbook | Handbook | `/hub/handbook` |
  | CP02-policy-page | One page | `/hub/handbook/{id}` |
  | CM01-overview … CM04-settings | Manage hub tabs | `/hub/manage…` |
  | CM05-new-post | New post dialog | `?new=1` |
  | CM06-page-editor | Page editor | `/hub/manage/pages/{id}/edit` |
  | CM07-who-sees-it | Who sees this page dialog | |
  | CM08-who-agreed | Who agreed | `/hub/manage/pages/{id}/agreed` |

- **Precedence:**
  - The HTML wins over a vague sentence.
  - A number in this file wins over the HTML.
  - Where `design/screens/company-hub*/spec.md` and a drawing disagree, this file says which one wins. Values the specs already accept as "built as" (column gap 64, reading column 720, title → ask box 32, stat tile padding) are **not** listed — keep them.
- **Change nothing that isn't listed here.** Fixes in shared parts are in section **A**. Fix each once and every screen follows; the screen sections don't repeat them.

| Name | Value |
|---|---|
| Ink | #0B0B0C |
| text-secondary | #45454A |
| text-tertiary | #6B6B70 |
| icon-muted | #9C9CA3 |
| gray fill (segmented track, chips) | #F3F3F5 |
| Mist (surface-subtle) | #F7F7F8 |
| border-divider | #EAEAEC |
| border-field | #DADADF |
| accent | #6E1630 |
| accent-subtle | #F6F1F3 |
| accent-muted | #E9DCE0 |
| Pending soft / text | #FFF3DF / #7A4800 |
| shadow-0 | `0 1px 2px rgba(11,11,12,.05)` |
| shadow-2 | `0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.08)` |
| shadow-3 | `0 8px 32px rgba(11,11,12,.14)` |

Checked live on local-sandbox, 2026-11-18, at 1710 × 1112, with test content created in the sandbox: 2 sections, 3 pages (one must-read, agree by 27 Nov, version 2 published on another), posts of every status (published, scheduled, draft, a policy update, a saved post, a long title). Every screen was re-checked at 1470 × 956: nothing wraps or overflows that shouldn't, and the fixes below are the same at both widths.

"Now" is what the live app does; "Must be" is the target.

---

## A. Shared fixes (fix once)

| # | Where | Now | Must be |
|---|---|---|---|
| A1 | **Times, everywhere in the hub** (dates are fixed — re-checked 18 Nov: "18 Nov", "Due 27 Nov", "23 Nov 2026") | Times are still 12-hour: "19 Nov, 9:00 AM", "Saved 11:25 PM", the Schedule picker and toast | **24-hour, no AM/PM**: **{d Mon}, {HH:mm}** "19 Nov, 9:00"; **{HH:mm}** "Saved 23:25"; "Schedule for 19 Nov, 9:00"; toast "Scheduled for 19 Nov, 9:00". Time pickers list 24-hour times. |
| A2 | **Page titles (h1)**: Company hub, News, Pages need your yes, Handbook, Manage hub, Who agreed | Inter 14/20 400 (looks like body text) | **Inter Tight 32/40 600** Ink. |
| A3 | **Reading titles (h1)**: CP02 page, one post, CM06 editor title | Inter 36/44 600 | **Inter Tight** 36/44 600 Ink. |
| A4 | **Back link** "Company hub" (CH02, CH03, CP01, CM01–CM04) and "News" (one post), "Pages" (CM06) | 13/18 500 #45454A, arrow #45454A | 13/20 500 **accent #6E1630**, `arrow-left-01` 16 accent, gap 4. |
| A5 | **Breadcrumbs** (CP02, CM08) | Links 13/18 500 #45454A; "/" 13/18 500 #6B6B70; CM08's last item is plain Ink text | Links 13/18 500 **accent**; "/" **12/16 400** #6B6B70; gap 6. Every item, including the last (the page name), is an accent link. |
| A6 | **Segmented control** (For me/Everyone, Waiting/Agreed, All/Published/…, Not yet/Agreed, Everyone/Filter/Choose) | Segment radius 8, 2 px between segments | Track #F3F3F5 radius 8 padding 2 (OK); segment **radius 6**, **0** between segments, padding 0 12, 13/18 500; picked: white + shadow-1, Ink; other #45454A. It hugs its content — CM07's is stretched to 592 with equal thirds, make it hug too. |
| A7 | **Search box** (CH02, CM02, CM03, CM08) | A 240 × 36 box with a **260 wide input inside** (20 px sticks out on the right), text 14/20, icon at 14, padding-left 40; placeholder "Search" | **240 × 32** (CH02: **280 × 36**), radius 8, 1 px #DADADF, padding 0 10, icon 16 #6B6B70 then 8 gap, text and placeholder **13/20** 400 (placeholder #6B6B70). Input fills the box exactly. Placeholders: "Search news", "Search posts", "Search pages", "Search people". |
| A8 | **Column / block headings**: CH01 "News", "Handbook"; CM01 "Posts", "Must-read pages"; CM04 block headings | Inter 14/20 400 | **Inter Tight 22/28 600** Ink (spec). Heading row 36 high, the link on the right ("All news", "Open handbook", "All posts", "All pages") 13/20 500 accent. Content starts **16** under the heading row (CM01: 8). |
| A9 | **Avatar 22 with initials** (author rows, owner cells, CM03) | Initials 12/16 500 (too big for 22) | Initials **10/16 600**. Photos as now. |
| A10 | **Row lists** (CH01 news rows, CH02, CM01, CM02) | 80 / 88 high, hairline under every row but the last; title and meta touch (gap 0) | Padding 16 0, hairline **under every row including the last** (1 px #EAEAEC), so rows are 81 (48 tile) / 89 (56 tile). Title 15/22 600 → **4** → meta 12/16 #6B6B70. |
| A11 | **Pinned pill** (CH01, CH02) | 12/16 600, radius 999, icon 16, gap 4 | 12/16 **500** #45454A on #F3F3F5, **radius 6**, padding 0 8, `pin` icon **14**, gap **6**, 24 high. |
| A12 | **Draft pill** (CM01, CM02) | White fill + dashed border | **No fill**, 1 px dashed #9C9CA3, text #45454A 12/16 600. |
| A13 | **Ghost buttons in headers**: Saved, Manage hub, Save draft | Text and icon Ink; icon → text 6 | Text and icon **#45454A**; icon → text **8**. |
| A14 | **Section colour of a new section** | The first new section got colour `gray`: its tile is #F3F3F5 with a gray icon, which is **invisible on the #F3F3F5 / Mist cards** (CH01, CP01) and flat everywhere else (CH03, CP02, CM03, CM06). The second got `wine`. | A new section takes the **next free tag colour** (manage spec, Actions: New section), starting with the first tag colour — never `gray`. Fix the existing `gray` section in the sandbox too. Pages take their section's colour unless the editor changes it. |
| A15 | **"To agree" dot on a section tile** (CH01 cards, CP01 cards) | 8 × 8 with a 2 px white box-shadow ring | **14 × 14** accent, **2 px solid border** in the card's colour (CH01/CP01: #F7F7F8), its centre on the tile's top-right corner (top −3, right −3). |
| A16 | **Long titles in rows** (CM02, CM01, CH02) | Cut with … but no tooltip | Cut with … **and** a tooltip with the full title on hover (spec, Long content). |
| A17 | **Saved state of the save button** (post rows, pinned post, one post, CP02) | `bookmark-check-02` — a bookmark with a checkmark, accent stroke | **The same `bookmark-02` glyph, filled**: `fill: #6E1630` + stroke #6E1630 (same size, same 1.75 stroke). No checkmark. Unsaved: `bookmark-02` outline as now. Accessible name stays "Save" / "Saved". (Ulia, 18 Nov.) |
| A18 | **Every dropdown / select with a search (shared `Select` / combobox — product-wide, not only the hub)**: CM07 field select, CM04 people picker, People → Edit people → Field, every other one | When open, the list has its **own search row** ("🔍 Search") above the options, separate from the field | **The field itself is the search** (Ulia, 17 Nov — product rule "a dropdown is its own search"). Click or focus opens the list right under the field (4 gap, radius 10, level 2, max 320 high, scrolls). Typing goes **straight into the field** (caret in the field, 14/20 Ink; placeholder keeps the field's own text, e.g. "Select a field"), the list narrows as you type, and the matched letters are **600** Ink in each option. **No search row inside the list, no second input.** Nothing matches → one muted row "Nothing found" 14/20 #6B6B70. Esc closes and restores the last value; Enter picks the highlighted option. Fix it in the shared component once. |

---

## S. Ulia's decision: Handbook column empty (CH01)

Reference: **`CH01-handbook-empty@1710/1470/1440`** (new).

The live state (S 96 `policies` scene, a title only) is wrong. SPEC § 10 allows **S 96 only for scenes with their own `-s` file** (drawn without thin lines); `policies` and `documents` have none. Scaled to 96, the 3-unit lines drop to 1.2 px, under the 2 px minimum. **Rule for the whole product:** a scene without an `-s` file is never shown smaller than 160 (M).

| # | What | Must be |
|---|---|---|
| S1 | Scene | **`documents`** (`illustrations/documents.svg`, the same file as in `styles/noddo/assets/illustrations/`), M **160 × 100**, `color: var(--accent)` |
| S2 | Placement | Centred **horizontally and vertically** in the free area of the Handbook column: from 16 under the heading row down to the bottom of the News column's content (product rule: an illustration with a caption always sits in the centre of its area). At 1710 with the reference content that area is 421 high and the illustration's top is 102 into it. With no news either, the whole-hub empty state applies (company-hub spec, States). |
| S3 | Title | "No handbook pages yet", Inter Tight 18/26 600 Ink, **16** under the illustration |
| S4 | Line | "Pages your company adds will show up here.", 14/20 400 #45454A, **4** under the title |
| S5 | Action | **Add a page**, secondary 36 (white, 1 px #DADADF, radius 8, padding 0 14, 14/20 500 Ink), **16** under the line. **Only for people who can manage the hub**; it opens Manage hub → Pages with a new page. Employees see no button. |

The `company-hub` spec States row is updated with this (see `spec-updates.md`).

---

## B. CH01 Hub home (`/hub`)

| # | Where | Now | Must be |
|---|---|---|---|
| B1 | "Pages need your yes" button | 13/18 500, padding 0 12 0 6, badge → text 8, badge line-height 16 | **14/20 500**, padding **0 14 0 6**, badge → text **10**; badge 24 circle with the number on line-height **24** (centred). |
| B2 | Ask box placeholder | 14/20 | **15/20** 400 #6B6B70 |
| B3 | Pinned cover hero "15" | Inter 48/48 500 | **Inter Tight** 48/48 500 accent |
| B4 | Cover → text | 24 | **20** |
| B5 | Pinned text stack | Pill → title 8, title → excerpt 8 | Pill → title **10**, title → excerpt **6**. Title **Inter Tight** 22/28 600. |
| B6 | Author row | Name only; date 13/18 500 | Avatar 22 + name 13/18 500 Ink + **job title 12/16 #6B6B70** (8 apart; when the person has one) — date on the right **13/18 400** #6B6B70 |
| B7 | News rows | No hairline above the first row | A hairline (1 px #EAEAEC) **above the first row** too, under the pinned post. Row date 13/18 **400** #6B6B70. |
| B8 | Handbook section cards | #F3F3F5, padding 0 12, cards 12 apart, tile radius 10, name 14/20 500, "· 1 to agree" 400 | **#F7F7F8**, padding **10**, **10** apart, tile 32 radius **12**, name **13/18 500**, "· {n} to agree" 12/16 **500** accent. |
| B9 | Recently updated | Label 12/16 400; label → rows 8; rows 8 apart; icon #6B6B70 | Label 12/16 **500** #6B6B70; label → first row **14**; rows **10** apart; page icon 16 **#9C9CA3**; right side "{section} · {d Mon}". |
| B10 | Celebrations: **Welcome tile** | **Now shown** (re-checked 18 Nov with a person hired today). Stacked avatars **32** | Avatars **40** (spec CH01 item 3), up to 3 then "+n", each with a 2 px ring in the tile colour, overlapping as the board. The rest per B11–B12. Still check: someone hired **earlier this week** (Mon–Tue) also gets in — the API window is today → +6 days, the spec says this calendar week. |
| B11 | Celebrations: tile width | Fixed 300 wide (4 fit, plus a 64 fade) | The tiles **share the row**: (row − 2 × 12) / 3 — 450 at 1710, 370 at 1470; more than 3 scroll sideways with the fade (spec). |
| B12 | Celebrations: text | Title 14/20 600, line 12/16 | Title **15/18 500**, line **13/20 400** (frame). Birthday: title Ink, line #45454A. Anniversary and Welcome: text in the tile's tag ink, the line at 85% opacity. |
| B13 | Anniversary tile | Number Inter 36/40 500; line "Today" | Number **Inter Tight** 36/40 500; line **"Today · {team}"** (the API sends no team for anniversaries — add it). |

## C. CH02 All news (`/hub/news`)

| # | Where | Now | Must be |
|---|---|---|---|
| C1 | Vertical rhythm | Title row → controls 24; controls → pinned 32 | **28**; **36** |
| C2 | Controls row | Gap 12; divider 1 × 24; type chips 14/20 500 | Gap **8**; divider **1 × 20** #EAEAEC; chips **13/18 500**, 32 high, padding 0 12. |
| C3 | Pinned post | Cover 240 × 200; hero Inter 48/48; title 22/28 | Cover **220 × 148**, radius 20; hero **Inter Tight 52/52 500** accent; title **Inter Tight 24/30 600**. Under the pinned post: padding-bottom 28 + a hairline, then **28** to the first group label. |
| C4 | Pinned save button | Left of the date | Date 12/16 #6B6B70, then **12**, then the save button 32 (icon accent when saved). |
| C5 | Group label "This month" | h2 15/22 600 Ink | **12/16 500 #6B6B70**, 4 above the rows. |
| C6 | Rows, right side | Save button (hover) then date 13/18 500 | **Date first, then the save button**: date 12/16 400 #6B6B70, **16** gap, save 32. |

## D. CH03 Pages need your yes (`/hub/to-agree`)

| # | Where | Now | Must be |
|---|---|---|---|
| D1 | Title block | h1 → line 4; segmented at the top, 24 from the title block | h1 → line **6**; the segmented control sits on the **bottom** line of the title block (aligned with the line), **16** from it. |
| D2 | Spacing | Title row → first group 32; groups 32 apart | **40**; **40** |
| D3 | Group heading | Name ↔ count 8; heading → rows 0 | **10**; **8** |
| D4 | Rows | Padding 12 0, hairlines only between; tile → text 16 | Padding **20 0**, hairline **under every row** (85 high); tile → text **18**. |
| D0 | Lead line | "… HR sees when you agreed." | "Read each page and agree to its current version. **The page owner sees when you agreed.**" (product rule: the system never says "HR"). |
| D6 | Waiting tab empty | all-caught-up M 200 pinned 48 under the tabs | Same scene and words, **centred vertically and horizontally** in the free area under the title row (product rule). Line 14/20 #45454A. |
| D5 | Due date | "By Nov 27" 13/18 500 #6B6B70 | "By 27 Nov" **14/20 400 #45454A**, in a fixed **96** column, **18** before Read. Overdue rows: "Overdue" pill + "Was {d Mon}" (frame) — not checked live. |

## E. CP01 Handbook (`/hub/handbook`)

| # | Where | Now | Must be |
|---|---|---|---|
| E1 | Title block | h1 → line 4; title block → ask box 32 | **6**; **28** |
| E2 | Ask placeholder | 14/20 | **15/20** #6B6B70 |
| E3 | Section cards | #F3F3F5, padding 24, tile → name 12, name 15/22, "· 1 to agree" 400 | **#F7F7F8**, padding **20 22 22**, tile → name **14**, name **16/22 600**, "· {n} to agree" **500** accent. |
| E4 | Page list in a card | Hairline + padding-top 12; rows are 32-high links with no gap; icon → title 8 | Hairline + padding-top **16**; rows **20 high, 12 apart**; icon → title **10**. |

## F. CP02 One page (`/hub/handbook/{id}`) and one post (`/hub/news/{id}`)

| # | Where | Now | Must be |
|---|---|---|---|
| F1 | Title row | "1 min read" is **inside the h1**, and the right group (tag + Edit page + save) squeezes the h1 to 298, so even "Code of conduct" breaks onto 2 lines | Read time **outside** the h1, right after the title on its first line (12/16 #6B6B70, no wrap, 16 after the title). The title column takes all free space (`flex: 1; min-width: 0`); the right group never shrinks it below its text. |
| F2 | Owner / author | 13/18 500 Ink | Avatar 22 + name **14/20 400 #45454A** (+ job title 12/16 #6B6B70 on a post), then 24, then the version line / date 12/16 #6B6B70. Post date: "15 Nov 2026" 12/16 400 (now 13/18 500 "Nov 15, 2026"). |
| F3 | Body text (page **and** post) | 14/20 #45454A | **15/26** 400 #45454A (spec Changes to SPEC 2); headings Inter Tight 18/26 600. |
| F4 | Agree bar position | On a short page it sits right under the text: `position: sticky; bottom: 24px` only takes effect when the page scrolls | **Always at the bottom of the viewport**, 24 above the edge, 720 wide in the column — also on a short page (e.g. make the reading column at least the viewport height, or pin the bar). |
| F5 | Agree bar | No border; "I agree" 125 wide (the hidden "Agreeing…" label reserves the width) | 1 px **#EAEAEC** border + shadow-2, radius 16, padding 12 12 12 20. "I agree" hugs its text (**76**); only the agreeing state may be wider. |
| F7 | **What changed block** (re-checked 18 Nov: Remote work policy v3, published with "Ask everyone to agree again" + 1 point; Ulia had agreed to v2) | **Now shown.** Differences from the board CP02: block **40** under the version line, padding **20 24**; bullet dot **6 × 6**, 8 from the top. The changed paragraph is marked as a **whole box**: #E9DCE0 behind the full paragraph, padding 2 8, pulled out 8 on both sides, text #45454A | Board CP02: block **48** under the version line, padding **22 24**, radius 16, accent-subtle, 12 between the title and points; dot **8 × 8** accent, margin-top **7**, 10 to the text. The highlight is **inline on the text, not a box**: a `<mark>` around the changed text inside the paragraph — background **accent-muted**, colour **accent-text**, radius **6**, padding **1px 4px**, `box-decoration-break: clone` (so a wrapped mark keeps its corners). The paragraph itself keeps no background and no padding (spec CP02: "a changed phrase may be marked in the text with an accent-muted highlight, radius 6"). The body text itself is F3. |
| F6 | Save button (page and post) | Icon 16 #6B6B70 | Icon **20 #45454A** in a 32 button. |

---

## G. Manage hub frame (CM01–CM04)

| # | Where | Now | Must be |
|---|---|---|---|
| G1 | Tabs | Other tabs #45454A | Other tabs **#6B6B70**; picked Ink + 2 px accent underline (OK). With A2 the title row becomes 40 high and the tabs land 28 under it. |

## H. CM01 Overview (`/hub/manage`)

| # | Where | Now | Must be |
|---|---|---|---|
| H1 | Stat tiles | #F3F3F5; number Inter 14/20 400; hint #45454A | **#F7F7F8** (Missed the deadline with people: **#FFF3DF**, all text **#7A4800**); number **Inter Tight 36/36 500** Ink, top 32 under the label top; hint 12/16 **#6B6B70**, bottom of the tile. |
| H2 | Post rows | Tile radius 12 | Tile 48 radius **16** (manage spec Values). |
| H3 | Post meta | "Everyone at Local Sandbox · goes out Nov 19" | "**Everyone** · goes out 19 Nov" — the audience is "Everyone", a team or an office, never "Everyone at {company}" (company-hub Words, Row meta). Same in CM02 "{author} · {audience}". |
| H4 | Scheduled pill on CM01 | "Nov 19, 9:00 AM" | The word **"Scheduled"** (the date-and-time pill is CM02 only). |
| H5 | Must-read rows | Padding 12 0, no hairlines; title row → bar 6; bar → due 6; title ↔ count 12; count #45454A | Padding **16 0** + hairline under every row (93 high); title row → bar **8**; bar → "Due {d Mon}" **8**; title ↔ "{n} of {m} agreed" **16**; count **#6B6B70**. |

## I. CM02 Posts (`/hub/manage/posts`)

| # | Where | Now | Must be |
|---|---|---|---|
| I1 | Controls row | 36 high | **32** (with A7). |
| I2 | Status pill | Width follows the text | Pills sit in a fixed **110** column (left aligned) so they line up. |
| I3 | Date | 13/18 500 | **12/16 400** #6B6B70, **56** column. |
| I4 | Row menu button | Icon 16 #6B6B70 | Icon **20 #45454A**, button 32. Menu items: OK. |

## J. CM03 Pages (`/hub/manage/pages`)

| # | Where | Now | Must be |
|---|---|---|---|
| J1 | Header row | 36 high, padding 0 4 0 28, gap 12, labels 12/16 400 | **33** (32 + hairline), padding **0 8**, gap **8**, labels 12/16 **500** #6B6B70. Columns: Page 440, Owner 160, Must read 200, Updated 80, actions 72. |
| J2 | Hairlines | Under every row | Only **under each section group**: under the last row of an open section ("{n} more pages" row if shown), or under a closed section row. Rows inside an open section have none. |
| J3 | Section row | Drag handle + chevron + tile + name + "{n} pages" right after the name | Chevron 16 #6B6B70 at 8 + tile 24 (radius 6, icon **14**) + name 14/20 600; **"{n} pages" 12/16 #6B6B70 in the Owner column**. Drag handle on hover only. |
| J4 | Section actions | "+" Ink, "⋯" #6B6B70, 2 apart | Both **#45454A**, **0** apart, 32 buttons. |
| J5 | Section "{n} must-read" | #45454A | **#6B6B70** |
| J6 | Page row | Page icon at 48 from the row start, title at 72 | Page icon at **62**, title at **86** (aligned under the section name). |
| J7 | Must read cell | Text #45454A; bar 112 | Text **#6B6B70**; bar **176** (column 200 with padding-right 24). |
| J8 | Updated | "Nov 18" 13/18 500 | "18 Nov" **12/16 400** #6B6B70 |
| J9 | Hover row | — | #F7F7F8 radius 10, drag handle 14 × 16 #9C9CA3 at 4 from the left (frame). |
| J10 | "{n} more pages" row (a section with more than 3 pages) | 37 high, padding 8 0 8 48, text 13/18, starts at 48; when opened, no way to fold the list back | Board CM03: **44** high + the section hairline under it (J2), padding **0 8**, text **"{n} more pages" 13/20 500 accent**, starting at **110**. When opened, the row turns into **"Show less"** (same style, same place under the last page) and folds the section back to 3 pages (Ulia, 19 Nov). |
| J11 | Search with no results ("zzzqqq") | no-results-s 96 + "Nothing matches “zzzqqq”" + Clear search — correct — but the block is centred in the **whole 1374 main area**, while the list above it is the 1000 column; "New section" stays under it | Centre the empty state **in the 1000 list column** (the same column as the header row and the search). Title 15/22 600 as U4. |
| J12 | Section menu, page menu, Delete page confirm | Rename · Change icon and colour · Who sees this section · Delete section; Edit · Move to… · Duplicate · Unpublish · Delete; "Delete “{title}”?" / "Readers lose it, and links to it stop working." / Cancel · Delete page | **Correct** (standard Menu and ConfirmActionModal; not drawn on the board). |
| J13 | **Drag and drop** (Ulia dragged the section "Policies and rules", 19 Nov; screenshot `references/CM03-drag-now.png`) | The floating copy of the row is **about two rows below the cursor**, so the landing line seems to lag behind: in the screenshot the copy is over "Time off rules", while the line is still at the top of the list. The line is a faint pink (accent at low opacity), not the accent. The floating card has a light shadow | The floating copy stays **exactly under the cursor, at the point where it was grabbed** (with dnd-kit: the `DragOverlay` must not sit inside a scrolled or transformed parent, and must keep the grab offset; detect the target by the pointer, not by the dragged row's top). The landing place is a **2 px solid accent #6E1630 line**, shown where the row will land **right now**, under the cursor. A section a page will join is highlighted **accent-subtle #F6F1F3**. The dragged row is **level 4**: shadow `0 12px 40px rgba(11,11,12,.18)` (SPEC § 7). On drop: saved at once + toast **"Moved to {section}"** with **Undo** (spec Actions). Check sections and pages, up and down, into another section, and that the order holds after a reload and in the Handbook. |

## K. CM04 Settings (`/hub/manage/settings`)

| # | Where | Now | Must be |
|---|---|---|---|
| K1 | Heading → first row | 12 | **16** (blocks 32 apart with hairlines: OK) |
| K2 | Who can post and edit pages | An empty input with no placeholder; role chips ("System Owner", "HR Admin", gray dot) **under** it, plus "Set in Roles" | **One field**, 42 high, padding 6 8, gap 6, holding the chips **inside**: chip 28 high, radius 999, #F3F3F5, padding 0 6 0 4, avatar or role initials 20 + name 13/20 Ink + remove × 14 #6B6B70. Then the placeholder "Add a person or a role" 12/16 #6B6B70. System roles that must always stay are chips without ×. |
| K3 | Setting rows | 60 high (padding 12 0); label 14/20 400 | **34** high, **16** apart; label **13/18 500** Ink + hint 12/16 #6B6B70 under it. |
| K4 | Reminder select | 176 wide, #F7F7F8 fill, gray chevron | **160** wide, **white**, chevron **Ink**. |
| K5 | Celebration checkboxes | Stacked, 12 apart; box → label 10 | **In one row, 24 apart**; box → label **8**. |
| K6 | "Changes save automatically." | Hairline above + padding 24 | No hairline; 24 under the last block. |

## L. CM05 New post (dialog)

| # | Where | Now | Must be |
|---|---|---|---|
| L1 | Header | **No close button**; header 62 | Close icon button 32 (`cancel-01` 20 #45454A) on the right; header **68** (padding 20 24 16), title centred to it. |
| L2 | Save draft | **Fixed** (re-checked 18 Nov: saves, closes, toasts "Draft saved"). | — |
| L3 | Body bottom | Padding-bottom 24 | Padding **0 24**, **20** from the last field to the footer hairline. |
| L4 | Cover | One string "Add a cover image (optional)" 14/20 #45454A; icon → text 8 | "Add a cover image" 14/20 **#6B6B70** + " (optional)" **12/16** #6B6B70; icon → text **10**. |
| L5 | Field labels | #45454A | **Ink** 13/18 500 |
| L6 | Text box | Radius 8; toolbar padding 4 6; tools Ink; text padding 10 14 | Radius **10**; toolbar padding **4**; tools and "Link a handbook page" **#45454A**; text padding **14 16**. |
| L7 | Who sees it | One field button "Everyone at Local Sandbox · 55 people" | Spec item 4: audience **filter chips** (selected FilterChip with ×, 32, 13/18 500) + **"Add filter"** dashed pill 32; **8** under the label; under them the hint 12/16 #6B6B70: "Everyone at {company} · {n} people" with no filter, "{n} people · {who joins later}" with filters. "Add filter" opens the CM07 builder in a popover. |
| L8 | Toggles | Label 14/20 400; 16 apart | Label **13/18 500** Ink; **12** apart. |
| L9 | Schedule popover | US dates | A1. |

## M. CM06 Page editor (`/hub/manage/pages/{id}/edit`)

| # | Where | Now | Must be |
|---|---|---|---|
| M1 | Page padding | Outer 32 + inner 0 16 + bar padding 8: the bar text sits at 49 | Page padding **24 48 32**; the editor bar is 36 high at the top. |
| M2 | Column | Centred in the page (x 135 at 1710) | **Left aligned** at the page padding (x 48), 720 wide (built width accepted). |
| M3 | "/ {section}" | One span 13/18 500 | "/" and the name separate, **12/16 400** #6B6B70, gap 6. |
| M4 | Icon tile | #F3F3F5 + gray icon 24 | The page's **tag tint** + icon **28** in the tag's dark colour (e.g. plum #ECE6EF / #441F56). |
| M5 | Spacing | Title row → properties 24; property rows 4 apart | **28**; **2** |
| M6 | Section property | A #F7F7F8 field 192 × 36 with a border | **Plain inline**: colour square 18 (radius 6, tag tint) + name 14/20 Ink + chevron 16 #6B6B70, gap 6, no box. Opens the picker on click. |
| M7 | Owner property | A bordered 562-wide picker with a chip and an input | **Plain inline**: avatar 22 + full name 14/20 Ink, gap 8. Click opens the person picker. |
| M8 | Must read row | 36 high; toggle → label 8; label #45454A | **40**; **10**; label **Ink**. |
| M9 | Agree by block | #F3F3F5, 64 high; "Agree by" #45454A; date field 36 high, 14/20, right after the label | **#F7F7F8**, **60** high, radius 16, padding 14 16; "Agree by" 13/18 500 **Ink**; date field **180 × 32**, 13/20, **at the right end** of the block. |
| M10 | Hint under the block | 4 under | **10** under |
| M11 | "Unpublished changes" pill | Icon 16 | Icon **14** |

## N. CM06 Publish dialog

| # | Where | Now | Must be |
|---|---|---|---|
| N1 | First version | An empty body div doubles the gap: 48 from the line to the footer | Drop the empty body: **24**. Keep "Readers will see this page as it is now." (added to Words). |
| N3 | Must-read page that people agreed to | The choice works (Ask everyone again / Small fix → "Publish fix"). Agree by "Dec 02, 2026" | "2 Dec 2026" (A1). With **Small fix** picked the title becomes **"Publish a small fix?"** (the version number doesn't change). |
| N4 | Agree by in the past | Any past day can be picked; on publish the date silently becomes today + 7 ("Due 25 Nov") | Past days are **not offered** in the Agree by picker (#9C9CA3, not clickable) — rules README position 2. |
| N2 | Version 2+: What changed | One empty field; an extra hint "Readers who agreed to an earlier version see these points…" | Points **drafted by the system** from the difference between the versions, each editable, with the label **"Drafted by AI — review before sending"** (12/16 #6B6B70, SPEC § 1) above the list. Remove the extra hint (not in Words). If drafting isn't built yet, keep the empty field and tell us — the label must not show over an empty list. |

## O. CM07 Who sees this page (dialog)

| # | Where | Now | Must be |
|---|---|---|---|
| O1 | Header | 50 high; close icon #6B6B70 | **56** (title top 23, centred on the 32 close); close icon **#45454A**. |
| O2 | Body | Gap 20; padding 16 24 | Gap **22**; padding **16 24 0** (22 to the footer hairline). |
| O3 | "People who match all of these" | #45454A; 8 to the rows | **Ink**; **10** |
| O4 | Filter row | Field select 176; remove icon **red** #C42B1C, 36 button | Field select **160**, then "is" 12/16 #6B6B70, then the value field with tags (flex), then remove: 32 icon button, icon **#45454A** (removing a filter row isn't destructive; red is only for Delete). |
| O5 | Add filter | Missing | **"Add filter"**: ghost sm 32 with + 16, 13/18 500 #45454A, 10 under the last row. |
| O6 | Also add | One string "Also add (optional)" #45454A; field 36, no placeholder | "Also add" 13/18 500 **Ink** + " (optional)" 13/18 **400 #6B6B70**; field **42** (padding 6 8, gap 6) with 28 chips as K2; placeholder **"Search people or roles"**. |
| O7 | Summary block | #F3F3F5, 52 high; avatars 28 with a gray ring, 20 apart; "55 people" 14/20 600 | **#F7F7F8**, **50** high; avatars **26** with a **2 px white border**, **18** apart; "{n} people" **13/18 500**; with filters add " · new people who match join automatically" 14/20 #45454A; "See who" 13/20 500 accent. |

## P. CM08 Who agreed

| # | Where | Now | Must be |
|---|---|---|---|
| P1 | Breadcrumb → title | 12 | **28** |
| P2 | Title block | h1 → line 4; buttons at the top | h1 → line **6**; Edit page / Remind on the **bottom** line of the title block. Remind icon → text **8**. |
| P3 | Hero numbers | Inter 52/52; "of 55 agreed" 14/20; gap 8; groups 64 apart | **Inter Tight** 52/52 500; "of {n} agreed" **16/20** #45454A; gap **10**; groups **56** apart. Bar stays 6 (spec). |
| P4 | "not yet" / "new hires" | Number and words in one row, Inter 36 | **Stacked**: number Inter Tight 36/40 500, under it the words 12/16 #6B6B70, gap 2; their top 10 below the hero's top. |
| P5 | Spacing | Numbers → controls 32; controls 36 high | **44**; **32** |
| P6 | Controls | Divider 1 × 24; gap 12; chips 14/20 500, chevron #6B6B70 | Divider **1 × 20**; gap **8**, **16** between the left group and search; chips **13/18 500**, chevron **Ink**. |
| P7 | Export | A 36 link, icon 16 Ink | 32 icon button, icon **20 #45454A**, **4** after search. |
| P8 | Table | Bare table | In a **card**: white, 1 px #EAEAEC, radius 16, shadow-0. Header 12/16 **500**, **37** high, cells padding 0 12, rows **45** (44 + hairline). Checkbox column: keep (row selection). |

---

## Q. Ulia's decisions on what was built but not drawn (18 Nov)

| # | What | Decision |
|---|---|---|
| Q1 | **Post types** (Announcement / Policy update / Event) | **Removed from the product.** All posts are one kind. <ul><li>CM05: remove the **Type** select.</li><li>CH02: remove the type chips (All types, Announcements, Policy updates, Events) and the divider before them; the controls row is the For me / Everyone segmented control only (search stays in the title row). C2 no longer applies.</li><li>Row meta everywhere (CH01, CH02): always "{author} · {audience}" — no "Policy update", no "Event on {d Mon}". The event date field goes too.</li><li>Row tile: the cover thumbnail, or the `megaphone` icon on #F3F3F5 for every post (no type icons).</li><li>Pinned cover without an image: the publish date as the hero ("15") and the month as the caption ("November") — as now.</li></ul> |
| Q2 | CM05 **Notify people** toggle | **Keep.** Style it as Pin to the top (L8): label "Notify people" 13/18 500 Ink, toggle on the right, hint "In their inbox, when the post goes out." 12/16 #6B6B70 under the label (4 gap); 12 between the toggle rows. Added to Words. |
| Q3 | CM06 **Publish version {n}** with nothing changed | The product has no disabled buttons (rules README, position 2: a control that can't work is not offered). With nothing to publish the **Publish button is not shown** (and no "Unpublished changes" pill); the bar is "Saved {HH:mm}" + Preview. It appears as soon as the draft differs from the published version. Today it shows "Publish version 2/3" on a page with no changes. |
| Q4 | CM08 **Legal entity** chip | **Shown only when the company has more than one legal entity** (Ulia, 19 Nov). With one legal entity the chip is not shown. |
| Q5 | Saved popover empty (U6) | **New scene `saved`** (Ulia, 19 Nov): the bookmark in Ink with the accent ring on its top-right corner. Files in `illustrations/`: `saved-s.svg` (S 96 — the popover; it is an `-s` file, so 96 is allowed) and `saved.svg` (M 160+, for a full Saved page if one comes). Inline it with `color: var(--accent)`, like every scene. Popover: saved-s 96, then 12, "Nothing saved yet" 15/22 600 Ink, 4, "Save a post or page to find it here." 14/20 #45454A, centred; padding 40 24. Add both files to `styles/noddo/assets/illustrations/` and the scene index (SPEC § 10: "saved — saved posts and pages, bookmarks"). Reference: `references/saved-empty-popover.png`. |

## U. States checked on 18 Nov, second pass (employee view, after the sandbox was re-created)

| # | Where | Now | Must be |
|---|---|---|---|
| U1 | **Could not load — every hub screen** (the hub API answering 500; re-checked 18 Nov, waiting 12 s) | For **7–10 s nothing at all** (the queries retry 3 times with nothing on screen), then `ErrorState` with **something-broke at S 96**, the title, an extra line **"An error occurred. Please try again."** and Try again. Titles now: CH01 "Couldn't load the news", CH02 "Couldn't load the news", CP01 "Couldn't load the handbook", CM02 "Couldn't load posts", CM03 "Couldn't load pages", CM04 "Couldn't load settings", CM06 **"This didn't load"**, CH03 **"This didn't load"**, CM08 **nothing at all** | <ul><li>Scene **something-broke at M 160** (it has no `-s` file — rule in S), centred in the free area under the title / tabs.</li><li>**No second line**: spec Words are the title + "Try again" only.</li><li>Titles from the specs: CH03 **"Couldn't load pages"**, CM06 **"Couldn't load this page"**, CM01 and CM08 (no words in the spec yet; Ulia, 19 Nov — SPEC § 1 error voice: what happened + how to fix + work is safe): CM01 **"We couldn't load the overview"** / **"Your posts and pages are safe."** + Try again; CM08 **"We couldn't load who agreed"** / **"Every yes is saved."** + Try again (CM08 shows nothing today — add the ErrorState). On these two the second line is wanted; on the other screens no second line.</li><li>While retrying, show the **loading** state (U3), not an empty screen.</li><li>CM02 shows **"All · 0 / Published · 0 / Scheduled · 0 / Drafts · 0"** above the error and while loading: never show counts as 0 when they are not loaded — hide the numbers ("All", "Published"…) until data comes. Same for CH03 "Waiting · 0 / Agreed · 0" (U2).</li></ul> |
| U2 | **CH03 — could not load / loading** | "Waiting · 0 / Agreed · 0" over the error (and over the empty wait) | Counts hidden until loaded; error per U1 ("Couldn't load pages"). |
| U3 | **Loading** (API slowed to 6 s; CP01, CH03, CM01–CM04, CM08) | A 24 ring for a moment, then **nothing** for the rest of the wait — CM01 shows only the title and tabs, CM02 the "· 0" tabs, CM03/CM04 the tabs. `/hub/manage` first shows the text **"Checking your access…"** in place of the page | Spec Loading: title, tabs and buttons draw at once; 0.3–2 s a `NodRing` in the block; past 2 s a `Skeleton` in the block's shape — CP01 6 section cards; CH03, CM02, CM03, CM08 skeleton rows; CM01 tiles and columns; CM06 bar + NodRing then skeleton. The access check shows the same skeleton, **no "Checking your access…" text**. |
| U4 | **CH02 search with no results** ("zzzqx") | The funnel `no-match` scene 96 + "No news matches this" 14/20 500 + "Clear filters"; pinned 32 under the controls | It is a **search**, so the **magnifier with the solid ring `no-results-s`** (product rule; post types are gone, so CH02 has no filters left). Title "No news matches this" **15/22 600** Ink, button **"Clear search"** (secondary 36). **Centred vertically** in the free area under the controls. |
| U5 | **CP01 empty** ("No handbook pages yet", employee) | policies M 200 pinned 48 under the ask box; line #6B6B70 | Centred **vertically** in the free area under the ask box (rule); line 14/20 **#45454A**. Employees get no button (correct). |
| U6 | **Saved popover, empty** | The **magnifier** (`no-results`) 96 + "Nothing saved yet" / "Save a post or page to find it here." | The magnifier means "a search found nothing". Use the new **`saved-s`** scene (Q5). Text as now. |
| U7 | Manage hub without the right (403) | `ErrorPage` "This page is private" / "Ask an admin for access." / Go to Company hub, policies M 200, centred | **Correct.** The hub has no Manage hub button for this person (correct), and the empty Handbook column has no action (correct, S5). |
| U8 | Login again after the restart | Landed on `/welcome` again | The welcome runs once (see the misc package, P1). |

## R. Still open — needs your side (Petya)

Everything else from the earlier R list was checked live on 18 Nov (menus, confirms, searches, error and loading states, What changed, Welcome tile) and is in the rows above.

- **Overdue** (CH03 "Overdue" pill + "Was {d Mon}", CM01 amber "Missed the deadline", CM08 overdue rows): not checked live — a past Agree by can't be set from the UI. Cover it with your tests against the boards.

---

## Z. Outside the hub

| # | Where | Now | Must be |
|---|---|---|---|
| Z1 | Log in page, left Wine pane: the ring grid (`svg` 408 × 271, `viewBox 0 0 408 271`), a top-row Rose ring when it nods (`@keyframes rn6x4x4-0`: down 7, back up to **−2**, then 0) | The top row sits on the very edge of the SVG (cy 20, r 17, stroke 6 → top of the stroke at y 0). The SVG and its parent have `overflow: hidden`, so on the −2 overshoot the ring's top is **cut flat** against the pane | The ring must never be cut. Give the grid **4 px of room on every side**: `viewBox="-4 -4 416 279"` with the SVG drawn at **416 × 279** and moved −4 / −4 (e.g. `margin: -4px`), so the rings stay exactly where they are. Or set `overflow: visible` on the SVG and on its wrapper. Check every ring that moves, in every row and column, on every sign-in screen that uses this pane (log in, code, forgot password, phone). |
| Z2 | Person header, "With us" | A person hired **today** shows "With us **1 week**" | Never round up: someone hired today has been here 0 days, not a week. Use the profile spec's wording for a stay under one week; if it has none, ask Ulia. |
