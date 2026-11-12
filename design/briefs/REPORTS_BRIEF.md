# Brief: Reports and analytics

**From the owner's side, 2026-11-12. Input for drawing, not a spec.** The engine behind these screens is built;
nothing is drawn yet. Each screen is still drawn into `screens/<name>/spec.md` by `../HANDOFF.md`.

How to read it — as `SCREENS_BRIEF.md`: **What exists** (built, the screen can show it today), **Decided** (the
owner's answers; draw to them), **States to draw** (every state the code can produce), and **> Note for the
designer** (a call left to you).

## What exists

A report is **one definition** run with the reader's own rights every time it is opened:

- **Who it is about** — the People table's filters, leavers included or not.
- **Its shape** — a list of people with columns; numbers by one or two groupings; a trend over dates; or events
  in a period (hires, leavers, transfers, promotions).
- **Groupings** — department, team, office, legal entity, manager, job, level, status, employment type,
  termination reason, regrettable, the person themselves, any custom field; dates and numbers in bands (month,
  quarter, year, tenure bands, age bands, number ranges).
- **Measures** — headcount, people, share of total, sum / average / median / lowest / highest of a number or
  money field, average and median tenure, direct reports per manager; hires, rehires, leavers, turnover rate,
  regrettable turnover rate, retention rate, early leavers, transfers, promotions; and from the other modules:
  days and hours absent, absence rate, sick days and spells, Bradford factor, unused leave, requests waiting;
  hours logged and their cost; onboardings started and completed, days to complete, overdue tasks; average final
  and manager rating, reviews shared.
- **When** — live (today), on any past date, over a range of dates, and compared with another date.
- **A chart hint** is saved with the report (bar, line, pie…); the engine never reads it — the screen does.

Every number opens into the people behind it (the People table, where bulk edit, assigning, starting a process
already work). A change between two dates can be broken down by every grouping ("turnover rose 4 points; 3 of
them are Sales").

Reports are saved, renamed, copied, deleted, exported to XLSX or CSV, shared with people, teams, departments or
roles (to view or to edit), and published outside the company as a frozen snapshot. Fourteen templates ship in a
gallery.

The full list of capabilities, line by line: `(claude)/technical_design/REPORTS_CAPABILITIES.md` on the owner's side.

## Decided (2026-11-12)

- **Live and on a date are one report** with a date control — not two kinds of report.
- **Each person sees a report with their own rights.** A field a reader may see on only some people narrows the
  report to them, and **the screen must say so**: "Narrowed to the 12 people whose Salary you can see." A field they
  may see on nobody is left out, and the screen says that too.
- **History is honest.** Before a field's history begins, a past date shows it as unknown — draw "no history
  before 1 Nov 2026" rather than an empty chart that looks like zero.
- **Small groups are hidden.** An average of a sensitive or money field over fewer than three people is not shown
  — draw the hidden cell. In a publication, any group under five people has no numbers.
- **Outside the company only a frozen snapshot.** A publication shows the numbers as they were when published,
  only the fields the publisher allowed, aggregates by default (a list of names needs a second, explicit yes),
  expires in 30 days by default (90 at most), can be revoked, and counts its views.
- **Inside the company the link is the report's own address**; someone it is not shared with gets "not found".
- **Templates are tried before keeping**: a template runs on the company's data first; saving makes a copy the
  person owns.
- **AI later, with the assistant**: a question in words becomes a report; "why did this change" is answered from
  the engine's breakdown. Leave room for it; do not draw the assistant here.

## Screens, and the states to draw

**1. Reports list** — mine and shared with me; each with its shape, dataset, owner and whether I own it, may edit
or may view. States: none yet (lead to the gallery), loading, error, no permission.

**2. Gallery** — the 14 templates; each runs before saving. States: a template that cannot work in this company
("This company has no field X"); one that left a column out.

**3. A report** — the result and its controls: date (live / on a date / a range), compare to, groupings,
measures, filters, chart or table. States, all of which the engine produces:
- loading; error; no people; a result;
- **narrowed** (one or more fields, with counts); **fields left out** (the reader may not use them);
- **unknown before history** (per field, with its date);
- **hidden small cells** (a measure per row);
- money in several currencies in one cell (never converted);
- a table with more rows (paged), and a total row under numbers;
- too large / took too long (narrow the people or the dates);
- shared with me to view (no editing; *Save a copy*).

**4. Drill-down** — from a cell to its people; a live cell opens as a People-table filter, a past or bucketed cell
as a fixed list.

**5. Share** — grantees, view or edit, and the warning before sharing: who of them will not see which field.

**6. Publish** — choose the fields that may leave, the expiry, the second yes for names; then the link, shown once.
Publications list: live, expired, revoked, views.

**7. The public page** — signed out; the snapshot, its date and expiry; states: expired, revoked, not found.

> **Note for the designer** — where the report builder lives (a side panel on the result, or a separate step
> before it) is yours. The engine accepts any definition at any moment, so either works.

> **Note for the designer** — a navigation entry: the product has none for reports yet. Where it goes, and whether
> managers see it, is a question for `../QUESTIONS.md`.
