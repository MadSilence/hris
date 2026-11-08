# Brief: the stub screens, Automations, and the lifecycle processes

**From the owner's side, 2026-11-06. Input for drawing, not a spec.** It says what the product
already does behind each screen, what the owner has decided about it, and what is proposed. A screen
is still drawn into `screens/<name>/spec.md` by the protocol in `../HANDOFF.md`.

How to read every section:

- **What exists** — built functionality the screen can show today. If it lives on another screen
  now, that is said.
- **Decided** — the owner's answers. Draw to them. (They are recorded in the owner's decision log of
  2026-11-06.)
- **Ideas** — proposals from the analysis. Not decided: draw them only as options, and ask in
  `../QUESTIONS.md` if one matters to the layout.
- **States to draw** — every state the code can produce.
- **> Note for the designer** — a call the owner left to you. Answer it in the screen's spec.

Contents:

- Part A — the stub screens: profile tabs (Public profile, Salary, Tasks, Notes) and settings pages
  (Approvals, Notifications, Integrations, Export, API, Subscription, Support).
- Part B — Automations (being redesigned).
- Part C — Preboarding, Onboarding, Offboarding: templates, running processes, tasks, the preboarding
  page.

**Removed:** Settings → Automation → *Workflows* is gone (2026-11-06). It was only a stub, and
Automations is what the word means. Do not draw it.

| Screen | Where | State of the backend | What to draw now |
|---|---|---|---|
| Public profile | Profile tab | Field group exists; who may see it is undecided | Draw; the access rule comes later |
| Salary | Profile tab | Pay fields and the change journal exist | Draw |
| Tasks | Profile tab | Task system complete; one list endpoint missing | Draw |
| Notes | Profile tab | Nothing; new feature, rules decided | Draw |
| Approvals | Settings → Automation | Per-domain approvals exist | Draw the overview |
| Notifications | Settings → Automation | Catalogue exists in code | Draw the read-only catalogue |
| Integrations | Settings → Automation | SSO/SCIM, calendar feeds | Draw the directory; Slack/Teams card next |
| Export | Settings → General → Import & Export | ~19 exports on their own screens | Draw the hub and history |
| API | Settings → Tech | Nothing | **Hidden** until a public API exists — do not draw |
| Billing (was Subscription) | Settings → Admin | Designed, built in finalization week 5 | Draw for week 5; hidden until then |
| Support | Settings → Admin | Request ids only | **On hold** — do not draw |
| Automations | Settings → Automation | Complete | Redesign — Part B |
| Lifecycle | Settings → Automation, `/processes`, `/tasks`, `/preboarding` | Complete | Redesign — Part C |

---

# Part A — the stub screens

## The profile — common ground

The tab row, in the owner's order: **Public profile · Personal info · Documents · Time off · Salary ·
Attendance · Forms · Reviews · Tasks · Notes.**

Already on the profile, so do not repeat it inside a tab:
- **The header**: avatar, name, job title, manager (a link), team, time with the company, "View in org
  chart", the ⋯ menu (start a process, terminate, export personal data…).
- **"Waiting on you"** above the tabs: time-off decisions and reviews the reader owes about this
  person.
- **Personal info**: every field group the reader may see, position history, and (for automation
  admins) the automation runs about this person.

Each new tab gets its own permission, so a tab is either there or absent for a reader — draw no
"you may not see this tab" state inside it.

## A1. Public profile

**What exists**
- A field group named **"Public profile"**: preferred first and last name, pronouns, about me, based
  in, time zone, primary language, personal website, LinkedIn, skills, mentor (a person). Today it
  shows on Personal info like every other group.
- The org chart's person card: the person with their manager and direct reports.
- Celebrations: birthday, work anniversary, new joiner (as on Home).
- Photo upload from a phone by QR code, beside the avatar — today only on the welcome page.

**Decided** — who may see and edit these fields is **not settled yet**. Today colleagues cannot see
them and a person cannot edit their own. Draw the tab as the colleague's view, as intended; the rule
behind it will follow.

> **Note for the designer — which tab opens first.** Should a colleague land on *Public profile* and
> HR or the manager on *Personal info* (the first tab depends on what the reader may see), or is it
> one tab for everybody? Your call; write it into the spec.

