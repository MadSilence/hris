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
- **The designers' round of 19 Nov, built 2026-11-20 (S1–S8b; not yet seen in a browser):**
  - **S1–S3, the dialog:** 680 wide; the step number a 24 accent-subtle circle; each signer a 44 row with a drag
    handle (drag a signer into another box), a 24 avatar (photo or coloured initials), the name 14 500 and its line
    ("The person", "Their manager", or "{job} · {office}"); "Add co-signer" / "Add next signer" 13/18 accent with a
    14 plus; the footer hint with an info icon, 280 wide; the title field no longer opens focused. **The signer
    picker is S03**: the field is the search ("Find a person"), the menu has their manager first, "People" with job
    and office (a new `job` extra on `/segments/resolve`, shown only to whoever may see `sys:job` company-wide), and
    "Someone outside the company" — the "Someone in the company | Someone outside" tabs and the separate select are
    gone. A guest's empty fields say "Enter their name." / "Enter their email." (S05). The demo note stays, demo
    only (S3).
  - **S4:** the toast is "Sent for signature. Meryem signs first" (the first step's first names).
  - **S5, the panel:** "Signing" with its pill on the right ("1 of 3 signed", "Signed by everyone", "Declined",
    "Expired", "Canceled"); "Sent by … on 17 Nov" with no year this year; each step a 24 circle (green with a tick
    when done), each signer an avatar, the name with "· The person" / "· Their manager" / the template's label, and a
    status line with its icon — "Signed 17 Nov, 14:02", "To sign", "Waiting", "Not asked any more", "Didn’t sign",
    "Declined 18 Nov" with the comment under it. The due block sits at the foot above a hairline, "Send a reminder
    now" sized to its text with a bell. **Cancel signing is red text**: `CancelSigningButton` for the preview's
    footer (the preview gained a `footerAction` slot and is 1240 wide with a 340 panel while it has one), or at the
    panel's foot when the caller does not pass `cancelInFooter`.
  - **S5b, S8, S8b:** the endings at the foot — "Completed 18 Nov" and a card for the signed copy (pdf tile, name,
    "In {folder}", chevron) when the caller passes `signedCopy`; "Declined 18 Nov" + "Nobody can sign it now.";
    "Closed …" + "The due date passed" + who did not sign in time; "Canceled 18 Nov" with the canceller (from the
    history) and the comment on a grey card; Send again secondary with the signature icon.
  - **S6:** "Signing history" replaces the panel's content in place (← back): a dot per event, "14 Nov, 09:40", "**Lena
    Novak** sent it for signature", a decline's comment as a grey quote; "signed — signed by everyone" rides on the last
    signature. The ⋯ on a signed file still opens it as a small dialog (S10).
  - **S7:** the confirm is 440, the file under the title, the text says whose signature is dropped (or that the
    document stays as it was when nobody has signed), "Comment (optional)", Keep it secondary, the comment not focused;
    the toast "Signing canceled". US "canceled" in every English string of the sender side.
- **Not done in this round:**
  - **The job and office line in the panel** ("· People partner"): the signing keeps no job; the panel shows the
    template's label, "The person" and "Their manager" (when the caller passes `managerId`) only.
  - **The signed copy's name and folder** need the caller (`signedCopy`); without it the card reads "Open the signed
    copy". The wiring in `PersonalDocumentsContainer` / `DocumentsSection` (`cancelInFooter`, `footerAction`,
    `managerId`, `signedCopy`) belongs to the documents tab's own round.
  - The row's pill text size (S4, 11/16) is the shared `StatusBadge`'s and was not changed.
