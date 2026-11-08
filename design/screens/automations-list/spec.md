---
status: built
screen: automations-list
owner: Ulia
updated: 2026-11-06
---

# Automations list

## What it is for
An HR admin opens it to see every automation in the company: which ones run, which are paused and why, and which failed last time. From here they start a new one, open one to edit, or archive, duplicate or turn one off.

## Where it lives
Sidebar → Automations. The page has two tabs, **Automations** (this spec) and **Activity** (`automations-activity`). People with the right to manage automations see everything here. People who may only view see the same list without any actions (E6). Everyone else does not see the sidebar item.

## Layout
1. **Page header:** title and description; `Add automation` (primary button, right). There is no Add button for a viewer.
2. **Tabs:** Automations | Activity (SPEC § 13.6 tabs). Per NAMING § 3, the page title stays "Automations" on both tabs, because the group is named for the section, not for one tab.
3. **Toolbar** (`ListToolbar`, ACTIONS_AND_MENUS § 4):
   - left: `SearchBox`, then `FilterChip`s All / Active / Paused / Drafts (single choice), then a "Starts when" menu filter (Q-9);
   - right: `ArchivedToggle` with its count, shown only when something is archived.
4. **Grid of cards**, 3 per row, gap 16. Every card has the same fixed height (212), whatever it holds. **New:** `AutomationCard`, see "New components".
5. View only: a grey line under the header, "You can view automations, not change them".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Skeleton: the toolbar shapes, then 6 card skeletons in the grid's shape (TABLES_AND_LISTS § 2). | E3-List-loading.png |
| Empty (nothing yet) | `EmptyState` with the **automations** scene: "No automations yet" / "Tell noddo what should happen." / "We'll draft the steps.", then the noddo AI field and two buttons, Pick a template and Start from scratch. There is no toolbar, because there is nothing to search. A viewer sees the scene and the title only. | E2-List-empty.png |
| No results | `NoResults` with the **no-match** scene for chips and filters, or **no-results-s** for a plain search. "No automations match these filters" / "Try another word or clear the filters." + "Clear filters" (secondary). | E4-List-no-results.png |
| Empty archive | Archived toggle on with nothing left (after the last Unarchive): the **archive** scene, "Nothing archived". | not drawn |
| Error | `ErrorState`, scene **something-broke**: "We couldn't load automations" / "Your automations keep running." + "Try again" (primary). The toolbar is hidden. | E7-List-error.png |
| No permission | View only (E6): no Add button, no ⋯ menus, no Make me the owner or See why buttons. The card still opens the automation in read mode. Without the view right the page is the product's 403. | E6-List-view-only.png |
| Normal | Cards with every status: Active, Paused by the system (reason + button), Draft, and a failed last run. | E1-List.png |
| Long content | The name wraps to 2 lines, then ellipsis, with the full name in a tooltip. "Starts when" is one line + ellipsis. | E1-List.png (Handbook… card) |
| Change owner | O1 (picker open), O2 (picked). | O1-Change-owner-pick.png, O2-Change-owner-picked.png |
| Owner on a card, hover | The tooltip over the owner's avatar. | W3-Owner-bottom-right.png |
| Archived view | Archived toggle on: archived cards only, footer "Archived 3 Sep 2026 by Ulia Tykoon · 94 runs". Menu: Unarchive, Duplicate, Run history. | E5-List-archived.png |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Add automation | header | Opens the New automation dialog (`automations-start`). | no |
| Draft with AI / Pick a template / Start from scratch | empty state | The same as the three ways in New automation. | no |
| Open | click the card | Opens the editor. Active, Paused and Archived open in read mode (R3), and a Draft opens editable. | no |
| Edit | ⋯ | Opens the editor in edit mode. | no |
| Duplicate | ⋯ | `ConfirmActionModal` (§ 7). The copy is a Draft named "<name> (copy)", placed first in the list, with toast "Automation duplicated". | **yes** |
| Turn off | ⋯ (Active only) | The automation becomes Paused at once. Scheduled runs are cancelled; nothing is undone. Toast "Automation turned off" + Undo. | no |
| Turn on | ⋯ (Paused by hand), or the card button | Opens the Turn on dialog (`automations-test-and-turn-on`, F4 / V6). | via the dialog |
| Run history | ⋯ | Opens the Activity tab filtered to this automation (V8b). | no |
| Archive | ⋯ (has ever run) | Dialog H3. On Archive: it stops, moves to Archived, and the toast says "Automation archived". | **yes** |
| Delete | ⋯ (Draft that never ran), last item after a separator, red (`RowActionDestructive`) | Dialog H5, red-filled "Delete automation". | **yes** |
| Change owner | ⋯ (Active, Paused, Draft) | Dialog O1 → O2: a single-person picker that lists only people with the right to manage automations. "Change owner" stays disabled until someone is picked. On save the new owner sends the automation's emails, tasks and requests, and hears about failures and pauses. Runs already going finish as they are. Toast "{Name} owns it now". | yes (its own dialog) |
| Unarchive | ⋯ in the Archived view | Fires at once. It returns as **Paused** (it does not run until turned on). Toast "Automation unarchived". | no |
| Make me the owner | card button (Paused because the owner left or lost the right) | Dialog H6. | yes (its own dialog) |
| Fix the step | card button (Paused because something a step points to is gone) | Opens the editor with that step's settings open. | no |
| See why | card footer (last run failed) | Opens the Activity tab filtered to this automation and the failed run open (V8b → run window V1b). | no |
| Clear filters | no results | Resets search and chips. | no |