**Ideas**
- A card layout, not a form: name with pronouns, about me, skills as chips, links, **local time**
  ("14:20 in Lisbon, 2 h ahead of you").
- **"Working with me"** — how I like to be contacted, working hours, focus days (one more field).
- Manager and direct reports as small cards.
- **Away line** — "Away until 12 Nov" when the person is on leave now or soon; never the leave type.
- Celebrations on the card when the reader may see the birthday.
- **Name pronunciation** — a text field first ("PET-r"), audio later.
- The person edits their own public fields in place.
- Later (designs parked): Praise and Goals would live here.

**States** — the person's own profile (editable) vs a colleague's; empty fields (a new hire who has
filled nothing: what does a colleague see?); long about-me; many skills; no manager; no reports.

## A2. Salary

**What exists**
- Money fields (amount + currency): **Base salary** (gross annual) and **Hourly rate**, both
  sensitive — a reader without the right sees them masked. Today they are on Personal info.
- The **Payroll information** group: pay schedule, overtime eligible, tax id (sensitive) and more.
- Position history: job, grade, from–to.
- Every change to a field is in the journal with its new value and who made it.

**Decided**
- **Salary history** is shown, read from the journal: date, old → new, who changed it. Read-only.
- **No dated pay table** (effective dates, reasons, scheduled raises): that is a future Payroll module.
  Do not draw "schedule a raise", "add a pay record" or "reason for change".
- Pay bands per grade do not exist.

> **Note for the designer — move or duplicate.** Should the pay fields **move** from Personal info to
> this tab (Personal info stops showing them), or **appear in both places**? Moving is the cleaner
> model (salary gets its own permission, e.g. "team lead without salary"); duplicating keeps
> Personal info complete for HR. Your call; write it into the spec.

**Ideas**
- A summary line: job, grade and time in the current position beside the amount; "Last change: +8 %,
  14 months ago".
- Derived figures — monthly equivalent from the annual amount and pay schedule (shown, never stored).
- History as a compact timeline with the percentage change per step.

**States** — no salary filled; masked (the reader may see the tab but not the amount, if the
permission design allows it — say in the spec); one value, no history; long history; two currencies
over time.

## A3. Tasks

**What exists** — the full task system (the same tasks as on `/tasks` and the process page; see
Part C): kinds, assignee, due date, "waits for", comments, questionnaires, files, reminders. Every
task can belong to a process (onboarding, offboarding) or be a system task (a review, an automation
approval).

**Decided**
- The tab lists **tasks about this person**.
- **HR and the manager chain** see all of them. **The person** sees only the tasks **assigned to
  them** — never a task where they are only the subject (an offboarding step must not leak through
  the profile).
- **First version: process and system tasks only.** No "Add task" outside a process.

**Ideas**
- Grouped by process ("Onboarding", "Offboarding", a review cycle, "Other"), open first, done
  collapsed.
- A progress line per process: "Onboarding · 12 of 18 · 2 overdue", linking to the process page.
- Filters: open / overdue / done; assigned to me / to the person / to others.
- The reader completes their own task in place (the task row already does this); others' tasks are
  read-only.

**States** — no tasks; only done tasks; overdue; waiting ("Planned for…"); a task the reader can act
on vs one they only see; the person's own view (only their assigned tasks); many processes.

## A4. Notes

**What exists** — nothing. A new feature.

**Decided**
- **Visibility is chosen per note**: *Only me* / *HR* / *HR and the person's managers*.
- Writing notes is its own permission.
- **The person never sees notes about themself**, and notes are not part of their personal data
  export.
- A note's text never appears in search, exports, notification previews or anywhere outside the tab.

**Ideas**
- A timeline, newest first; pinned notes on top; edit and delete by the author; "edited" mark.
- A category from a small fixed set (Performance, Conversation, Absence, General) for filtering.
- Mention a colleague — only one the note's visibility already includes.
- "Remind me on…" (later — it needs ad-hoc tasks).

**States** — no notes; a note per visibility (the visibility must be visible on the note: an icon or
a chip); a long note; the composer empty / typing / saving / failed; edit; delete confirm; a note by
someone who has left.

