---
status: ready
screen: documents-categories
owner: Ulia
updated: 2026-11-20
---

# Document categories — Edit / Delete, and deleting a category that has documents (AQ-19)

Added 20 Nov 2026 — approved by Ulia ("noddo · Documents" board, page "★ New — for review", AQ19a–d, all Done). It adds to `documents-expiry` X07 (Settings › People › Document categories).

## What it is for
Taking a category out of use without archives. Deleting a category asks what happens to its documents.

## Where it lives
Settings › People › Document categories; a category row's ⋯. For whoever may edit the document settings.

## Layout and values
Exact values: `../../measurements/documents-categories/AQ19*.md` and the crops in `../../components/AQ19*`. The page is X07 as shipped.
- **AQ19a · the category ⋯.** Menu 220 wide, radius 10, 1 px #EAEAEC, shadow `0 8px 24px rgba(11,11,12,.12)`, padding 4; items 32 high.
  - "Edit" (icon `pencil-edit-02`, Ink).
  - A hairline (1 px #EAEAEC, margin 4 6).
  - "Delete" (icon `delete-02`, #C42B1C, hover #FDEDEB).
  - No Archive, no Active toggle, no Description anywhere — the pickers included.
- **AQ19b · deleting a category with documents.** Dialog 520.
  - Title "Delete “Certificates”?", with "12 documents have this category" under it.
  - Two options, 16 apart, radio 16 aligned to the first line:
    - **"Keep them as they are"** — the default — with "They keep the “Certificates” tag. Nobody can pick it for new files." under it;
    - **"Move them to another category"**.
  - Footer: Cancel · **"Delete category"** (red fill #C42B1C).
- **AQ19c · move chosen.**
  - A select 36 high appears under the option text: 1 px #DADADF, radius 8, value "Identity", chevron `arrow-down-01`.
  - The button reads **"Delete and move"** (red).
- **AQ19d · a category nobody uses.** A plain confirm: "Delete “Payslips”?" / "No documents have this category", then Cancel · "Delete category" (red).

## States
| State | What the reader sees | Image |
|---|---|---|
| Normal | AQ19a–d | images/*.png |
| Loading | The red button's loading state, as every confirm (the shared Button) | — |
| Error | The product's standard error toast | — |
| No permission | No ⋯ on the rows | — |

## Actions
| Action | What happens | Confirms? |
|---|---|---|
| Edit | Opens the category dialog (X07) | No |
| Delete — keep | The category is gone from the list and the pickers. Its documents keep the tag | The dialog is the confirm |
| Delete — move | The documents move to the chosen category; then the category is deleted | The dialog is the confirm |

## Words
`words.md`.

## Changes to SPEC
None.
