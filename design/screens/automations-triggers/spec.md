---
status: built
screen: automations-triggers
owner: Ulia
updated: 2026-11-06
---

# What starts it: the trigger list and trigger settings

## What it is for
The person picks the event that starts the automation and sets it up: which date and how many days before or after, which field changes, which time-off event and under what conditions, or a schedule.

## Where it lives
- **The trigger list**: the "What starts it" tool window (left, 320), opened by itself for a new automation (F2), or by clicking the When card.
- **Trigger settings**: the step settings window (right, 340), header "What starts it" over the static trigger name. While a trigger is set up, the canvas shows only the selected When card and the dashed "Add the first step".
- Read mode as in `automations-editor` (icon rows).

## Layout
**The trigger list** (F2): Search, then groups with a 13/18 500 tertiary label each:
- People: Someone is hired · A termination is scheduled · A last working day comes · Someone joins a group · A field changes
- Dates: A related date comes up · Schedule
- Time off: Time off is requested · approved · declined · cancelled
- Processes: A process is completed

Each row: a 20 icon, the name, 36 high, radius 8, hover `--accent-subtle` (§ 13.7 menu item).

**Settings per trigger** (fields top to bottom; one control per line; dividers, no section headings):

| Trigger | Fields | Frames |
|---|---|---|
| A related date comes up | **Date** (searchable select: About the person: Hire date, End of probation, Last working day, Date of birth; then Your company's fields, each marked "Custom". The list scrolls inside a fixed height, and "Pick a date" is pinned at the bottom) · [N days] + Before / After (segmented) + ☐ On the day · **Every year** toggle + hint · **If the date has already passed**: radio Run it late (hint) / Skip it; under Run it late: "Run late for up to [30] days" | T1, T1b |
| Pick a date (one date with a year) | Date (shows the date) → the date picker popover · Before / After + ☑ On the day · no Every year · a Mist note "Runs once: Mon, 1 Mar 2027" | T1c, T1d |
| A field changes | **Field** (searchable select) · **From** (Any {field} / a value) · **To** (Any {field} / a value) · **If the change starts later**: radio On the day the change starts (hint) / As soon as the change is saved (hint) | T2 |
| Time off is requested / approved / declined / cancelled | **Time off is** (segmented: Requested · Approved · Declined · Cancelled) · **Only when**: the ConditionBuilder (Leave type, Days, Department, Office…) · **Count step days from**: segmented Request · First day · Last day + hint | T3, T3b |
| Schedule | **Every**: segmented Day · Week · Month · Quarter · Year. Then: Week → seven day buttons Mo–Su, several may be picked · Month → On: A day of the month / A weekday, day grid 1–31 + Last day, hint · Quarter → Month of the quarter: First · Second · Third + day grid, hint · Year → month-and-day picker, no year, hint. Then **At** [09:00] (typed) · **Time zone** (select: Each person's time zone (default) / Company time zone / Pick a time zone) | T4a, T4b, T4, T4c, T4d |
| Someone joins a group | A grey line naming the group from Who it runs for + "Change it in Who it runs for." · **When someone stops matching**: radio Take back what this automation gave (hint) / Leave everything as it is | T5 |
| A process is completed | **Process** (select: Any onboarding / Any offboarding / a template) · **Only when**: ConditionBuilder | T6 |
| Someone is hired / A termination is scheduled / A last working day comes | No settings: one grey line saying when it runs. | — |

On the canvas the When card shows the trigger in words (title) and its key setting (subtitle), for example "Probation ends in 14 days" / "Every person, once".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The trigger list: 3 groups of skeleton rows. Field options load inside their select with a nod ring. | not drawn |
| Empty | No trigger yet: the placeholder card ("Choose what starts it"). | F2 / F0 in automations-start |
| No results | Search in the list or in a searchable select finds nothing: no-results-s S, "No events match" / "No fields match". | not drawn |
| Error | The list or a select's options can't load: "We couldn't load the list" + Try again (link), in place. | not drawn |
| No permission | Read mode: icon rows, no fields. | R3 pattern |
| Normal | One frame per trigger above. | T1–T6 |
| Long content | The date list with company fields scrolls and "Pick a date" stays pinned (T1b). The whole Time off window is drawn in full on the board (T3b; on screen it scrolls). | T1b, T3b |
| A field can't be used | A trigger that points to a field or process that was deleted: the field shows the declined `FieldError` "This field was removed. Pick another." and the automation is Paused by the system ("Fix the step"). | not drawn |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Pick an event | trigger list | Sets the trigger and opens its settings. If steps exist that use the old trigger's dates, they keep their settings, and those that no longer fit show "needs details" (F3). | no |
| Change the trigger | When card → trigger list | As above. | no |
| On the day | checkbox | Disables [N days] and Before / After. | no |
| Pick a date | pinned item in Date | Switches to the one-date mode (T1c) and opens the date picker. | no |
| Every year | toggle | On: repeats yearly (birthdays, anniversaries). | no |
| Day buttons / day grid | Schedule | Week: several days. Month / quarter: one day, or Last day. | no |

## Words
| Where | Text |
|---|---|
| List window title | What starts it |
| Groups | People · Dates · Time off · Processes |
| Events | Someone is hired · A termination is scheduled · A last working day comes · Someone joins a group · A field changes · A related date comes up · Schedule · Time off is requested · Time off is approved · Time off is declined · Time off is cancelled · A process is completed |
| Date trigger | Date · About the person · Hire date · End of probation · Last working day · Date of birth · Your company's fields · Custom · Pick a date · Before · After · On the day · Every year · Turn on for birthdays and work anniversaries. · If the date has already passed · Run it late · For people whose date passed before this was turned on, or while it was paused. · Skip it · Run late for up to [30] days |
| One date | Runs once: {Mon, 1 Mar 2027} |
| Date picker | {Month Year} · M T W T F S S (first day per Q-4) |
| Field change | Field · From · To · Any {field} · If the change starts later · On the day the change starts · Someone moves to Vilnius from 1 Dec: it runs on 1 Dec. · As soon as the change is saved · It runs today, when the move is entered. |
| Time off | Time off is · Requested · Approved · Declined · Cancelled · Only when · Add a condition · Add a group · Count step days from · Request · First day · Last day · Steps with "days before / after" count them from the first day off. (The hint follows the pick.) |
| Schedule | Every · Day · Week · Month · Quarter · Year · On · A day of the month · A weekday · Mo Tu We Th Fr Sa Su · Last day · For months with fewer days, it runs on the last day. · Month of the quarter · First · Second · Third · Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct. · No year: it repeats every year. 29 February runs on 28 February in other years. · At · Time zone · Each person's time zone · Lena in Warsaw gets it at 09:00 Warsaw time · Company time zone · Europe/Vilnius · everyone at the same moment · Pick a time zone · Any city or UTC offset |
| Joins a group | It starts when someone begins to match Who it runs for: {Department is Engineering}. · Change it in Who it runs for. · When someone stops matching · Take back what this automation gave · Removes them from {Developers} and takes back the policy. Things set by hand stay. · Leave everything as it is |
| Process | Process · Any onboarding · Only when · Days to complete · more than |
| When card subtitles | Every person, once · Once for each person it runs for · From any office to any office · Any onboarding process |
| Sentence parts | probation ends in 14 days · someone's office changes · time off over 10 days is requested · On the 15th of every month at 09:00 · someone joins Engineering · an onboarding is completed |
| Errors | No events match · No fields match · We couldn't load the list · Try again · This field was removed. Pick another. |

## Values
- Fields 36 high, radius 8, full window width (§ 13.3). Labels 13/18 500, hints 12/16 tertiary. Gap 16 between fields, and a hairline divider between parts.
- The segmented control is 32 high, radius 8, Mist track, with a white thumb at level 0.
- Day buttons: 32 × 32, radius 8, secondary look; picked = `--accent` fill + `--on-accent`. Day grid: 7 columns, gap 4.
- **Date picker** popover: 300 wide, radius 10, level 2 (the board drew 12, § 8 says 10), padding 12.
  - Header "‹ March 2027 ›" 14/20 600.
  - Weekday letters 12/16 tertiary (the board drew 11; § 5 has no 11).
  - Days 28 px. Other-month days `--text-disabled`. Picked = `--accent-muted` circle; today = filled `--accent` circle (§ 7 exception, the range band rules).
- Searchable select lists: § 7 (FORMS_AND_FIELDS) `SearchableSelect`, max height 320, then scroll. A pinned item is separated by a hairline.
- "Custom" marker: a Gray tag, S size (§ 4.7, § 13.4).

## Changes to SPEC
None beyond `automations-editor`. The board's 11 px weekday letters, `#C9C9CE` other-month days and radius 12 popovers are not SPEC values. This spec uses 12 px, `--text-disabled` and radius 10.

## New components
None. This uses `SearchableSelect`, the segmented control and the date picker that exist, plus the ConditionBuilder from `automations-editor`.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-4** — the person's own date and time format, and the company's first day of the week; there is no company-level date or time format. Design-only items (Pick a date, Year, At + time zone, several weekdays, the stops-matching choice) are in DESIGN-ONLY.md § 3 and § 1.6.

---

## Built
- **Where to see it:** the editor's "What starts it". Code: `components/modules/automations/settings/triggers`.
- **Differs from the design:** "Pick a date" opens the shared date field under the Date select (it cannot replace the
  select in place); Time off's "Only when" offers the request's own fields (leave type, days…), not Department or
  Office — those are Who it runs for; Month "A weekday" adds a which-week select (First … Last).
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
