---
status: built
screen: automations-editor
owner: Ulia
updated: 2026-11-06
---

# Automation editor: canvas, tools, step settings

## What it is for
An HR admin builds or changes one automation. They see the whole flow as cards on a canvas and the sentence it reads as. They add, move and set up steps, choose who it runs for, check with a test run, and turn it on. This spec covers the frame of the editor. What goes inside the trigger and step windows is in `automations-triggers` and `automations-steps`. The test run and turning on are in `automations-test-and-turn-on`, and the Run history and Versions windows are in `automations-run-history`.

## Where it lives
- Route: `/automations/<id>` (new: `/automations/new`). It opens from a card, from New automation, or from "Open in editor" in Activity.
- Managers edit. A viewer and anyone opening an Active, Paused or Archived automation see **read mode** (R3, R4). A manager switches to editing with "Edit", which is not shown on Archived or system automations.

## Layout
1. **App sidebar, folded to 64 px**: icons, Settings, and the avatar at the bottom. Hovering opens the full sidebar *over* the canvas without pushing it (J4). Leaving the editor unfolds it again. A manual unfold is not remembered. (§ 6: the collapsed sidebar is 64.)
2. **Header**, 64 high, white, with a hairline under it:
   - × (close, icon button), the automation icon and name (click → Name and icon dialog I1), and the status pill;
   - on the right: "Test run" (secondary, play icon), then by status:

     | Status | Buttons |
     |---|---|
     | Draft | Save draft · Turn on (primary) |
     | Active | Turn off · Save changes (primary) |
     | Paused | Turn on · Save changes (primary) |
     | Read mode | Edit (secondary) only |
3. **The sentence on top ("In short")**: a white card, radius 16, level 0. It reads the automation as one sentence, 18/26 600. Key words are chips in `--accent-subtle` with `--accent-text`. The selected step's words use `--accent-muted`. A long sentence shows 2 lines + "Show all" (H4).
4. **Canvas**: `#F7F7F8` with a dot grid. On it:
   - Step cards. **New:** `StepCard`.
   - Connectors: 1.5 px `#B4B4BA` with rounded corners.
   - A "+" on each connector.
   - Branch labels as status pills: Approved (approved tone), Declined (declined tone), and path names for Split by a condition.
5. **Tool block**: **new** `CanvasToolBlock`, floating top-left at 16 / 16. It is a vertical white block with 5 icon buttons: noddo AI, Add a step, Who it runs for, Run history, Versions. Hover gives a Mist background and a light tooltip (title + one line, § 7 exception).
6. **Tool window**: **new**, joined to the tool block like an ear. The block's right edge and the window's top-left meet with no border between them. Radius 16 except the joined corner. Full height with 16 px margins; width 320, noddo AI 400. Only one tool window is open at a time.
7. **Step settings window**: on the right, 340 wide. It ends above the zoom control and scrolls inside. A dashed accent line runs from the selected card to it. Header: "Step N" (or "When" for the trigger), the static title (the step type), ⋯ and ×.
8. **Who sees what card**: under the step settings, 340 wide. **New:** `WhoSeesWhat`.
   - A Mist well with the step shown on real names (an inbox item, an email, a task, a profile field), headed "Example · nothing is sent".
   - It collapses to its header with a chevron. That choice is remembered for every step (J8).
   - It belongs to the step: closing the step closes both cards, and picking another step opens both for that step.
