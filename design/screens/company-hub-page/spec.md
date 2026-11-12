---
status: built
screen: company-hub-page
owner: Ulia
updated: 2026-11-12
---

# Company hub: the handbook and a page

## What it is for
The handbook is where people find how things work at the company: policies, guides, offices, benefits, teams and tools. **CP01** shows every section with its first pages. **CP02** is one page to read. When a page is **must read** and the reader has not agreed to its current version, CP02 shows what changed since they last agreed and a bar at the bottom with **I agree**. The reader leaves having read the page and, where needed, agreed to it. HR sees when (`company-hub-manage`, CM08).

## Where it lives
- **Routes:**
  - `/hub/handbook` (CP01), with `#section-{id}` to scroll to a section;
  - `/hub/handbook/{pageId}` (CP02).
- **Who sees it:** everyone sees the handbook. A reader sees only the sections and pages whose audience includes them. A section with no page the reader can see is not shown at all.
- **Where it opens from:**
  - Company hub (Open handbook, a section card, "{n} more sections", Recently updated);
  - the "Pages need your yes" list (CH03);
  - a link to a handbook page inside a post;
  - search (⌘K);
  - the ask box.
- **For managers:** a manager also sees an **Edit page** button on CP02 (secondary, `pencil-edit-02`), to the left of Save. It opens the page editor (CM06). It is not drawn, because CP02 shows an employee's view.

## Layout

### CP01 Handbook
Page padding 32 48 (as in `company-hub`). The content is full width.

1. **Back link** "Company hub".
2. **Title** "Handbook" (32/40 600). Under it, "How things work at {company} · {n} pages in {n} sections" (14/20, secondary).
3. **Ask box**, 32 under the title: `AiBox` hub variant, 860 wide (left-aligned), placeholder "Ask the handbook, or search pages". It searches and asks only within handbook pages.
4. **Sections grid**, 40 under the ask box: 3 columns, gap 20, in the editor's order. Each section card is Mist `#F7F7F8`, radius 20, padding 22 (built as 24), no border. Top to bottom:
   - **Header:**
     - a 40 icon tile in the section's tag colour, radius 12;
     - the name (16/22 600, see Values);
     - under the name, "{n} pages" and, when some wait for the reader, "· {n} to agree" in `accent-text`;
     - an accent dot 8 on the tile's corner when something waits.
   - A hairline 16 below.
   - **Up to three pages:**
     - first, the ones that wait for the reader;
     - then the editor's order.
     - Each is a 32 row: the page icon 16, the title (14/20), and an accent dot 6 after the title when it waits.
   - **"{n} more"**: a link that opens the rest of the section in place, inside the card. When open it reads "Show less".
   - A section with three pages or fewer has no link.

### CP02 A page
Page padding 32 48. The reading column is 760 wide, left-aligned.

1. **Breadcrumb**, 13/18 links: "Company hub / Handbook / {section}" (SPEC § 13.6: deeper than two levels). The section link opens CP01 at that section.
2. **Title row**, 40 under the breadcrumb:
   - a 52 icon tile, radius 16, in the page's tag colour, with the page icon 24;
   - the title (36/44 600 Inter Tight, see Values; it wraps freely);
   - "{n} min read" (12/16, tertiary), right after the title on its first line;
   - on the right of the column:
     - the audience as a tag (`TagChip`, the **Ocean** dot), e.g. "Everyone at Acme" or "Vilnius office";
     - after it, the save icon button (`bookmark-02`).
3. **Meta line**, 16 under the title row:
   - the owner's avatar 22 and name;
   - 24 apart, "Version {n} · updated {d Mon yyyy}" (12/16, tertiary);
   - there is no version switcher: only the current version is shown (Ulia, round 6).
4. **What changed**, 40 under the meta line. It is shown only when the reader agreed to an older version of this page. It is a block on `accent-subtle`, radius 16, padding 20 24, holding:
   - the title "{n} things changed since you agreed to version {n}" (15/22 600);
   - up to 5 points, each with an accent dot 6.
   - The points are **made by the system** when the editor publishes a version (see `company-hub-manage`, Publish), so the reader sees them as published. There is no AI label on the reader's side: the editor reviewed them.
   - A reader who never agreed (a new page or a new person) does not see this block.
5. **Body**, 48 under the block (or under the meta line):
   - headings 18/26 600 (SPEC § 5 section title);
   - text 15/26 secondary (see Values);
   - lists, links to other pages, images (radius 16) and tables (SPEC § 13.5);
   - a changed phrase may be marked in the text with an `accent-muted` highlight, radius 6. It is shown together with the What changed block and only to the reader who saw the older version.