## Settings — common ground

The Automation group is now: **Automations · Lifecycle · Approvals · Notifications · Integrations.**
Each stub page today is gated by a placeholder right; each real page gets its own.

## A5. Approvals

**What exists** — approvals live in each domain; there is no common "approval" object, and that is
decided.
- **Time off**: per policy — approval required or not, the chain of approvers, a fallback when the
  approver cannot decide. Edited in the policy wizard's approval step.
- **Delegation**: a person delegates their approvals for a period (on `/preferences`); automatic
  delegation while on leave.
- **Automations**: a "Request approval" step creates an approval task.
- **Reviews**: approving peer nominations and a review.
- **A leaver's** pending approvals are reassigned in the termination flow.
- Approvers act on `/time-off/requests`, the inbox's *Needs action* and `/tasks`.

**Decided**
- The page is an **overview**: who approves what, with a link to where each chain is edited, and
  **the approvals waiting across the company**. Chains stay edited where they are.
- **HR may set a delegation for another person** (e.g. an approver who is suddenly ill). It is
  recorded as set by HR.

**Ideas**
- "Who approves what": every time-off policy with its chain, every automation with an approval step,
  review cycles needing approval.
- "Waiting": item, requester, approver, waiting since; stuck items first — approver on leave, has
  left, or none resolved — with *Remind* and *Reassign*.
- "Delegations": all active delegations, *Add delegation* for someone.
- Later: reusable chains, escalation after N days.

**States** — nothing configured; nothing waiting; stuck items; a delegation set by HR vs by the
person; an approver who has left.

## A6. Notifications

**What exists**
- A catalogue of notification types in code: each with its trigger, recipients, category (Approvals,
  Org changes, Policies, Documents, Tasks, System), channels and whether it is mandatory.
- In-app inbox; each person mutes categories on `/preferences`. **Who may mute** a category is a right
  in Roles & Access.
- About ten system emails (invite, preboarding link, password reset, security alerts, account locked,
  automation email…), one layout, in the recipient's language.

**Decided**
- The page starts as a **read-only catalogue**: every type — what triggers it, who gets it, category,
  channels, mandatory or not.
