# Company hub: design handoff, 12 Nov 2026

From Ulia (design) to Petya (code). It follows `design/HANDOFF.md`.

**The board:** "Company hub & Reports — concept", page **"Hub · ready for handoff"**, https://claude.ai/artifact/BgFvowA35GUEAH5kQz2eS3. The page has 13 frames drawn at 1440 wide, in three rows, one per flow. The other pages of the board are earlier rounds and Reports, and are not part of this handoff.

**Checked against:**
- `MadSilence/hris` main @ f9e6e3d (11 Nov);
- `styles/noddo/SPEC.md`;
- `design/rules/`.

The newest `CHANGELOG.md` entry is the Home build (11 Nov). The hub reuses what came with it:
- `AiBox`;
- Home's own tokens for the big numbers and the tint radius.

It also reuses the automations pieces:
- `SegmentedControl`;
- `PeoplePicker` with roles;
- the condition builder (`components/audience/AudienceBuilder`).

`QUESTIONS.md` has Q-1, Q-2 and Q-7 open. Only Q-7 touches the hub: the person's own birthday switch, which the hub honours.

**Ulia's word:** the Company hub is ready. Every element is built as drawn. Where the spec and the picture differ, the spec wins. There are three places like that, listed in `NOT-DRAWN.md`.

**Reports** (analytics) is a separate handoff, later.

## What is in this zip

| Path | What |
|---|---|
| `design/screens/company-hub/` | Hub home, All news, Pages need your yes. |
| `design/screens/company-hub-page/` | The handbook and one page with the agree bar. |
| `design/screens/company-hub-manage/` | Manage hub, its dialogs and the editor: Overview, Posts, Pages, Settings, New post, the page editor, Who sees it, Who agreed. |
| `…/spec.md` | One spec per flow, from `SCREEN_SPEC_TEMPLATE.md`. Already at its place in the repo. |
| `…/images/` | A PNG of every frame, named after the frame (`CH01-hub-home.png`). |
| `…/export/` | The board's HTML for each frame. It is a reference picture only, never a source of values. |
| `…/words.md` | Every string in the frames. Names, dates and numbers in it are example data. The spec's "Words" holds the product copy. |
| `DESIGN-ONLY.md` | **What the design needs that the code does not have.** Read this first: the hub is a new module. |
| `NOT-DRAWN.md` | States written in the specs but not drawn, and where the spec corrects a frame. |
| `QUESTIONS-to-add.md` | Five entries (Q-9 to Q-13) to paste into `design/QUESTIONS.md`. None blocks: each has a recommended answer the specs follow. |
| `PRODUCT-RULES.md` | UI rules Ulia set while designing this, for the owner's notes (`rules/`). |

## The flows

| Folder | Frames | Status |
|---|---|---|
| `company-hub` | CH01 hub home, CH02 all news, CH03 pages need your yes | ready |
| `company-hub-page` | CP01 handbook, CP02 a must-read page | ready |
| `company-hub-manage` | CM01 overview, CM02 posts, CM03 pages, CM04 settings, CM05 new post, CM06 page editor, CM07 who sees it, CM08 who agreed | ready |

"Ready" means every item of the HANDOFF checklist holds:
- every state is drawn or written out;
- every component is named or marked new;
- every value is traced to SPEC or listed under "Changes to SPEC";
- every word is written;
- every action says what it does and whether it confirms;
- no open question blocks.

## Read in this order

1. `DESIGN-ONLY.md`: the size of the work (a new module: posts, pages with versions, agreements, the audience).
2. The specs: `company-hub` → `company-hub-page` → `company-hub-manage`.
3. `NOT-DRAWN.md`.
4. `QUESTIONS-to-add.md`.
