---
status: built
screen: automations-run-history
owner: Ulia
updated: 2026-11-06
---

# Run history and Versions (in the editor)

## What it is for
Inside one automation, the person sees every time it ran, for whom, and how it went. They open a run to see each step, fix a failed step in place, retry the run, or cancel a waiting one. In Versions they see what changed when, and which runs still use an old version.

## Where it lives
Two tools of the canvas tool block (`automations-editor`): **Run history** (clock icon) and **Versions** (layers icon). Each is a tool window, 320. Opening a run puts its window on the right (340), where step settings usually go, and the canvas highlights that run's path. The same runs, company-wide, are in the Activity tab (`automations-activity`).

Visibility: anyone who may open the automation. Runs about people outside the reader's access are not listed, and are counted in the closing line.

## Layout
**Run history window** (V1):
1. Title "Run history" + ×.
2. `SearchBox` "Search" (searches the person's name).
3. `FilterChip`s with counts, single choice, wrapping to two lines: All 312 · Failed 2 · Waiting 3 · Scheduled 14 · Done 293.
4. An endless list of runs. Each row:
   - avatar 28 + name (14/20 500) + what started it (12/16 tertiary, e.g. "Vacation, 9–27 Dec");
   - right: the status pill, with the date in grey under it ("4 Nov", "Today").
   - A late run has a line under the description in the pending text colour: "Ran 2 days late".
   - The selected row is `--accent-subtle`.
5. A closing line at the bottom: "Plus 12 runs you can't see." (only when there are some).

**Run window** (V1, V1b), on the right:
1. Header: "Run · started 3 Nov, 10:14 CET · version 4" (hint), then the title "{Name}, {what}" + ×.
2. Steps in run order. Each has a status icon (Done check, Waiting hourglass, Failed cancel-circle, Not started grey clock), the step title, and on the right its time or "since 3 Nov" / "after that".
   - A waiting step adds the reason in grey: "Waiting for Marta. Asks her manager on 6 Nov."
   - A failed step adds the reason: "We couldn't create the task. Marta left the team on 31 Oct, so the task has no owner." Its own actions sit right under it, at the text's indent: "Skip this step" (secondary) and "Choose an owner" (primary).
3. Actions for the whole run, below a divider:
   - failed: "Or retry from the failed step." + "Retry the run" (secondary, retry icon);
   - waiting or scheduled: "Cancel this run" (secondary).
4. On the canvas, the run's cards show their state: "Failed in this run" in red under the card, a declined border, and "Not started yet" for steps ahead.

**Versions window** (V5): a list, newest first. Each version shows:
- a badge "v4". The current version's badge is approved-tone (#E6F4EC / #135C3A); older ones are grey.
- what changed (14/20 500), "{who} · {when}" (hint), and "{n} runs still on this version" in the pending text colour, when any;
- "View" (link) on the right.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The window with skeleton chips and 6 skeleton rows. | V4b-Runs-loading.png |
| Empty | No runs yet: the **automations** scene S, "No runs yet" / "It runs the next time someone asks for more than 10 days off." (the second line is built from the trigger). | V2-Runs-empty.png |
| No results | Search or chip finds nothing: the **no-match** scene S (no-results-s for search only), "No runs match" / "No waiting runs for "Zofia"." + Clear search. | V3-Runs-no-match.png |
| Error | Something-broke S, "We couldn't load the runs" / "The automation keeps running." + Try again. | V4-Runs-error.png |
| No permission | Runs about people outside access are hidden and counted ("Plus 12 runs you can't see."). A viewer sees the run window without Skip, Choose an owner, Retry or Cancel. | V1 (closing line) |
| Normal | Every status, a waiting run open (V1); a failed run open (V1b, G2). | V1, V1b, G2 |
| Long content | 312 runs: endless scroll, with the list running under the window's bottom edge and a scroll thumb. A long name: one line + ellipsis + tooltip. | V1 |
| Versions | 4 versions, one with runs still on it. | V5-Versions.png |
| Versions empty | A draft that was never turned on has no versions: the **history** scene S, "No versions yet" / "A version is saved each time you turn it on or save changes." | not drawn |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open a run | a row | Opens the run window. Its path is highlighted on the canvas. | no |
| Skip this step | under the failed step | The run goes on from the next step. Toast "Step skipped". | no |
| Choose an owner | under the failed step | A people picker popover. On pick, the step runs again with that owner. | no |
| Retry the run | bottom of the run window | Runs again from the failed step. Toast "Run retried". | no |
| Cancel this run | bottom of a waiting or scheduled run | It stops; nothing done is undone. Toast "Run cancelled" + Undo (while it was scheduled). | no: it fires with Undo (§ 7 does not list Cancel) |
| Filter / search | chips, search | Filters the list; the counts stay those of the whole history. | no |
| View a version | Versions | Shows that version read-only on the canvas, with a banner "You're looking at v3 from 28 Oct." + "Back to the current version". | no |

## Words
| Where | Text |
|---|---|
| Window | Run history · Search |
| Chips | All {n} · Failed {n} · Waiting {n} · Scheduled {n} · Done {n} |
| Run statuses (StatusBadge) | In progress (in-progress tone) · Failed (declined) · Waiting (pending) · Scheduled (scheduled) · Done (approved) · Skipped (inactive) · Cancelled (archived/cancelled) |
| Dates under status | Today · Yesterday · 4 Nov · 12 Nov (scheduled, future) |
| Late | Ran {n} days late · Ran 1 day late |
| Closing lines | Plus {n} runs you can't see. / Plus 1 run you can't see. |
| Run window header | Run · started {3 Nov, 10:14 CET} · version {4} |
| Run title | {Name}, {vacation} |
| Step times | {3 Nov, 10:14} · since {3 Nov} · after that |
| Step reasons (examples) | Waiting for Marta. Asks her manager on 6 Nov. · We couldn't create the task. Marta left the team on 31 Oct, so the task has no owner. |
| Step actions | Skip this step · Choose an owner |
| Run actions | Or retry from the failed step. · Retry the run · Cancel this run |
| Canvas marks | Failed in this run · Not started yet |
| Empty | No runs yet / It runs the next time {trigger sentence}. |
| No match | No runs match / No {waiting} runs for "{query}". / Clear search |
| Error | We couldn't load the runs / The automation keeps running. / Try again |
| Versions | Versions · v{n} · {what changed} · {who} · {when} · {n} runs still on this version / 1 run still on this version · View · Turned on (v1) |
| Version view banner | You're looking at v{n} from {date}. · Back to the current version |
| Versions empty | No versions yet / A version is saved each time you turn it on or save changes. |
| Toasts | Step skipped · Owner chosen. The step runs again. · Run retried · Run cancelled + Undo · We couldn't retry the run. Try again. |
| Notifications the system sends (NOT-DRAWN N8) | A run failed: "{Automation} couldn't finish for {Name}." + See why · Paused: "{Automation} is paused: {reason}." + Open · Wait ran out: "{Automation} stopped waiting for {Name}: {what} wasn't done in {n} days." |

## Values
- Tool window 320; run window 340 (as `automations-editor`).
- Rows: 56 high, padding 8 12, avatar 28, no hairlines between rows inside the window (a list, not a table). Hover `--surface-row-hover`, selected `--accent-subtle`.
- Status pill 24, 12/16 600 with a 14 icon (§ 13.4, § 4.5). The date under it is 12/16 tertiary, right-aligned.
- "Ran 2 days late": 12/16, `--status-pending-fill` #985A00 (§ 4.5).
- Version badge 24 × 24, radius 6, 12/16 600.
- Scroll thumb: 4 wide, pill, `#DADADF`, shown while the list moves (FORMS_AND_FIELDS § 7 scrollbar rule).

## Changes to SPEC
1. **"Ran late" as text in the pending fill colour** (#985A00). § 4.5 gives text colours as `--status-*-text`; Ulia picked the fill for visibility. #985A00 on white is 5.5:1, so it passes 4.5:1.
2. **Endless list with no bottom border** (PRODUCT-RULES § Lists). § 13.5 asks for pagination under tables. Activity and run lists are query screens (TABLES_AND_LISTS § 1a: infinite scroll), so this follows the rules, not § 13.5.

## New components
- **RunRow** and **RunStepList** (the run window body). States per step: done, waiting with reason, failed with reason + actions, not started, skipped.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-2** — runs are kept forever; the line "Runs from the last 12 months." is gone.

---

## Built
- **Where to see it:** the editor's Run history and Versions. Code: `components/modules/automations/runs`.
- **Differs from the design:** the first version reads "Turned on" (the badge already says v1); steps on a path not
  taken are not listed in the run window; the scrollbar is the default one, not the 4 px thumb; a retry's error uses the
  error catalogue's sentence.
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
