---
status: built
screen: automations-start
owner: Ulia
updated: 2026-11-06
---

# Start a new automation

## What it is for
An HR admin starts an automation in one of three ways: describe it to noddo AI, pick a template, or start from scratch. They leave in the editor with either a draft to check or an empty canvas that asks what starts it.

## Where it lives
- **New automation** dialog: from "Add automation" on the list (and "Pick a template" on the empty list, which opens it scrolled to the templates).
- The editor (full screen, the app sidebar folded): from the dialog, or from "Start from scratch" / "Draft with AI" on the empty list.
- Managers only.

## Layout
**New automation dialog** (Main): `Dialog` L, 800 wide (§ 7 exception: white).
1. Title "New automation" + close.
2. The AI field: a textarea with a hint and "Draft with AI" (primary, with the AI sparkle icon) inside its lower edge. **New:** `AiPromptField`, the same one as on the empty list.
3. A section label "Or start from a template" with a hairline to the right.
4. `FilterChip`s by category (single choice): All · Onboarding · People · Celebrations · Compliance · Time off · Offboarding.
5. Template cards, 3 per row: the category (hint), the name (card title), and two icon lines for what starts it and what it does. The list scrolls inside the dialog.
6. Footer: "Start from scratch" (secondary), right.

**Editor, start from scratch** (F2 → F0 → F0b): the editor layout is in `automations-editor`.
- **F2.** The **What starts it** tool window opens by itself on the left with the trigger list (`automations-triggers`). On the canvas sits a dashed accent placeholder card: "Starts when · Choose what starts it · Pick an event with [+] on the left". The [+] icon is inline, 14 px, grey, with no plate. Under the card: "or", then "Describe it to noddo AI".
- **F0.** If the person closes the window, the canvas does not change.
- **F0b.** Once a trigger is picked, the When card is real and a dashed "What should happen next? · Add the first step" card follows.
- From the start, the sentence on top reads "When [something happens], noddo [does the steps]." Its bracketed parts are grey dashed chips, and each turns into real text as it is picked.
- The header name is "Untitled automation" until the first save (I1).

**Build with AI** (D1): the editor opens with the noddo AI window (400 wide) on the left. It shows the person's sentence, the reply, the drafted steps on the canvas, questions as buttons, and a dashed placeholder with the nod ring while a step is being added.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading (editor) | The editor frame with the header and tool block, and `Skeleton` cards on the canvas in the shape of a When card and two steps. | F1-Editor-loading.png |
| Loading (templates) | Skeleton template cards in the grid, 6. | not drawn |
| Empty | A brand-new automation: F2 / F0. The canvas is never empty. | F2-Start-from-scratch.png, F0-New-empty.png |
| No results | Not applicable: the dialog has no search. A category is never empty, because templates come from the code. | — |
| Error (templates) | Inside the dialog, under the AI field: `ErrorState` compact, scene something-broke: "We couldn't load the templates" / Try again. The AI field and Start from scratch still work. | not drawn |
| Error (AI draft) | In the AI window: "We couldn't draft it. Your text is still here." + Try again (secondary). See also H1 in `automations-editor`. | not drawn here, pattern H1 |
| No permission | Without the manage right there is no Add button, so these screens can't be reached. A direct link opens the product's 403. | — |
| Normal | Main (dialog with a prompt typed), F0b (trigger picked), D1 (AI draft). | Main.png, F0b-Trigger-picked.png, D1-Build-with-AI.png |
| Long content | A template name wraps to 2 lines (the "A task for the manager on the first day" card). A long prompt grows the field to 6 lines, then scrolls. | Main.png |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Draft with AI | AI field (enabled when the field has text) | Opens the editor (D1); the AI drafts steps; the automation is a Draft, not saved until "Save draft". | no |
| Pick a template | template card | Opens the editor with the template's trigger and steps; header name = template name; Draft, unsaved. | no |
| Start from scratch | dialog footer / empty list | Opens F2. | no |
| Pick a category | chips | Filters the cards. | no |
| Close (× / Esc) | dialog | Closes, nothing is kept. | no |
| Pick an event | What starts it window | The trigger is set (F0b) and its settings open (`automations-triggers`). | no |
| Describe it to noddo AI | canvas, under the placeholder | Opens the noddo AI tool window. | no |
| Answer an AI question | buttons in the AI window (D1: "Yes, tell HR" / "Only approved ones") | The AI changes the draft. Each change can be undone (H1). | no |

