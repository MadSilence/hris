---
status: built
screen: automations-activity
owner: Ulia
updated: 2026-11-06
---

# Activity: every run in the company

## What it is for
An HR admin sees what automations did and are about to do across the company, without opening each one. They see what needs attention (failed runs), what is waiting on someone, and what is planned for the next 7 days. From the card menu of one automation, the same page shows only that automation's runs.

## Where it lives
- Sidebar → Automations → tab **Activity**: all automations (V8).
- An automation card's ⋯ → "Run history", or "See why" on a card: Activity filtered to that automation (V8b), with "Open in editor".
- Who: anyone who may view automations (Q-8). Rows about people outside the reader's access are hidden and counted.

This is a **query screen** (TABLES_AND_LISTS § 1a): column filters, infinite scroll, and no sort.

## Layout
1. Page header: "Automations" / "Routine HR work that runs by itself." The tabs are Automations | Activity, with Activity selected. There is no Add button on this tab.
2. **Toolbar**, left only:
   - `SearchBox` "Search" (searches people);
   - a "Filters" button (opens the ConditionBuilder over people: department, team, office…);
   - the **Automation** filter pill. Empty, it reads "All automations ▾". Picked, it turns accent-subtle and reads "Automation: Long time off approval ▾ | ×" (PRODUCT-RULES § Controls).
   - V8b only: "Open in editor" (secondary, pen icon) on the right.
3. **Chips with counts**, on their own line: All 1,284 · Needs attention 2 · Waiting 5 · Next 7 days 14.
   - Needs attention = failed runs.
   - Waiting = waiting on a person.
   - Next 7 days = scheduled in the coming week, soonest first.
4. **Table**, endless. Columns (V8): Person · Automation · When · Status · (action). In V8b the Automation column is dropped: Person · When · Status · (action).
   - Person: avatar 28 + name 14/20 500 + what it was about (12/16 tertiary).
   - Automation: its icon (16, tertiary) + name.
   - When: date and time in tabular figures ("Today, 10:02", "4 Nov").
   - Status: `StatusBadge`.
   - Action: "See why" (secondary, small) on failed rows, right after Status.
   - The table container is open at the bottom (no bottom border) and runs under the screen edge, with a scroll thumb.
5. A closing line after the last row: "Plus {n} runs you can't see."

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The toolbar and chips (counts as skeleton pills), then skeleton rows inside the real table body under the real header (TABLES_AND_LISTS § 2). | not drawn: the pattern of V4b in a table |
| Empty | No automation has ever run: the **automations** scene, "Nothing has run yet" / "Runs show up here once an automation is on." + "Go to automations" (secondary, switches the tab). | not drawn |
| No results | Search or filters find nothing: the **no-match** scene (no-results-s for a plain search), "No runs match" / "Try another name or clear the filters." + Clear filters. A chip with 0 (e.g. Needs attention): the **all-caught-up** scene, "Nothing needs attention". | not drawn |
| Error | `ErrorState`, something-broke: "We couldn't load the activity" / "Your automations keep running." + Try again. | not drawn |
| No permission | Without the view right the tab is not shown. Rows about people outside access are hidden, and the closing line counts them. | — |
| Normal | All automations (V8); one automation (V8b). | V8-Activity.png, V8b-Activity-one-automation.png |
| Long content | 1,284 runs: endless scroll. Long names: one line + ellipsis + tooltip (§ 5). | V8 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open a run | click a row | Opens the run in the editor: the automation opens with Run history and that run's window open (`automations-run-history`, V1 / V1b). | no |
| See why | failed row | The same, scrolled to the failed step. | no |
| Pick an automation | Automation pill | A searchable list of automations; on pick → V8b. | no |
| Clear the automation | × in the pill | Back to all (V8). | no |
| Filters | button | The ConditionBuilder in a popover. Applied filters show their count on the button: "Filters 2". | no |
| Chips | chip row | Single choice; the counts follow search and filters. | no |
| Open in editor | V8b | Opens the automation in the editor. | no |

## Words
| Where | Text |
|---|---|
| Header | Automations / Routine HR work that runs by itself. |
| Tabs | Automations · Activity |
| Toolbar | Search · Filters · Filters {n} · All automations · Automation: {name} · Open in editor |
| Chips | All {n} · Needs attention {n} · Waiting {n} · Next 7 days {n} |
| Columns | Person · Automation · When · Status |
| Row examples | Vacation, 12 days · Probation ends 25 Nov · Signs the handbook · First day · Work anniversary · Moved to Vilnius · Birthday |
| Statuses | In progress · Failed · Waiting · Scheduled · Done · Skipped · Cancelled |
| When | Today, 10:02 · Yesterday, 16:20 · 4 Nov · 4 Nov 2025 (another year) |
| Row action | See why |
| Closing line | Plus {n} runs you can't see. / Plus 1 run you can't see. |
| Empty | Nothing has run yet / Runs show up here once an automation is on. / Go to automations |
| No results | No runs match / Try another name or clear the filters. / Clear filters |
| Zero chip | Nothing needs attention · Nothing is waiting · Nothing planned for the next 7 days |
| Error | We couldn't load the activity / Your automations keep running. / Try again |

## Values
- Page as `automations-list` (padding 32, header, tabs).
- Toolbar controls 32 high (§ 6 "controls above a list"). Search 260 (`SearchBox`). Filter chips 32, pill (§ 13.4).
- Picked pill: `--accent-subtle` fill, `--accent-ring` border, `--accent-text`; label "Automation:" in `--text-secondary` 400.
- Table (§ 13.5): container level 0, **radius 16** (the board draws 12), sticky header 36 with 12/16 500 tertiary headers, rows 60 (two-line person cell), hairlines, no zebra.
- Column widths V8: 26% / 30% / 16% / 16% / 12%. V8b: 40% / 20% / 20% / 20%.

## Changes to SPEC
1. **Rows 60 high**: § 13.5 has 44 / 36. The person cell carries two lines (name + what it was about). The People list in § 6 keeps one line; here the second line is the point of the row.
2. **Endless table with no bottom border**, as `automations-run-history` change 2.

## New components
None: `ListToolbar`, `SearchBox`, `FilterChip`, the ConditionBuilder popover, `StatusBadge`, and the table.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-8** — as recommended: anyone who may view automations; rows outside access hidden and counted.

---

## Built
- **Where to see it:** `/automations?tab=activity`. Code: `components/modules/automations/activity`.
- **Differs from the design:** the second line of a row is built from what the run was about (a leave, a process, the
  trigger and its date) — "Probation ends 25 Nov" reads as the trigger's name and the date. A card's See why opens the
  failed run itself.
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
