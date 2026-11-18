---
status: built
screen: documents-requests
owner: Ulia
updated: 2026-11-17
---

# Requests — "please upload this" (R01–R10)

## What it is for
Whoever manages a person's documents asks them, or someone else, to upload a document: a new copy of one that expires, or something new. The person gets a task, uploads straight into it, and the task closes by itself.

## Where it lives
On a person's Documents tab, a request can start from four places:
- ⋯ on an expiring file (R01);
- the preview's expiry line (R01b);
- the **Request** button next to Add (R05);
- the People table, for many people (R10).

The person's side is a box on top of their own tab (R07) and a Home "Do" card (R09). The company-wide list of open requests is in `documents-section` (D04).

## Layout
- **Request the new one (R02).** A dialog.
  - Subtitle: the file and its expiry ("Passport.pdf · expires 26 Nov 2026").
  - Fields:
    - "Who should upload it": a people picker with the person first, then anyone in the company (R03).
    - "Due by (optional)": a date field, "No due date" when empty.
    - "Note": prefilled, editable.
  - Footer hint: "Meryem gets a task and a notification. The task closes by itself when she uploads the file."
  - Buttons: Cancel · **Send request**.
- **Request documents (R06).** A dialog, "From Meryem Alaoui".
  - "What should Meryem upload": tick the documents to replace, in the same list look as the tab, plus **Something else · Anything new**.
  - Then the same Who / Due by / Note fields.
- **Something else (R06b).** "What do you need" is typed. It becomes the task title "Upload: Medical certificate".
- **Sent (R04).** A toast with Undo. Meryem gets a task and a notice.
- **Person's side (R07).** A request box on top of her tab: the title ("Upload your new passport"), "Asked by Lena Novak", "Due 23 Nov", the note set apart, and **Upload**.
- **Uploading for a request (R08).** The upload asks no folder and no category; they come from the request. Only the optional date is asked.
- **Home (R09).** A "Do" card in the Waiting on you deck. The due date is the main line, as on every Do card.
- **Many people (R10).** The result window: "Request sent", "Upload: First aid certificate · due 4 Dec", "Asked 35 people.", then "2 weren’t asked", each with why ("Hasn’t logged in yet" / "You can’t manage their documents"), and **Done**.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Send request button `loading` | — |
| Empty | No requests: the tab has no request box | `documents-tab` |
| No results | Who picker: "No one called …" (`PeoplePicker` standard) | R03 |
| Error | `FormError` in the dialog: "Couldn’t send the request. Try again." | — |
| No permission | Request items are absent for anyone who can't edit the person's documents (left out of menus, not disabled) | — |
| Normal | R02, R06, R07, R09 | R02, R06, R07, R09 |
| Long content | 35 asked / 2 skipped with reasons | R10 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Request the new one | R01 / R01b | R02 | no |
| Request | R05 button | R06 | no |
| Send request | R02 / R06 | Task + notification "Document requested"; toast with Undo | no |
| Upload | R07 | R08; the task closes when a file of that category is filed after the request | no |

## Words
`words.md`. Key strings:
- **Request window:** "Request the new one", "Request documents", "What should Meryem upload", "Replace a document", "Something else", "Anything new", "Who should upload it", "Due by", "No due date", "Note", "Send request", "Meryem gets a task and a notification. The task closes by itself when she uploads the file."
- **Person's side:** "Asked by Lena Novak", "Due 23 Nov".
- **Many people:** "Asked 35 people.", "2 weren’t asked", "Hasn’t logged in yet", "You can’t manage their documents".

## Values
- Dialogs: L 800 / M (§ 13.7).
- The request box on the tab: accent-subtle with an accent-ring border, radius card (§ 4.4, § 8).
- The Do card follows `home-widgets` (DecisionCard).

## Changes to SPEC
None.

## New components
- **RequestBox** — the person's request on top of their tab. Could be used for any task shown in context.

## Open questions
Q-41 (the company-wide requests list, for D04) blocks nothing here.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** Request beside Add on a person's tab; "Request the new one" on an expiring row; the
  person's own tab (the boxes, R07–R08); Home's card (R09); People table → tick people → Request documents (R10,
  `RequestManyDialog`). Built 2026-11-18, **not yet looked at in a browser**.
- **Differs from the design:** R10 names who was not asked by reason and count, not one by one.
