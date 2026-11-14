---
status: ready
screen: sign-in-invitation
owner: Ulia
updated: 2026-11-13
---

# Login — an invitation (G1–G5)

## What it is for
A person invited to a company opens the link from M2 and joins: with Google / Microsoft or by creating a password (or with the company's SSO when it is required). The page welcomes them warmly and never shows who invited them or any colleague (nothing about the company is shown before login beyond its logo and name). After joining the session opens → D4 if the company requires two-step → `first-run-welcome`.

## Where it lives
`<company>.<root>/invite?token=…`. Public. Company look. Behaviour: Notion § 14.7 (G6 "You're in" is removed — acceptance opens the session). Common: `sign-in-root/spec.md` § "Common".

## Layout
Desktop: the company pane (520, accent) carries, top to bottom: the company's logo + name (40 tile, 20/28), a 6 × 3 ring grid, and at the foot a huge two-tone welcome "Welcome / to Acme, / Anna." (Inter Tight 600 60/60, the name in `color-mix(accent 45%, white)`) with "powered by noddo" under it. The white side:
- **G1** "Join your team" (32/40) · "You’re joining as {email}." · Continue with Google · Continue with Microsoft · "or" · "Create a password" (eye) · hint "Use at least 8 characters." · "Join Acme".
- **G2** G1 + declined alert above the buttons "We couldn’t connect your Google account. Try again, or create a password." (the invitation stays unused).
- **G3** password only (company switched the buttons off; also a System Owner invited into an SSO-required company).
- **G4** SSO required: "You’re joining as {email}. At Acme, everyone logs in with Okta." · one accent button "Join with Okta".
- **G5** (the invitation doesn't work) — everyday company base, grey circle, one heading per reason (see Words); only "already used" has a button ("Log in").
Phone: the company strip; heading "Welcome to Acme, Anna" (name in the accent) instead of the pane welcome; lead and form as desktop; "powered by noddo" at the foot.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | "Joining…", "Taking you to Google…", "Taking you to Okta…". | RG1-States, RG4-States |
| Empty | "Enter a password." | RG1-States |
| No results | — | — |
| Error | "Use at least 8 characters." · I9: "This Google account is already used by someone else at Acme. Use another one, or create a password." · G2 alert · G5 (expired / already used / withdrawn / link broken). | RG1-States, RG2, RG5-* |
| No permission | — | — |
| Normal | G1–G4 desktop and phone. | RG*-Desktop / Phone |
| Long content | Long first name and company: the pane welcome wraps (60/60 keeps up to 4 lines), phone heading wraps. Long email wraps whole. | (as C long) |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Continue with Google / Microsoft | G1 | Provider → joins with that account → D4 or `first-run-welcome`. | no |
| Join Acme | G1, G3 | Creates the password, joins. | no |
| Join with Okta | G4 | Company SSO → joins. | no |
| Log in | G5 already used | Company login. | no |

## Words
| Where | Text |
|---|---|
| Pane | Welcome / to Acme, / Anna. · powered by noddo |
| Phone heading | Welcome to Acme, Anna |
| Heading / lead | Join your team / You’re joining as {email}. |
| Field / hint / button / busy | Create a password / Use at least 8 characters. / Join Acme / Joining… |
| G4 | You’re joining as {email}. At Acme, everyone logs in with Okta. · Join with Okta · Taking you to Okta… |
| G5 expired | This invitation has expired · Ask the person who invited you to send a new one. |
| G5 used | This invitation was already used · If you accepted it, log in to Acme. · Log in |
| G5 withdrawn | This invitation was withdrawn · Ask the person who invited you if you should still join Acme. |
| G5 broken | This invitation link doesn’t work · The link may be cut short. Open it again from the email, or ask for a new invitation. |
Full list: `words.md`.

## Values
Pane welcome 60/60 Inter Tight 600, −0.04em; logo 40 + name 20/28; grid 6 × 3. Rest § Common.

## Changes to SPEC
§ Common + display size 60.

## New components
None beyond § Common.

## Open questions
None.
