---
status: built
screen: home-edit
owner: Ulia
updated: 2026-11-11
---

# Edit home

## What it is for
Anyone can make Home their own. They can add the widgets they need, drop the ones they don't, pick each widget's size, change the order, and choose the Colour or Light header. Nothing changes until they press Save, so they can try things out freely.

## Where it lives
"Edit home" at the end of Home (E01) and in the My profile menu. It opens edit mode on the same route (`/dashboard`; a URL flag or a state, the code's choice). It replaces today's Customize list. Everyone who has Home can edit their own Home. It changes only their own page.

## Layout
1. **Edit bar** on the header band (Colour) or on white (Light), in two lines:
   - Line 1: "Edit home" (24/32 600, page title, SPEC § 5) and under it "Try things out. Nothing changes until you press Save." (13/18). On the right: Cancel (secondary) and Save (primary; white fill on the Colour band, accent on Light).
   - Line 2: "Header" label + a segmented control Colour / Light (`SegmentedControl`, Q-1), and "Reset to default" (ghost) on the right.
2. **The page, zoomed out** to fit next to the panel: 56 % at 1440, 44 % at 1280 (EF18). It is the real grid with real data. Every widget gets edit chrome: a drag handle (top centre, `drag-drop-vertical`), a size tag in its top right corner (S / M / L, pill 24, level 2), and a remove button (a 30 circle, top left, level 2, `minus-sign` in red). The widget has a 1.5 px `accent` 25 % outline. **New:** `WidgetEditChrome`.
3. **Widgets panel** on the right: `SidePanel` 480, level 3 (SPEC § 13.7). Top to bottom:
   - "Widgets" (section title) + close (×). Close is the same as Cancel.
   - Search (36).
   - Category chips: All · For me · My team · Company, each with a count (`FilterChip`, single choice). The chips hide while searching.
   - The hint "Pick a size, then drag the widget onto your home or click +".
   - A list of widget rows divided by hairlines. Each row has a preview 156 × 132 (Mist, radius 12, the widget drawn in its picked size with the person's real data), then the name, a description of up to 2 lines then …, and the size switch with only the sizes the widget has ("Small only" when there is one). On the right is "+" (secondary icon button 32), or "On your home" in grey when it is already on the page.
   - **New:** `WidgetCatalogRow`.

## States
| State | What the reader sees | Image |
|---|---|---|
| Open (For me) | EF01. Hover a row: Mist background, "+" turns accent, and the preview can be dragged. | EF01-open.png |
| All | EF02: grouped under the small headings For me / My team / Company. | EF02-all.png |
| Size switched | EF03: the preview redraws at once in the new size. | EF03-size.png |
| Loading | EF04: skeleton rows in the shape of the real ones, after 2 s (SPEC § 12). | EF04-loading.png |
| Search with results | EF05: names and descriptions are searched across all categories. A "{n} widgets" heading, matches marked in `accent-subtle`. | EF05-search.png |
| No results | EF06: **no-results-s** scene, "No widgets match “{text}”" / "Try another word." + "Clear search". | EF06-no-results.png |
| Error | EF07: **something-broke** scene, "Couldn’t load widgets" / "Your home is safe. Try again." + "Try again". The page stays editable. | EF07-error.png |
| Long content | EF08: names wrap to 2 lines, descriptions stop at 2 lines with …. | EF08-long.png |
| Dragging | EF09: the dragged preview at level 4 (SPEC § 7). A drop place opens where it will land (dashed `accent-ring`, `accent-subtle`, SPEC § 13.8) and the widgets after it move down. | EF09-drag.png |
| Added | EF10: the widget lands with an accent outline that fades after 1.5 s. Its row now says "On your home". Toast "“To sign” added" + Undo. | EF10-added.png |
| Widget clicked | EF11: a popover under the widget (radius 10, level 2) with the size control (only its sizes) and Remove (`delete-02`, red). The widget lifts with an accent outline. To move a widget, press and drag the widget itself, with no click needed. | EF11-widget-size.png |
| Removed | EF12 (Light top): the widget leaves the page and its row gets "+" again. Toast "“Next time off” removed" + Undo. | EF12-removed-light.png |
| Reset | EF13: the role default comes back at once, still not saved. Toast "Home reset to default" + Undo. | EF13-reset.png |
| Cancel with changes | EF14: confirm dialog 400. | EF14-discard.png |
| Saving | EF15: Save shows `NodRing` + "Saving…" and keeps its width. A second click does nothing. | EF15-saving.png |
| Saved | EF16: back to Home with the new layout. Toast "Home saved". | EF16-saved.png |
| Light top | EF17. | EF17-light.png |
| Narrow (1280) | EF18: the page zooms to 44 %. | EF18-narrow.png |
| Empty page | The person removed every widget. The zoomed page shows one dashed drop place, "Drag widgets here". Not drawn. | not drawn |
| Save failed | Toast with the red icon "Couldn’t save your home" + "Retry". Edit mode stays open with every change kept. Not drawn. | not drawn |
| No permission | Not a state: everyone can edit their own Home. Widgets the person has no right to are not in the list, and the counts on the chips count only what they can add. | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Edit home | E01, profile menu | Opens edit mode, panel on For me. | no |
| Header Colour / Light | edit bar | The page redraws at once. It is saved with Save. | no |
| Reset to default | edit bar | Puts back the role default (`home` spec, "Default layout") at once. Undo in a toast. It is not saved until Save. No confirm, because Cancel still drops everything. | no |
| Search / category chips | panel | Filters the list. | no |
| Size switch in a row | panel | Changes the preview and the size the widget will land in. | no |
| + | panel row | Adds the widget at the top of the first free place that fits. Toast "“{name}” added" + Undo. | no |
| Drag a preview onto the page | panel → page | It lands where the drop place is. Same toast. | no |
| Drag a widget on the page | page | Moves it. Others reflow (300 ms, SPEC § 11). | no |
| Click a widget | page | Opens the size / remove popover (EF11). | no |
| Size in the popover | popover | Resizes in place. Others reflow. | no |
| Remove (−, or Remove in the popover) | page | Removes it. Toast "“{name}” removed" + Undo. | no |
| Cancel / close × | edit bar, panel | With no changes it closes. With changes it opens the confirm (EF14). | **yes**, only with changes |
| Discard changes | confirm | Closes and drops every change. | it is the confirm |
| Keep editing | confirm | Back to editing. | — |
| Save | edit bar | Saves layout, sizes and header for this person. Back to Home, toast "Home saved". | no |

## Words
| Where | Text |
|---|---|
| Edit bar | Edit home / Try things out. Nothing changes until you press Save. / Cancel / Save / Saving… |
| Edit bar line 2 | Header / Colour / Light / Reset to default |
| Panel | Widgets / Search widgets / All / For me / My team / Company / Pick a size, then drag the widget onto your home or click + |
| Panel row | {Widget name} / {description} / Small / Medium / Large / Small only / On your home |
| Search heading | 1 widget / {n} widgets |
| No results | No widgets match “{text}” / Try another word. / Clear search |
| Error | Couldn’t load widgets / Your home is safe. Try again. / Try again |
| Empty page drop place | Drag widgets here |
| Popover | Small / Medium / Large; the red icon button’s tooltip and accessible name: Remove from home |
| Toasts | “{name}” added · Undo / “{name}” removed · Undo / Home reset to default · Undo / Home saved / Couldn’t save your home · Retry |
| Confirm | Discard your changes? / Your home stays as it was. / Keep editing / Discard changes |
| Accessible names | Drag {name}; Remove {name}; Size: {Small / Medium / Large}; Add {name} |

The widget names and descriptions in the panel:

| Widget | Category | Description | Sizes |
|---|---|---|---|
| Waiting on you | For me | Requests that wait for your answer | S M L |
| Time off | For me | Your balance, what is booked and pending | S M L |
| Next time off | For me | A quiet countdown to your next day off | S M |
| My time | For me | Today’s hours, breaks and clock out | S M L |
| To sign | For me | Documents waiting for your signature | S M L |
| My tasks | For me | Tasks from processes and people, by due date | S M L |
| Who’s out | My team | Who is away today or this week | S M L |
| This week | Company | Birthdays, work anniversaries and new joiners | S M L |
| Processes | Company | Onboarding, offboarding and preboarding in progress | S M L |
| Automations | Company | What noddo did this week, and what needs a fix | S M L |

Every string in the frames is in `words.md`.

## Values
- Panel 480, level 3, radius 20 on its outer corners, padding 24, gap 12 (SPEC § 6, § 13.7).
- Row: padding 12 0, gap 16, preview 156 × 132 radius 12 on Mist. The preview is scaled to fit 140 × 116.
- Zoom 56 % (1440) / 44 % (1280), page padding 40 / 48 in edit mode.
- Remove button 30, size tag 24 pill, level 2. The edit outline is 1.5 px accent at 25 %, and 3 px accent when selected.
- Drop place: 2 px dashed `accent-ring`, `accent-subtle` fill, radius 28 (SPEC § 13.8). Dragged item level 4.
- Toast per SPEC § 13.7: bottom left, 5 s, Pine icon.
- Segmented control (Header, sizes): 28 high (2 padding + 24), a pill outside and a pill on the picked segment, picked white on Mist. The code's `SegmentedControl` (Q-1) is 32 with radius 8; on Home it takes this pill shape and the 28 height.

## Changes to SPEC
1. **The page zooms out in edit mode** (56 % / 44 %) so the whole Home fits next to the 480 panel. SPEC has no zoomed canvas outside the org chart.
2. **Preview radius 12** in the panel rows. SPEC § 8 does not list 12. Alternative: 10 (popover) or 16 (card).
3. **Segmented control as pills**, 28 high (the code's `SegmentedControl` is radius 8, 32 high, Q-1).
4. **The added widget's accent outline**, 3 px, fading out in 1.5 s. SPEC § 11 has no "just added" highlight.
5. The widget card itself (radius 28, no border, soft shadow) is listed in `home-widgets`.

## New components
- **`WidgetEditChrome`**: handle, size tag, remove, outline. States: default, hover (outline 1.5 → 2), selected (3 px accent, lifted 8 px, level 4 shadow), dragging (level 4, 2° tilt), locked (Waiting on you: no remove button, as drawn).
- **`WidgetCatalogRow`**: preview, name, description, size switch, add / on your home. States: default, hover, dragging, added, search match.
- **`EditBar`**: the two-line bar on the header band (Colour) or on white (Light).

## Open questions
- Q-3 (how the layout with sizes is saved). See `handoffs/2026-11-11-home/QUESTIONS-to-add.md`. It is about storage only; the design does not change. It does not block.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** Edit home on `/dashboard`, from the end of the page or My profile —
  `components/modules/home/edit/EditHome.tsx`. Built 2026-11-11, **not yet looked at in a browser**.
- **Differs from the design:**
  - **The panel has no loading or error state** (EF04, EF07): the catalogue is the screen's own and never loads.
  - **Drag and drop is the browser's own** (no new library): the dragged item is the browser's drag image, not a
    level-4 card tilted 2°; the drop place is drawn as specified.
  - **"+" adds at the end of the order**; the dense grid then puts the widget in the first free place it fits.
  - The category counts and the list leave out My time and To sign (not built).
- **Images of the real screen:** owed by the first walk.
