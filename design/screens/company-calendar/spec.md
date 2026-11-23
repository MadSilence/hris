---
status: built
screen: company-calendar
owner: Ulia
updated: 2026-11-20
---

# Company calendar

Approved by Ulia on 19 Nov 2026. Board "noddo · Calendar", page **Company calendar**, frames N01–N25, every one with a green Done sticky. The boards are drawn at **1710 × 1112** (N24 at 1440 × 932). Pictures: `images/`, pages: `export/`, every element measured: `../../measurements/company-calendar/`, components: `../../components/`.

## What it is for
Anyone in the company opens it to see who is away and when, plan around it, and (a manager) act on a request. They leave knowing who is off, filtered to the people they care about, and can save or share that view.

## Where it lives
Sidebar › **Calendar** (`/calendar`). Everyone sees it, within their access: what kind of leave someone has is shown only to people allowed to see it; others see a gray **Away** pill (leave colours, Gray). A person filter has its own address, `/calendar?person={id}` (N21) — Home › Who's out opens it, not the profile. Any calendar state (view, filters, dates) can be shared as a link and opens the same for the receiver, within the receiver's access.

## Layout (N01)
Top to bottom, in the content column (sidebar as everywhere):
1. **Header** — title "Calendar" + one line "See who is away, and which days are public holidays." On the right: **Share** (Button secondary md, Link01 16) · Print (icon button secondary 36, Printer) · Export (icon button secondary 36, Download04). Share is drawn on every N frame.
2. **Saved views** — pills, each name + a PLAIN count (13/18 400 tertiary, no bubble). Picked view: accent-subtle fill, accent text, name **600** (count stays 400). After a 1 × 20 divider: **Save as a view** (ghost, Add 16, accent text). "Everyone" is always first; it can't be moved or deleted.
3. **Toolbar** — `SearchBox` 260 × 36 "Search" · **Filter** (secondary, FilterHorizontal, with the count when filters are on) · applied filters as OUTLINED white chips "Team Design ×" · **Clear all** · … on the right **Group ▾** (ghost) · **Today** (secondary sm) · **Week / Month** (`SegmentedControl` 32).
4. **Timeline** — a fixed left column (people), and the days: a months row (month name 600 + year 400 tertiary) over weekday letters over day numbers; today = accent circle on the date and a 2 px accent line down the whole board that never breaks. Endless horizontal scroll. Month view shows **33 days** at 1710 (16 Nov – 18 Dec on the board) — never squeeze in more, narrower days. **Every day is its own cell** in person rows: a 1 px divider between all days, month start 1.5 px gray-300. Weekends solid Mist. Rows never shrink, pills vertically centred, the today line under the pills. No legend, no month arrows, no Away row.
5. **Person row** — avatar 32 (initials rule, DESIGN_SYSTEM § 5) + name 14/20 500 + job 12/16 tertiary. People are sorted **A–Z by first name** everywhere on the calendar (in the list and inside each group).

### Leave pills
- Approved: pill in the policy's leave fill, text in its text colour, radius full, 28 high, text "Annual leave · 5 days" (the "· 5 days" 400). Colours: `../../../2-product-wide/screens/leave-colours/`.
- Pending: white, 1.5 px dashed edge in the policy's edge colour, text colour, Clock 14 before the text.
- A pill that comes in from the left (started before the visible days): square left end, a 40 px fade, the text starts 44 px in so the fade never touches it. A long leave says where it ends: "Parental leave · back Mon 4 Jan →" (N01, Marius).
- Short pills keep only what fits; a pill too short for text is colour only.
- Hover: the pill lifts (white 2 px ring + soft shadow), never a dark outline; the row highlights (N03). **No tooltip on a pill.**
- Click: the compact **leave card** (N04, N05) pops up **centred on the pill, 6 px from it**, kept inside the board.

### Leave card (N04 approved · N05 pending)
300 wide, padding 16, gap 12, popover (radius 10, level 2). Row 1: policy marker + policy name · status badge (`StatusBadge`, no tooltip) · **ArrowExpand01** icon button top-right (opens the request in full — `../profile-time-off/` Q30). Dates 18/26 600, then "5 working days · back Mon 23 Nov" 14/20 tertiary 4 px under. The person's comment as a grey speech bubble (surface-mist, radius 4 12 12 12, 14/20), no label. Pending: an amber line about who else is away then. **Decline / Approve** (bottom right, no divider) only for someone who can manage that request. No person row, no "Open request" button.

### Public holidays (N22, N23, N25)
Per person, from their office's holiday calendar. The person's day is a light tint of the company colour (accent 9 % on white), no flag. A leave pill covers it. Week view writes the holiday name in the cell (cut with … + tooltip); under a pill nothing is written. When everyone shown is in one office (N25) the holiday fills the whole column including its header cell; the weekday letter and date turn accent — no circle around the date.

### Week view (N02)
Weekday label stacked over the date, both centred over the column, so the today line drops from the date circle.

