# Product-wide UI rules from the automations design

Ulia decided these on 6 Nov 2026 for the whole product, not for one screen. They are proposals for the owner's notes (`rules/`, then `node design/sync-rules.mjs`). Where a rule differs from SPEC, it is also listed under "Changes to SPEC" in the spec that uses it.

## Text
- **A number never breaks away from its word.** Join them with a non-breaking space (U+00A0): "3 requests", "14 days", "1 Mar", "48 people". This holds for translated strings and for strings built from placeholders ("{count} days") too.
- Copy is plain, not bureaucratic. No relative clauses between commas ("Marta, who set it up, left…").
- No hint that lists a dropdown's options or states the obvious ("Pick one or more days").
- **As few headings as possible.** Settings windows have no section headings, only a divider line. A control that explains itself has no label over it (no "How long" over [2 days] Before / After). Field labels stay.
- ~~"(optional)" is grey~~: withdrawn, because `FORMS_AND_FIELDS.md` § 3 wins (Q-5).

## Dates and times
- **Time format, date format and the first day of the week follow the company setting**, or each person's own setting where the company allows one. This applies to every time field, weekday picker, calendar and date picker (Q-4).

## Lists
- **Long lists scroll endlessly, with no pages** (run history, Activity, any log). A list that runs to the bottom of the screen has no bottom border, and a scroll thumb shows on the right. This matches § 1a "query screen".
- **Status filter chips carry counts**, All included ("All 312 · Failed 2 · Waiting 3").
- **In a list of runs, the date sits in grey under the status pill.** A "ran late" note is in the pending text colour.
- An action about a row ("See why") comes right after the status column.
- **List toolbar:** Search → a "Filters" button (opens the conditions builder) → only the one or two main filters as their own pills → status chips with counts on the next line.

## Controls
- **Don't reach for a dropdown by default.** Two or three options make a segmented control (Before / After, And / Or). On/off is a checkbox or toggle. A number or a time (14:30) is a typed field. Dropdowns are for long lists.
- **Options that open more settings are a radio list**, and the extra settings appear indented under the picked option.
- **Days relative to a date:** [N days] + Before / After, with an "On the day" checkbox below. Ticking it disables the number and Before / After.
- **Picking people or roles:** chips inside the field. The list shows roles first (The person, Their manager, Their manager's manager, Department head, Onboarding manager, then the company's roles), then people A–Z with avatar and "job · office". Typing filters both; the typed letters are bold.
- **Picking something a person has** (calendar, policy, office, team): options that change with each person come first ("Their office's calendar"), then the real items A–Z. Countries carry a flag (Q-3).
- **Filters / conditions, everywhere:**
  - The group is outlined, radius 10 (the board draws 12, see the specs).
  - Each condition sits in its own Mist card (radius 10, padding 8), on two lines: field + remove, then operator + value.
  - The And / Or switch is centred between conditions, with a hairline on each side. A nested group is dashed.
  - "Add a condition" opens the field list at once. The operator and value stay dimmed until a field is picked.
  - The result count ("48 people match · See who") sits on accent-subtle.
- **Filter pills:** an empty pill is white with a chevron. A picked value lives inside its own pill, which turns accent-subtle with an accent-ring border: "Automation: Long time off approval ▾ | ×". The chevron picks another value; × clears it.
- **A settings window over a canvas** ends above the zoom control and scrolls inside. Popovers inside it show over it in full.
- **Read mode for something live:** no disabled inputs. Values show as icon rows: a grey 16 px icon, the value 14/500, and a grey line under it saying what it is. An "Edit" button switches to the fields.

## Banners and toasts
- **A banner on a canvas** is white with a hairline border and shadow-1, so it stands off the dots. A warning banner uses the pending status colours. Never Mist on a canvas.
- **Toasts on a canvas screen** sit bottom left, 24 px from the bottom, level with the zoom control. A canvas map sits 8 px above the zoom control.

## Test data
- **Anything a test sends is marked [Test]** and goes only to the person testing. Wherever test items land (the test run, notifications, inbox, tasks), there is "Delete test items" with a count.

## Buttons
- **Archive confirm button, everywhere:** grey fill (`--text-tertiary` #6B6B70), white text, never the accent. Cancel beside it is ghost. Hover `--text-secondary` #45454A. This is a new button kind, listed under Changes to SPEC.
- **Actions about one item stay with that item; actions about the whole thing sit apart**, below a divider. For example, "Skip this step" goes under the failed step, and "Retry the run" goes at the bottom of the run window.

## Illustrations
- Always the real scene from the noddo set, never a stand-in. Errors use `something-broke`.
