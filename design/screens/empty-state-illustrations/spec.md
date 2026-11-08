---
status: built
screen: empty-state-illustrations
owner: Ulia
updated: 2026-11-06
---

# Empty-state illustrations — every empty screen in noddo

## What it is for
The audit of 4 Nov 2026 found 78 places where a screen can be empty ("nothing yet", "coming soon", "nothing found", errors). This spec says, for each of them, which ring illustration it shows, at which size. Sixteen scenes are new, four existing scenes are redrawn, and the 404 page gets a design of its own. Every place below was approved one by one by the designer on 6 Nov 2026.

**The SVGs in `svg/` are the final drawings. Copy them as they are — do not redraw, re-proportion or "clean up" any path.** They follow the package format (canvas 240×150, `data-role` on every element, ring = `currentColor`, everything else reads the `--illustration-*` variables with fallbacks), so `components/illustrations/scenes.tsx` is regenerated from them the usual way.

Review board (all 78 places, before and after): https://claude.ai/artifact/WadBzVxq4hoPsAmsktShZE — page "All 78 places". Final drawings side by side: `images/all-scenes.png`.

## Where it lives
Everywhere an `EmptyState`, `ListEmptyState`, `NoResults`, `ErrorState` or `ErrorPage` renders, plus the coming-soon placeholders. Visible to whoever can see the screen the empty state belongs to; nothing here changes permissions.

## Layout
No new layout. Each place keeps its existing component (`rules/DESIGN_SYSTEM.md` § 5): `EmptyState` (with `compact` inside cards and side panels), `ListEmptyState`, `NoResults`, `ErrorState`, `ErrorPage`, `<Illustration scene size>`. Only the `scene` and `size` props change, per the table below. Order inside the component stays SPEC § 10: illustration → title → text → action.

Sizes (SPEC § 10, code widths from `Illustration.tsx`): **S** 96 px — use the `-s` cut where one exists (support lines dropped); **M** 200 px — default; **L** 360 px.

## Files in this package

| File | What |
|---|---|
| `svg/<scene>.svg` — 16 new | coming-soon, archive, trash, history, career, templates, office, tasks, people, review-cycle, nomination, welcome, no-match, legal-entity, job-families, notifications |
| `svg/<scene>.svg` — 7 redrawn | automations (new drawing: bolt + ring + speed lines); all-caught-up, policies, goals-and-growth, announcements, signing, surveys (sharp corners rounded). They **replace** the current files |
| `svg/<scene>-s.svg` — 7 S cuts | people-s, career-s, attendance-s, reviews-and-one-on-ones-s, forms-s, no-match-s, history-s |
| `404/404-balls-animated.svg` | The 404 page drawing, animation built in (SMIL), plays once |
| `404/404-balls-static.svg` | Same drawing at rest — for reduced motion and for the server render |
| `images/all-scenes.png` | Every final drawing, for checking the build against |
| `images/rounded-before-after.png` | The seven redrawn existing scenes, before and after |

Scene labels for `SCENE_LABELS` (accessibility, used only with `labelled`):

| Scene | Label |
|---|---|
| coming-soon | Coming soon: a sprout in a pot, its bud is the ring |
| archive | Archive: a box with its lid lifted, an accent ring inside |
| trash | Trash: a bin with its lid slightly open, the knob is the ring |
| history | History: a timeline, the newest entry is the ring |
| career | Career: steps going up, a ring person on the top step |
| templates | Templates: a stack of layout cards, a ring marks where to start |
| office | Office: a map pin, its hole is the ring |
| tasks | Tasks: a to-do list, the first item checked in the accent |
| people | People: a ring person in front of two colleagues |
| review-cycle | Review cycle: people on a turning loop, one is the ring |
| nomination | Nomination: a ring person and an arrow toward two empty seats |
| welcome | Welcome: a rocket ready to launch, the porthole is the ring |
| no-match | No match: a filter funnel with the ring inside, items left outside |
| legal-entity | Legal entity: a building with columns and a round emblem |
| job-families | Job families: a ring branching into three role cards |
| notifications | Notifications: a bell, its clapper is the ring |
| automations | Automations: a lightning bolt with a ring and speed lines |

## The 78 places

`Action`: keep = no change; swap = put an existing scene; new scene = one of the new files; none = no illustration (text only, the existing compact/empty text stays).