### Grouping (N06c, N07)
- **Group band**: white, 32 high (person row 52), no day cells, the today line runs through; chevron 14 (fold) + team name 13/18 600 in accent-text + plain count 13/18 tertiary, 24 px from the left; a 2 px border-divider line on both sides; two bands in a row share one line.
- **Group control when grouped**: a picked pill — accent-subtle, 1 px accent ring, 32 high: "Group:" 13/18 400 secondary + "Team" 13/18 500 accent + chevron 14 (opens the menu) + a 1 × 14 accent-ring divider + × 14 (ungroups).
- **Group menu** (N07): opens right under the Group button, right edges aligned, 220 wide; title "Group by" 12/16 500 tertiary (padding 8 10 4) with the divider hugging it (margin 0 6 6); options None · Department · Team · Office; the picked one in accent with an accent tick.

### Saved views (N08, N08b, N08c, N10)
- Many views (N08b): the row shows the views that fit, then **"14 more ▾"** — a pill like the views — opening a scrolling menu (name + count).
- Order (N08c) = drag and drop: drag a pill in the row or a row in the "N more" list (DragDropVertical handle on hover, cursor grab). While dragging the pill lifts (shadow-3), an accent line marks where it lands, the list leaves a dashed gap. Drop saves the order at once for this user (views are personal); no Save button. The row shows the views in that order, as many as fit; dragging from the list into the row puts it there and the last pill that no longer fits moves to the top of the list. Picking a view from the list shows it in the row in place of the last pill for this visit only. ⋯ on a list row: Rename, Delete.
- **Save as a view** (N10): popover, title 15/22 600 → "Name" label + field → Cancel / Save view on the right. No hint, no divider. A saved view is seen only by its author.

### Filter (N09b, N09c, N09d)
The product-wide filter — see `../../../2-product-wide/screens/filter/spec.md`. Many filters (N09c): the first three as chips, then an outlined "+9 more" chip; it opens the filter with all conditions (N09d).