6. **Agree bar**, sticky at the bottom of the viewport, 28 above the edge, as wide as the column (**new**, `AgreeBar`). It is shown only on a must-read page whose current version the reader has not agreed to.
   - The bar is white, radius 16, level 2 (SPEC § 7), padding 12 12 12 20.
   - On the left:
     - "Agree to version {n} by {d Mon}" (15/22 500);
     - under it, "{owner first name} will see that you agreed and when" (12/16, tertiary).
   - On the right: **I agree** (primary, 36).
   - When the page is overdue, the first line is "Agree to version {n} — it was due {d Mon}" and the line under it does not change.

**After agreeing:**
- the bar turns into a quiet line in its place for 5 s: a check icon + "You agreed to version {n} on {d Mon}". Then it leaves;
- the What changed block stays until the reader leaves the page;
- the hub's counter and CH03 update.

**An agreed page:**
- has no bar;
- the meta line gets ", you agreed {d Mon}" after the version: "Version 3 · updated 3 Nov 2026 · you agreed 12 Nov".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | **CP01:** the title and the ask box draw at once. Past 2 s the grid shows a `Skeleton` of 6 section cards. **CP02:** the breadcrumb draws at once. From 0.3 to 2 s a `NodRing` shows in the column. Past 2 s a `Skeleton` shows: title, meta and 6 text lines (SPEC § 12). | not drawn |
| Empty (nothing yet) | **CP01 with no pages** (or none the reader can see): `EmptyState`, **policies** scene. Title "No handbook pages yet". Text "Pages your company adds will show up here." A manager gets "Add a page" (primary), which opens Manage hub → Pages. **CP02 with no text** (only a title): the empty body says "This page has no text yet". | not drawn |
| No results | **Ask box:** "Nothing found for “{text}”" + "Ask noddo" (as on Home). | not drawn |
| Error (could not load) | **CP01:** `ErrorState` **something-broke**, "Couldn't load the handbook" + "Try again". **CP02:** the same in the column, "Couldn't load this page". **I agree fails:** the button goes back from "Agreeing…" to its label, and an error toast shows "Couldn't save your answer. Try again." with Retry. The bar stays. | not drawn |
| No permission | A page outside the reader's audience: `ErrorPage` 403, "This page is private" / "Ask an admin for access." [Go to handbook]. **A page that was deleted:** `ErrorPage` 404 with "Go to handbook". **A page that was unpublished:** 404 for readers. | not drawn |
| Normal | CP01 (whole handbook, 10 sections), CP02 (must-read page, newer version waiting) | CP01-handbook.png, CP02-policy-page.png |
| Long content | A long section name wraps to 2 lines on CP01. A page title in a section card is cut with … and a tooltip. A long page title on CP02 wraps freely. A long page scrolls, and the agree bar stays at the bottom. A page with more than 5 changes shows 5 and "Show {n} more". A long audience name in the tag is cut at 200 with a tooltip. | not drawn |
| Agreeing | I agree shows "Agreeing…" with `NodRing`, keeps its width, and ignores a second click (SPEC § 12). | not drawn |
| Agreed | The bar leaves (see Layout), and the meta line says when the reader agreed. | not drawn |
| Reference page (not must read) | No bar, no What changed block, no "to agree" anywhere. | not drawn |
| A section expanded | Every page in the section, then "Show less". | not drawn |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open a page | CP01 row, links | Opens CP02. | no |
| {n} more / Show less | CP01 card | Opens and closes the section in place. | no |
| Ask / search | CP01 ask box | Searches page titles and text. Results are grouped by section, plus "Ask noddo". | no |
| Breadcrumb | CP02 | Company hub → CH01; Handbook → CP01; {section} → CP01 at that section. | no |
| Save / unsave | CP02 | Toggles. Undo toast: "Saved" / "Removed from saved". | no |
| I agree | CP02 bar | Records that this person agreed to this version, with the time. The bar leaves (see Layout). The counter on the hub and Manage hub update. There is no undo: an agreement is a record HR relies on. There is also no confirm: the bar already names the version and that the owner will see it. | no |
| Edit page | CP02 (managers only) | Opens CM06 for this page. | no |
| Open the owner | CP02 meta | Opens the owner's profile. | no |

