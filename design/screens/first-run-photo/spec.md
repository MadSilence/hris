---
status: built
screen: first-run-photo
owner: Ulia
updated: 2026-11-13
---

# First run — the photo from a phone (P2–P4, P6–P10)

## What it is for
On a computer without a good photo, the person scans a code with their phone, picks a photo from the phone's gallery, and it appears on the computer by itself.

## Where it lives
Computer: the photo step of `first-run-welcome` (W2), the drop zone turns into the code. Phone: `<company>.<root>/m/avatar?token=…` — no login needed, the token is single-use for 15 minutes. Same white frame as the welcome (company logo, rings). Behaviour: Notion § 14.10.

## Layout
- **P2 (computer)** the drop zone holds the QR (168, white tile) + "Scan the code with your phone" + "You’ll pick a photo on your phone and it will appear here. The code works once, for the next 15 minutes." + link "Choose a file instead". No "waiting…" line, no "Hide code". "Skip" under it.
- **P3 (computer)** the photo appears by itself (short fade-in) with a check badge · "Your photo is in" · "It came from your phone. You can change it any time." · "Choose another file" / "Upload from my phone" · "Continue" · "Skip".
- **P4 (computer)** "The code has expired" · "Codes work once, for 15 minutes. Press “Show a new code” and scan it again." · "Choose a file" / "Show a new code".
- **P6 (phone)** "Hi, Anna" · "Pick a photo for your profile at Acme." · one big button in thumb reach "Choose a photo" · "From your gallery." (the gallery, not the camera).
- **P7** "Uploading…" · "Keep this page open for a moment." · progress bar; the avatar keeps the initials until the upload is done.
- **P8** "That’s your photo" · "It’s already on your profile. You can close this page and go back to your computer."
- **P9** "That didn’t work" · "Show a new code on your computer and scan it again."
- **P10** "This code has expired" · "Codes work once, for 15 minutes. Show a new one on your computer and scan it again." (shown before the gallery opens).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | P7. P5 (uploading from the computer) = the drop zone's busy state (as `sign-in-appearance` L4). | P7-Phone |
| Empty | P2 waiting for the phone. | P2-Desktop |
| No results | — | — |
| Error | P4, P9, P10. | P4-Desktop, P9-Phone, P10-Phone |
| No permission | A used / wrong token → P10. | P10-Phone |
| Normal | P2, P3, P6, P8. | P*-* |
| Long content | — | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Choose a file instead | P2 | Back to W2's drop zone (file picker opens). | no |
| Show a new code | P4 | A new token, P2. | no |
| Choose a photo | P6 | The phone's gallery → P7 → P8; the computer shows P3. | no |
| Continue / Skip | P3 / P2 | As W2. | no |

## Words
Quoted above; full list `words.md`.

## Values
QR 168 in a white tile (radius popover, hairline). Phone button lg 44 full width, pinned 24 px above the rings. Rest as `first-run-welcome`.

## Changes to SPEC
As `first-run-welcome`.

## New components
None beyond the drop zone (`first-run-welcome`).

## Open questions
None.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** the computer's side is W2 (`PhotoStep.tsx`); the phone's `/m/avatar?token=…`
  (`app/(company)/m/avatar/page.tsx`, `MobileAvatarUpload.tsx`) in the welcome's frame. Built 2026-11-13, **not yet
  looked at in a browser**, no images yet.
- **Differs from the design:**
  - P7's bar does not measure the upload (a server action has no progress events): it moves towards the end and
    completes with the answer.
  - A refused file on the computer shows the refusal under the drop zone (the error catalogue's sentence).
  - The camera-only input (`capture`) is removed: the phone's picker opens on the gallery.
