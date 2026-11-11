# Home: design handoff, 11 Nov 2026

From Ulia (design) to Petya (code). It follows `design/HANDOFF.md`.

**The board:** "Home dashboard", page "Ready for handoff", https://claude.ai/artifact/QBnRZi4D67C1PU8tbfoAB4. It has 43 frames drawn at 1440 wide: the finished home, the edit flow and the widget library.

**Checked against:** `MadSilence/hris` master @ f1ca618 (9 Nov), `styles/noddo/SPEC.md` and `design/rules/`. The newest `CHANGELOG.md` entry is the automations build (6 Nov). The board uses its `SegmentedControl` and `AiPromptField` as the base for the Home versions. `QUESTIONS.md` has Q-1 and Q-2 open; neither touches Home.

**Ulia's word:** every element is built as drawn. Where the design and today's home differ, the design wins (`DESIGN-ONLY.md`). Where a widget needs a module that does not exist yet, it arrives with that module, as drawn.

## What is in this zip

| Path | What |
|---|---|
| `design/screens/home/` | Home: header, AI box, profile menu, the grid, the role defaults. |
| `design/screens/home-edit/` | Edit home: zoomed page, the widgets panel, sizes, drag, remove, reset, save. |
| `design/screens/home-widgets/` | The ten widgets: sizes, states, card kinds, motion. |
| `…/spec.md` | One spec per flow, from `SCREEN_SPEC_TEMPLATE.md`. Already at its place in the repo. |
| `…/images/` | A PNG of every frame, named after the frame (`HF01-home-bold.png`). |
| `…/export/` | The board's HTML for each frame. It is a reference picture only, never a source of values. |
| `…/words.md` | Every string in the frames. Names, dates and numbers in it are example data; the spec's "Words" holds the product copy. |
| `DESIGN-ONLY.md` | **What the design has that the code does not.** Read this first. |
| `NOT-DRAWN.md` | What today's home has that the design drops, and states written but not drawn. |
| `QUESTIONS-to-add.md` | Four entries (Q-3 to Q-6) to paste into `design/QUESTIONS.md`. All about storage; none blocks. |
| `PRODUCT-RULES.md` | UI rules Ulia set while designing this, for the owner's notes (`rules/`). |

## The flows

| Folder | Board frames | Status |
|---|---|---|
| `home` | HF01–HF06, A01, A02, P01, E01, G01 | ready |
| `home-edit` | EF01–EF18 | ready |
| `home-widgets` | LW00, LW01–LW01d, LW02–LW10 | ready |

"Ready" means every item of the HANDOFF checklist holds. A state that is not a frame is written out in the spec's "States" table, with its words. The spec wins over the picture.

## Read in this order

1. `DESIGN-ONLY.md`: how much work is behind each widget (the running clock in My time, the Waiting on you feed, approve from Home).
2. `NOT-DRAWN.md`: what goes from today's home.
3. The specs: `home` → `home-edit` → `home-widgets`.
4. `QUESTIONS-to-add.md`.
