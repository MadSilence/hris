---
status: built
screen: home
owner: Ulia
updated: 2026-11-11
---

# Home

## What it is for
Everyone lands here after sign-in. They see who they are greeted as and today's date. They can ask, search or tell noddo what to do from one box. Below that is a grid of widgets that answer the questions they have every day: what waits for me, how much time off I have, who is out, what I need to sign or do. Most widgets let them act on the spot (approve, request time off, sign, tick a task, start the day). Everything else opens the right page. The person can change which widgets they see and how big they are (`home-edit`).

## Where it lives
Route `/dashboard`, as in the code today (`APP_HOME`, the first item in the sidebar). Every signed-in person sees it, with no page gate (a refused reader is sent here from `/403`). Which widgets show depends on role, modules and rights (see "Default layout" and `home-widgets`). A widget the person has no right to is neither shown nor offered.

## Layout
Sidebar 240 (SPEC § 6, § 13.6), then the page, white (`bg-page`), content 1088 wide at 1440 (SPEC § 6: home max 1440). Top to bottom:

1. **Header band** (Colour top only): the accent gradient (`accent-strong` → `accent`, 115°) behind the top 380 px of the page, plus one quiet ring (the noddo mark) in the top right corner: a 200 px circle with a 80 px stroke, the accent's light tint at 22 %. The first row of widgets rises over the band. Light top has no band: the page is white, and the ring is drawn in `accent-muted`. **New:** `HomeHeader`.
2. **Top line:** `My profile` on the right. It is a 44 px trigger: avatar 34 + "My profile", a pill (radius full), on Colour top white 14 % fill with a white 26 % hairline and white text. On Light top it is a secondary button look. Click opens the profile menu (P01). Hover only highlights it.
3. **Greeting row**, 28 px under the top line:
   - left: the date (accent tint on Colour, accent text on Light; 14/20 500), then "Good afternoon, {first name}" (see Values: 52/56 500);
   - right, on the same baseline: the **AI box** 520 × 56, radius 18, white, level 2. It holds the noddo spark, the placeholder "Ask, search or tell noddo what to do", one suggestion chip "Request time off" (filter-chip shape, 32 high) and a send icon button 40 × 40 (primary fill, radius 12, `arrow-up`). **New:** `AiBox` (A01, A02). The code has `AiPromptField` from automations; this one is its home variant.