## Words
| Where | Text |
|---|---|
| Dialog title | New automation |
| AI field label | Describe what should happen |
| AI field example (Q-6) | When someone's probation ends in 14 days, remind their manager to book a review and tell HR |
| AI field hint | noddo AI drafts the steps. You check them before turning it on. |
| AI button | Draft with AI |
| Section | Or start from a template |
| Categories | All · Onboarding · People · Celebrations · Compliance · Time off · Offboarding |
| Templates (the code's 13) | Written by the code's template catalogue. The board shows: Welcome email before the first day · A task for the manager on the first day · Onboarding completed · Confirm the end of probation · Moved to another department · Holiday calendar by office · Work anniversary · Birthday · A document about to expire · A monthly reminder to check one's details · A long leave approved · Tell HR about a termination · Collect equipment on the last day |
| Template lines (examples) | 7 days before the hire date / Email the new teammate; On the hire date / Task for their manager |
| Footer | Start from scratch |
| Editor header (new) | Untitled automation · Draft |
| Sentence template | When [something happens], noddo [does the steps]. |
| Placeholder card | Starts when / Choose what starts it / Pick an event with [+] on the left |
| Under it | or · Describe it to noddo AI |
| Next step placeholder | What should happen next? / Add the first step |
| AI window title | noddo AI |
| AI reply (example) | Here's a draft with 4 steps. Check who approves before you turn it on. |
| AI label | Drafted by AI — review before turning on |
| AI step placeholder | Adding a task… |
| Templates error | We couldn't load the templates / Try again |
| AI error | We couldn't draft it. Your text is still here. / Try again |

## Values
- Dialog 800 (§ 6, § 13.7), radius 20, padding 24, white (§ 7 exception).
- AI field: border `--accent` with a 3 px `--accent-muted` halo while focused (§ 13.1). Radius 8, padding 12. Hint 12/16 tertiary.
- Template card: radius 10, hairline border, padding 16, no shadow. Category hint 12/16 tertiary, name card title 15/22 600, icon lines 13/18 secondary with 16 icons tertiary.
- Placeholder card on the canvas: dashed 1.5 px `--accent-ring`, `--accent-subtle` fill, radius 10 (§ 13.8 drop target).
- Canvas: `#F7F7F8` with a `#DADADF` dot grid every 16 (§ 4.2, § 13.8).

## Changes to SPEC
1. Template cards have radius 10 and no shadow (§ 8 gives cards 16). They are picks inside a dialog, closer to a menu item than to a page card.
2. **noddo AI surfaces**: the prompt field, the AI window, the "Drafted by AI" label and the step placeholder with the nod ring are new (see "New components").

## New components
- **AiPromptField.** A textarea, a hint and a primary button inside the field's lower edge. States: empty (button disabled), typing, sending (the button shows "Drafting…" with the nod ring, and the field is read-only), error (`FieldError` under it). It is used on the empty list, in New automation, and in the AI window as the reply box.
- **Canvas placeholder card**: the dashed accent card. States: default and hover (`--accent-muted` fill). Used for "Choose what starts it" and "Add the first step".

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-6** — the grey example stays. **Owner:** noddo AI is a placeholder for now: the field and the window are built, a prompt is answered "noddo AI isn't connected yet. Start from a template or from scratch — your text is kept." and nothing is drafted.

---

## Built
- **Where to see it:** Add automation; `/automations/new` (`?template=`, `?ai=`). Code: `list/NewAutomationDialog`, `editor`.
- **Differs from the design:** noddo AI is a placeholder (the owner, 2026-11-06): the field and window are built, a
  prompt is answered "noddo AI isn't connected yet…" and nothing is drafted. Only categories that have a template show.
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
