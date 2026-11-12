# Not drawn

## Where the spec corrects a frame

The spec wins over the picture. Three places differ from what the frames show:

| Frame | The frame shows | Build it as |
|---|---|---|
| CH01 | Radius 14 on section cards and row tiles, column gap 56 | 16 on cards, 12 on icon tiles, a gap of 64 (spec → Values) |
| CP02, CM06 | Reading column 760 | 720 (SPEC § 6) |
| CM03 | Section tile radius 7 | 6 |

Three earlier differences were fixed on the board before the handoff, so the frames and the spec now agree:
- "Missed the deadline" is amber;
- the manager's side says "agreed", not "confirmed";
- CM08's breadcrumb starts at Manage hub.

## Written in the specs, not drawn

| Screen | State | Where it is written |
|---|---|---|
| all | Loading (`NodRing`, then skeletons per block) | each spec → States |
| company-hub | The Manage hub button on CH01 (managers only) | `company-hub/spec.md` → Where it lives |
| company-hub | Empty hub, empty News column, empty Handbook column, nothing to agree, nothing saved | `company-hub/spec.md` → States |
| company-hub | The Saved popover | `company-hub/spec.md` → Actions |
| company-hub | The ask box results (Pages / News / Ask noddo) and no results | `company-hub/spec.md` → Actions, States |
| company-hub | CH03's Agreed tab | `company-hub/spec.md` → Layout |
| company-hub | A single post (`/hub/news/{id}`) | `company-hub/spec.md` → Layout |
| company-hub-page | The Edit page button for managers on CP02 | `company-hub-page/spec.md` → Where it lives |
| company-hub-page | Agreeing, agreed, failed to agree, overdue bar | `company-hub-page/spec.md` → Layout, States |
| company-hub-page | A reference page (no bar), a section expanded | `company-hub-page/spec.md` → States |
| company-hub-manage | The publish dialog with the drafted What changed | `company-hub-manage/spec.md` → CM06 |
| company-hub-manage | "Add Company news to everyone's Home?" when Show on Home is turned on | `company-hub-manage/spec.md` → CM05 |
| company-hub-manage | The publish dialog's choice: ask everyone again / small fix | `company-hub-manage/spec.md` → CM06 |
| company-hub-manage | The schedule popover, Edit post | `company-hub-manage/spec.md` → CM05 |
| company-hub-manage | Row menus, confirms, toasts | `company-hub-manage/spec.md` → Actions, Words |
| company-hub-manage | CM07 on Everyone and on Choose people, and with 0 people | `company-hub-manage/spec.md` → CM07 |
| company-hub-manage | CM08's Agreed tab and the row selection | `company-hub-manage/spec.md` → CM08 |
| company-hub-manage | A team lead's view (no Settings tab) | `company-hub-manage/spec.md` → Where it lives |
| company-hub-manage | Preview of a page | `company-hub-manage/spec.md` → Actions |
| all | Errors and 403 | each spec → States |
| all | Dark mode, mobile, narrow screens under 1280 | Not in this round. Under 1280 the hub's columns stack: News, then Handbook. |