9. **Zoom control**: bottom right, 24 from the edges: − 100% +. With both windows open, the canvas fits itself (≈ 75% at 1440). When either window closes, it zooms back to fit.
10. **Banners** over the canvas, top centre: white, hairline, level 1. On a live automation (F5): "This automation is on. Changes apply to runs that start after you save."

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Header with a skeleton name, the tool block, and skeleton cards on the canvas (When + 2 steps). The sidebar stays. | F1-Editor-loading.png |
| Empty | A new automation: the placeholder cards (`automations-start` F2 / F0). | F0-New-empty.png (in automations-start) |
| No results | "Search" in Add a step finds nothing: no-results-s scene, S size, "No steps match" / "Try another word." | not drawn |
| Error (couldn't load) | In the canvas area: `ErrorState`, something-broke: "We couldn't load this automation" / "It keeps running as it was." + Try again (primary) and Back to automations (secondary). | not drawn |
| Error (couldn't save) | The editor stays as it is. Toast with the declined icon: "We couldn't save your changes. Try again." + Retry. | not drawn |
| No permission | Read mode: no Edit button, no "+" on connectors, no drag. The tool block shows Who it runs for, Run history and Versions; noddo AI and Add a step are hidden. Step windows show icon rows (R3), and Who it runs for shows a summary + Mist cards (R4). | R3-Read-icon-rows.png, R4-Read-who-icon-rows.png |
| Normal | A Draft with a selected step and Who sees what (D3); both windows open (D5); tools closed with a tooltip (J2); Active while editing (F5, in `automations-test-and-turn-on`). | D3, D5, J2, J4 |
| Long content | A long name (ellipsis in the header, tooltip), a 2-line sentence + Show all, a 3-path split, steps with long subtitles, canvas at 60% (H4). | H4-Long-content.png |
| Who sees what collapsed | Only its header, under the step settings. | J8-Who-sees-what-collapsed.png |
| AI edge cases | AI can't do a request (it says so and offers what it did instead), AI error, Undo of an AI change. | H1-AI-edge-cases.png |
| Leaving with unsaved changes | Dialog H2. | H2-Leave-unsaved.png |
| First save | Name and icon dialog I1. | I1-Name-and-icon.png |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open a tool | tool block | Opens its window and closes another open tool window. A second click closes it. | no |
| Add a step (drag) | Add a step window (D2) | Drag a step onto the canvas. Valid drop targets are dashed accent-ring on accent-subtle (§ 13.8). The step is added and its settings open. | no |
| Add a step (click) | Add a step window | Adds after the selected step, or at the end of the trunk. | no |
| Quick add | "+" on a connector (D4) | A popover: Search, the common steps, and "All steps" (opens the Add a step window). | no |
| Select a step | click a card | Opens Step settings + Who sees what, draws the dashed line, and highlights its words in the sentence. | no |
| Move a step | drag a card | Reorders it. The numbers are recounted. | no |
| Step menu ⋯ | step settings header (G4) | Duplicate step (adds a copy right after it) · Skip for now (the step stays but is skipped in runs; the card shows a Skipped pill) · then a separator and Remove step (red). | Remove step: no confirm. It fires with a toast "Step removed" + Undo, because it is a draft edit inside the editor and nothing is saved until Save. |
| Close settings | × | Closes both cards and zooms back. | no |
| Who it runs for | tool | Everyone / Only some people + the conditions builder (G3, G3b). The count "48 people match" + See who opens a people list popover. | no |
| Rename / icon | click the name | Opens Name and icon (I1). | no |
| Save draft | header | First time: I1 asks for the name and icon, then saves. Toast "Draft saved". | no |
| Save changes | header (Active / Paused) | Step changes with runs going → dialog V7. Name or description only → saves at once. Toast "Changes saved". | V7 if runs are going |
| Turn on / Turn off / Test run | header | See `automations-test-and-turn-on`. | per that spec |
| Edit | header in read mode | Every window switches to fields. | no |
| Close × | header | With unsaved changes → H2. Otherwise back to the list. | H2 |
| Keep editing / Save and leave | H2 | Close the dialog / save then leave. **Esc and × = Keep editing** (Ulia, 6 Nov). | — |
| Zoom − / + | zoom control | Steps of 10%. Ctrl/⌘ + wheel zooms; the space bar + drag pans. | no |
| Undo an AI change | AI window | Reverts that change. | no |

## Words
| Where | Text |
|---|---|
| Header buttons | Test run · Save draft · Turn on · Turn off · Save changes · Edit |
| New automation name | Untitled automation |
| Tool tooltips | noddo AI / Describe a change, noddo drafts it. · Add a step / Drag a step onto the canvas. · Who it runs for / Pick the teams, offices or countries this automation works for. · Run history / Every time it ran, and what happened. · Versions / What changed, and runs still on an old version. |
| Add a step window | Add a step / Search / Ask people: Create a task, Ask for approval, Start a review, Ask to sign a document, Send a survey / Tell people: Send a notification, Send an email / Change records: Assign or unassign, Grant a time-off policy / Shape the flow: Wait until, Split by a condition |
| Add a step hint | Drag a step onto the canvas, or click it to add after the selected step. |
| Drop target | Drop a step here |
| Quick add | Search / (common steps) / All steps |
| No steps match | No steps match / Try another word. |
| Step card kind labels | When · the step type (e.g. "Ask for approval", "Send an email") |
| Branch pills | Approved · Declined · path names (e.g. Warsaw · Vilnius · Anyone else) |
| Split card | Split by a condition / Which office are they in? / 3 paths |
| Next step placeholder | What should happen next? / Add the first step |
| Settings header | Step {n} · {step type} / When · {trigger name} |
| Step menu | Duplicate step · Skip for now · Remove step |
| Skipped pill on a card | Skipped |
| Who sees what | Who sees what · Example · nothing is sent · In {Name}'s inbox · {role} / In {Name}'s email / In {Name}'s tasks · {role} / In {Name}'s time off / On {Name}'s profile |
| Email example footer | Sent by noddo on behalf of {Company} |
| Who it runs for | Who it runs for · Everyone · Only some people · Add a condition · Add a group · And · Or · {n} people match · See who · New teammates who match join automatically. Count: "1 person matches" / "{n} people match". |
| Condition builder | Pick a field · Pick a value · groups: Job (Department, Office, Legal entity, Job title, Employment type, Manager) · Person (Hire date, On probation) · Your company's fields (Custom) · operators: is · is not |
| Read mode (R3) | Edit · icon rows, e.g. "Their manager / Gets the task", "Due in 7 days / After it's created", "For everyone / No conditions" |
| Read mode (R4) | Only some people · {field} is {value} or {value} · and |
| Live banner | This automation is on. Changes apply to runs that start after you save. |
| Edited mark on a card | · edited |
| Sentence | Show all · Show less |
| Unsaved dialog (H2) | Save your changes? / You changed {name}. Save the changes before you leave. / Keep editing · Save and leave |
| Name and icon (I1) | Name your automation / Icon / We picked one from what starts it. Change it if you like. / Name / {n}/60 / Suggested from the steps. / Description / How it looks in the list / Cancel · Save |
| AI (H1) | noddo can't post to Slack yet. I changed the HR notification so the whole HR team gets it in noddo instead. / Changed 1 step · Undo / We couldn't make this change. Your automation is safe and nothing changed. / Try again / Changed by AI · {what} |
| Load error | We couldn't load this automation / It keeps running as it was. / Try again · Back to automations |
| Toasts | Draft saved · Changes saved · Step removed + Undo · We couldn't save your changes. Try again. + Retry |

## Values
- Header 64 high, padding 0 24, hairline under it (§ 4.2). Buttons 36 (§ 13.2).
- Sentence card: radius 16, level 0, padding 20 24; text 18/26 600 Inter Tight (§ 5 section title). Chips radius 6 (§ 8 tag), `--accent-subtle` / `--accent-text`; selected `--accent-muted`.
- Step card: 320 wide, radius 10, level 1 (§ 13.8 canvas node), padding 16. Kind line 12/16 tertiary + 16 icon. Title card title 15/22 600. Subtitle 12/16 tertiary. Selected: 1.5 px `--accent` border + `--accent-muted` halo.
- **Step number:** top right, 12/16 500, `--text-disabled` #9C9CA3 (see Changes to SPEC). The When card has no number.
- Connectors 1.5 px #B4B4BA (§ 13.8). The "+" is a 20 px white circle with a hairline and a 12 px icon.
- Tool block: 48 wide, radius 16, level 1, padding 4. Buttons 40 × 40, radius 8, icon 20.
- Tool window 320 (AI 400), step settings 340, Who sees what 340. Each is radius 16, level 2, white. Inside padding 16 20, and field gap 16 (§ 6 scale).
- Who sees what well: Mist, radius 10, padding 12. Example item: white, radius 10, hairline.
- Zoom control: 36 high, radius 10, level 2.
- Conditions: outlined group radius 10 (the board draws 12; § 8 has no 12). Condition card Mist, radius 10, padding 8. Inner selects 28 high, radius 8, white. The And / Or segmented control is centred with hairlines. The count block is `--accent-subtle`, radius 10.
- Canvas banner: white, hairline, level 1, radius 10, max 720.
- Dialogs (H2, I1): 400 / 560, radius 20, padding 24.

## Changes to SPEC
1. **The canvas tool block and the attached tool window** are a new pattern. SPEC § 6 has side panels of 480 / 640 only. The windows here are 320 / 400 / 340 and float.
2. **Step numbers in `--text-disabled`.** § 4.2 keeps it for disabled and decorative text. The number repeats the "Step N" header, so it is decorative. Ulia asked for it lighter than tertiary.
3. **The step settings and tool windows have radius 16** (card) with level 2. § 8 / § 13.7 give side panels radius 20 and level 3. These are floating cards over a canvas, not side panels.
4. **H2 "Save your changes?" has a primary accent button.** It is not a destructive confirm; leaving does not lose anything.
5. **Condition group radius 10**, not the 12 drawn on the board. The board's 12 and the 5 / 7 radii inside the old condition chips are not SPEC values; use 10 and 8.

## New components
- **StepCard.** Parts: kind (icon + label), number, title, subtitle; on runs, a status pill left of the number. States: default, hover (level 2), selected, dragging (level 4), drop target, edited ("· edited"), skipped (Skipped pill, text tertiary), needs details (declined-tone border + "Add …" line, F3), read-only.
- **CanvasToolBlock + ToolWindow.** States: closed, hover (Mist + tooltip), open (the joined window, the button pressed in `--accent-muted`).
- **WhoSeesWhat.** Open or collapsed (remembered). Its content is per step type.
- **ConditionBuilder** (Who it runs for, trigger "Only when", step "Only if"). Parts: the outlined group, condition cards, the And / Or switch, a nested dashed group, "Add a condition", "Add a group", and the result count. Ulia wants it to be the one filter builder of the product (PRODUCT-RULES.md). Ask the code side whether `FilterPopover` can take this look.
- **ReadRows**: icon rows for read mode.

## Open questions
None block.

---

## Built
- **Where to see it:** `/automations/<id>`. Code: `components/modules/automations/editor`, the shell seam
  `components/layout/AppFrame`.
- **Differs from the design:** the condition builder has no And / Or switch and no groups for people conditions — the
  segment format is a flat AND list ("Poland or Lithuania" is one condition with "is any of"); the event conditions of
  a trigger do have And / Or. The settings header reads "Step {n} · {type}" over the step's title (as D5 draws it).
  After Turn on the editor stays in fields with the live banner. Run history is off until the automation is saved.
  Keyboard: Enter opens a card, Alt+↑/↓ moves it, Shift+F10 opens its menu, Delete removes it.
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