- **Who may mute stays in Roles & Access**; the catalogue shows it per category ("Can be muted by:
  Employee, Manager") with a link there.
- Company-wide defaults come later, with a second channel.

**Ideas**
- System emails listed with a preview per language and "Send me a test".
- Later: sender name and reply-to; a delivery log; channels (email, Slack/Teams) switched on here.

**States** — the catalogue grouped by category; a mandatory type; a type no one can mute.

## A7. Integrations

**What exists**
- **Sign-in and provisioning**: SSO (OIDC, SAML), SCIM with tokens, MFA policy — on Settings → Tech →
  Login & SSO.
- **Calendar feeds** (ICS): holiday calendars can be subscribed to from Public holidays. Personal and
  team feeds are built in the backend but on hold.

**Decided**
- The page is a **directory**: a card per connection that exists, each opening its own page. **Login
  & SSO stays in Tech**; its card links there.
- **Slack and Microsoft Teams are the first new integrations.** Not built yet; the design can prepare
  their cards and connection flow.
- No "coming soon" cards for connectors that do not exist.

**Ideas**
- A card shows status: "Connected to Okta · last sync 5 min ago", "Not connected".
- Slack / Teams: notifications to a channel or a person, a "who's out today" post, approving time off
  from a message.

**States** — nothing connected; connected; error (sync failing, token expiring).

## A8. Export (Import & Export → Export)

**What exists** — one export engine (CSV, Excel), every export recorded in the journal (who, what,
rows, format), and about nineteen exports, each a button on its own screen: People (as shown, or all
columns), roles and members, fields, offices, legal entities, departments, teams, job catalogue,
holiday calendars, time-off policies, attendance, the company calendar, review results, the activity
log, a person's personal data (ZIP), the import template.

**Decided**
- The tab is a **hub**: one list of everything the reader may export, grouped (People,
  Organisation, Time, Reviews, Audit), each with its format choice. Rows the reader may not export are
  absent, not disabled. The buttons on the modules' own screens stay.
- **Export history**: who exported what, when, how many rows, which format.
- *Import & Export* shows to anyone with an import **or** export right; the Import tab only with an
  import right.
- A full company export (one ZIP) comes later, with Billing.

**States** — the hub with few vs many rows; exporting (a large file may take seconds); failed;
history empty / filtered / long.

## A9. API — hidden

No public API exists. **Decided:** none before launch; the menu entry is hidden. Do not draw.

## A10. Billing (was "Subscription management")

**What exists** — nothing yet; the trial form promises 14 days.

**Decided** — the page is called **Billing**, behind its own right (paying is often an accountant's
job, not HR's). It is designed in the owner's go-to-market design and built in finalization week 5;
hidden until then. From that design: price per employee, EUR, monthly or yearly; seats = people
neither archived nor drafts; Stripe for payment; without a payment provider, *Request activation*.

**Ideas**
- A plan card: plan, price per employee, period, next charge, trial days left.
- Seats: used vs paid, who counts (a link to People).
- Invoices and payment method through Stripe's own portal.
- Usage of limited features (the AI assistant's budget).

**States** — trial (days left); active; past due; lapsed — the whole company read-only, with a banner
everywhere; sandbox / *Go live*; cancelling.

## A11. Support — on hold

**Decided:** not touched for now. Do not draw.

---

# Part B — Automations (Settings → Automation → Automations)

A rule says: **when** something happens, **for whom**, **do** these steps. Built in two rounds, the
second on 2026-11-04 and walked the same day; two checks (narrowed roles, a delegate) are still owed.

## B1. Screens today

**The list** — `/settings/automation/automations`
- Toolbar: search (name, description, and the rule's sentence); an *Archived* toggle (only when
  something is archived); *From template* and *New automation* (only for those who may manage).
- A row: name; the rule as a sentence — "When … · for … → does …"; the pause reason if paused; a
  status chip; last run; number of runs. A row opens the rule.
- **First run** (no rules yet): a hero with the template gallery and *New automation*.

**The rule** — `/new` and `/[id]`, one page (not a dialog)
- Header: name, status chip, ⋯ menu, primary button — **Publish**, or **Save** when only the name or
  description changed.
- Name and description, then three cards that read as one sentence: **When** · **For whom** (the
  shared audience builder, with a live count) · **Do** (the steps).
- A right column: **Preview** and **Try it** (*Send a test to me*, *Simulate one person*).
- Tabs on an existing rule: **Rule · Run log · Versions**.
- Banners: paused (reason and how to fix); the author has left or lost a right (*Take over*); "owned by
  the system, changed in <place>" (holiday calendar by office).

**The template gallery** — a dialog; picking one opens a new rule filled in; nothing is saved until
published.

**Elsewhere**
- The profile's Personal info: the last 20 runs about the person, each expandable, linking to its
  rule (automation admins only).
- `/tasks`: approval tasks from a rule, with *Approve* / *Decline*.
- Assignment dialogs (roles, departments, policies…): "Select everyone who matches" creates a **live
  rule**; each roster has a *History* toggle (assigned or removed, by which rule or by hand); the
  profile shows "From rule: …" or "Set by hand · *Return to rule*".

## B2. What a rule can do

**When — triggers**
- **Person hired** (on the hire date).
- **Termination scheduled** (the day it is recorded).
- **Last working day arrives.**
- **A date**: N days before / on / after the hire date, end of probation, last working day, date of
  birth, or any company date field; optionally every year.
- **Joins a group** (a live rule): when a person starts matching the audience. Leaving takes back only
  what this rule gave.
- **A field changes**, optionally from → to: hire date, end of probation, names, email, manager,
  position, department, office, legal entity, team (added / removed), status, any custom field. A
  change dated in the future fires on its **effective** day (default) or when **recorded**.
- **An event**: time off requested / approved / rejected / cancelled; a process completed; a review
  submitted / shared. Events have conditions — groups of *all / any / not*, up to 4 levels and 20
  conditions (e.g. leave type is Sick **and** more than 3 days). "Count days from": the event, the
  leave's start or its end.
- **A schedule**: daily, weekly (a weekday), monthly (a day or the last day), quarterly — once per
  person in the audience.
- **If the date is already past** (collapsed): run late (default) or skip; how late is still OK
  (default 30 days).

**For whom** — the People table's filters; empty means everyone. Checked when a run is planned and
again before each step.

**Do — steps**, in order, each with a day offset and an optional *Only if…* condition:
- **Notify** — the person, manager, manager's manager, department head, onboarding manager, a role, a
  named person; for time off also the approver, for reviews the reviewer.
- **Send email** — subject and body (people inside the company only).
- **Create task** — an assignee and a due offset.
- **Assign / Unassign** — role, department, team, office, legal entity, holiday calendar, position.
- **Grant a time-off policy.**
- **Start a review.**
- **Wait until** — a task from this run is done, or a field is filled; at most N days; then
  continue / stop / stop and tell.
- **Request approval** — approver, title, description, at most N days; a decline stops the run.
- Texts take placeholders — `@` inserts a field: `{firstName}`, `{department}`, `{leaveStart}`…

**Limits (decided — do not draw these)**: no branches or flowchart (one straight line of steps with
per-step conditions); a rule's changes never trigger another rule; no external email, webhook, Slack,
"update a field" or "start a process" step; no company-saved templates. The step menu offers only
what the author may do by hand.

## B3. A rule's life

- **Statuses**: Disabled (a draft is a disabled rule), Enabled, Paused, Archived.
- **Paused** by the system: something it points to is gone; the author has left; the author lost a
  right. *Resume* or *Take over*.
- **Versions**: every publish is a new version. With runs under way, publishing asks: keep them on
  the current version (default) or move everyone. Waiting and half-done runs always stay.
- **Enable** asks: only people from now on, or also those who already match (with the count). Above
  200 messages at once, a confirmation tick.
- **Preview** (updates as you edit): who matches now (count, names), who is past the moment; the next
  30 days of dated steps (late ones marked); each message rendered for a chosen person, with missing
  values; "N will be assigned, M skipped" and why; conflicts with other rules; messages per firing;
  problems that block publishing.
- **Publish** needs a name, at least one step and a clean, fresh preview; the reason it is held is
  written beside the button.
- **Try it**: a test to yourself, marked "[Test]"; *Simulate* one person's whole plan with dates,
  conditions, waits and approvals.
- **⋯ menu**: Enable, Resume, Disable (cancels scheduled runs; nothing done is undone), Archive,
  Unarchive, Duplicate ("Copy of …", disabled), Change owner, *Also tell* (extra people told about
  failures and pauses), Delete (only if it never ran).
- **The author** is whoever published the current version; every step runs with the author's rights
  as of that day.
- **Read-only** for a reader without manage rights, an archived rule, a system-owned rule.

## B4. The run log

- A run: Scheduled, In progress, Done, Skipped, Failed, Cancelled; flags *ran late*, *backfill*.
- A step: Scheduled, Waiting, Done, Skipped, Failed, Cancelled, Stopped — each with a reason in plain
  words (no longer matches, the person left, no approver, declined, timed out… about 27 reasons).
- Columns: person, version, status, reason, started, finished; a row expands into its steps (planned
  vs actual date).
- *Retry* a failed run, *Cancel* a scheduled one (manage rights).
- Filter by status; 50 per page.
- Only people in the reader's scope are listed, with "and N outside your access".

## B5. The 13 templates

Welcome email before the first day · A task for the manager on the first day · Confirm the end of
probation · Work anniversary · Birthday · A document about to expire · A long leave approved ·
Onboarding completed · Tell HR about a termination · Collect equipment on the last day · Moved to
another department · A monthly reminder to check one's details · Holiday calendar by office.
Categories: Onboarding, People, Celebrations, Compliance, Time off, Offboarding.

## B6. Who may do what

- **View** automations: list, rules, versions, run logs, runs on the profile.
- **Manage**: everything else. Even then, a person can only build steps they could do by hand.
- **Approve / decline** an approval task: the assignee (or their delegate — the button for a delegate
  is not there yet).
- Live rules from an assignment dialog follow that module's own right.

## B7. Known gaps (from the code)

- **No company-wide run log** — runs are listed per rule or per person only.
- The run log has no person filter or search (the backend could filter by person).
- A delegate has no *Approve* button on an automation approval.
- *Request approval* cannot name a role as the approver, though that was decided.
- *Wait until* cannot wait for an approval.
- Runs are kept forever.

## B8. Ideas for the redesign

- **A company-wide "Activity" view** of all runs (failures first, waiting, approvals pending,
  what is planned in the next 7 days) — the question "did everything work last night?" has no screen
  today. Needs one backend read.
- Show the rule's sentence large in the editor header, so the three cards read as one sentence.
- Run log: a person filter and search.
- The list: filter by status and trigger; a "needs attention" group (paused, failing) on top.

## B9. States to draw

- **List**: loading; error; first run (gallery + New); no search results; archived; a paused row
  with its reason; a reader who may only view (no buttons).
- **Rule**: loading; failed to load; read-only (no rights / archived / system-owned with its note);
  Publish held with each reason; Save-only mode.
- **Preview**: no trigger yet; updating; failed; an event rule (nothing can be dated ahead); nothing
  due; a sample with missing values; conflicts; problems; volume over 200 (amber).
- **Try it**: disabled until the preview is clean; sending; simulating; results.
- **Dialogs**: Publish (new / existing; with runs under way; with or without Enable; the backfill
  choice; the volume tick; error); Enable; Change owner; Also tell; Archive; Delete; unsaved changes.
- **Banners**: paused; author gone or lacking a right + *Take over*.
- **Do card**: no steps yet; each step collapsed and open; "add a task first" for *Wait until*.
- **Run log**: loading; error with retry; empty; empty for a filter; the outside-scope note; steps
  expanded; waiting and approval steps; a failure; Retry and Cancel.
- **Toasts**: published; published and enabled; saved; enabled / disabled / resumed with counts;
  owner changed; taken over; retried; cancelled.
- **Notifications** a rule sends: its message; task assigned; run failed; rule paused; wait timed out.

---

# Part C — Preboarding, Onboarding, Offboarding

Three **processes**: a set of tasks for a person, made from a **template**, run around a date — the
hire date (preboarding, onboarding) or the last working day (offboarding). The rework of 2026-11-02
is tested but **not yet walked** by a person.

## C1. How the three differ

- **Preboarding** — for someone **without an account yet**. They do their tasks on a **separate
  page** reached by a link sent by email, not in the app. The link lives 400 days, can be revoked or
  re-sent, and dies when the person registers or the process ends; their remaining tasks then move to
  `/tasks`. One preboarding per person, ever.
- **Onboarding** — inside the app, around the hire date. No limit on how many.
- **Offboarding** — around the **last working day**; labels read *By last day / Last day / The
  leaver / Offboarding manager*. Starts only once a termination is recorded; can start after the last
  day; cancelled automatically if the termination is taken back. One open offboarding at a time.
- They are not mirror images: offboarding lacks confidentiality, walk-out mode, re-hire and retention
  — known, not built.

## C2. Starting a process

**Always by hand**, from the profile's ⋯ menu — nothing starts on its own on hire or termination, and
an automation cannot start a process. *Start offboarding* appears only once a termination date
exists; terminating someone does not start one.

**The start dialog**
1. Choose a template (archived ones hidden) and the **onboarding / offboarding manager** (defaults to
   the line manager). A hire date or an email is asked for only if the person lacks one.
2. **The summary**, editable: each task with kind, due date and who does it, plus "waits for".
   Rename, remove (with undo), reassign to a named person. Problems: *Nobody assigned / Has left / Not
   an employee yet* block **Start**; *Cannot edit fields / Cannot upload* only warn.

Then the process page opens.

## C3. Templates — Settings → Automation → Lifecycle

Three tabs: **Preboarding · Onboarding · Offboarding**.

**The list** per tab: search; *Archived (N)*; *Add template* (asks a name only; names are unique).
A row: name, *Archived* badge, "N tasks · Updated <date> · description", a warning "Names somebody who
cannot take a task", and a small timeline sparkline. ⋯: Edit, Archive / Unarchive, Delete (refused
once the template has started a process). A ready "Standard onboarding" can also be installed from
Settings → Templates.

**The editor** — `/settings/automation/<type>/<id>`
- Header: the name (edited in place), *Saving… / Saved / Not saved*, **Preview**, ⋯ (Archive).
- **Timeline view**: days from −14 to +14, then weeks to day 90, then 30-day columns, plus a "Before
  start / By last day" column; day 1 (or the last day) is the accent line. **One lane per assignee**,
  each its own colour; *Add person* adds a lane for a named person. A task is a block with its kind
  icon and title. **Drag sideways** to change the day, **down** to change the assignee; **drag
  between handles** to make one task wait for another (a circle is refused). Click an empty cell or a
  lane button to add a task. Keyboard: arrows (Shift = a week), Enter, Delete, Esc, Alt+1 to fit.
- **List view**: grouped by phase — Before start · Week 1 · Month 1 · Later. The only view on narrow
  screens; the choice is remembered.
- **The side panel** of a task: title and description; the kind and its settings; **when** (before /
  on / after + days, or "by the start day"); **who**; **waits for**; warnings (the assignee has left,
  has not started, or cannot do this kind).
- **Autosave**, ~1 s after the last change. An incomplete task (no title, no assignee, a
  questionnaire without questions, an acknowledgement without material) is not saved — and today
  nothing says so (a gap worth drawing).
- **Preview**: what the person themself will see — the preboarding page, or their task rows — with
  example dates; fields and questions can be tried, nothing is sent.
- An archived template opens read-only.

## C4. Tasks

**Five kinds in a template**
- **To-do** — mark done; optionally *requires a file* (of a document category).
- **Fill fields** — the person's fields to fill; closes itself when they hold values.
- **Document** — upload a file; closes on upload.
- **Acknowledge** — read material and confirm; only the assignee can close it.
- **Questionnaire** — 7 question types, required or not; only the assignee answers. Answers belong
  to the person and survive the process being deleted (shown on the profile's **Forms** tab).

Any task can carry **material** (files or links). System task kinds also appear on `/tasks`: a review,
nominating and approving peers, approving a review, approving an automation step.

**Who does it**: *the person* (the new hire / the leaver), *the onboarding (offboarding) manager*, or a
**named person**. There is no "HR", role or group assignee — HR means a named person. Changing the
process manager moves their open tasks.

**When**: N days before / on / after the anchor date (calendar days), or "by the start day". There is
no "no deadline".

**Waits for**: a task may wait for several others; while waiting it is hidden from its assignee and
not reminded; when they are done or cancelled it opens, due today at the earliest.

**Comments**: a thread per task (up to 4,000 characters); the only kind of message.

**The task row** (shared by `/tasks`, the process page, the preview)
- Status icon (open / done / waiting / cancelled, struck through), kind badge, process badge, *Due*
  badge, *Waiting for X*.
- Meta: "Due <date>" or "Planned for <date>", "About <person>", "Done by", "Done on"; fields with ✓;
  "A file in <category>"; materials.
- Inline action per kind: *Mark done*; file picker + *Attach and mark done*; *I have read it*;
  *Upload*; fields + *Save* or *Fill in on the profile*; *Answer* → questionnaire → *Send answers*;
  for someone else's: *Waiting for X to confirm / answer*. Afterwards *See the answers*. *Comment /
  Comments (n)*.

## C5. Running processes — `/processes`

**The list**: search (person or template), *Archived* toggle. Columns: Person · Process (type +
template) · Starts · Onboarding manager · Tasks "done / total" + "N due" · Status. A Home widget shows
the same. **No filter by type or status** today.

**Statuses**: Planned (nothing done yet), In progress, Completed (all closed, or closed by hand),
Partially failed (a scheduled step failed), Cancelled; *Archived* is separate. A process completes on
its own when nothing is open or waiting; a date passing completes nothing.

**The process page** — `/processes/<id>`
- Title "<Type> for <name>" (the name links to the profile), status, *Archived*. Line: template ·
  start or last day · manager · the preboarding link, active or not.
- **Mark as complete**. ⋯: Change manager; Send a new link and Revoke link (preboarding); Cancel
  process; Archive / Unarchive and Delete (manage rights). Delete shows what goes and what stays
  (tasks deleted; documents, answers and history kept).
- **Date-moved banner** when the hire date or last day changed: which open tasks would move, and
  *Recalculate dates*.
- **The task list** with *Add task* and per-row ⋯ *Edit task / Cancel task*. Adding asks kind,
  settings, a real date (not an offset) and who. Editing changes title, description, date and who
  only. A task added here cannot wait for another. Cancelling a task opens what waited for it.

## C6. The new hire's side

- **The preboarding page** — `/preboarding?token=…`, phone-first: company logo, "Welcome, <name>",
  the company and the start date, progress "x of y done" / *You're all done*; task cards with
  materials and inline actions; *Ask a question* (comments on that task); "powered by noddo". Shows
  only the person's own open tasks. Some field types cannot be filled here (person, reference,
  address, money).
- Broken, revoked or expired link: *This link doesn't work* + a sign-in hint.
- After registering, tasks appear in `/tasks`. The welcome page has nothing about the process.

## C7. Who may do what

- **Templates**: view; edit (create, save); manage (archive, delete).
- **Processes** (by scope — e.g. a manager's people): view; edit (start, act on tasks for others,
  add / edit / cancel tasks, change manager, recalculate, the link, complete, cancel); manage
  (archive, delete).
- The **onboarding manager** has no access to the process page by being the manager — they see their
  tasks in `/tasks` (an open question).
- Comments: the assignee and whoever may view the process.
- Forms tab: process viewers see all answers; the person sees their own.

## C8. Notifications

Tasks assigned (once per start, and when a task opens, is added or reassigned) → each assignee · Due
today → assignee · **3 days overdue → the manager** · New comment → assignee and manager (not the
author) · A scheduled step failed → manager. In-app; the new hire gets no reminders; "by the start
day" tasks get no due reminders.

## C9. Known gaps (from the code)

- `/processes` says "Preboarding and onboarding under way" and its empty state forgets offboarding;
  the column reads "Starts" for an offboarding too.
- The start dialog's "no templates" hint names an old menu path.
- On the preboarding page every dated task reads "On the start day · by <date>" — likely a bug.
- The start summary cannot change a task's date.
- The new hire cannot comment once their last task is done.
- The process page lists tasks flat, with no grouping by phase.
- The *Start process* menu item is shown to people who may then be refused by the server.
- An incomplete task in the template editor is silently not saved.

## C10. Ideas for the redesign

- `/processes`: filters by type and status; group or tab by type; overdue first.
- The process page: tasks grouped by phase (as the template's list view) or by assignee; a progress
  bar; the timeline view read-only for a running process.
- Template editor: say why a task is not saved.
- The preboarding page: the date line fixed; a "your first day" block (where, when, whom to ask).

## C11. States to draw

- **Templates**: empty per type; no search results; archived; loading; error; a template with
  problems; read-only archived; an empty template ("No tasks yet"); a block per kind; a waiting arrow;
  a refused circle; lane warnings (has left / not started / nobody chosen); Saving / Saved / Not saved
  / save error; leave with unsaved changes; narrow screen; preview with nothing for the person.
- **Start dialog**: no templates; hire date or email needed; a blocking problem; a warning; a removed
  task (undo); refusals (already has a preboarding; already in an offboarding; the person has left…).
- **Processes**: none yet; archived; "N due"; each status. **Process page**: link active / none;
  date-moved banner; no tasks; closed (read-only). Dialogs: complete, cancel, archive, delete with
  impact (loading / failed), revoke link, change manager, add / edit task, cancel task.
- **Task rows**: open; due; overdue; waiting; done (+ *See the answers*); cancelled; someone else's;
  file required; fields inline vs *Fill in on the profile*; upload; a questionnaire with missing
  required answers; comments (none / loading / error / count). `/tasks`: nothing to do; *Show done*.
- **Preboarding page**: before the first day (with or without a date); progress; all done; a task
  done; broken / revoked / expired link; after registering; a file that cannot be opened.
- **Forms tab**: empty; answered; not answered.
- **Offboarding**: its labels everywhere; *Start offboarding* hidden until a termination exists;
  cancelled because the termination was taken back; the termination dialog's step listing the
  processes the leaver manages, each with *Reassign to…*.
