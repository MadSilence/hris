---
status: ready
screen: sign-in-password
owner: Ulia
updated: 2026-11-13
---

# Login — forgot and reset a password (F1–F8)

## What it is for
Someone who forgot their password asks for a link (F1, F2), sets a new password from it (F3; F4 when Google/Microsoft will be disconnected; F6 when the account is locked and has two-step), and is sent back to log in (F7). An old or used link explains itself (F8).

## Where it lives
`<company>.<root>/login/forgot`, `/login/reset?token=…`. Public. Company look (everyday base). Behaviour: Notion § 14.6. Common: `sign-in-root/spec.md` § "Common". The reset stays a link (not a code); the backend should burn the token only on submit, not on opening the page (mail scanners).

## Layout
- **F1** back arrow · "Forgot your password?" · "Enter your work email and we’ll send you a link to set a new one." · Email · "Email me a link".
- **F2** back arrow (→ F1) · accent circle · "Check your email" · "We’ve sent a link to set a new password to {email}. It works for 1 hour." · "Not there in a few minutes? / Check your spam folder or resend." · "Back to login" (main). The same screen whether or not the account exists (no email if none).
- **F3** "Set a password" (for everyone — also for someone who never had one; Notion F5 is gone) · "For {email}." · one field "New password" with the eye, no confirm · hint "Use at least 8 characters." · "Set password".
- **F4** F3 + pending `InlineAlert`: "Setting a password this way disconnects Google." / (new line) "If you can still log in, set a password in your preferences instead." (provider name changes).
- **F6** F3 + pending alert "Your account is locked after too many failed logins." / "To unlock it, also enter the code from your authenticator app." + `CodeInput` "Code from your authenticator app".
- **F7** accent circle (tick) · "Password changed" · "You’ve been logged out everywhere you used the old one." · "Log in" (→ C8).
- **F8** grey circle · "This link doesn’t work" · "It may be more than an hour old, or it was already used." · "Request a new link" (→ F1).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | "Sending…", "Resending…", "Saving…". | RF1-States, RF2-States, RF3-States |
| Empty | "Enter your email." · "Enter a password." | RF1-States, RF3-States |
| No results | F2 is the same either way. | RF2-Desktop |
| Error | "Enter a valid email, like anna@company.com." · "Too many attempts. Try again later." · "Something went wrong on our side. Try again." · "Use at least 8 characters." · F6 "That code doesn’t match. Try again." · resend: "Sent again." + "Check your spam folder too."; too often: "Check your spam folder." · F8. | States boards, RF8 |
| No permission | — | — |
| Normal | F1–F4, F6–F8 desktop and phone. | RF*-Desktop / Phone |
| Long content | Long email in F2/F3 wraps as a whole word. | RF2-Desktop |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Email me a link | F1 | Sends M4 → F2. Rate-limited (shared with the login code). | no |
| resend / Back to login | F2 | Again (same limit) / company login. | no |
| Set password | F3, F4, F6 | Sets it; logs out every session; F4 disconnects the provider (sends M11 = M10 variant); F6 also checks the code → F7. Sends M17. | no |
| Log in | F7 | Company login with C8's notice. | no |
| Request a new link | F8 | F1. | no |

## Words
Full list: `words.md`; product copy quoted above.

## Values
§ Common.

## Changes to SPEC
§ Common. The F4/F6 alerts use the pending tone (owner: kept as drawn).

## New components
None.

## Open questions
None.
