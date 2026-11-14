---
status: ready
screen: sign-in-root
owner: Ulia
updated: 2026-11-13
---

# Login — the root: finding your company (A1–A4)

## What it is for
Someone who has a noddo company but is not on its address lands on the root (noddo.so) and needs to get to their company's login. They type the company address (A1), or continue to the one this browser remembers (A2). Someone who forgot the address asks for it by email (A3) and is told to check their inbox (A4).

## Where it lives
`<root>/login` (A1, A2), `<root>/login/find` (A3, A4). Public, no session. Root screens are always noddo's own brand (Wine) — there is no company yet (DESIGN_SYSTEM § 4). Behaviour: Notion `SOCIAL_SIGN_IN_DESIGN` § 14.1; addresses: `COMPANY_ADDRESSES.md`.

## Common to every login screen (all `sign-in-*` and `first-run-*` folders refer here)
Approved by the owner (Ulia) on 2026-11-11 … 13; the full reasoning per decision is in `decisions-for-petya.md` (shipped with this handoff).

**Words.** "Log in" as the verb, "login" as the noun — never "sign in" (this replaces Notion's wording everywhere). Sentence case. No full stop at the end of a heading. One exclamation mark in the whole product (SPEC § 1); auth pages are exempt (the owner: they are half marketing).

**Two bases.**
- *Everyday* (A root, C company login, D second step, E3, F password, G5, N): desktop = a pane 520 wide on the left + the white side. The pane is the accent (Wine on root screens, the company's accent on company screens). On top an even 6×4 ring grid (rings 34 px, stroke 6: resting = Wine 500 / on a company accent `color-mix(accent 78%, white)`; the light "hot" rings = Rose / `color-mix(accent 30%, white)`). At the foot: root = the noddo wordmark large (44 high, white with the Rose "o") + the slogan "Every yes, handled." (Inter Tight 600 24/30, "handled." in Rose); company = the company's logo (56 white tile, letter fallback in the accent) + name (Inter Tight 600 40/44 white; 26/32 wrapping when longer than ~16 chars) + "powered by noddo" (white lockup, 15 px wordmark). The white side holds only the step: back arrow top-left (when there is one), heading 32/40 Inter Tight 600, lead 15/22 secondary, the form max 400, left-aligned, vertically centred.
- *First experience* (B registration, S setup): form on the left with a 40/44 two-tone heading; on the right a rounded Wine card (radius 20, 12 px from the edges) with "Every yes, handled." / "Approve once. noddo does everything that follows." and the orbit (a Rose ring in the centre, white rings on two dashed circles labelled Workflows · Approvals · Time off · Onboarding · Reviews).

**Phone (375).** The pane becomes a slim strip on top: logo (wordmark 24 high, or company logo 28 + name 18/28 one line with ellipsis) + one row of 7 rings (r 12, stroke 5). No slogan. A form shorter than the screen is centred in the space under the strip (when there is an icon above the heading, the heading + form are centred and the icon hangs above); a form as tall as the screen or taller starts 40 px under the strip (72 with a back arrow) and the page scrolls. The back arrow is pinned 20 px under the strip. Company screens put "powered by noddo" (grey) at the foot of the white part.

**Motion.** Only the light (hot) rings nod: one scripted 24 s loop, a nod every 3 s — one ring, then a pair (second 0.14 s behind) — never more than two at once; each nod 7 px down with a 2 px overshoot, `cubic-bezier(.5,0,.3,1)`. The orbit's centre ring is still; only the two dashed circles turn, in opposite directions (`stroke-dashoffset` ∓180 over 20 s, linear). Everything is off under `prefers-reduced-motion`.

**Controls.** Size lg 44 everywhere on login screens. No asterisks on login forms (FORMS_AND_FIELDS § 1); registration detail forms (B2a, B3) carry the grey asterisk. Errors: the field's `FieldError`; a refusal of the whole form: `FormError` → `InlineAlert` declined, never a toast. Error and expiry screens: a 48 px Mist circle with a 24 px icon above the heading (not an illustration — the owner: illustrations are for inside the product). Confirmation screens (check your email): the same circle on accent-subtle with the accent icon. Google / Microsoft buttons are always the standard white provider button with the official mark (`assets/google.png`, `assets/microsoft.png` in each export; the build takes the official files from the brand kits), never the accent — also when they are the only way in.

**Back.** Every screen reached from a first screen has a ghost icon button 36 (SPEC § 13.2), `arrow-left-01`, top-left of the white side (16 px; 12 on the phone), name and tooltip "Back". It goes one screen back. Foot links that did the same job are gone.

**Changes to SPEC (all auth screens — approved by the owner as auth-only exceptions, not product-wide).** The split layout and the strip; display sizes 40/44 and 44 (wordmark); the ring grid and the orbit as brand patterns; nodding outside loaders/Approve/splash (SPEC § 9 limits the nod); the white-on-accent wordmark; the grey/accent circle icons instead of illustrations (DESIGN_SYSTEM § 5 asks for `ErrorState` with an illustration); Google / Microsoft marks on provider buttons (DECISIONS says no provider logo); the custom accent tints for rings (SPEC § 10 has the on-Wine recipe only). Everything else is SPEC values.

**New components (shared).** `AuthSplit` (pane + white side, desktop/phone), `RingGrid` (static + nodding), `Orbit`, `CodeInput` (6 boxes, see `sign-in-registration`), `AuthIconCircle` (48 grey / accent). Each is used only on auth screens.

## Layout (A)
`AuthSplit`, root variant (Wine pane with the wordmark and slogan). White side, top to bottom:
1. Back arrow (A3, A4 only).
2. Heading: A1/A2 "Log in to your company", A3 "Find your company", A4 "Check your email" (with the accent circle, `mail-01`).
3. A1: field "Company address" with the suffix `.noddo.so`, button "Continue", link "Forgot company address?". No hint under the field. No "Start a free trial".
4. A2: "Last time you logged in here:" + a tile with the remembered company's logo (or first letter on its colour), name and address; "Continue"; "Use another company".
5. A3: lead "You’ll get an email with the address of each company you can log in to.", field "Work email", "Email me my addresses".
6. A4: "We’ve sent a list of your companies and their addresses to {email}." + "Not there in a few minutes? / Check your spam folder or resend." + "Back to login" (main button).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Pages render on the server; the only busy state is the button's `loading` after submit: "Logging in…" (A1, A2), "Sending…" (A3), "Resending…" (A4). | RA1-States, RA3-States, RA4-States |
| Empty | A1 first visit = the empty field. | RA1-Desktop |
| No results | A3 never says whether an email exists: A4 is the same either way (no email arrives if none). | RA4-Desktop |
| Error | A1: "Enter your company address." (an address with no company goes to that address's own "no such company" page, as today). A3: "Enter your email." · "Enter a valid email, like anna@company.com." · "Too many attempts. Try again later." · "Something went wrong on our side. Please try again." A4 after resend: "Sent again." + "Check your spam folder too."; resent too often: only "Check your spam folder." (no resend link). | RA1-States, RA3-States, RA4-States |
| No permission | Not applicable (public pages). | — |
| Normal | A1, A2, A3, A4, desktop and phone. | RA1…RA4 Desktop / Phone |
| Long content | A long company address and name (A2 tile wraps the name to two lines, the address ellipsis in the middle); Russian strings length check. | RA2-States, RA1-Russian |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Continue | A1 | Goes to `<address>.<root>/login`. Unknown address → field error. | no |
| Continue | A2 | Goes to the remembered company's login. | no |
| Use another company | A2 | Shows A1 (forgets nothing). | no |
| Forgot company address? | A1 | A3. | no |
| Email me my addresses | A3 | Sends M6; shows A4. Rate-limited. | no |
| Resend | A4 | Sends again (same limit; "Too many attempts. Try again later."). | no |
| Back to login | A4 | A1. Back arrow: A3. | no |

## Words
Every string is in `words.md` (pulled from the frames); the table holds the product copy.

| Where | Text |
|---|---|
| Heading A1/A2 | Log in to your company |
| Field A1 | Company address · suffix `.noddo.so` |
| Button | Continue |
| Link A1 | Forgot company address? |
| A2 | Last time you logged in here: · Use another company |
| A3 heading / lead | Find your company / You’ll get an email with the address of each company you can log in to. |
| A3 field / button / busy | Work email / Email me my addresses / Sending… |
| A4 heading / text | Check your email / We’ve sent a list of your companies and their addresses to {email}. |
| A4 resend | Not there in a few minutes? · Check your spam folder or resend. · Resending… · Sent again. · Check your spam folder too. |
| A1 busy | Logging in… |
| A4 button | Back to login |
| Pane slogan | Every yes, handled. |
| Errors | listed under States |

## Values
Pane 520 (desktop), form max 400, heading 32/40 (SPEC § 5 heading), lead 15/22 (body-l), controls lg 44 (SPEC § 13.2), radius control 8. Desktop frames are 1280 × 800 (A) — the layout holds from 1024 up; below 768 it is the phone layout.

## Changes to SPEC
See "Common" above.

## New components
See "Common". A2's company tile is new (`RememberedCompany`): 56 logo tile, name 18/26 600, address 13/18 tertiary, the whole tile not clickable — "Continue" is the action.

## Open questions
- Q-14 (A2 needs the remembered company's public logo and name) — blocks nothing; without it A2 shows the address only.