The ⋯ menu shows only what applies:
- Active: Edit, Duplicate, Turn off, Run history, Change owner, Archive.
- Paused: Edit, Duplicate, Turn on, Run history, Change owner, Archive.
- Draft: Edit, Duplicate, Change owner, then a separator and Delete.
- Archived: Unarchive, Duplicate, Run history.

Every item has an icon (ACTIONS_AND_MENUS § 2).

## Words
| Where | Text |
|---|---|
| Page title / description | Automations / Routine HR work that runs by itself. |
| Tabs | Automations · Activity |
| Primary button | Add automation |
| Search | Search |
| Chips | All · Active · Paused · Drafts · Starts when |
| Archived toggle | Archived {n} |
| Status pills | Active · Paused · Draft · Archived |
| Card footer, ran | Last run today, 09:00 CET · 312 runs / Last run yesterday, 16:20 CET · 41 runs · 3 waiting / Last run 1 Mar 2026 · 186 runs. Counts: "1 run" / "{n} runs", "{n} waiting". |
| Card footer, failed | Last run failed on 4 Nov · See why |
| Card footer, draft | Edited 2 days ago · not turned on yet |
| Card footer, archived | Archived 3 Sep 2026 by Ulia Tykoon · 94 runs |
| Paused by the system | {Name} left the company, so it can't run. + Make me the owner / {Name} can't manage automations any more, so it can't run. + Make me the owner / A step points to something that's gone, so it can't run. + Fix the step |
| Paused by hand | Turned off by {name} on 12 Oct. + Turn on |
| Owner tooltip | {Name} / Owner |
| Menu | Edit · Duplicate · Turn off · Turn on · Run history · Change owner · Archive · Delete · Unarchive |
| Change owner dialog | Who should own {name}? / Its emails, tasks and requests will come from the new owner. They also hear when it fails or is paused. / {Owner name} · Owner now · {role} / New owner / Only people who can manage automations. / list group: People who can manage automations / note after picking: Runs already going finish as they are. New runs come from {first name}. / Cancel · Change owner |
| Picker no results | No one matches |
| View only note | You can view automations, not change them |
| Empty | No automations yet / Tell noddo what should happen. / We'll draft the steps. |
| AI field label (hidden) / example | Describe what should happen / When someone's probation ends in 14 days, remind their manager to book a review (Q-6) |
| AI field hint / button | You check every step before it turns on. / Draft with AI |
| Empty, other ways | Pick a template · Start from scratch |
| No results | No automations match these filters / Try another word or clear the filters. / Clear filters |
| Empty archive | Nothing archived |
| Error | We couldn't load automations / Your automations keep running. / Try again |
| Archive dialog | Archive {name}? / It stops right away and moves to Archived. {n} requests waiting on a manager stay as they are, but no more steps run for them. / Its run history stays. You can unarchive it later. / Cancel · Archive. With no runs going, the middle sentence is "It stops right away and moves to Archived." |
| Delete dialog | Delete {name}? / It was never turned on, so nothing ran. You can't undo this. / Cancel · Delete automation |
| Duplicate dialog | Duplicate {name}? / The copy is a draft. It doesn't run until you turn it on. / Cancel · Duplicate |
| Make me the owner dialog | Become the owner of {name}? / {Name}, its owner, has left the company, so it needs a new owner. / Its emails, tasks and requests will come from you, so it can do only what you can. / ☐ Turn it on now / Cancel · Make me the owner. For a lost right: "{Name}, its owner, can't manage automations any more, so it needs a new owner." |
| Toasts | {Name} owns it now · Automation duplicated · Automation turned off + Undo · Automation archived + Undo · Automation unarchived · You're the owner now · Automation deleted |
| Errors in dialogs (`InlineAlert` declined, the dialog stays open, § 7) | We couldn't archive it. Try again. / We couldn't delete it. Try again. / We couldn't duplicate it. Try again. |

