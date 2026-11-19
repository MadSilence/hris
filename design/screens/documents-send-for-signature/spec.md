---
status: built
screen: documents-send-for-signature
owner: Ulia
updated: 2026-11-17
---

# Sending a document for signature (S01–S13)

## What it is for
Whoever may send a person's documents for signature sends a PDF from their Documents tab. They choose who signs and in what steps, then follow the signing, remind, cancel or send again. Template-based sending and sending to many people come with Templates; they are not in this round.

## Where it lives
Profile → Documents:
- ⋯ on a PDF → **Send for signature** (S01). A non-PDF has no such item (S12).
- The document's preview gains a **Signing panel** on the right (S07, S08, S13).
- The company-wide list of signings is `documents-section` D03.

## Layout
- **Send for signature dialog (S02–S05).**
  - Header: a signature icon beside the title "Send for signature", and a subtitle with the file and the person.
  - "Title": prefilled from the file name; hint "Signers see it in the email and on the signing page."
  - "Who signs": **steps as boxes**, numbered. A box holds one or more signers (avatar, name, "The person" / "Their manager" / job, ×).
    - Inside a box: "Add co-signer" — signs in the same step.
    - Under the boxes: "Add next signer" — a new step.
    - Hint: "People in one box sign at the same time. Each gets an email when it’s their turn."
  - Add (S03) picks who: their manager, anyone in the company, or someone outside it. A guest is a name + email typed in place (S05); an empty email shows a `FieldError` under it. The icons stay centred on the input, not on the error.
  - No "Signs as" field: the label comes from the template (owner, 17 Nov).
  - Footer: Cancel · **Send**.
- **Sent (S06).**
  - A toast.
  - The row shows a pill "Signing · 0 of 3".
  - A signed file gets "(signed)" in its name and a green signature mark, which stays visible when a long name is cut. Its tooltip says when and by whom.
- **Signing panel (S07)**, in the preview's right column:
  - "Signing" header; "Sent by Lena Novak on 17 Nov".
  - The step chain: each signer with their role and status ("Signed 17 Nov, 14:02" / "To sign" / waiting).
  - At the foot: "Due 17 Dec", "<n> days left" with a time bar, "Reminders go out on day 3 and the day before it’s due", and **Send a reminder now**.
  - **Cancel signing** sits in the preview's bottom bar, under the signing column, left of Download.
- **Endings (S08a–d).** The panel's top line tells the end:
  - Signed by everyone: the link to the signed copy.
  - Declined: who declined, with the comment as "Name: …" in a quoted box; **Send again**.
  - Expired: a red pill "Expired", "Closed 17 Dec · The due date passed", and the bar red; **Send again**.
  - Cancelled: by whom, with the comment; **Send again**.
- **Send again (S08e).** It opens the usual Send for signature dialog (S04), filled in as last time. Always the same file. The preview closes behind it.
- **Cancel confirm (S09).**
  - "Cancel this signing?" / "Nobody can sign it any more. Meryem’s signature is dropped; the document stays as it was."
  - "Comment (optional)", placeholder "For example: sent the wrong version".
  - Buttons: **Keep it** · **Cancel signing** (`destructive-confirm`).
- **Menus.**
  - S10, on a signed file: no Rename, no expiry edit. It adds "A signed document can’t be changed." and **Signing history**.
  - S11, while out for signature: no Send, no Rename. The signing opens by clicking the document or its pill.
  - S12, not a PDF: no Send item at all (left out, not disabled).
- **Signing history (S13, S13b).** A log, oldest first: sent, signed, declined + comment, sent again, cancelled + comment, expired, completed. It opens from ⋯ on a signed file and from the "Signing history" link at the foot of the panel.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Send button `loading`; panel skeleton | — |
| Empty | A document never sent has no Signing panel | — |
| No results | Signer picker: standard "No one called …" | S03 |
| Error | Refusals as `FormError` with the brief's words ("This document is already out for signature.", "Only a PDF can be sent for signature.", "Every signer needs a person or a name and an email.") | S05 |
| No permission | No Send / Cancel / Remind for anyone without the send right; the person can't send their own documents | — |
| Normal | S04, S06, S07 | S04, S06, S07 |
| Long content | Long file name keeps the signature mark; 3 signers in 2 steps; history with 6 events | S06, S13b |
| Endings | S08a–d | S08a–d |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Send for signature | ⋯ on a PDF | S02 | no |
| Send | dialog | Signing created; first step emailed; toast | no |
| Send a reminder now | panel | Whoever's turn it is gets reminded; guests get a fresh link | no |
| Cancel signing | preview bottom bar | S09 | yes |
| Send again | S08b–d | S04 prefilled; a new signing on the same document | no |
| Signing history | ⋯ / panel foot | S13b | no |

## Words
`words.md`. Key strings:
- **Dialog:** "Send for signature", "Who signs", "Add co-signer", "Add next signer", "People in one box sign at the same time. Each gets an email when it’s their turn.", "Send".
- **Panel:** "Signing · 1 of 3", "Sent by Lena Novak on 17 Nov", "To sign", "Due 17 Dec", "Reminders go out on day 3 and the day before it’s due", "Send a reminder now", "Cancel signing".
- **Cancel confirm:** "Cancel this signing?", "Keep it".
- **Signed file:** "A signed document can’t be changed.", "Signing history".

## Values
- Dialog M (§ 13.7).
- Step box: radius card, hairline, a 12 px gap between boxes, numbered by a 20 circle (§ 8).
- Pills (§ 13.4):
  - "Signing" uses the in-progress status colours (§ 4.5).
  - "Expired" and "Declined" use declined.
- The time bar is 6 high, radius full; it turns declined red when overdue.

## Changes to SPEC
None.

## New components
- **SignerSteps** — the editable step boxes. Also used by Templates later.
- **SigningPanel** — status chain, due + time bar, reminders, endings. Used in the preview.
- **SigningHistory** — an event log.

## Open questions
Q-31, Q-32, Q-33, Q-34 — none blocks the drawing.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** a PDF's ⋯ → Send for signature on a person's tab; the signing panel in the preview's
  right column, and from the ⋯ (`SendForSignatureDialog`, `SigningPanel`, `CancelSigningDialog`,
  `SigningHistoryDialog`). Built 2026-11-18, walked in the built-in browser the same day (`(claude)/HISTORY.md` § "Documents" → "The second part").
- **Differs from the design:** "Their manager · {name}" is a one-click button first in the signer picker
  (`SendForSignatureDialog.tsx`): it adds today's manager **as a person**, not a role resolved later — a change of
  manager after sending does not move the step. With no manager it is not shown.
