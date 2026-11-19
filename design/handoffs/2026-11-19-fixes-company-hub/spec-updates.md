# Spec updates — Company hub (round 1)

Apply these to the specs in `design/screens/` so they match the decisions in `FIXES-company-hub.md`.

## company-hub/spec.md — States, "Empty (nothing yet)"

Replace the sentence about the Handbook column:

> **Handbook column only empty:** an S **policies** scene, "No handbook pages yet".

with:

> **Handbook column only empty:** the **documents** scene at M **160 × 100**, centred horizontally and vertically in the column's free area (16 under the heading row down to the bottom of the News column's content). Title "No handbook pages yet" (18/26 600). Line "Pages your company adds will show up here." (14/20, secondary). For people who can manage the hub: **Add a page** (secondary 36), which opens Manage hub → Pages with a new page. Employees get no button. (Ulia, 18 Nov.)

Add to Words → Empty: "No handbook pages yet / Pages your company adds will show up here. / Add a page".

## Product rule (all screens) — illustration size

A scene is shown at S 96 **only if it has its own `-s` file** (SPEC § 10: S drops the support lines). A scene without one is never smaller than **M 160**: at 160 its thinnest 3-unit line is exactly 2 px, the minimum on screen. Search with nothing found uses `no-results-s`; a filter that leaves nothing uses `no-match-s`.

## company-hub-manage/spec.md — Words, Publish dialog

Add the first-version line: "Readers will see this page as it is now."

## company-hub/spec.md — save button

Replace "filled `bookmark-check-02` when saved" with: "**`bookmark-02` filled with the accent** (fill and stroke #6E1630, no checkmark) when saved" (Ulia, 18 Nov). Applies everywhere the save button appears: CH02 rows, the pinned post, one post, CP02.

## company-hub/spec.md and company-hub-manage/spec.md — no post types (Ulia, 18 Nov)

- company-hub, CH02 controls: remove "the type filter chips … All types, Announcements, Policy updates, Events" and the vertical hairline. Words: remove "CH02 types".
- company-hub, rows: the tile is the cover thumbnail or `megaphone`; remove the per-type icons (`file-01`, `calendar-03`). Row meta: "{author} · {team, office or "Everyone"}" only; remove the policy / event variants.
- company-hub-manage, CM05: no type field. Add after Pin to the top: **Notify people** toggle, hint "In their inbox, when the post goes out." Words: Notify people; In their inbox, when the post goes out.

## company-hub-manage/spec.md — CM06 bar with nothing to publish

When the draft equals the published version: no Publish button and no "Unpublished changes" pill; the bar shows "Saved {HH:mm}" and Preview. (Rules README position 2: no disabled buttons.)

## company-hub/spec.md — CH03 lead

"Read each page and agree to its current version. HR sees when you agreed." → "Read each page and agree to its current version. The page owner sees when you agreed." (product rule: the system never says "HR").

## Product rule — a dropdown is its own search (Ulia, 17 Nov; first sent to code in this package)

Every select with search: the field is the input, the list narrows under it, matched letters bold. No separate search row inside the list.


## 19 Nov — Ulia's decisions

- **New illustration `saved`** (+ `saved-s`): the bookmark in Ink with the accent ring on its top-right corner. Add to `styles/noddo/assets/illustrations/` and to the SPEC § 10 scene index: "saved (+ `-s`) — saved posts and pages, bookmarks". company-hub spec, Saved popover empty: **saved-s** 96 (not no-results).
- **company-hub-manage spec, Words → Errors:** add "We couldn't load the overview / Your posts and pages are safe. / Try again" (CM01) and "We couldn't load who agreed / Every yes is saved. / Try again" (CM08).
- **CM03 "{n} more pages"**: opened, it becomes "Show less" (Words: Show less).
- **CM08 Legal entity chip**: shown only when the company has more than one legal entity.
