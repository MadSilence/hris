# Brief: Documents — templates written in noddo

**From the owner's side, 2026-11-18. Input for drawing, not a spec.** This is the Templates round the documents
handoff of 2026-11-17 left out (`handoffs/2026-11-17-documents/README.md`, "Scope"). Each screen is drawn into
`screens/<name>/spec.md` by `../HANDOFF.md` and built only when its spec says `status: ready`.

How to read it — as `DOCUMENTS_BRIEF.md`:

- **Decided** — the owner's answers. Draw to them.
- **What the code does** — built, or being built now from this brief's decisions; the screen can rely on it.
- **States to draw** — every state the code can produce.
- **> Note for the designer** — a call left to you. Answer it in the screen's spec.

The words quoted are proposals in the product's voice; better words are welcome in the spec. Every string is
translated into Russian by the code — Russian stays in the product (Q-42, answered by the owner on 2026-11-18).

---

## 0 · What changed, in one page

**A template used to be a Word file with `{{placeholders}}`, uploaded.** That is gone (`QUESTIONS.md` Q-44). On
2026-11-18 the owner decided:

| | Decided |
|---|---|
| **Where a template is written** | In noddo, in the same editor as the company hub's pages ("/" menu, drag handles, headings, lists, tables) |
| **Fields** | **Chips** in the text — "Full name", "Start date", "Salary" — picked from a list, never typed. A chip is filled from the person's profile when a document is made |
| **Where people sign** | **Signature blocks** in the text — one per signer, with the signer's label under the line ("Employee", "Employer") |
| **Versions** | A template has a **draft** and **published versions**. Documents are made from the published one, and each remembers its version |
| **The PDF** | Made by noddo in the company's style — its logo and colour from Appearance, page numbers — not by Word |
| **Word** | Only a door: **import** a lawyer's .docx into a new draft, **export** a template as .docx. There is no "upload a file" template any more |
| **The AI** | Drafts a template with real fields, proposes edits as changes to blocks, and checks it. **A person publishes** — the AI never does |
| **Later, not in this round** | Conditional blocks ("only for contractors"), repeating sections, one template in several languages. Leave room; do not draw them |

What does not change: everything the documents round drew — sending, signing, the Signing panel, the automation step,
the process task. They read "who signs" and "time to sign" from the template, exactly as drawn.

---

## 1 · The templates list

**Settings → People → Document templates**, behind the right *Document templates — manage*.

### What the code does
- Name, description, category (documents made from it are filed there), active or not.
- Signers in short ("The person, then their manager"), time to sign, the published version and when.
- **Problems** — a template whose published version uses a field that was renamed or deleted since, or a signer with no
  place to sign. Shown before anybody tries to use it.

### States to draw
- The list: name, category, signers in short, version ("v3 · 12 Nov"), a draft waiting ("Draft changes"), problems,
  inactive.
- Empty: what a template is, **New template**, **Import from Word**.
- Loading, error, no results — the standard ones.

> **Note for the designer:** "New template" may offer a few starters (an NDA, an offer letter, an employment contract)
> written by us, or the AI's "Draft with AI" (§ 7). Your call how the first step looks.

---

## 2 · The editor

A full page, like the hub's page editor. The text on the left; the template's settings beside it.

### The text
- The hub editor's blocks: paragraphs, three heading levels, bulleted and numbered lists, tables, a divider, and a
  **page break** (new for templates).