4. **Widget grid**, 40 px under the greeting row. 4 columns × 254, gap 24, rows 160 (`home-widgets` § System). Widgets come in three sizes: Small 1 × 1, Medium 1 × 2, Large 2 × 2. They are placed in the person's saved order, and a smaller widget fills the first hole it fits (dense flow). Nothing ever leaves an empty hole in the middle of the grid.
5. **Edit home** at the very end, right-aligned: a pill button 44 high: white, a 1 px `accent-muted` hairline (#E9DCE0), 15 px 500 text, the `dashboard-square-01` icon 18 (E01). Also in the profile menu.

Narrow screens (1280 and less, HF06): the AI box drops under the greeting and keeps 520 width, left-aligned. The band grows to 420. The grid has 3 columns (a Large still takes 2), in the same order.

## Default layout
A new person gets the widgets for their role, in this order (Large first, then Medium and Small as they fit):

| Role | Widgets |
|---|---|
| Employee | Time off (M), My time (M, only with Attendance), Next time off (S), To sign (S), My tasks (L), This week (M) |
| Manager / approver | Waiting on you (L) first, then the employee set, plus Who’s out (L) |
| HR / admin | The manager set, plus Processes (M) and Automations (M) |

The finished screens (HF01–HF04) show the HR layout: Waiting on you L, Time off M, My time M, Who’s out L, Next time off S, This week M, To sign S, My tasks L, Processes M, Automations M. "Reset to default" in Edit home returns to the person's role default. A widget whose module is off (My time without Attendance) is skipped, and the rest move up.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The header (band, greeting, AI box, My profile) draws at once: it needs only the session. Each widget loads on its own and shows its own skeleton after 2 s (SPEC § 12). Under 2 s it shows nothing. The page never shows one big loader. | widget skeletons: `home-widgets/images/*` |
| Empty (nothing yet) | The person removed every widget and saved. Under the header: `EmptyState`, **all-caught-up** scene, "Your home is empty" / "Add the widgets you need." + "Edit home" (primary). Not drawn. | not drawn |
| No results | Only inside the AI box: typing finds nothing. "Nothing found for “{text}”", then "Ask noddo" as the only row. Not drawn. | not drawn |
| Error (could not load) | A widget that fails shows its own error card, and the rest of the page works (`home-widgets`). If the layout itself cannot load, the role default is shown, with no error. | `home-widgets/images/*` |
| No permission | Not a state of the page: everyone has Home. Widgets the person cannot use are not shown. | — |
| Normal | Colour top HF01 (first screen 1440 × 900), HF03 (whole page, scrolled); Light top HF02, HF04. | HF01–HF04 |
| Long content | A long first name wraps the greeting to two lines. The header grows and the cards move down. The name is never cut (HF05). Narrow screen: HF06. | HF05, HF06 |
| My profile menu open | P01 | P01-profile-menu.png |
| AI box focused | It grows up and to the left over the header and keeps its right edge. The cards stay where they are, with no dimming. Under the input are three suggestion chips (A01). | A01-ai-focus.png |
| AI box, long text | It grows upward up to 6 lines, then scrolls inside. Shift + Enter makes a new line (A02). | A02-ai-long.png |
| Greeting by time | Morning, afternoon or evening by the person's local time (G01). | G01-greetings.png |
| End of the page | E01: the last row and "Edit home". | E01-edit-entry.png |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open the profile menu | My profile | Menu 260 wide, radius 10, level 2 (SPEC § 13.7), right-aligned under the trigger. Items 32, icon 16. | no |
| My profile / My time off / My documents / My attendance | profile menu | Opens the page. My documents carries a Pending tag "2 to sign" only when there is something to sign. My attendance shows only with the Attendance module. | no |
| Edit home | profile menu, end of page | Opens edit mode (`home-edit`). | no |
| Personal settings | profile menu | Opens personal settings. | no |
| Log out | profile menu, last, after a divider | Signs out. | no |
| Focus the AI box | click or `/` | Grows upward (A01). Esc closes it and keeps the text. | no |
| Type in the AI box | AI box | Results open under the box, over the cards, in three groups: **People** (name, job · team), **Do** (actions: "Request time off", "Approve Lena’s request"), **Ask noddo** ("Ask noddo: “{text}”"). Arrow keys move, Enter runs the highlighted row. With nothing highlighted, Enter sends to noddo. | no |
| Suggestion chip | AI box | Puts the action into the box, the same as typing it. "Request time off" opens the request dialog at once. | no |
| Send | AI box | The same as Enter. | no |
| Anything inside a widget | widgets | See `home-widgets`. | per widget |

## Words
| Where | Text |
|---|---|
| Greeting 05:00–11:59 | Good morning, {first name} |
| Greeting 12:00–16:59 | Good afternoon, {first name} |
| Greeting 17:00–04:59 | Good evening, {first name} |
| Date | {Weekday}, {d} {Month} — "Tuesday, 10 November" |
| Profile trigger | My profile |
| Profile menu | {Full name} / {Job title} · {Team}; My profile; My time off; My documents; tag: {n} to sign; My attendance; Edit home; Personal settings; Log out |
| AI box placeholder | Ask, search or tell noddo what to do |
| AI box chip (closed) | Request time off |
| AI box chips (open) | Request time off; Who’s out Friday?; My balance |
| AI box hint (open) | Shift + Enter for a new line |
| AI box groups | People; Do; Ask noddo |
| AI box ask row | Ask noddo: “{text}” |
| AI box no results | Nothing found for “{text}” |
| Send button (accessible name) | Send |
| End of page | Edit home |
| Empty home | Your home is empty / Add the widgets you need. / Edit home |

Every string in the frames, including example data, is in `words.md`.

## Values
- Page padding 56 on every side at 1440, 48 at 1280 (HF06). The header-to-grid gap is 40, and the grid gap is 24 (SPEC § 6 scale). The padding is a change, see below.
- Greeting row: date-to-greeting gap 10, gap 40 between the greeting and the AI box.
- AI box 520 × 56, radius 18, padding 0 8 0 18, level 2; chip 32 (SPEC § 13.4 filter shape); send 40 × 40, radius 12, primary fill.
- My profile 44 high, a pill, padding 0 14 0 4, avatar 34.
- Band height 380 (420 narrow); ring 600 box, r 200, stroke 80, at right −180 / top −200.
- Light tooltip everywhere (DESIGN_SYSTEM § 7).
- Accent colour: everything that is accent follows the company accent, including the band, the ring, buttons, links, the time dial and the confetti (DESIGN_SYSTEM § 3). On a light accent (butter yellow) the header text and the button labels turn dark, decided by contrast the way `accent.ts` does it.

## Changes to SPEC
1. **Greeting 52/56, weight 500, −0.02em** (SPEC § 5 says 32/40 600). On the band the greeting is the hero, and 32 looked lost. The narrow screen keeps 52.
2. **Page padding 56** (SPEC § 6 says 32). The home is a calmer page than a table.
3. **Header band in the accent gradient** (`accent-strong` → `accent`) with one quiet ring. SPEC has no home header. The accent is allowed to fill it because it is the company's colour (§ 2), not noddo's.
4. **AI box radius 18**, a radius SPEC does not list (§ 8). It sits between the card (28) and the controls (8). Alternative: 20 (panel).
5. **Widget card: radius 28, no border, shadow `0 1px 2px rgba(11,11,12,.06), 0 8px 24px rgba(11,11,12,.08)`** (SPEC § 7 level 0 and § 13.9 say radius 16 with a border). Ulia chose this on 11 Nov (N7): on a white page a border made the cards heavy. Details are in `home-widgets`.
6. **Pill-shaped controls on Home** (SPEC § 13.2 gives buttons radius 8): My profile and Edit home are pills 44 high, and the segmented controls are pills. The AI box's send button is 40 × 40 with radius 12. Ordinary buttons inside the widgets stay SPEC § 13.2.

## New components
- **`HomeHeader`**: band (Colour / Light), ring, top line, greeting row. Its states are Colour, Light and narrow. It is used only on Home.
- **`AiBox`**: closed (one chip), focused (grows up, three chips), typing (results panel), long text (6 lines then scroll), sending (the send button shows `NodRing`). It could later become the ⌘K palette's home face.
- **`ProfileMenu`**: a standard menu (SPEC § 13.7). It is new only in its content.
- **`WidgetGrid`**: a 4-column dense grid with three cell sizes. In edit mode it adds handles, size tags and remove (`home-edit`).

## Open questions
- Q-3 (how the layout with sizes is saved), Q-4 (where the Colour / Light choice is saved): in `handoffs/2026-11-11-home/QUESTIONS-to-add.md`. Both are about storage only; the design does not change. Neither blocks.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/dashboard` — `components/modules/home/components/HomeContainer.tsx` (`HomeHeader`, `AiBox`,
  `WidgetGrid`, `WidgetCard`). Built 2026-11-11, **not yet looked at in a browser**.
- **Differs from the design:**
  - **My time and To sign are not built** (the owner: clock-in is not something the product does; e-signing is not
    planned) — so they are not in the role defaults, and the HR default is the drawn one without them. `QUESTIONS.md`
    Q-7.
  - **The AI box is a stub** (the owner): People come from quick search, Do from a fixed list of Home's own actions,
    and *Ask noddo* says the assistant is on its way and sends nothing.
  - **My documents carries no "2 to sign" tag** — there is nothing to sign without e-signing.
  - **The role default** is read from rights: HR runs processes or automations, a manager sees leave beyond their own.
    **Its order is re-packed**: without My time and To sign the drawn order left a hole in the middle of the grid, so
    each default is the drawn set placed to fill each pair of rows (Large, Medium, Medium, …, the Small one last). At
    1280 the HR default still leaves one cell at the end of a row.
    Every new widget a person is given later joins at the end of their order at its default size.
  - **The empty home's action** is the empty state's primary button, as drawn in words.
- **Images of the real screen:** owed — the walk of 2026-11-11 ran with the window hidden (`(claude)/testing/OWNER_VISUAL_REVIEW.md` § 21).
