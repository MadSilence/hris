---
status: ready
screen: sign-in-company-login
owner: Ulia
updated: 2026-11-13
---

# Login — the company's login (C1–C10)

## What it is for
Everyone at a company logs in here every day: with Google or Microsoft, with the company's own SSO, with email and password, or with a one-time code sent by email. It must be quick to recognise ("this is my company"), never reveal whether an account exists, and keep a way in for the System Owner when the company's SSO breaks.

## Where it lives
`<company>.<root>/login` (with `next` from any page — N3). Public. Company look: the company's accent, logo and name; "powered by noddo". Behaviour: Notion § 14.3 (variants by the company's settings in Login & SSO). Common rules: `sign-in-root/spec.md` § "Common".

## Layout
Everyday base, company variant (pane in the company's accent with the ring grid; logo + name + powered by at the foot). White side:
- **Heading** "Log in to {Company}" (no lead; the company cannot change it — `sign-in-appearance`).
- **C2 (default for every company)**: Continue with Google · Continue with Microsoft · "or" · Email (under it the link "Email me a login code", 6 px below the field, 24 px above Password) · Password with "Forgot password?" on its label row, eye toggle · "Log in" · "Not your company? Log in to another one".
- **C1** (company turned Google/Microsoft off, no SSO): the C2 form without the provider buttons and "or".
- **C3** (optional company SSO + buttons): "Log in with Okta" (secondary) above Google / Microsoft; with Entra the company's button reads "Log in with your company account".
- **C4** (optional SSO, buttons off): "Log in with Okta" · "or" · the password form.
- **C5** (SSO required): "Acme logs in through Okta." + one accent button "Log in with Okta"; busy "Taking you to Okta…". At the very foot, under "Not your company?", a quiet grey "System Owner login" (12/16 tertiary) → C6.
- **C6** back arrow · "Log in with a password" · "Only the System Owner can log in this way, if Okta isn’t working." · Email · Password · "Log in". No login code here.
- **C7** (domain connected, Google Workspace required): "Acme logs in with Google Workspace." + the white Google button (never accent — provider rules) + the quiet "System Owner login".
- **C8** (just after a password change, F7 → here): info alert "Your password was changed. Log in with the new one." above the form, email pre-filled.
- **C9** refusals: one message in the form (`FormError` → `InlineAlert` declined), never a toast.
- **C10** (after "Email me a login code"): back arrow · accent circle · "Check your email" · "Enter the 6-digit code we sent to {email}." · `CodeInput` (see `sign-in-registration`) · "Log in" · "Didn’t get it? Check your spam folder or resend." The email M16 also carries a one-click link.

### The background (new, 2026-11-13)
The company chooses in Appearance what sits behind its logo: **Your color** (the pane in the company colour, as drawn here) or **Light** — the pane and the phone's top strip in **Gray 50** with **Gray 200** rings, the company name and "powered by" in Ink, and the nodding rings in the company colour, or in the logo's colours when the logo has several. The white side and every state on it do not change. Frames: `sign-in-appearance` LT1, LT2, LT6 and L7-Light-Login.
A light company colour (Sunflower, or a light "Your own") writes Graphite #2A2A2E on the pane and on the buttons; links and text take the same hue darkened to 4.5 : 1.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Busy buttons: "Logging in…", "Taking you to Okta…", "Sending a login code…" (the link's own line while sending). | RC9-States, RC5-States, RC10-States |
| Empty | "Log in" with empty fields: "Enter your email." · "Enter your password."; login code asked with the email empty: "Enter your email." under Email. | RC9-States, RC10-States |
| No results | Not applicable — the page never says whether an account exists. | — |
| Error | "That email and password don’t match. Check them, or check the company address." · "Too many failed attempts. Try again later." (same for a lock, a restriction, an attack; no time given) · "We couldn’t log you in with Google. Use another way you’ve logged in before, or reset your password." · "We couldn’t log you in with Okta. Try again, or ask your IT team." · "Something went wrong on our side. Try again." · code: "That code doesn’t match. Try again." · "This code has expired. Resend a new one." · "We’ve sent a new code. Check your spam folder too." · "Too many attempts. Try again later." | RC9-States, RC10-States |
| No permission | A person who may not use a way in simply does not see it (variants C1–C7 follow the company's settings). | — |
| Normal | C1–C8, C10, desktop and phone; C3 with Entra. | RC*-Desktop / Phone, RC3-Entra |
| Long content | 63-char company name (pane name 26/32 wraps; heading wraps; phone strip name ellipsis), long email. | RC2-Long, RC2-LongD |
| Link hover | "Email me a login code": accent link with no underline at rest; underline on hover / keyboard focus. | RC1-States |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Continue with Google / Microsoft | C2, C3, C7 | E1 → provider → E1 → the app (or D1 / D4). | no |
| Log in with Okta / your company account | C3, C4, C5 | Company SSO. | no |
| Log in | form | Checks; → D1/D4 if two-step; → `next` or Home. Errors in the form. | no |
| Email me a login code | under Email | Sends M16 to the typed email → C10. Same page whether or not the account exists. Rate limit shared with Forgot password. Hidden when SSO is required (C5–C7). | no |
| Forgot password? | Password label row | `sign-in-password` F1. | no |
| System Owner login | C5, C7 foot | C6. | no |
| Not your company? Log in to another one | foot | `sign-in-root` A1. | no |
| Log in (C10) / one-click link (M16) | C10 / email | Logs in; the second step (D) is still asked. The link works only in the browser that asked. | no |

## Words
Full list: `words.md`. Every product string is quoted in Layout and States above. Pane: "{Company}" · "powered by" + noddo wordmark.

## Values
Pane 520, company logo tile 56 (radius control, white; letter fallback in the accent 28 px), name 40/44 (26/32 long), powered-by wordmark 15 high. White side: heading 32/40, form max 400, controls lg 44. "System Owner login" 12/16 tertiary, 24 px under "Not your company?". Login-code link 13/18 500 accent-text. Desktop frames 1280 × 800 (taller where the form is long).

## Changes to SPEC
§ Common. Plus: the company's own SSO button is the accent button when it is the only way in (C5) — DECISIONS says a provider is never the primary; the owner's ruling: under REQUIRED it *is* the company's main action. Custom-accent ring tints (`color-mix` 78 % / 30 % with white).

## New components
None beyond § Common (`AuthSplit` company variant, `CodeInput`).

## Open questions
None blocking. Backend points for C10 (lifetime, single use, link bound to the browser, second step still asked, shared rate limit, whether a code login resets the password-failure counter) are in `decisions-for-petya.md` § C10.
