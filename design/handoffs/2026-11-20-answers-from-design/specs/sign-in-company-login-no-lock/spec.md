---
status: ready
screen: sign-in-company-login-no-lock
owner: Ulia
updated: 2026-11-20
---

# Company login — no lock after wrong passwords; the alert offers a reset link

Added 20 Nov 2026 — approved by Ulia ("noddo · Login flow" board, page C · Company login, frame RC9r-OfferReset, next to C9 · States). It changes `sign-in-company-login` C9 and `sign-in-password` F6. Rule: `../../../7-product-wide/NO-LOCK.md`.

## What it is for
People forget which password they used and try several. Instead of locking them out, the login offers a reset link once it's clear they're stuck.

## Where it lives
`<company>.<root>/login`, the password form. Public. The everyday login base (the company's look).

## Layout and values
The sheet shows two crops of the form side by side (the 520 pane is left out). Exact values: `../../measurements/sign-in-company-login-no-lock/RC9r-OfferReset.md`; crops in `../../components/RC9r-OfferReset__1…2`.
- **C9-3 — 1st and 2nd wrong password.** As today: the InlineAlert (declined) is the first thing in the form, 28 under the title. Fill #FDEDEB, no border, radius 10, padding 12, gap 8, icon 16, 13/18 400 #A12215. Text: "That email and password don’t match. Check them, or check the company address."
- **C9-3r — from the 3rd wrong password in a row for this email.**
  - The same alert, same place and style. Text: "That email and password don’t match. Forgot your password? **Email me a link to reset it**".
  - The link is inside the alert: 600, underlined (offset 2), in the alert's text colour.
  - It sends the reset email at once and opens F2 ("Check your email") with this email, skipping F1.
- "Forgot password?" above the field stays as it is.

## States
| State | What the reader sees | Image |
|---|---|---|
| 1st, 2nd wrong password | C9-3 | images/RC9r-OfferReset.png (left) |
| 3rd and later | C9-3r | same (right) |
| Bot limit hit | "Too many failed attempts. Try again later." (C9-4, unchanged) | C9 · States |
| Sending the link | The link's loading state, then F2 | F2 |

## Actions
| Action | What happens | Confirms? |
|---|---|---|
| Email me a link to reset it | Sends M4 (reset link) to the typed email; opens F2 with it. Same screen whether or not the account exists | No |

## Removed
- **F6** (set a password on a locked account with two-step).
- **The "Locked" account state:** no Unlock in Manage account, no Locked pill.

## Numbers for the code side
- No per-person lock.
- Bot limit, proposed: 20 failed tries per email per 15 minutes, and per IP. Then C9-4.
- Petya to confirm.

## Words
`words.md`.

## Changes to SPEC
None.
