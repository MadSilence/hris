---
status: built
screen: automations-send-for-signature
owner: Ulia
updated: 2026-11-17
---

# Automations — the Send for signature step (A01–A05)

## What it is for
In an automation, "Send for signature" makes a document from a template for the person and sends it to the template's signers. A later step can wait until it is signed. It was drawn as a "not connected" step before; it now works.

## Where it lives
The automation editor (`automations-editor`, `automations-steps`, `automations-test-and-turn-on`). Only the parts below are new; everything else is the built editor.

## Layout
- **A01 — the quick step list** (the "+" between steps). It shows Send a notification · Send an email · Create a task · **Send for signature** (marked "New" while it's new) · Wait until · — All steps.
- **A02 — the step card and its settings.**
  - Card: kind "Send for signature" with the signature icon; title = the template's name ("Employment contract"); meta "The person, then their manager · 30 days to sign".
  - Settings:
    - **Template**: a select. Hint: "The document is made for the person when the step runs, and filed in their Documents under Contracts."
    - **Who signs**: read-only rows from the template ("1 The person", "2 Their manager"). Hint: "Set on the template. Open the template".
    - **Time to sign**: read-only, "30 days · from the template".
  - **Who sees what** (`WhoSeesWhat`), "In Lena’s inbox · the person": "Signature requested — Acme asks you to sign Employment contract by 17 Dec." Then "Then Marta, her manager, gets the same when it’s her turn. Guests get it by email."
  - If the document can't be made (an empty field, no manager), the step fails and the run says why (Run history, existing).
- **A03 — Wait until.** One field, **Wait for**: "Employment contract is signed", hint "From step 1. Signed means everyone has signed."
  - The list offers only what is in this automation.
  - Then the existing "Wait at most [30] days" and "If it’s not signed by then": Go on with the next steps · Stop · Stop and tell someone → Tell.
  - Hint: "Declined or cancelled counts as not signed: the run doesn’t wait for the date."
  - No Who sees what: this step shows nothing to anyone.
- **A04 — Test run.** What would happen:
  - "Would send for signature — Employment contract — Lena signs first, then Marta Nowak, her manager. 30 days to sign." with **Send the document to me**.
  - "Would wait until it’s signed — At most 30 days".
  - "HR Admin gets a notification" with **Send it to me** (as built).
  - Anything a test sends is marked [Test] and goes only to the tester.
- **A05 — Send a notification after signing.** The built step, with one new field to insert: **document**, the signed document, linked.
  - Example message: "[first name] [last name] signed [document]. Everyone has signed, the copy is in their Documents."
  - Who sees what: "In Ulia’s inbox · HR Admin".
- The sentence on top: "When a start date is set, noddo sends the employment contract to sign, waits until it’s signed, then tells HR Admin."

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | as the editor | — |
| Empty | Template select with nothing picked: "Pick a template" and the step card "Pick a template" | — |
| No results | Template select: standard "No template called …" | — |
| Error | A template with problems or inactive: the step card shows the `FieldError` style line (as the editor's step errors) | — |
| No permission | Only people who can edit automations | — |
| Normal | A01–A05 | A01–A05 |
| Long content | A long template name ends in … on the card | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Add Send for signature | A01 | Step added, settings open | no |
| Open the template | A02 | Settings › Document templates (Templates, a later round) | no |
| Send the document to me | A04 | The PDF is made and sent to the tester only, marked [Test] | no |

## Words
`words.md`; the key strings are quoted above.

## Values
All values are from the built automation screens (StepCard, the settings window, WhoSeesWhat, TestRunResult). The new pieces are the read-only "Who signs" rows: Subtle fill, radius 10, rows 32, numbered 20 circles.

## Changes to SPEC
None.

## New components
None. These are existing components with new content: the read-only rows follow `ReadRows`.

## Open questions
Q-38 (who sends a document an automation sends), Q-39 (Wait ends on declined / cancelled), Q-40 (test-run PDF to the tester), Q-43 (the "document" field). None blocks the drawing.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** Automations → an automation → "+" → Send for signature (`settings/steps/PeopleSteps.tsx`
  `SignFields`, `WaitFields`, `editor/windows/WhoSeesWhat.tsx`). Built 2026-11-18, walked in the pane with the automations fixes (2026-11-19).
- **Differs from the design:** "Open the template" waits for the Templates screens. The step card's meta line
  ("The person, then their manager · 30 days to sign", `AutomationCanvas.tsx` `signMeta`) and A01's "New" mark
  (`QuickAdd.tsx` `addStep.new`) were built later (documents batch 11, 2026-11-18).

### Built from `design-fixes-automations-1` (2026-11-18, walked 2026-11-19)

The package `hris/design/handoffs/2026-11-18-fixes-automations/FIXES-automations.md` is built as written; where the text above disagrees, it wins. What differs from it:
- "Send the document to me" makes the real document for the case's person and sends it only to the tester, filed in the tester's own Documents as "[Test] …"; *Delete test items* closes it and removes the file and the notification.
- "Then {name}, her manager…" under the example stays generic ("each signer after them").
