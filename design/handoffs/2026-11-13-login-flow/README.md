# Login flow — handoff (2026-11-13, second pass)

From the board "noddo · Login flow". Unpack into the repo root: everything goes under `design/`.

| Folder | Screens | Status |
|---|---|---|
| `design/screens/sign-in-root` | A1–A4 · finding your company | ready |
| `design/screens/sign-in-registration` | B1–B3a · free trial | ready |
| `design/screens/sign-in-company-login` | C1–C10 · the company's login, login code | ready |
| `design/screens/sign-in-second-step` | D1–D6 · two-step | ready |
| `design/screens/sign-in-provider` | E1, E3 · to Google / Microsoft and back | ready |
| `design/screens/sign-in-password` | F1–F8 · forgot / reset password | ready |
| `design/screens/sign-in-invitation` | G1–G5 · invitation | ready |
| `design/screens/sign-in-link-pages` | N1, N3 · broken link, logged out | ready |
| `design/screens/first-run-setup` | S1–S3 · the owner sets up the company | ready |
| `design/screens/first-run-welcome` | W0–W4 · everybody's welcome | ready |
| `design/screens/first-run-photo` | P2–P10 · the photo from a phone | ready |
| `design/screens/sign-in-emails` | M1–M18 · login emails | ready |
| `design/screens/sign-in-appearance` | L · Settings → General → Appearance, the presets, the Light background | ready |

Each folder: `spec.md` (the source of truth), `words.md` (every string in the frames), `export/` (the frames as HTML, open in a browser), `images/` (a PNG of every frame).

- The rules shared by every login screen are in `sign-in-root/spec.md` § "Common".
- `design/QUESTIONS.md` — the existing file plus Q-14 … Q-28 (none blocks a screen). Q-24 (the presets) is answered.
- `design/BOARD-NOTES.md` — every sticky and title from the board, word for word, in board order.
- `design/decisions-for-petya.md` — why each decision was taken, against Notion `SOCIAL_SIGN_IN_DESIGN` § 14.
- Not in this round: onboarding / preboarding emails (M3), personal preferences (login methods, two-step setup), Settings → Login & SSO.

## What changed since the first pass (same day)

- **The presets are decided** (Q-24): Wine (default), Cherry, Tangerine, Sunflower, Basil, Indigo, Ocean, Mulberry, Black, plus "Your own". Graphite stays as a value, off the grid. `sign-in-appearance/spec.md` → "The presets" and "Changes to SPEC".
- **Appearance was redrawn** at 1512 × 982: the logo is step 1, the colour step 2 (with "From your logo"), the background step 3; Save is pinned to the bottom of the column; messages never push the page.
- **A new company-wide setting — the background: Your color · Light.** It changes the login pane, the email band and the default Colour / Light top of Home. `sign-in-appearance` LT1 … LT7 show every screen in both.
- **A light accent writes Graphite #2A2A2E**, not Ink.
- **A logo with several colours**: the company picks only the accent; in Light the rings use all of its colours. Auto-Light when a multi-colour logo is uploaded and the background was never touched.
- **Emails are signed by noddo** (variant C): the wordmark + "Sent by noddo on behalf of Acme" under every company email.
- **Three rules for a colour close to a status colour** (`sign-in-appearance` → "A colour close to a status colour", frames L8-Close and L8-Rules).
