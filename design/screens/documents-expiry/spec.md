---
status: built
screen: documents-expiry
owner: Ulia
updated: 2026-11-17
---

# Expiry — dates, reminders, the Expiring view, the Home widget (X01–X11, F4)

## What it is for
A document can have a last valid day. Whoever manages a person's documents sees what is about to expire or has expired, and asks for the new one. The person sees their own. Categories can require a date and set reminders.

## Where it lives
- Profile → Documents (`documents-tab`): an **Expires** column and an **Expiring** view.
- The preview's meta line.
- Upload and "Edit expiry date".
- **Settings → People → Document categories** (X07).
- Home widget "Expiring documents" (X10).
- The company-wide list is in `documents-section` (D02). It is not a People column or a report field (owner, 16 Nov).

## Layout
- **Expires column (X01).** It shows just the date.
  - Soon (inside the category's reminder window, 30 days by default): pending text with an hourglass.
  - Past: declined text with a cross.
  - Valid: grey.
  - No date: "—".
- **Expiring view (X02).** A fourth segment, "Expiring N", in the view switch. Same five columns. Expired first, then soonest. "Request the new one" on row hover (`documents-requests`).
- **All documents (F4 chosen):** grouped under folder headings.
- **Row ⋯ (X03):** a new item, **Edit expiry date**, after Rename. The rest is the approved menu.
- **Edit expiry date (X04).** Dialog, 400 wide.
  - Fields: "Valid until (optional)", a date field, and a hint: "Meryem and whoever manages her documents get a reminder 30 days before."
  - Footer: "Remove date" on the left (ghost); Cancel · Save.
- **Date picker (X04b, product rule).**
  - The date can be typed.
  - The year in the header opens a scrolling year grid, three per row; picking a year returns to its days.
  - Footer: "Today" on the left, "Clear" on the right.
- **Upload (X05):** the approved M3 gains one optional field, "Valid until". **X05b:** when the category requires it, the field is required, with the `FieldError` "Your company asks for an expiry date on passports."
- **Preview (X06):** the expiry sits in the meta line under the name: "Expires 26 Nov 2026" with an hourglass, in pending text.
- **Category editor (X07).** Settings › Document categories, per category:
  - "Requires an expiry date" (on/off).
  - "Remind … days before it expires" (1–365, or no reminder; the number field is dimmed while off).
  - "Visible to the person by default": a `SegmentedControl` with Hidden · Visible · The uploader decides.
- **Home widget (X10).** Follows `home-widgets`: S · M · L for those who manage documents, M for the person, and an empty state. It shows the next few, the count expired, and a link to the full list (D02).
- **Own view (X11):** the person sees the expiry of their own visible files.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | as `documents-tab` T16 | — |
| Empty | Expiring view with nothing: `EmptyState` "Nothing is expiring" (a good state). Widget empty: in X10 | X10, D09 |
| No results | as `documents-tab` | — |
| Error | as `documents-tab` T17 | — |
| No permission | The person never sees hidden files or their dates; the category page needs *Document categories — manage* | X11 |
| Normal | X01, X02, F4 | X01, X02, F4 |
| Long content | 90-character name row in X01 | X01 |
| Required date missing | X05b | X05b |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Edit expiry date | row ⋯ | X04 | no |
| Remove date | X04 | date cleared, state gone | no |
| Request the new one | Expiring row / preview | `documents-requests` R02 | no |
| Category settings | X07 | saved per category; a new date re-arms reminders | no |

## Words
`words.md`. Key strings:
- **Dates:** "Expires", "Expiring", "Valid until", "Edit expiry date", "Remove date", "Expires 26 Nov 2026".
- **Required date:** "Your company asks for an expiry date on passports."
- **Reminder hint:** "Meryem and whoever manages her documents get a reminder 30 days before." No "HR" in system text (product rule).

## Values
- Pending and declined text and icons: § 4.5.
- Date: tabular numbers (§ 5).
- Dialog 400 (§ 13.7).
- Widget per `home-widgets` (DESIGN_SYSTEM § 7, Home exceptions).

## Changes to SPEC
None beyond `documents-tab`.

## New components
- **ExpiryCell** — date + optional icon in three tones. Used in the tab, D02 and the preview.
- **YearGrid** inside `DatePicker` (product rule).

## Open questions
None blocks this.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** the tab's Expires column and Expiring view; Edit expiry date in a row's ⋯; Settings →
  Documents → Categories (X07); Home → Edit home → "Expiring documents" (`components/modules/home/widgets/
  ExpiringDocumentsWidget.tsx`). Built 2026-11-18, walked in the built-in browser the same day (`(claude)/HISTORY.md` § "Documents" → "The second part").
- **Differs from the design:** the Home widget is offered to anyone with documents VIEW, in all three sizes — for the
  person it lists their own (the read is scoped), and since 2026-11-19 they are offered M only (a documents VIEW that reaches only their own record); whoever sees others' documents gets S · M · L.

- **The designers' package of 2026-11-19, built 2026-11-20**, not yet seen in a browser:
  - ExpiryCell 14/20 500 with icons 14 — the hourglass amber, the crossed circle red; valid grey 400; none "—" (X1).
  - "Expiring" is always in the tab's switch, with its hourglass and "0" (X2, AQ-18 asks the designers to confirm).
  - Expiry date (X04, X3): the title "Expiry date", "Valid until (optional)", "Reza and whoever manages their
    documents get a reminder 30 days before." with the category's days (X11). Neither button is greyed: Remove date
    shows only while there is a date, Save with the field cleared removes it. The toast has no full stop (X6).
  - The preview's expiry strip (X7) and the upload's required-date error under Valid until, fields in X05's order (X8).
  - The category dialog (X10), as far as X12 allows: 560, the edited category's name under the title; "Needs an
    expiry date" with its hint and no box; "Remind before it expires" — a number 96, "days before", and a "Don't
    remind" checkbox that dims it; the hint; "Who can see new files" as three stacked options with icons.
- **Not built this round:** X4 and X5, the typeable field and the new date picker (AQ-02); X12, dropping Description and
  Active (AQ-19) — both stay in the dialog; X9, the categories page's own layout (it keeps the settings page frame).

## Built from documents-categories (AQ-19 — 2026-11-23)
*`hris/design/handoffs/2026-11-20-answers-from-design/specs/documents-categories`, plan `DESIGN_ANSWERS_2026_11_20_PLAN.md`
item 6. Code: `components/modules/settings/modules/documentCategories` (with a test). Not walked yet.*
- **X07's rows** have **⋯ with Edit and Delete** only (AQ19a); a system category keeps its lock. The second line is the
  category's rules, as drawn ("Expiry date optional · remind 30 days before · visible to the person"). **No description
  and no Active switch** — gone from the form, the list and the search; a category deleted with "keep" leaves the list
  and every picker (the upload form, Request many, the lifecycle task's category), and stays on its documents as a tag.
- **Delete** reads `GET /documents/categories/{id}/delete-impact` first: "Delete “{name}”?" with "{n} documents have
  this category" and the two options (AQ19b, c) — **Keep them as they are** (default, "Delete category", red) or
  **Move them to another category** with a select ("Delete and move", red; without a category picked it says so under
  the select). Nobody uses it: the plain confirm (AQ19d), "No documents have this category". `POST …/delete
  {strategy, targetCategoryId}`.
- **Templates follow the category (C3, 2026-11-23):** with "keep" (and for an unused category) it is cleared from the
  document templates and the lifecycle template tasks that name it — they file, or ask for, a document with no
  category; with "move" both move to the target. Running processes keep their copy; the journal line carries the
  counts. Not walked.
- **Differs:** the select is the product's searchable select, not a native one; the dialog is the md width (520).
