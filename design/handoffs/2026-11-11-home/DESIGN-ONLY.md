# In the design, not in the code

Checked against `MadSilence/hris` main @ f1ca618 (9 Nov): `components/modules/home/*`, `models/home`, `api/modules/home`, `api/modules/attendance`, `useSaveHomeLayout`. Each item says what the design does, what the code does today, and where to see it. Ulia decided all of these. Where an item goes against an owner rule (`HOME_AND_SEARCH.md`), the rule changes to match the design.

**Ulia's word (11 Nov):** every element is built as drawn. Nothing in the design is cut or simplified to fit today's code. Where a card kind or a widget needs a module that does not exist yet (e-signing, expenses), it arrives with that module, drawn as it is here.

**Size** is a rough guess: S is UI only, M is UI plus API, L is a new module or engine work.

## 1. The page and the layout

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 1.1 | **One free grid** of 4 columns with three sizes per widget (S 1 × 1, M 1 × 2, L 2 × 2), dense flow, no group headings. | Widgets in group sections (Personal, Company, HR, Utilities), each a 1–3 column grid of equal cards. | HF01–HF04 | M |
| 1.2 | **Saved layout carries order across all widgets and a size per widget.** | `homeLayout: [{ id, hidden }]` in user settings; order only within a group. Needs a size per widget and one order across all widgets (Q-3). | EF01–EF16 | M |
| 1.3 | **Role defaults:** Employee / Manager / HR sets, with sizes (`home` spec, "Default layout"). Reset to default returns to them. | One default order, the catalogue's. | EF13 | S |
| 1.4 | **Header band** Colour / Light, a per-person choice saved with the layout. | A plain greeting row; no band. Saved per person (Q-4). | HF01, HF02, EF17 | S |
| 1.5 | **Greeting 52 px** + date above it; **My profile** trigger and menu top right. | Greeting as the page title, date and "· 3 unread" link under it; Customize button on the right. The unread link moves to the Inbox link on Waiting on you. | HF01, P01 | S |
| 1.6 | **AI box** next to the greeting: search people, run actions, ask noddo. | None on home. `AiPromptField` exists in automations. | A01, A02 | M–L |
| 1.7 | **Edit home** in place: the page zoomed out, a widgets panel to drag from, size switch, remove, Reset, Cancel with confirm, Save. | Customize: a separate list with show/hide and move up/down within a group. It goes away. | EF01–EF18 | M |
| 1.8 | **Widget card**: radius 28, no border, soft shadow, title 20, big numbers (Changes to SPEC in the specs). | `HomeCard`: SPEC card. | all | S |

## 2. Waiting on you

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 2.1 | **A deck** of one card at a time, 1 of N, Skip. | A list of the newest five time-off requests. | LW01 | S |
| 2.2 | **Approve from Home** with Undo for 5 s; Decline opens the request with the reason focused. | Read-only; the request opens. The owner rule "home writes nothing but its layout" changes. | LW01c | M |
| 2.3 | **Skip** moves a card to the back for this person, kept between visits. | None. Kept per person (Q-5). | LW01d | M |
| 2.4 | **Card kinds beyond time off:** expense, attendance correction, document to sign, review, task, missing profile data, policy to confirm, answered request, announcement, failed automation. | Time-off requests and cancellations. Reviews, tasks and automation runs exist as modules but not in this feed. Expenses, e-signing, policy confirmation, announcements and profile-data requests do not exist. Build the feed so a kind is one more source. | LW01b | L (per module) |
| 2.5 | **Facts on the card:** overlap warning ("Rūta from Design is out on 12 Nov too"), working days, balance after. | The decision context read (`/time-off/requests/{id}/decision-context`) holds most of this. | LW01, LW01b | S |
| 2.6 | **Shown with "All caught up"** when nothing waits. | Hidden when nothing waits. The owner rule changes. | LW01 | S |

## 3. The other widgets

| # | Widget | Design | Code today | Frames | Size |
|---|---|---|---|---|---|
| 3.1 | Time off | Hero balance of the main type, other types as a list, the nearest request as a pill + "+N", Request time off. | My time off: balances per policy and the next leave; request link to the profile tab. Same data. | LW02 | S |
| 3.2 | Next time off | Countdown to the next approved leave **or public holiday**, whichever is first. | Upcoming holidays is its own widget (`/users/{id}/public-holidays`). Fold it into this one. | LW03 | S |
| 3.3 | My time | A **running clock**: Start the day, Break / Back to work, Finish the day; today against the day's target; breaks; last 7 days. | Attendance logs finished spans (`logEntries` with start and end). No running entry, no breaks. The target per day exists (`normMinutes`). Needs a running entry and break spans. | LW04 | L |
| 3.4 | Who's out | M: today's list; L: the week as lanes; S: a count. Pending as a dashed bar. | `/home/whos-out` with TODAY / WEEK and TEAM / EVERYONE, disclosure rule. Same data. | LW05 | S |
| 3.5 | This week | Today first, then the rest of the window; hero for one, faces for many, confetti. | `/home/celebrations` (today, or the next 7 days with `upcoming=true`). Use the 7-day read and split it into today and later. Birthdays show only for people who chose to show theirs: a per-person opt-in, which does not exist. | LW06 | S |
| 3.6 | To sign | Pending documents to sign, due dates, Sign. | No e-signing. The widget waits for the module. | LW07 | L |
| 3.7 | My tasks | Tick a task done on Home, with Undo; Today / This week; overdue first. | Read-only list of five; doing happens on `/tasks`. The owner rule changes. | LW08 | M |
| 3.8 | Processes | Rows with progress (steps done / total) and overdue steps; status chips. | Open processes, soonest first. Needs steps done / total and overdue count per process. | LW09 | M |
| 3.9 | Automations | Runs this week, per-day dots, the failure of today with Fix it, the next run. | On / waiting / failed counts and the automations that need a look. Runs exist (`/automations/runs/search`); needs a per-day count and the next scheduled run (Q-6). | LW10 | M |

## 4. Small behaviour

| # | Design | Code today | Size |
|---|---|---|---|
| 4.1 | Lists scroll inside a card; a widget never grows. | Cards grow with their content (max five rows). | S |
| 4.2 | Who's out remembers My team / Everyone per person; S follows it. | Local state. | S |
| 4.3 | Toasts with Undo for approve, task done, finish the day, add, remove, reset. | None on home. | S |
| 4.4 | Waiting on you has no remove button in Edit home. | — | S |
