---
status: built
screen: filter
owner: Ulia
updated: 2026-11-19
---

# Filter — one design for the whole product

Approved by Ulia on 19 Nov 2026 ("this is the filter design across the whole product"). Board "noddo · Calendar", page Company calendar, frames **N09b, N09c, N09d** (Done). Drawn at 1710 × 1112. Pages `export/`, pictures `images/`, measured `../../measurements/filter/`, crops `../../components/filter-*`.

## What it is for
Narrow any list or board by conditions ("Team is Design and Office is Vilnius").

## Where it lives
Every filter that builds conditions: the shared `components/audience/FilterPopover` (People table, Attendance overview, the calendar) and the automations `ConditionBuilder` — one look. It replaces the FilterPopover's rows of 36-high selects. TABLES_AND_LISTS § 1 still decides WHERE a filter appears; this decides how it looks.

## Layout (N09b)
- Popover 620 wide (wide contexts), padding 12, radius 10, shadow-2, opens under the Filter button.
- Each condition is a **Mist card** (#F3F3F5, radius 10, padding 8 6 8 8) on ONE line: field select 150 · operator select 96 · value select (the rest) · remove ×.
- Selects 28 high, white, 1 px #DADADF, radius 8, padding 0 8 0 10, 13/18 400 Ink, chevron 12 #6B6B70. Open select: accent border + 3 px accent-muted ring. Remove: 28 × 28, icon 14 #6B6B70.
- Between conditions: "and" 12/16 400 #6B6B70 centred between two 1 px #EAEAEC hairlines, gap 8. A flat AND list — no And/Or, no groups.
- "Add a condition": text link 13/18 500 accent, Add 14, gap 6, no box; it opens the field list at once.
- Footer: Reset (ghost sm) left · Apply (primary sm) right, over a 1 px #EAEAEC divider.
- Value lists with colours (e.g. Policy) show the marker in the option and in the picked value.
- Narrow places (side windows ~320–400, e.g. automations' "Who it runs for"): the same card on two lines — field + ×, then operator + value.

## Many conditions (N09c, N09d)
- In the toolbar, applied filters are outlined white chips "Team Design ×"; when they don't fit, the first three show, then an outlined **"+9 more"** chip (N09c).
- "+9 more" opens the popover with all conditions (N09d): the popover grows to the screen (max ~700 of list), the list scrolls inside, Reset / Apply stay fixed at the bottom (the one place a divider stays: a scrolling list with a fixed footer).

## States
| State | What the reader sees | Image |
|---|---|---|
| Closed, filters on | chips + Clear all | N09c |
| Open | N09b | N09b |
| Many conditions | N09d | N09d |
| A value list open, no results in a list, error on Apply, the narrow two-line card | Not drawn — keep today's behaviour with this look | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Filter | toolbar | opens the popover | no |
| Add a condition | popover | a new card, the field list opens | no |
| × on a card | popover | removes the condition | no |
| Reset | popover | clears all conditions | no |
| Apply | popover | applies, closes, chips show | no |
| × on a chip / Clear all | toolbar | removes one / all | no |
| +N more | toolbar | opens the popover with all | no |

## Words
Filter · is · contains · and · Add a condition · Reset · Apply · Clear all · +{N} more · field names as the product has them.

## Changes to SPEC
None (popover § 13.7); replaces the FilterPopover look.

## New components
Condition card; "and" divider; "+N more" chip.

---

## Built
Built 2026-11-20 (the code side).

- **Components** (`hris/components/audience/`): `ConditionChrome` — `ConditionCard` (`layout="line"` field 150 ·
  operator 96 · value · ×; `"stacked"` two lines), `ConditionJoiner` ("and" between hairlines), `AddConditionButton`,
  `CompactSelect`, `compactTrigger` (28 high, white, open = accent border + ring) — moved from the automations
  settings, which now draw from here too. `AudienceBuilder` is rebuilt on them; `FilterPopover` is the button, the
  620 popover and the chips; `AppliedFilterChip(s)` the outlined "Team **Design** ×" chips, three then "+N more", then
  Clear all.
- **Where**: the People table, the company calendar and the Attendance overview use `FilterPopover` (the People table's
  and the calendar's hand-copied popovers are gone); the people picker, the hub's audience, a review cycle's and a
  calibration session's people and a role's custom scope use `AudienceBuilder` in the same look.
- **Popover**: 620, the conditions scroll inside it (up to the screen, max 760), Reset left and Apply right under the one
  hairline. "Add a condition" opens the field list at once. Reset now also clears the cards on screen.
- **What one line has no room for** (AQ-17, until answered): "Also search non-active people" and "Include people with
  no value" are checkboxes in the foot, left of Reset — the second is now one choice for every excluding condition
  ("is not", "has none of"), not one per condition; a range ("between") and several typed values show as a summary in
  the value cell ("A – M") that opens a small popover with From / To or the typed list; several values from a list are
  the list's own multi-pick, named on the field ("Poland, Lithuania").
- **The marker in a value**: `PolicyMarker size="sm"` is ready for a Policy value and `AppliedFilterChip` takes an
  `icon`; no filter field lists policies yet — the calendar rebuild adds it.
- **Not drawn, kept as today in this look**: an open value list, no results, an error on Apply.
