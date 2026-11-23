---
status: built
screen: process-sign-task
owner: Ulia
updated: 2026-11-17
---

# Processes — a Sign task (P01a, P01d)

## What it is for
In a process template (preboarding, onboarding, offboarding), a task can be of the kind **Sign**: "the person signs a document made from template X". When the task opens, the document is made and sent by itself, by whoever started the process. The task closes when everyone has signed.

## Where it lives
The task editor of a process template: **Add task** / edit task.

The process and onboarding feature itself isn't designed yet (owner). The page behind the window on the board is a stand-in. The task inside a running process (not open yet, out for signature, signed, couldn't send) will be drawn with processes. Until then, use the brief § 7.

## Layout
The Add task window, 480 wide:
1. Title "Add task", ×.
2. Kind: `SegmentedControl` with To do · Upload · **Sign**.
3. **Document**: a dropdown with a file icon, e.g. "Employment contract". Under it, one hint line saying who signs, taken from the template: "The person signs, then their manager."
4. **When**: [5 days] + Before | After (`SegmentedControl`) + "the start date". This is the product rule for days relative to a date.
5. Cancel · **Add task**.

Not asked:
- **who does it** — a Sign task is always the person's own;
- **who signs** — from the template;
- **the title** — from the document's name: "Sign: Employment contract".

**P01d — the dropdown open.**
- The field itself is the search (product rule): typing "con" narrows the list and the typed letters are bold.
- Each option shows the document name and, in grey under it, who signs.
- With 50 documents the list scrolls inside. There is no separate search box.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Dropdown list as skeleton rows | — |
| Empty | No templates yet: the list says "No document templates yet" with a link to Settings › Document templates | — |
| No results | "No document called “xyz”" | — |
| Error | `FieldError` under Document when Add task is pressed with none picked: "Pick a document" | — |
| No permission | Only people who can edit process templates | — |
| Normal | P01a, P01d | P01a, P01d |
| Long content | Long template names end in …; the who-signs line wraps once | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Add task | window | Task added to the template | no |

## Words
- "Add task", "To do", "Upload", "Sign", "Document", "When", "Before", "After", "the start date", "Cancel".
- "The person signs, then their manager." The wording follows the template's signers.
- Proposed (not drawn): "Pick a document", "No document templates yet", "No document called “…”".

## Values
- Window 480 (§ 13.7).
- Fields per § 13.3.
- The dropdown list: max height 236, then it scrolls; option rows have two lines (14/20 name, 12/16 tertiary hint).

## Changes to SPEC
None.

## New components
None. These are the existing `SegmentedControl`, select and dropdown.

## Open questions
None blocks the window. The running-process states wait for the processes design.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** Settings → a process template → Add task → Sign; the task's side panel
  (`lifecycle/templates/canvas/AddTaskDialog.tsx`, `TaskKindConfigFields.tsx` `SignTemplateField`). Built 2026-11-18, **not yet looked at in a browser**.
- **Differs from the design:** the Add task window keeps its kind cards (not a three-way `SegmentedControl`) and its
  timing is the cell clicked, as for every kind; When is changed in the side panel. A Sign task added to a lane that
  is not the person's is flagged by the draft's problems rather than refused in the window. Sign in a running
  process is built (documents batch 11, A6): offered in Add task with the template field and no assignee; the
  envelope is sent when the task opens (`SignTaskStarter`, as whoever added it).
- **The designers' round of 19 Nov, built 2026-11-20 (PT1–PT4, P01e; not yet seen in a browser):**
  - **PT1, PT3:** the kind stays the dropdown with all six kinds, as Ulia settled.
  - **PT2:** the Document field is the shared `Combobox` (the field is the search, typed letters bold), each option
    with who signs in grey — "The person, then their manager" — and under the chosen one "The person signs, then their
    manager." (a template's own label wins over the kind's word; people of one step are joined by "and"). "Pick a
    document" shows as a `FieldError` under the field. **Material is not asked for a Sign task** (the document is the
    material), unless the task already carries some.
  - **P01e:** with no active document templates the list says "No document templates yet" / "Make one in Settings,
    then pick it here."; there is no hint line under the field.
- **Not done in this round:**
  - **"Open Document templates" is hidden** (P01e): the templates editor's screen does not exist yet, so the link
    would lead nowhere (`ANSWERS-2026-11-20.md` § D).
  - **When stays the side panel's "[n] + days before / on / after / by the start date" select**, not a Before | After
    switch: the template's timing is the cell clicked, for every kind (see above).
