# Automations: design handoff, 6 Nov 2026

From Ulia (design) to Petya (code). It follows `design/HANDOFF.md`.

**The board:** "Automation screens", https://claude.ai/artifact/YGmiv8vzoEKU1bkS8TJVdh. It has 81 screens in 9 rows, drawn at 1440 × 900. A taller frame on the board shows a whole settings window for review only. On screen that window scrolls.

**Checked against:** `MadSilence/hris` main @ 850deec (5 Nov), `styles/noddo/SPEC.md`, and `design/rules/` (synced 5 Nov). `CHANGELOG.md` has one entry, the § 7 exceptions, and they are followed. `QUESTIONS.md` was empty.

## What is in this zip

| Path | What |
|---|---|
| `design/screens/automations-*/spec.md` | One spec per flow, from `SCREEN_SPEC_TEMPLATE.md`. Already at its place in the repo. |
| `design/screens/automations-*/images/` | A PNG of every state, named after its board frame (`E1-List.png`). |
| `design/screens/automations-*/export/` | The board's HTML for each frame. It is a reference picture only, never a source of values (HANDOFF § "Taking an export in", step 3). |
| `design/screens/automations-*/words.md` | Every string in the frames, pulled from the HTML. Names, dates and numbers in it are example data. The spec's "Words" table holds the product copy. |
| `DESIGN-ONLY.md` | **Things the design has that the code does not**, and what in the code would change. Read this first. |
| `NOT-DRAWN.md` | Things the code has that the board does not draw, and what to do with each. |
| `QUESTIONS-to-add.md` | Nine entries to paste into `design/QUESTIONS.md`. |
| `PRODUCT-RULES.md` | UI rules Ulia set for the whole product while designing this. They are proposals for the owner's notes (`rules/`, then `sync-rules.mjs`). |

## The flows

| Folder | Board row | Frames | Status |
|---|---|---|---|
| `automations-list` | 1 · Automations list | E1–E7, H3, H5, H6, O1, O2, W3 | ready |
| `automations-start` | 2 · Start | Main, F2, F0, F0b, D1, F1 | ready |
| `automations-editor` | 3 · Build, 5 · Live (canvas), 6 · Edge cases | D2, D4, D3, J8, D5, G4, G3, G3b, J2, J4, R3, R4, H1, H2, H4, I1 | ready |
| `automations-triggers` | 3a · What starts it | T1–T6 (14 frames) | ready |
| `automations-steps` | 3b · Steps | S1–S7 (14 frames) | ready |
| `automations-test-and-turn-on` | 4 · Check and turn on, 7 | G1a, G1, G1b, G1m, F3, F4, F5, V6, V7 | **draft**: waits on Q-1 |
| `automations-run-history` | 5, 7 | G2, V1, V1b, V4b, V2, V3, V4, V5 | ready |
| `automations-activity` | 7 | V8, V8b | ready |

"Ready" means every item of the HANDOFF checklist holds. A state that is not a frame on the board is written out in the spec's "States" table, with its words. The spec wins over the picture.

## Read in this order

1. `DESIGN-ONLY.md`: it decides how much engine work there is (branches, statuses, new steps and triggers).
2. `QUESTIONS-to-add.md`: Q-1 blocks the test run.
3. The specs, list → start → editor → triggers → steps → test and turn on → run history → activity.

## Fixed on the board while preparing this, to match `rules/`

- Search placeholders are now just "Search" (ACTIONS_AND_MENUS § 4). Before, they said "Search automations", "Search steps", "Search events" or "Search people".
- "(optional)" is gone from field labels (FORMS_AND_FIELDS § 3). See Q-5.
- The list pages got the "Automations | Activity" tabs and Settings in the sidebar, the same as the Activity frames.
- Grant a time-off policy has no "Starts" field: the policy starts the day the step runs. Ulia decided this on 6 Nov.
- Activity has no "Person" pill, because Search covers it. Ulia decided this on 6 Nov.
