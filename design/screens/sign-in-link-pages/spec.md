---
status: ready
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