### Share (N10c, N10d)
Share opens a small window "Share this view": what the link keeps (view pill + filter chips + "Month · from 12 Nov"), the line "People see only what they have access to.", primary **Copy link**; no divider. After copying: toast bottom left "Link copied", 5 s (N10d).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Header, views, toolbar real; skeleton rows (avatar + 2 bars) and skeleton pills, shimmer | N16 |
| Empty — nobody away | Not drawn as its own state (Ulia: not needed): the board with no pills | — |
| No results (search) | "No one found" / "Check the spelling or try another name." — `EmptyState` no-results M, centred in the free area under the date rows | N12 (typing), N13 |
| No match (filters) | "No one matches these filters" / "Change a filter or clear them all." + Clear all, no-match M | N14 |
| Error | Tools stay; "We couldn’t load the calendar" / "Everyone’s time off is safe." + secondary "Try again" (no icon), something-broke M | N17 |
| No permission | "Not available to you" / "Ask an admin of your company for access.", policies M | N18 |
| Normal | N01 (month), N02 (week), N03 hover, N04/N05 card, N06c grouped | |
| Long content | Long names and jobs cut with … + tooltip (N19); 245 people, the list scrolls with the header fixed (N20, N11 scrolled) | N19, N20, N11 |
| One person | `/calendar?person=…` from Home › Who's out; the Person chip clears it | N21 |
| Smaller window | 1440 × 932: same layout, fewer days | N24 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Pick a view | views row | the calendar shows that view | no |
| Save as a view | after the views | popover N10; saved for this user only | no |
| Reorder views | drag a pill / list row | order saved at once | no |
| Rename / delete a view | ⋯ in the "N more" list | rename in place / deletes the view (not drawn in this round — use the product's existing rename and delete behaviour) | as the product does today |
| Search | toolbar | narrows the people list as you type | no |
| Filter | toolbar | popover N09b, Apply applies | no |
| Group | toolbar | menu N07; × on the picked pill ungroups | no |
| Fold a group | chevron on the band | hides its people | no |
| Today / Week / Month | toolbar | scroll to today / switch scale | no |
| Click a pill | timeline | leave card N04 | no |
| ↗ on the card | card | opens the request in full (profile-time-off Q30) | no |
| Decline / Approve | card (managers only) | decides; toast "Time off approved" / "Time off declined" | no; Decline may take an optional reason |
| Share | header | window N10c; Copy link → toast "Link copied" | no |
| Print / Export | header | print the current view / export it | no |

## Words
`words.md` lists every string per frame. Product strings (the rest is sample data):
Calendar · See who is away, and which days are public holidays. · Share · Everyone · My team · Save as a view · Search · Filter · Clear all · Group · Group: · Group by · None · Department · Team · Office · Today · Week · Month · {N} more · Rename · Delete · Name · Cancel · Save view · Share this view · People see only what they have access to. · Copy link · Link copied · {Policy} · {N} days · back {Ddd D Mon} · {N} working days · back {Ddd D Mon} · Approved · Pending · Decline · Approve · Away · No one found · Check the spelling or try another name. · No one matches these filters · Change a filter or clear them all. · We couldn’t load the calendar · Everyone’s time off is safe. · Try again · Not available to you · Ask an admin of your company for access. · Time off approved · Time off declined.
Dates: "Mon 23 Nov", no year in the current year; months row "November 2026".

## Values
Everything is measured in `../../measurements/company-calendar/<frame>.md` (position, size, font, colour with its token, borders, radii, padding, gaps, shadows, icons by Hugeicons name). Where a measurement and a picture differ, the measurement wins.

## Changes to SPEC
- **§ 13.13 Time off calendar** is replaced by this design: approved leave = the leave fill (not the tag bar), pending = white with a 1.5 px **dashed** edge (no tint, no dot pattern), public holiday = accent 9 % per person (no column grey, no name in the header except N25's one-office case and the week cell), weekends Mist; no understaffed marker drawn.
- **§ 4.7 tag palette for leave** → the leave colours (`2-product-wide/screens/leave-colours`).
- **§ 13.7 Tooltip**: white tooltips (white card, 12/16 #45454A, shadow-2) — approved earlier (answer 1.1), as on every board.
- **Policy marker**: "dot on a tint" replaces the 16 × 6 PolicyMarker pill everywhere.

## New components
- **Leave pill** (approved / pending / from the left / hover lift) — calendar, profile calendar.
- **Leave card** (300 popover) — calendar, profile calendar.
- **Group band** + **picked Group pill**.
- **Saved views row** with "N more" and drag-to-reorder.
- **Share window**.

## Open questions
None blocking. Petya: Decline with a reason — the reason is **optional** (Ulia 19 Nov); the decline dialog is not drawn in this round.

---

## Built
*2026-11-20, the code side* (`hris/components/modules/calendar/`; the reference is `(claude)/technical_documentation/COMPANY_CALENDAR.md`). Not yet looked at in a browser.

Built as drawn: the header (Share, Export), the views row with Everyone and My team built in, "N more", drag-to-reorder saved at once, ⋯ Rename / Delete; the toolbar (Search 260, Filter with its chips, Group as a ghost button and as the picked pill with ×, the Group by menu, Today, Week / Month); the board with endless sideways scroll (no month arrows), 38 px month days, a week of seven, the months row, today's circle and line, weekends, month starts, 1 px day dividers, the holiday tint per person and the one-office column (N25), the week view's holiday name; leave pills approved / pending (Clock 14) / from the left / hover lift, no tooltip; the leave card N04 / N05 with ↗, the comment bubble, the length, the amber line and Decline / Approve; group bands; the states N13, N14, N16, N17, N18; one person by `?person=` with its Person chip (N21); Share and "Link copied" (N10c, N10d); the whole state is the page's address.

What differs, and why:
- **Print is not built**, and the old one is removed (the owner, 2026-11-20). Export is the download icon alone.
- ~~No count beside a view's name~~ — since 2026-11-23 (B5) each pill carries its plain count, and so does the "N more" list: `POST /calendar/company/people/count` with the view's filters, within the reader's own scope. A count not yet read (or refused) is simply not drawn.
- ~~No job title under a person's name~~ — since 2026-11-23 (B5) the row draws the job (12/16 tertiary) under the name, from the row's `jobName`; both lines are in the tooltip.
- **Rename / Delete are also on a pill in the row** (⋯ on hover), not only in the "N more" list — a reader with three views has no list. Rename opens the Save-as-a-view popover titled "Rename view". Delete is immediate, as the product's view delete was.
- ~~The card's length says "5 days"~~ — since 2026-11-23 (B5) the card and the pill say "5 working days" or "5 days" by the policy's counting method.
- ~~Decline opens the request in full~~ — since 2026-11-23 Decline is the AQ-13 window (optional "Comment", toast "Time off declined"). Approve is held five seconds behind Undo (the owner's D1) and toasts "Time off approved".
- **"Who else is away"** names the first person and "N more", from the rows the board has loaded — never someone the reader could not already see.
- **A long leave** (two weeks or more) says "back Mon 4 Jan" instead of its length; the arrow → is drawn only when it runs past the loaded days.
- **N12 (search typed)** is the ordinary search box; the result of a search that finds nobody is N13.

*2026-11-23, the answers of 20 Nov* (`profile-time-off-answers`, plan `DESIGN_ANSWERS_2026_11_20_PLAN.md` item 5). Not yet looked at in a browser.
- **A3 — the reduced card**: a reader with neither the length nor a way to open the request gets the policy (or "Away" in grey), the dates and "Back Mon 23 Nov" — no status, length, comment, ↗ or actions.
- **↗ opens the request in full over the board** (AQ-12 b) by the page's address (`?leaveRequest={id}`); the parameter survives the board rewriting the rest of its address. There is no request page any more.
- **Decline** is the AQ-13 window; **"5 working days"** on the card and the pill (B5).
