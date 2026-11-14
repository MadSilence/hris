---
status: built
screen: first-run-welcome
owner: Ulia
updated: 2026-11-13
---

# First run — the welcome (W0–W4)

## What it is for
Everybody's first login (an invited person after G, the owner after S): a warm greeting, then a few optional steps — connect Google/Microsoft to log in faster, add a photo, fill in their own blank fields, check time zone and language. Every step can be skipped.

## Where it lives
`<company>.<root>/welcome`, once per person (skipping counts as done). The company's look: a white page, the company logo on top (white tile with hairline + shadow-1, 44; 36 on the phone, so a white logo still reads), one centred column, two rows of rings along the bottom in the company colour (resting = accent-muted, strong = accent, the strong ones nod; the lower row cut in half by the bottom edge). Desktop frames 1440 × 900. Behaviour: Notion § 14.9. The photo from a phone: `first-run-photo`.

## Layout
- **W0** "Hi, Anna!" / "Glad you’re here" (Inter Tight 600 112/104, the second line in the accent; 56/54 on the phone; no full stop) · "A few quick settings, and you’re ready to go." · "Let’s go" (→ W1, or W2 when W1 is absent).
- **W1** (only when the company allows Google/Microsoft) "Log in faster next time" · "Connect Google or Microsoft and skip the password from now on." · Connect Google · Connect Microsoft · "Skip". W1a approved alert "Connected as {account}." + "Continue". W1b declined alert above the buttons: "This Google account is already used by someone else at Acme. Try another one, or skip." / "We couldn’t connect your Google account. Try again, or skip."
- Stepper (two-bar, as `first-run-setup`): "Step 1 of 3 · Profile" (W2), "Step 2 of 3 · Profile" (W3), "Step 3 of 3 · Preferences" (W4); without W3 it counts to 2.
- **W2** "Add your photo" · "Help your colleagues recognize you. You can change it any time." · drop zone (column 560): 112 avatar with initials · "Drag your photo here" · "Square, at least 400 × 400 px. PNG, JPG or WEBP." · "or" · "Choose a file" / "Upload from my phone" (→ `first-run-photo` P2). Dragging over: accent border, accent-subtle, "Drop it here". No "Continue" until there is a photo — the upload buttons and "Skip" are the only actions. Phone: one button "Upload a photo".
- **W3** (only when the person may fill some of their own blank fields) "A bit about you" · "A few details for your profile. All of it can wait." · the blank fields their role may edit (drawn: Preferred name "What your colleagues call you.", Date of birth DD/MM/YYYY, Languages you speak — multi-select with chips + checkbox list; eight-field case) · "Continue" · "Skip".
- **W4** "How should things look?" · "We’ve used Acme’s settings. Change them if they don’t fit you." · Time zone "(UTC+01:00) Warsaw" (clock icon) · Language "English" (globe icon) · "Finish" · "Skip". Unchanged = keeps following the company's settings.
- "Skip" everywhere: a text button in `accent-text`, no underline, centred under the main button. Back arrow top-left of the page from W2.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Connect → provider (E1); buttons busy. | W1-States |
| Empty | W2 no photo; W3 blank fields. | W2-Desktop, W3-Desktop |
| No results | Languages list filter: none drawn (standard select "No matches"). | — |
| Error | W1b; W3 field validation "Enter a real date."; W2 refused file uses the drop zone's error (as P). | W1-States, W3-States |
| No permission | Steps the person may not use are not shown (W1 without providers, W3 without editable blank fields). | — |
| Normal | W0–W4 desktop and phone, W2 dragging. | W*-Desktop / Phone, W2-Drag |
| Long content | W3 with eight fields (the page scrolls); long first name in W0 wraps to three lines. | W3-States |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Let’s go | W0 | W1 or W2. | no |
| Connect Google / Microsoft | W1 | Links the account (M9 sent) → W1a / W1b. | no |
| Choose a file / drop | W2 | Uploads → photo in, "Continue" appears. | no |
| Upload from my phone | W2 | `first-run-photo` P2. | no |
| Continue / Finish | W1a–W4 | Saves the step → next / Home. | no |
| Skip | every step | Next step without saving; counts as done. | no |

## Words
Quoted above; full list `words.md`.

## Values
Column 400 (W2 560), greeting 112/104, logo tile 44, rings r 22 stroke 7 (desktop) / r 12 stroke 5 (phone), the lower row margin-bottom −36 / −24. Rest § Common.

## Changes to SPEC
§ Common + display size 112/104 and 56/54.

## New components
- **Drop zone** (photo) — dashed 1.5 px border-strong, radius card; states empty, drag-over, uploading, refused; also used in `sign-in-appearance` for the logo and in `first-run-photo` for the QR.

## Open questions
- Q-19 — a personal language (W4) is new: screens only, or emails and exports too? Blocks nothing (recommend screens + emails, exports stay the company's).
- Q-20 — the welcome opened on a phone: Notion § 14.10 doesn't cover it; drawn: one "Upload a photo" button using the phone's own picker. Blocks nothing.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/welcome` — `components/modules/firstRun/components/WelcomeContainer.tsx` (W0–W4), the
  photo `PhotoStep.tsx`, the frame `WelcomeFrame` in `FirstRunPieces.tsx`. Built 2026-11-13, **not yet looked at in a
  browser**, no images yet.
- **Differs from the design:**
  - W1 also offers *Set a password instead* to somebody who has no password (an SSO person in a company that offers
    Google or Microsoft) — the code side's addition; the wording is ours.
  - W1 shows the one provider the company offers when it offers one: "Connect Google and skip the password from now
    on."
  - W1's buttons say "Taking you to Google…" while the round trip starts; Connect may ask "confirm it is you" first
    (the product's step-up dialog) when the login is not fresh.
  - W4's language is also offered on My Preferences (with "Same as the company"), so a choice made here can be
    changed again.
  - The phone's welcome (Q-20) is the same steps; on W2 the drop zone carries one *Upload a photo*.
