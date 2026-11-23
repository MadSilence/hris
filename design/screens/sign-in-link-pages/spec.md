---
status: built
screen: sign-in-link-pages
owner: Ulia
updated: 2026-11-13
---

# Login — pages that end at the login (N1, N3)

## What it is for
Two pages for people who are not logged in: a link with a token that no longer works (N1), and the login shown after the session ended, which takes them back to where they were (N3).

## Where it lives
N1: any token page (`/reset`, `/confirm-email`, …) except the invitation (G5) and the phone photo (P10). N3: `<company>.<root>/login?next=…` when the session ended. Company look (everyday base). Behaviour: Notion § 14.13.
**N2 (403) is not a login page** (owner, 2026-11-12): a logged-in person always sees the 403 inside the product (`ErrorPage` with the illustration, sidebar visible); a logged-out person opening any link — inside the company or external — first gets that company's login (N3), and after login, if they still may not see the page, the in-product 403. A link into another company leads to that company's login.

## Layout
- **N1** grey circle · "This link doesn’t work" · "It may be out of date, already used, or cut short. Open it again from the email, or ask for a new one." · "Go to login".
- **N3** the company login (C2 or its variant) with an info `InlineAlert` on top: "You were logged out. Log in again to pick up where you left off." No reason given (time-out, password changed elsewhere, admin action). After login → `next`.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading / Empty / No results / No permission | as `sign-in-company-login` | — |
| Error | N1. | N1-Desktop, N1-Phone |
| Normal | N3. | N3-Desktop, N3-Phone |
| Long content | as C. | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Go to login | N1 | The company login. | no |
| Log in | N3 | As C → `next` (through `safeReturnPath`). | no |

## Words
Quoted above; full list `words.md`.

## Values
§ Common.

## Changes to SPEC
§ Common.

## New components
None.

## Open questions
None.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** N1 `/link-expired`, N3 `?reason=ended`. Built 2026-11-13 (`(claude)/development_plan/SIGN_IN_PLAN.md`), walked locally the same evening (`(claude)/HISTORY.md` § "Identity…" → "Logging in with Google, Microsoft and emailed codes").
- **Differs from the design:** nothing known.

### Built from the designers' answers of 2026-11-20 (2026-11-23)
- AQ-20: the colour pane grows with the window — 520 at 1280 × window ÷ 1280, never smaller, stopping at 1920 — and
  everything in it (rings, wordmark, slogan or company name) scales with it (`--auth-grow` as the pane's `zoom`,
  `styles/globals.css`; `technical_documentation/ui/DESIGN_SYSTEM.md` § 9).
- Not seen in a browser.
