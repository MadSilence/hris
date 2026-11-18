# Product-wide UI rules from the automations design

Ulia decided these on 6 Nov 2026 for the whole product, not for one screen. They are proposals for the owner's notes (`rules/`, then `node design/sync-rules.mjs`). Where a rule differs from SPEC, it is also listed under "Changes to SPEC" in the spec that uses it.

## Text
- **A number never breaks away from its word.** Join them with a non-breaking space (U+00A0): "3 requests", "14 days", "1 Mar", "48 people". This holds for translated strings and for strings built from placeholders ("{count} days") too.
- **An article never breaks away from its word** (Ulia, 17 Nov 2026). Join "a", "an", "the" to the next word with a non-breaking space: "a task", "the file". All UI text: hints, explanations, dialogs, empty states, emails.
- **The system never uses "HR" as a concept** (Ulia, 17 Nov 2026). Permissions, visibility, reminders, settings and system text never say "HR" ("HR only", "Meryem and HR get a reminder", "for HR"): name the person, or what they can do ("whoever manages her documents"). A person's own job title or a company's own role may of course be "HR" — that is their data, not the system's word.
- **Buttons and action links are short** — a few words ("Add another signer", "Add next signer"), never a sentence.
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
- **A dropdown is its own search** (Ulia, 17 Nov 2026). Typing goes straight into the dropdown's field; the list under it narrows and the typed letters are bold. Never a separate search box inside the open list — one field, one list.
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

## noddo AI — where it lives (Ulia, 12 Nov 2026, decided while designing Reports)
- **One AI, one history, several windows onto it.** A conversation exists once. It is never copied between places.
- **A feature may have its own AI window** that shows the same history filtered to that feature and keeps that feature's own actions.
  Reports: the "Ask noddo" tab — only report questions, with "Save to my reports", "See the N people", the subject tag ("About: People · 7 reports").
- **The general AI chat shows everything**, each conversation marked with where it came from (Reports, Company hub, Automations…).
  Opening a feature's conversation from there opens it in that feature's window, with its actions.
- **You ask where you work; you never have to decide where to go.** The general history is for finding something old.
- **From Home (the AI box):**
  - asked to go somewhere or find something ("show me people in Sales who joined this year") → noddo takes the person to the right screen with the right filter already applied (here: People, filtered). No chat in between.
  - asked to do something → it opens the general AI chat and continues there.
- **The button is always called "Ask noddo"**, with the spark icon. Its label is never rewritten per place ("Ask about People" is wrong); the place travels as a removable subject tag inside the field.
- **The AI input is always the same AI box** (Home `AiBox` look: white, 56 high, radius 18, level-2 shadow, spark, placeholder, arrow-up send 40 × 40). Never a smaller or restyled one, never merged into a search field.
  A long text grows the box upward to 6 lines, then it scrolls inside; "Shift + Enter for a new line". The box does not change position between states.
- Fields that do one local job stay where they are: the Company hub ask / search field, "Draft with AI" in Automations.
- **Not designed yet:** the general AI chat itself has no place in the product (no sidebar item; today only the Home AI box). A task of its own.
- Questions for Petya (to `design/QUESTIONS.md` when the general chat is designed): one store of conversations with a "source feature" on each; what "go and filter" from Home can reach at launch.

## Selection and lists (Ulia, 17 Nov 2026, decided while designing Documents)
- **A list of records has no frame.** No card border or shadow around a table: only the column header and hairlines between rows. (Documents first; other lists when they are next touched.)
- **The selection bar sits right above the list it acts on** (under the folders in Documents), not in the toolbar's place. White, 48 high, radius 10, hairline border, and **its shadow and border tinted with the company color** — a deliberate exception to SPEC § 7 ("shadows are never tinted"), listed under Changes to SPEC. Selected rows are accent-subtle, as SPEC says.
- Inside the bar: checkbox · "3 selected" · a short divider · "Select all 7" … actions on the right · a divider before the destructive one · × at the end with no divider of its own.
- **Empty, no-results and error states sit in the vertical centre of the free area**, never just under the toolbar.
- **Search field:** the accent border is only the focus state; a filled search that is not focused keeps the grey field border (Wine reads as red).
- **Date pickers, everywhere:** the date can be typed straight into the field ("14 Mar 2031"). In the calendar, the month and the year in the header are each a picker: clicking the year turns the same calendar into a scrolling grid of years, three per row (this year in the accent, the picked one filled); one click on a year goes straight back to the days of that year. No typing the year, no paging month by month. No dropdown on top of the calendar: never a window in a window. Footer: "Today" on the left (accent text), "Clear" on the right (grey). The calendar opens 8 px under the field. The first weekday follows the company setting.

## Pages in the company's brand (Ulia, 17 Nov 2026, decided while designing signing)
Every page that carries the company's brand instead of noddo's ends with the same footer. These pages are the guest signing page and its states, the phone drawing page, and a new joiner's signing page.
- **The wording is one line: "Signing powered by noddo".** The noddo part is the grey wordmark, 15 high, never typed. Signing pages always say "Signing powered by", never just "Powered by".
- **Placement:** centred on the page, not on a column; 44 high; Hint style in tertiary grey; 5 px gap before the wordmark.
- **The wordmark's letters sit on the text's line**, centred to the text vertically. Its nodding "o" hangs a little lower, so the image is lifted 1 px (`top:-1px`), not pushed down.
- **Phone pages from a QR code:** the company colour band on top with the logo, white below, no rings, and the same footer.