| # | Place | Text on screen today | Shows now | Shows after | Size | Action | Note |
|---|---|---|---|---|---|---|---|
| 1 | Employee profile › Public profile | “Public profile is not available yet” | company-hub | **— (no illustration)** | — | none | Never empty, so no illustration here. company-hub stays in the set for other places. |
| 2 | Employee profile › Personal info | “No custom fields have been set up for this company yet.” | nothing | **— (no illustration)** | — | none |  |
| 3 | Employee profile › Documents | “No folders or files” | small icon | **documents** | M | swap |  |
| 4 | Employee profile › Documents › Trash | “Nothing in the trash” | small icon | **trash** (new) | M | new scene | Its own trash scene, not the archive box (see 08 · trash). |
| 5 | Employee profile › Time off › Calendar | “No time-off policy is assigned yet…” | nothing | **— (no illustration)** | — | none | No illustration on time off for now. |
| 6 | Employee profile › Time off › Requests | “No time off requests yet.” | small icon | **— (no illustration)** | — | none | No illustration on time off for now. |
| 7 | Employee profile › Time off › Balance history | “No ledger entries yet.” | nothing | **history** (new) | M | swap | The history timeline, as #63. |
| 8 | Employee profile › Salary | “Salary is not available yet” | company-hub | **payroll** | M | swap | While the tab is coming soon: the seedling (coming-soon). Once the tab ships, its empty state uses payroll. |
| 9 | Employee profile › Attendance | “Nothing logged on this day.” | nothing | **attendance-s** | S | swap | S size, only in the log block under the calendar. The page always has the calendar, so never a full-page empty state. |
| 10 | Employee profile › Attendance › Work schedule | “Works the company week” | attendance | **attendance-s** | S | keep | S size, only under the calendar, never for the whole page. |
| 11 | Employee profile › Forms | “No forms yet” | forms | **forms** | M | keep |  |
| 12 | Employee profile › Reviews | “No reviews” | reviews-and-one-on-ones | **reviews-and-one-on-ones** | M | keep |  |
| 13 | Employee profile › Tasks | “Tasks is not available yet” | company-hub | **tasks** (new) | M | new scene | While the tab is coming soon: the seedling (coming-soon). Once the tab ships, its empty state uses tasks. |
| 14 | Employee profile › Notes | “Notes is not available yet” | company-hub | **notes** | M | swap | While the tab is coming soon: the seedling (coming-soon). Once the tab ships, its empty state uses notes. |
| 15 | Employee profile › Position history (side panel) | “No position changes yet” | notes | **career-s** (new) | S | new scene | S size. |
| 16 | Employee profile › Automations for a person | “No automation runs” | automations | **automations** (redrawn) | M | keep | automations redrawn from your sketch: bolt, ring, speed lines. Replaces the old scene in every place that uses it. |
| 17 | Main app › Inbox | “No notifications yet.” / “Nothing needs your action.” | nothing | **all-caught-up** (redrawn) | M | swap |  |
| 18 | Main app › People list | “No people to show” | nothing | **people** (new) | M | new scene | Its own scene, not the org tree from #19 (see 10 · people). Also: move to the shared ListEmptyState so a filter gives no-results. |
| 19 | Main app › Org chart | “No people to display yet.” | nothing | **team-and-org** | M | swap |  |
| 20 | Main app › Company calendar | “No people to show” | nothing | **calendar** | M | swap |  |
| 21 | Main app › Attendance overview | “Nobody in this period” | attendance | **attendance** | M | keep |  |
| 22 | Main app › My tasks | “Nothing to do” | all-caught-up | **tasks** (new) | M | swap |  |
| 23 | Main app › Processes | “No processes yet” | onboarding | **automations** (redrawn) | M | swap |  |
| 24 | Main app › Preboarding (new hire page) | Progress / all set | onboarding | **welcome** (new) | M | new scene | A rocket ready to launch; the porthole is the ring (see 11). |
| 25 | Main app › Dashboard widgets (7) | “Nothing assigned to you.”, “No public holidays ahead.” and others | nothing | **— (no illustration)** | — | none | Text is enough inside a widget. |
| 26 | Main app › Reviews overview | “No review cycles yet” | reviews-and-one-on-ones | **reviews-and-one-on-ones** | M | keep |  |
| 27 | Main app › My reviews | “No reviews for you yet” | reviews-and-one-on-ones | **reviews-and-one-on-ones** | M | keep |  |
| 28 | Main app › My reviews › To write | “All caught up” | all-caught-up | **all-caught-up** (redrawn) | M | keep |  |
| 29 | Main app › My reviews › Shared with me | “Nothing shared with you yet” | reviews-and-one-on-ones | **reviews-and-one-on-ones** | M | keep |  |
| 30 | Main app › Review cycle › Participants | “Nobody takes part” | team-and-org | **review-cycle** (new) | M | new scene | New scene (see 11 · review cycle, nomination, welcome). |
| 31 | Main app › Review cycle › Reviewers | “Nobody has a review to write” | team-and-org | **all-caught-up** (redrawn) | M | swap |  |
| 32 | Main app › Cycle results | “No manager has rated anybody in this cycle yet.” | nothing | **reviews-and-one-on-ones-s** | S | swap | S size. |
| 33 | Main app › Calibration | “Nobody to calibrate here” | reviews-and-one-on-ones | **reviews-and-one-on-ones** | M | keep | Calibration: the review step where managers line up their ratings side by side to keep them fair. Empty when a cycle has no ratings to compare yet. |
| 34 | Main app › Peer nomination | “Nobody chosen yet” | team-and-org | **nomination** (new) | M | new scene | New scene (see 11 · review cycle, nomination, welcome). |
| 35 | Main app › Review forms | “No review forms yet” | forms | **forms** | M | keep |  |
| 36 | Main app › Review form editor | “No questions yet” | nothing | **forms-s** | S | swap | S size. |
| 37 | Settings › Legal entities | “No legal entities yet” | company-hub | **legal-entity** (new) | M | new scene | A classical building with columns: legal, official. company-hub stays for company info (see 13 · legal entity). |
| 38 | Settings › Offices | “No offices yet” | company-hub | **office** (new) | M | new scene | Pin without the gray marks around it. |
| 39 | Settings › Departments (tree) | “No departments yet.” | nothing | **team-and-org** | M | swap |  |
| 40 | Settings › Department › People | “No people in this department yet” | team-and-org | **team-and-org** | M | keep |  |
| 41 | Settings › Teams (tree) | “No teams yet.” | nothing | **team-and-org** | M | swap |  |
| 42 | Settings › Team › People | “No people in this team yet” | team-and-org | **people** (new) | M | swap | Same people scene as the People list (#18). |
| 43 | Settings › Job catalogue › Job families | “No job families yet” | goals-and-growth | **job-families** (new) | M | new scene | One family (ring) branching into three smaller role cards, more air between lines. |
| 44 | Settings › Job catalogue › Career tracks | “No career tracks yet” | goals-and-growth | **career** (new) | M | swap | Takes the steps scene (career). |
| 45 | Settings › Roles | “No roles yet” | policies | **policies** (redrawn) | M | keep |  |
| 46 | Settings › People and roles | “No people yet” | team-and-org | **people** (new) | M | swap | Same people scene as #18 and #42. |
| 47 | Settings › Role › Assigned users | “No users yet — use Assign…” | nothing | **people-s** (new) | S | swap | People scene, S size. |
| 48 | Settings › Document categories | “No categories yet” | documents | **documents** | M | keep |  |
| 49 | Settings › Template catalogue | “No templates to apply” | forms | **templates** (new) | M | new scene |  |
| 50 | Settings › Logs | “Nothing recorded yet” | notes | **history** (new) | M | new scene |  |
| 51 | Settings › Public holidays (2 places) | “No public holiday calendars yet” | calendar | **calendar** | M | keep |  |
| 52 | Settings › Time off policies (2 places) | “No time off policies yet” | time-off-m | **time-off-m** | M | keep |  |
| 53 | Settings › Leave types (2 places) | “No leave types yet” | time-off-m | **time-off-m** | M | keep |  |
| 54 | Settings › Policy › Assigned to | “No one is assigned yet” | nothing | **people-s** (new) | S | swap | People scene, S size, as #47. |
| 55 | Settings › “Assigned to” panel (shared) | “No people assigned yet” | team-and-org | **people** (new) | M | swap | People scene, as #47. |
| 56 | Settings › Preboarding templates | “No preboarding templates yet” | onboarding | **welcome** (new) | M | swap | The preboarding rocket, as #24. |
| 57 | Settings › Onboarding templates | “No onboarding templates yet” | onboarding | **onboarding** | M | keep |  |
| 58 | Settings › Offboarding templates | “No offboarding templates yet” | onboarding | **offboarding** | M | swap | Today it shows the person arriving, by mistake. |
| 59 | Settings › Template › Task list | “No tasks yet” | onboarding | **tasks** (new) | M | swap | The to-do scene, as #13. |
| 60 | Settings › Automations | “No automations yet” | automations | **automations** (redrawn) | M | keep |  |
| 61 | Settings › Automation › Runs | “No runs yet” | automations | **automations** (redrawn) | M | keep |  |
| 62 | Settings › Automation › Versions | “No versions yet” | automations | **history** (new) | M | new scene |  |
| 63 | Settings › Assignment history | “No history yet” | notes | **history** (new) | M | new scene |  |
| 64 | Settings › Login & SSO › Groups | “No groups pushed yet.” | nothing | **job-families** (new) | M | swap | Same scene as job families (#43). |
| 65 | Settings › Notification settings | “No configurable categories yet.” | nothing | **notifications** (new) | M | new scene | New: a bell, its clapper is the ring, soft sound arcs around it. |
| 66 | Settings › “Coming soon” pages ×8: Support, Subscription, API, Workflows, Approvals, Notifications, Integrations, Export | “… is not available yet” | company-hub | **coming-soon** (new) | M | new scene | The seedling (A) on every “coming soon” page. |
| 67 | Search, errors, first run › No results: quick search, people without a department or team | “No results” | no-results-s | **no-results-s** | S | keep | The one scene for every empty search and filter result. |
| 68 | Search, errors, first run › Time off requests with a filter | “No requests match these filters.” | small icon | **no-match-s** (new) | S | new scene | A filter found nothing, so its own scene: a funnel, items left outside (see 12 · filter). Plain search keeps #67. |
| 69 | Search, errors, first run › Inbox search | “No notifications match your search.” | nothing | **no-results-s** | S | swap |  |
| 70 | Search, errors, first run › Dropdowns: people, countries, columns | “No people match …”, “No people found.” | nothing | **no-results-s** | S | swap | Same as #67 when nothing is found. |
| 71 | Search, errors, first run › Archive of any list | “Nothing archived” | the list’s own scene | **archive** (new) | M | new scene | The archive box, lid ajar at the same angle as the trash bin. |
| 72 | Search, errors, first run › 404 page | “We can’t find this page” | no-results | **404 page (see § 404 page)** | page | new scene | Its own page design, not an empty-state illustration: balls fall once, roll apart and stay. See the #72 · 404 page board. |
| 73 | Search, errors, first run › No access (403, 29 places) | “This page is private” | policies | **policies** (redrawn) | M | keep |  |
| 74 | Search, errors, first run › App error (500) | “Something broke on our side” | something-broke | **something-broke** | M | keep |  |
| 75 | Search, errors, first run › Errors inside blocks (96 places) | The error’s own text | something-broke | **something-broke** | M | keep | Picked by error type; one example shown. |
| 76 | Search, errors, first run › Work schedule: no person chosen / no access | “Choose a person” / “Not available to you” | attendance | **policies** (redrawn) | M | swap | Shield only for “Not available to you”; “Choose a person” keeps attendance. |
| 77 | Search, errors, first run › First run › Welcome | No text in the audit | onboarding | **onboarding** | L | keep | L size. |
| 78 | Search, errors, first run › First run › Company setup | No text in the audit | company-hub | **company-hub** | M | keep | The company setup wizard after sign-up: one step per screen (company, offices, teams). Its side picture is company-hub or team-and-org, by step. |

Rules agreed while reviewing:
- Any "coming soon" placeholder, anywhere, shows **coming-soon**. #8 Salary, #13 Tasks, #14 Notes show coming-soon while those tabs are placeholders; once a tab ships, its empty state uses payroll / tasks / notes.
- Every empty search shows **no-results-s** (#67, #69, #70). When a **filter** leaves nothing, it is **no-match** instead (#68, and any filtered list — see the People list note below).
- #9 and #10 Attendance: the calendar is always on the page, so the illustration only appears S-size in the log block under the calendar, never as a full-page empty state.

## 404 page
The 404 page is its own page design, **not** an empty-state illustration, so the "illustrations are static" rule does not apply to it.

- Drawing: `404/404-balls-animated.svg`, shown at 480 px wide, centred, above the title. Five balls fall together from one point, bounce once, roll apart and stay. The accent ball falls with the others and lands in the row. Lines 5 px (page-specific). Plays **once** on load (`fill="freeze"`), never loops. Duration 3.6 s; balls start 0.12 s apart.
- With `prefers-reduced-motion: reduce`, render `404/404-balls-static.svg` instead (same final picture, no motion).
- Under it, unchanged from SPEC § 12: title, line, primary and secondary action.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Unchanged: skeletons (`rules/TABLES_AND_LISTS.md`) | — |
| Empty (nothing yet) | The scene from the table above, size as listed | `images/all-scenes.png` |
| No results (a filter or search found nothing) | Search: no-results-s. Filter: no-match-s + "Clear filters" (SPEC § 12) | same |
| Error (could not load) | Unchanged: something-broke (#74, #75) | — |
| No permission | policies (redrawn, rounded corners) — #73, #76 "Not available to you" | same |
| Normal | Not affected | — |
| Long content | Not affected: titles are the existing copy | — |

## Actions
No new actions. Existing empty-state actions stay as they are.

Code note, not a design change: the People list (#18) shows one text both when there are no people and when a filter found nobody. Moving it onto the shared `ListEmptyState` gives people (empty) vs no-match-s (filtered) automatically.

## Words
No new or changed words. Every title and line stays exactly as it is in the code today (the "Text on screen today" column is a quote, for finding the place). The 404 copy is SPEC § 12's: "We can’t find this page" / "The link may be broken." / [Go to home] [Search].

## Values
Only sizes, all from SPEC § 10: S 96 / M 200 / L 360 (code widths). 404 drawing 480 px (see Changes to SPEC). Stroke widths inside the SVGs are the package's: ink and ring 7, small rings 5, support 4, baseline 3.

## Changes to SPEC
For the next package version (the designer approved each of these on 6 Nov 2026):
1. **Scene index (§ 10)** gains: coming-soon, archive, trash, history, career, templates, office, tasks, people, review-cycle, nomination, welcome, no-match, legal-entity, job-families, notifications, and the S cuts listed above.
2. **Redrawn scenes (§ 10):** automations (new drawing); all-caught-up, policies, goals-and-growth, announcements, signing, surveys (corners rounded) — replace the package files.
3. **New illustration rule (§ 10), applies to every illustration in the product and the package:** no sharp corners. Every corner of a shape is rounded with a small curve (about 4–6 units on the 240×150 canvas) on top of the round line joins; positions and stroke widths do not change. Allowed to stay: simple line ends, checkmarks, and a tear or zigzag that is the point of the drawing (the torn page).
4. **404 (§ 10 index and § 12):** 404 no longer uses no-results; it is a page design of its own (§ 404 page above): 480 px drawing, 5 px lines, plays once, static under reduced motion. The "illustrations are static" rule is unchanged — it does not cover this page.
5. **Coming-soon placeholders** use coming-soon instead of company-hub; company-hub stays for company info and the setup wizard (#78).

## New components
None.

## Open questions
None. Nothing in `QUESTIONS.md` blocks this.

---

## Built
*Filled by the code side when the screen is built.*

Built 2026-11-06.

- **Where to see it:** every place in the table. The drawings: `styles/noddo/assets/illustrations/` (the
  package's SVGs, copied as they came, never edited) → `components/illustrations/scenes.tsx`, generated by
  `npm run illustrations`. The 404: any unknown address, e.g. `/nowhere`. The labels the spec gives are in
  `SCENE_LABELS`; the seven `-s` cuts had none, so the code side wrote one each, after its full scene.
- **Differs from the design:** what, and why.
  - **Places inside a section render S, not M** (#28–#31, #33, #34, the reviews tabs): they already use
    `EmptyState compact`, the small block for a list that is one section of a page (`rules/DESIGN_SYSTEM.md`
    § 5). The scene changed as listed; the size stayed with the component. Say if any of them should be M.
  - **#1 Public profile shows coming-soon**, not nothing: it is the same placeholder as Salary, Tasks and Notes,
    and the rule "any coming-soon placeholder shows coming-soon" was taken to win while the tab is a
    placeholder. Once it ships, it has no empty state.
  - **#24 Preboarding shows welcome in both states** — while tasks are open and when all are done (it showed
    all-caught-up when done).
  - **#52, #53 keep `time-off`**, which is what they showed: the table's "time-off-m" is a different cut, and
    "keep" was read as no change.
  - **No "Clear filters" action on a filter that left nothing** (#18, #68): "No new words", and there is no
    such label in the catalogue yet. The funnel and the list's own sentence are there; the action is a
    follow-up with a word.
  - **#70 covers every searchable dropdown**: the shared `SearchableSelect` (34 places, countries among them)
    shows no-results-s, as do the people pickers and the columns menu. The people picker with a filter on
    shows no-match-s.
  - **404's secondary action stays "Go back"**, as in the code today, not "Search": the spec says the page
    under the drawing is unchanged.
  - **The 404 restarts its timeline when it appears.** SMIL counts from the page's load, so a 404 reached by a
    link inside the app would otherwise show the balls already lying still. Under reduced motion the still
    cut is drawn.
  - **#71 is every list's archived view** — `ListEmptyState` now always shows the archive box there.
- **Images of the real screen:** none yet. The generated scenes were rendered side by side, light and dark,
  and match `images/all-scenes.png`; the screens themselves have not been walked in the running app.
