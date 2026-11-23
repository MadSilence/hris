---
status: built
screen: sign-in-second-step
owner: Ulia
updated: 2026-11-13
---

# Login — the second step (D1–D6)

## What it is for
After the first step, a person with two-step login enters a code from their authenticator app (or a backup code); a person whose company requires two-step and who has none sets it up right there and saves backup codes.

## Where it lives
`<company>.<root>/login/second-step`, `/login/set-up-two-step`. Session in a "first step done" state, 5 minutes. Company look (everyday base). Behaviour: Notion § 14.4, MFA_DESIGN. Common: `sign-in-root/spec.md` § "Common". Only at login — setting two-step up from inside the product is the person's preferences (not in this round).

## Layout
- **D1** back arrow (= "Start over" → company login) · "Two-step login" · "Enter the 6-digit code from your authenticator app." · `CodeInput` (sends itself on the 6th digit) · checkbox "Remember this device for 30 days" (only when the company allows it and the person is not a System Owner; the length comes from the company's setting — Q-16) · "Log in" · link "Use a backup code".
- **D2** back arrow (→ D1) · "Two-step login" · "Enter one of your backup codes. Each code works once." · field "Backup code" · "Log in".
- **D3** accent circle · "You’re logged in" · "You have {n} backup codes left. If you lost your phone, set up two-step login again on your new one." · "Continue". With 1 left: "You have 1 backup code left. …" + "Set up again" (primary) and "Later". With 0: grey circle (warning) "That was your last backup code. Set up two-step login again on your phone so you don’t get locked out." + "Set up again" / "Later".
- **D4** (required, no back arrow — cannot be skipped) · "Set up two-step login" · "Acme asks for a second step when you log in." · "1. Scan this with your authenticator app" (QR in a white tile) · link "Can’t scan? Enter a key instead" → "Enter this key in your app" + the key (JetBrains Mono, Mist panel) + "Copy key" · "2. Enter the 6-digit code it shows" · `CodeInput` · "Turn on".
- **D5** "Save your backup codes" · "If you can’t get a code from your app, use one of these. Each code works once." · ten codes, two columns, JetBrains Mono on Mist · "Download" · "Copy" (→ "Copied" with a tick) · checkbox "I’ve saved these codes" · "Continue".
- **D6** grey circle · "We couldn’t set up two-step login" · "Something went wrong on our side. Log in again to try once more." · "Log in again".
- **Timed out** (D1 after 5 min): grey circle (clock) · "Your login timed out" · "For your safety, the second step has to be done within 5 minutes." · "Log in again".

Everything on the white side is left-aligned (also the code's error line, the QR, the key block). No Stepper on D4 → D5 (the owner: two screens with numbered steps inside D4 — an exception to DESIGN_SYSTEM § 5 "Wizard progress").

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | "Logging in…", "Turning on…". | RD1-States, RD4-States |
| Empty | D2 "Enter a backup code."; D5 Continue without the checkbox: "Confirm that you’ve saved the codes." | RD2-States, RD5-States |
| No results | — | — |
| Error | "That code doesn’t match. Try again." · "Too many attempts. Try again later." · D2 "That code doesn’t work. Check it, or use another one." · D4 "That code doesn’t match. Check the time on your phone and try again." · D6 · timed out. | RD*-States, RD6 |
| No permission | — | — |
| Normal | D1–D5 desktop and phone. | RD*-Desktop / Phone |
| Long content | Company with a long name (pane as C); codes fixed length. | see `sign-in-company-login` RC2-Long |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Log in | D1, D2 | Checks the code → `next` / Home (D2 → D3). | no |
| Use a backup code | D1 | D2. | no |
| Back | D1 / D2 | Company login / D1. | no |
| Set up again | D3 | D4 then D5 with a new set (Q-17). | no |
| Later / Continue | D3 | Into the app. | no |
| Copy key | D4 | Copies; "Copied" for 2 s. | no |
| Turn on | D4 | Checks the code → D5. | no |
| Download / Copy | D5 | `backup-codes-acme.txt` / clipboard. | no |
| Continue | D5 | Needs the checkbox → into the app. | no |
| Log in again | D6, timed out | Company login. | no |

## Words
Full list: `words.md`; product copy is quoted above.

## Values
QR 168 in a white tile (radius popover, hairline). Key block: Mist, radius popover, JetBrains Mono 16/24, letter-spacing .08em. Codes grid: 2 × 5, JetBrains Mono 15/24, Mist panel radius card, padding 16. Rest: § Common.

## Changes to SPEC
§ Common. No Stepper on D4–D5 (owner).

## New components
None beyond § Common.

## Open questions
- ~~Q-16~~ — built as recommended: the company's days in the label (Built).
- ~~Q-17~~ — built as recommended: D3 starts a new phone right from the login (Built).

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** D1–D6 and the timeout at `/login/second-step` and `/login/set-up-two-step` (single sign-on sends a
  second step there too). Built 2026-11-13 (`(claude)/development_plan/SIGN_IN_PLAN.md`), walked locally the same evening (`(claude)/HISTORY.md` § "Identity…" → "Logging in with Google, Microsoft and emailed codes").
- **Differs from the design:**
  - "Remember this device for {n} days" takes the company's days and shows only when the company allows it (Q-16, as
    recommended).
  - **D3's "Set up again"** (Q-17, built 2026-11-19): with 1 or 0 codes left, *Set up again* opens D4 and D5 for a new
    phone inside the session the backup code opened. The old phone keeps working until the new one's first code is right,
    so D4 here has its own lead — "Scan this with the authenticator app on your new phone. Your old phone keeps working
    until you turn the new one on." — instead of "{company} asks for a second step". A new set of backup codes replaces
    the old one on D5. It needs the backup code's step-up, which lasts 10 minutes: past that, D6.

### Built from the designers' answers of 2026-11-20 (2026-11-23)
- AQ-20: the colour pane grows with the window — 520 at 1280 × window ÷ 1280, never smaller, stopping at 1920 — and
  everything in it (rings, wordmark, slogan or company name) scales with it (`--auth-grow` as the pane's `zoom`,
  `styles/globals.css`; `technical_documentation/ui/DESIGN_SYSTEM.md` § 9).
- Not seen in a browser.
