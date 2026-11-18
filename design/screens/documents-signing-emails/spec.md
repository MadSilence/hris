---
status: built
screen: documents-signing-emails
owner: Ulia
updated: 2026-11-17
---

# Signing emails (G14–G16)

## What it is for
There are three emails:
- **G14:** a guest is asked to sign.
- **G15:** a signer gets the code to sign. This goes to anyone who signs.
- **G16:** a guest gets the signed copy.

## Where it lives
The backend sends them in the company's accent, from "Acme <no-reply@acme.noddo.so>", like every company email (`sign-in-emails`, Q-21).

## Layout
Every email is built on the **login email template** (`sign-in-emails` spec, Layout), with the same values. The full rule set is in `handoffs/2026-11-17-documents/EMAIL-RULES.md`.

- **G15 — Moment, the code: the same as M16**, with only the words changed.
  - Band: "Here’s your / code to sign", with a row of 6 rings, r 20, cut in half by the band's edge.
  - Body: "Enter it on the signing page to sign Employment contract 2026."
  - The code box (one selectable string "482913", shown 3 + 3).
  - Small print: "The code works for 10 minutes. If you didn’t ask for it, ignore this email."
- **G14 and G16 — a new kind, "Document"** (approved 17 Nov). The band shows a white sheet of paper rising from its bottom edge, so a request never looks like a login email.
  - **G14 (asking to sign):**
    - The paper has a dashed accent "Sign here" box.
    - Heading 28/34: "Lena Novak asks you to sign".
    - "Please read the document and sign it."
    - A document card: PDF tile, "Employment contract 2026", "PDF · 4 pages · sign by 17 Dec".
    - Button: **Open and sign** →.
    - Small print: "The link is only for you. If you weren’t expecting it, ignore this email."
  - **G16 (signed copy):**
    - The paper shows a drawn signature and a green "Signed" pill.
    - "Everyone has signed" / "Here’s your copy of the signed document."
    - Card: "Employment contract 2026 (signed)", "PDF · signed by 3 people on 18 Nov".
    - Button: **Download the signed copy** →.
    - Small print: "The link works for 30 days, until 18 Dec."
- **Footer:**
  - the noddo wordmark (Ink with the Wine nod, 26 high, the official file);
  - "Sent by noddo on behalf of Acme";
  - "Acme · 12 Main Street, Warsaw · You get this because Acme asked you to sign a document."

## States
Not applicable to emails (`sign-in-emails`): one frame each. Narrow (< 480) follows the template's container query.

## Actions
- Open and sign → the guest page (`documents-signing` G09).
- Download the signed copy → G12.

## Words
Quoted above; `words.md`. Subjects:
- "Lena Novak asks you to sign Employment contract 2026";
- "{code} is your code to sign";
- "Signed: Employment contract 2026".

## Values
As `sign-in-emails`:
- Card max 600, radius 20.
- Band padding 32 40 0; moment heading 44/46.
- Button 48, 16/600, padding 0 24.
- Small print 14/22.

New for the Document kind:
- Band 264 high.
- Paper 340 wide, radius 10 at the top, soft shadow, grey text lines.
- Document card: hairline, radius card, 12 × 14 inside.

## Changes to SPEC
As `sign-in-emails`, plus the **Document** band (the paper). Approved by the owner.

## New components
The email template's third kind, **Document**: the paper band in two states, Sign here and Signed. A static image per state and accent, like the ring row (Q-28).

## Open questions
None blocks this.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** Mailpit, after sending for signature, signing, cancelling — the Document kind of
  email (`LoginEmail` Kind.DOCUMENT, the paper band from `design/email-images.mjs`). Built 2026-11-18, **not yet looked at in a browser**.
- **Differs from the design:** nothing known.
