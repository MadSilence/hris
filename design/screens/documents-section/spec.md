---
status: built
screen: documents-section
owner: Ulia
updated: 2026-11-17
---

# Documents in the sidebar (D01–D06, D09–D12)

## What it is for
People who manage other people's documents get one place for everyone's documents. In it they can:
- find any file;
- see what is expiring;
- see what is out for signature and whose turn it is;
- see which requests are open.

## Where it lives
A new main-navigation item, **Documents**, under Organization (file icon).
- **Only for managerial roles:** anyone who may see or edit other people's documents. An employee has no Documents item; their own documents are on their profile (owner, 17 Nov).
- Route `/documents`, with the views as `?view=all|expiring|signing|requests`.

## Layout
1. **Page title** "Documents" + "Everything you can see, from every profile."
2. **Views** (`SegmentedControl`, with counts):
   - All documents 1,284
   - Expiring 12 (hourglass)
   - Out for signature 5 (signature icon)
   - Requests 8 (request icon)
3. **Toolbar:** Search "Search documents or people" · **Person** · **Category** (`FilterChip`s) · Clear all (when something is picked) · on the right a **Request** button (secondary).
   - **Only these two filters** (owner). Each opens a menu with ticks and counts. The menu has no separate search row.
   - With several values picked, the pill keeps one line: "Category: Identity +3".
4. **The list** — no frame (product rule). It depends on the view:
   - **All documents (D01).**
     - Columns: checkbox · Name (the file tile; a signed file has the green signature mark) · Person (avatar 22 + name) · Category · Expires · Who can see · Uploaded ↓ · quick actions on hover (Download, Star, ⋯).
     - A row opens the preview.
   - **Expiring (D02).** Columns: Name · Person · Category · Expires ↑ · Uploaded · an action.
     - Expired come first (red), then soonest (amber). There are no group rows.
     - Hover shows **Request the new one**. Once asked, the row says "Asked on 17 Nov" with a check.
   - **Out for signature (D03).**
     - Columns: Document · About (the person) · Waiting for (avatar + name + "Step 2 of 2", or a guest icon + "Guest · step 1 of 1") · Due ↑ (date + "in 30 days", amber when ≤ 3 days, red when past) · Status pill (Out for signature / Expired / Declined) · ⋯.
     - Declined and expired stay until someone sends again or deletes.
     - A row opens the preview with the Signing panel (`documents-send-for-signature` S07).
   - **Requests (D04).**
     - Columns: What ("Upload: Passport") · Who uploads · Asked by · Due ↑ · Status (Overdue amber / Waiting grey / Uploaded green) · ⋯.
     - Uploaded requests stay for 30 days, then drop off.
5. **One person picked (D06).** A strip above the list: avatar, name, "Senior product designer · Design", and **Open profile** →, which leads to their Documents tab with folders.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Title, views and filters at once; rows as skeleton with shimmer | D11 |
| Empty | Expiring with none: `EmptyState` "documents", "Nothing is expiring" / "Every document with a date is valid for at least 30 more days." (a good state) | D09 |
| No results | `EmptyState` "no-results", "No documents match" / "Try fewer filters." + Clear all | D10 |
| Error | `ErrorState`, "We couldn’t load the documents" / "Nothing is lost. Try again in a moment." + Try again | D12 |
| No permission | The item isn't in the sidebar for someone with no rights over others; a direct link shows `ErrorPage` 403 | — |
| Normal | D01–D04 | D01–D04 |
| Filters | D05 (Category open, four picked), D06 (one person) | D05, D06 |
| Long content | A 90-character name cuts with … and a tooltip; 1,284 rows scroll endlessly (product rule) | D01 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open a row | any view | Preview (with the Signing panel on D03) | no |
| Request the new one | D02 hover | `documents-requests` R02 | no |
| Request | toolbar | R06 for a picked person, or a person picker first | no |
| Open profile | D06 | Profile → Documents | no |
| Filter / Clear all | toolbar | The list follows at once | no |

## Words
`words.md`. Key strings:
- **Page and views:** "Documents", "Everything you can see, from every profile.", "All documents", "Expiring", "Out for signature", "Requests".
- **Toolbar:** "Search documents or people", "Person", "Category", "Clear all", "Request".
- **Rows:** "Request the new one", "Asked on 17 Nov", "Waiting for", "About", "Step 2 of 2", "Guest · step 1 of 1", "Overdue", "Waiting", "Uploaded", "Open profile".
- **Empty and error states:** "Nothing is expiring", "No documents match", "Try fewer filters.".

## Values
- Page as the app's list pages: title in § 5 page style, with a 4 px gap to the subtitle.
- Table per § 13.5.
- `FilterChip` per § 13.4, with the product rule's picked state: accent-subtle + accent-ring + "|×".
- Person avatars 22 (§ 13.6).

## Changes to SPEC
None beyond `documents-tab` (no frame on lists).

## New components
None. These are the existing table, `FilterChip`, `SegmentedControl`, `EmptyState` and `ErrorState`.

## Open questions
Q-41 — the API for the company-wide lists and who gets the Documents item. Blocks nothing in the design; the code side says what the API needs.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** the sidebar's Documents → `/documents` (`components/modules/signing/components/
  DocumentsSection.tsx`). Built 2026-11-18, **not yet looked at in a browser**.
- **Differs from the design:** the Person filter is the people picker without counts per person (the backend gives no
  counts per person or category yet).