- **A field chip.** Typing `{{` or "/" → *Field* opens the list of fields; picking one puts a chip in the text.
  The list (the code's vocabulary):

| Group | Fields |
|---|---|
| The person | First name, Last name, Full name, Email, Date of birth |
| Their job | Job title, Department, Office, Legal entity, Employment type, Manager |
| Their dates | Start date, Last working day, Probation end |
| The company | Company name |
| The document | Today |
| Custom fields | Every custom field of a printable type — text, number, date, email, phone, link, a choice, country, language, currency, time zone |

- Dates print written out in the company's language ("9 June 2026").
- **A chip that cannot be filled any more** (its field was deleted or changed type) is shown as a problem in place.
- **A signature block.** "/" → *Signature* → which signer. It shows a line, the signer's label under it, and is
  where the signature is drawn on the signed PDF. **Every signer has exactly one block.** A signer with none, or a
  block for nobody, is a problem that stops publishing.

### The settings beside it
- Name, description, category.
- **Who signs** — the `SignerSteps` the documents round drew ("Also used by Templates later"): steps as boxes, *Add
  co-signer*, *Add next signer*. A signer is **the person**, **their manager**, **a named person** or **a guest** (a
  name and email asked when sending). **Each has a label** — "Employee", "Employer", "Witness" — which the sending
  screens, the signing page and the certificate show.
- **Time to sign** — days, 30 by default (1–365).
- **"Needs a qualified signature or paper"** — a German fixed-term contract, any termination letter. Such a document
  can be made, never sent for signature in noddo: "This document needs a qualified signature or a signature on paper.
  Sign it outside noddo and upload it."
- **Active** — an inactive template is kept but offered nowhere.

### States to draw
- Empty draft; a long contract (6 pages, two tables); a chip with a problem; a signer with no block; saving.

> **Note for the designer:** how a chip looks in the text (it prints the value, so it must read as "filled later"),
> and how the signature block looks in the editor versus on the PDF.

---

## 3 · Drafts, versions, publishing

### What the code does
- **The draft** is saved as you type. Nobody else sees it until it is published.
- **Publish** makes a new version; it is refused while there is a problem. A short note "What changed" may be given.
- **Versions** are listed — number, who, when, the note. A published version never changes.
- **Compare** two versions: the blocks that changed.
- **Restore** an older version into the draft.
- A document made from a template remembers its version ("Made from Employment contract v3").

### States to draw
- The draft ahead of the published version; publish refused with problems; the version list; a comparison; restoring.

> **Note for the designer:** versions in a side panel, a tab, or a separate page — your call.

---

## 4 · Preview

- **For a person**: the PDF exactly as it will be made for them, with the values **as you may see them**. A field you
  may not see for them, or an empty one, is shown as a problem rather than filled — the same refusals as making the
  document (§ 6).
- **With sample values**, when no person is picked.
- In the company's style: its logo, its colour, page numbers. Nothing is filed.

---

## 5 · Import from Word, export to Word

### Import
- **Import from Word** — a `.docx` becomes a **new draft**. Carried over: paragraphs, headings, bold, italic and
  underline, lists, simple tables, page breaks.
- The lawyer's `{{placeholders}}` become chips; `{{sign:…}}` marks become signature blocks.
- **What could not be carried over is listed beside the draft**, never dropped silently: images, text boxes, tracked
  changes, columns, unknown placeholders ("{{salary}} is not a field noddo knows — pick one or remove it").
- Refusals: "This Word file couldn't be read." · "Only a .docx can be imported." · up to 20 MB.

### Export
- **Export to Word** — the draft or a version as a `.docx`, chips written as `{{…}}`, so the lawyer's edits import back.

---

## 6 · Making a document from a template

On a person's profile → Documents → **Make from a template** → pick → a PDF appears in their Documents, in the
template's category, hidden from the person unless the category opens it.

- Values are read **as the person making it may see them**. A field they may not see refuses the whole document — "The
  template uses Salary, which you can't see for this person." An **empty** field refuses it too — "These are empty for
  this person: Start date, Based in. Fill them in first." (A contract with a hole is worse than none.)
- "Couldn't make the PDF right now. Try again in a minute."
- The made document can then be sent for signature — the round already drew it.

### States to draw
- Pick (with the template's signers in short); made (the new PDF in the list); refused for a hidden field, for empty
  fields (with a way to the profile to fill them), engine unavailable.

---

## 7 · One template to many people

From the People table — a selection or a whole filter — **Send for signature** → pick a template → each person gets
their own document and signing.

- **The result window**, as the requests round drew it (R10): "Sent to 35 people", then "2 weren't sent", each with why —
  "Hasn't logged in yet", "You can't manage their documents", "Empty fields: Start date".
- At most 1,000 people at once.

---

## 8 · The AI in templates

Per the AI rules (`handoffs/2026-11-17-documents/PRODUCT-RULES.md` § "noddo AI"): one AI, one history; a feature may
keep its own window and its own actions. It arrives with the assistant (week 6 of the finalization), but the editor is
drawn with room for it now.

- **Draft with AI** — "An NDA for contractors in Germany, mutual, two years" → a new draft with real fields and signature
  blocks. A field it wanted but noddo does not have is named, not invented.
- **Ask noddo** while editing — "make the probation clause softer", "add a non-compete" → the change is shown **as a
  change to blocks**, accepted or rejected block by block.
- **Check** — empty fields for the people it will be sent to, a signer with no block, a clause that contradicts another.
- The AI never publishes and never sends.

> **Note for the designer:** where *Draft with AI* sits (on the empty draft? in "New template"?), and how a proposed
> change is shown in the text.

---

## 9 · Who may do what

| Who | May |
|---|---|
| *Document templates — manage* | Everything on §§ 1–5 |
| Whoever may edit a person's documents | Make a document from a template for them (§ 6), send it (§ 7) |
| Everybody else | Nothing here |

---

## 10 · Not in this round

- Conditional blocks and repeating sections.
- One template in several languages — a company makes a second template.
- Editing a template with someone else at the same time; comments on a template.
- A qualified signature (QES) — later, through a provider; "Needs a qualified signature or paper" is its placeholder.