## Values
- Page padding 32 (SPEC § 6). Header to tabs 24, tabs to toolbar 20, toolbar to grid 20 (§ 6 scale).
- Card: radius 16, level 0, hover level 1 (§ 8, § 7), padding 16, gap between cards 16.
- Card icon tile 36 × 36, radius 8, Mist, icon 20 tertiary (§ 9). Name: card title 15/22 600 (§ 5), 2 lines max. Trigger line: body 14/20 secondary with a 16 icon. Footer: hint 12/16 tertiary, above it a hairline `--border-divider`.
- Failed footer: declined text #A12215 with a cancel-circle icon (§ 4.5); "See why" is a link in the same colour.
- Filter chips 32, pill (§ 13.4); a selected chip is Ink fill + check. Archived toggle is the same chip with an archive icon and the count in tertiary.
- Dialogs: white (§ 7 exception), 400 wide, radius 20, padding 24 (§ 13.7).

## Changes to SPEC
1. **Pill buttons on the empty state** (Pick a template, Start from scratch). § 8 forbids pill buttons in the product. Ulia wants them here, next to the AI field.
2. **The Archive confirm button is grey-filled**: `--text-tertiary` fill, white text, hover `--text-secondary`. § 13.2 has no grey-filled kind. This holds for every archive confirm in the product.
3. **"Paused" has no status tone** (Q-7): the inactive tone with a `pause` icon.

## New components
**AutomationCard.**
- Parts:
  - top row: the status pill on the left; ⋯ on the right, **always visible** for managers (no ⋯ for viewers);
  - the icon tile and name, then the trigger line;
  - the footer line with the last run, with **the owner's avatar in the bottom-right corner** (24, photo, or initials on the avatar colour, § 4.7). Hovering the avatar shows a light tooltip (§ 7 exception): the name (500) and "Owner" (tertiary) under it. The footer text stops 36 px before the avatar.
- States: default, hover (level 1), focus, menu open, paused with reason + button (the button sits above the footer), failed footer, draft footer (dashed Draft pill), archived footer.
- Size: one third of the content width, **fixed height 212** for every card (Ulia, 6 Nov). The name is clamped to 2 lines; longer footers (Make me the owner) fit inside.
- Used here only; the template cards in New automation are a simpler sibling.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-6** — the grey example stays in the AI prompt (an exception for it only). **Q-7** — Paused is the inactive tone with the `pause` icon. **Q-9** — the status chips stay. **Owner:** "Also tell" is not in the product; Automations is an item of the main sidebar (`/automations`).

---

## Built
- **Where to see it:** `/automations` (the sidebar's Automations). Code: `components/modules/automations/list`, `shared`.
- **Differs from the design:** the main navigation has no Time off or Documents item, so Automations sits last; times
  show without a zone abbreviation; Change owner's "Owner now" shows no role (`PersonRef` has none); a system automation
  (a holiday-calendar binding) offers only Run history; the empty archive got a second line ("Automations you archive
  wait here, with their run history."). Paused is drawn in the inactive tone with the pause icon (Q-7).
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