## Words
| Where | Text |
|---|---|
| Back link | Company hub |
| CP01 title | Handbook |
| CP01 lead | How things work at {company} · {n} pages in {n} sections |
| CP01 ask | Ask the handbook, or search pages |
| Section card | {Section} / {n} pages (1 page) · {n} to agree |
| More | {n} more; Show less |
| Breadcrumb | Company hub / Handbook / {section} |
| Read time | {n} min read (under a minute: 1 min read) |
| Audience tag | Everyone at {company}; {group name}; {n} groups (more than one filter) |
| Save (accessible name) | Save; when saved: Saved |
| Meta | Version {n} · updated {d Mon yyyy}; after agreeing: … · you agreed {d Mon} |
| What changed | {n} things changed since you agreed to version {n} (1: 1 thing changed since …); Show {n} more |
| Agree bar | Agree to version {n} by {d Mon} / {owner first name} will see that you agreed and when / I agree |
| Agree bar, overdue | Agree to version {n} — it was due {d Mon} |
| Agreeing | Agreeing… |
| Agreed line | You agreed to version {n} on {d Mon} |
| Agree error toast | Couldn't save your answer. Try again. / Retry |
| Empty handbook | No handbook pages yet / Pages your company adds will show up here. / Add a page |
| Empty page | This page has no text yet |
| Errors | Couldn't load the handbook; Couldn't load this page / Try again |
| Private | This page is private / Ask an admin for access. / Go to handbook |
| Edit (managers) | Edit page |

## Values
- **CP01 section card:**
  - padding 22 → build **24** (SPEC § 6 scale);
  - radius 20 (SPEC § 8 panel; see Changes to SPEC);
  - grid gap 20.
- **CP01 section name** 16/22 600: not a SPEC § 5 role, so build it as card title **15/22 600**.
- **CP02 reading column** 760: build **720** (SPEC § 6: reading text max 720). The agree bar is the same width.
- **CP02 body text** 15/26 (SPEC § 5 body is 14/20). This is a reading page, so the longer line height is a Change to SPEC.
- **CP02 title** 36/44 600 Inter Tight. See Changes to SPEC.
- **Icon tiles:**
  - 52, radius 16, on CP02;
  - 40, radius 12, on CP01;
  - 16-glyph page icons in rows.
  - Colours are the tag palette by the editor's choice (SPEC § 4.7).
- **What changed:** `accent-subtle` background, radius 16, dots in the accent.
- **Agree bar:** level 2 shadow (SPEC § 7), radius 16, 28 above the viewport edge (built as 24).
- **Highlight** in text: `accent-muted`, radius 6 (SPEC § 8 tag radius).

## Changes to SPEC
1. **Page title 32/40** on CP01 and **36/44** on CP02 (SPEC § 5 page title 24/32). CP02 is a document, and its title is the document's title. See also `company-hub` Changes to SPEC 1.
2. **Reading text 15/26** on CP02 (SPEC § 5 body 14/20). Long policy text at 14/20 was tiring to read. The same should apply to a single post.
3. **Section cards on Mist with radius 20 and no border** (SPEC § 13.9 card: radius 16, level 0 border). These are areas of the page rather than cards on it. Home's widget card dropped the border for the same reason.
4. **The What changed points are made by the system** (Ulia, round 7) and shown to readers without the "Drafted by AI" label, because the editor reviews them before publishing (`company-hub-manage`). SPEC § 1 asks for the label on AI text that is not yet reviewed. Q-11.

## New components
- **`AgreeBar`**: a sticky bar with a two-line message and one primary button. States: waiting, overdue, agreeing, failed (toast), agreed (a quiet line, then gone). It could be reused for documents to acknowledge.
- **`WhatChanged`**: a block with a title and up to 5 points, then "Show {n} more".
- **`HandbookSection`** (CP01 card): header, page rows, expand.
- **`PageHeader`** (CP02): icon tile, title, read time, audience tag, save, meta line.
- The page body is rich text (headings, lists, links, images, tables, page links). Its editor is in `company-hub-manage` (CM06).
- Reused: `AiBox` (hub variant), `TagChip`, `EmptyState`, `ErrorState`, `ErrorPage`, `Skeleton`, `NodRing`, toasts.

## Open questions
Q-11 (how What changed is made) is in `QUESTIONS-to-add.md`. It does not block: the design follows the recommended answer. Whether a new version asks people again is the editor's choice when publishing (`company-hub-manage`, CM06; Ulia, 12 Nov). A small fix keeps agreements and shows readers no What changed block.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/hub/handbook`, `/hub/handbook/{id}` — `components/modules/hub/reader/`. Built 2026-11-12; walked by the assistant the same day with the window hidden — **not yet looked at by a person**.
- **Differs from the design:**
  - "What changed" compares with the version the reader agreed to, so a small fix since then is shown as changed too.
  - The "What changed" block and the changed paragraph render grey, not in the accent tint — for the designers to say.
  - A reader outside the page's audience sees "This page is private"; a deleted or unpublished page is not found.
- **Images of the real screen:** not added — the walk's window was hidden.
