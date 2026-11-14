---
status: ready
screen: sign-in-registration
owner: Ulia
updated: 2026-11-13
---

# Registration — start a free trial (B1, B2, B2a, B3, B3a)

## What it is for
Someone who wants to try noddo starts a free trial: they pick Google, Microsoft or their work email, prove the email with a 6-digit code (email path), name themselves and their company, and land in the setup wizard (`first-run-setup`) with a session already open.

## Where it lives
The root (`<root>/signup`, then `<root>/signup/verify`, `<root>/signup/company`). Public. Always noddo's brand (Wine). Behaviour: Notion § 14.2, changed as below. Common rules for all login screens: `sign-in-root/spec.md` § "Common".

## What changed against Notion § 14.2 (approved by the owner)
- **Email first, details later.** B1 asks only for the email (or Google / Microsoft). Name, company and password come after the email is confirmed (B2a).
- **A code, not a link.** B2 is a 6-digit code typed on the same page (cross-device and mail-scanner safe). Notion's verification link and B6 ("the link doesn't work") are gone.
- **Password on B2a**, never a separate "choose how you'll log in" screen (Notion B5 is gone). Provider paths stay password-less.
- **Google and Microsoft both go straight to B3** — Notion's B4 (Microsoft "confirm your email first") is gone. The backend identifies by `tid`+`oid` / `sub`, never links accounts by email, and trusts the email only when Microsoft marks the domain verified (no visible step).
- **Terms as a line**, not a checkbox (Q-15 asks legal to confirm for the EU).
- No "Your company will be at …" previews.

## Layout
First-experience base (`sign-in-root` § Common): form on the left, the Wine card with the orbit on the right; phone = Wine strip + form.
- **B1** "Start your *free trial*" (two-tone, 40/44): Continue with Google · Continue with Microsoft · "or" · field "Business email" · "Continue with email" · line "By continuing, you agree to the Terms and the Privacy policy." · "Already have an account? Log in".
- **B2** back arrow · accent circle (`mail-01`) · "Check your email" · "Enter the 6-digit code we sent to {email}." · `CodeInput` · "Continue" · "Didn’t get it? Check your spam folder or resend."
- **B2a** back arrow · "Create your company" · approved line "{email} is confirmed" (tick) · First name* · Last name* · Company name* · Password* (eye) with hint "Use at least 8 characters." · "Create my company".
- **B3** "Create your company" · "You’re continuing with Google." (or Microsoft) · a read-only identity row: avatar, name, email, "Not you?" · First name* · Last name* (pre-filled from the provider) · Company name* · "Create my company".
- **B3a** grey circle (clock) · "This step has expired" · "For your security, it only lasts 10 minutes. Nothing was created." · "Start again".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Button busy: "Sending code…" (B1), "Checking…" (B2), "Creating your company…" (B2a, B3). | RB1-States, RB2-States, RB2a-States, RB3-States |
| Empty | B1 empty field; B2 empty boxes. | RB1-Desktop, RB2-Desktop |
| No results | Not applicable. | — |
| Error | B1: "Enter a valid email, like anna@company.com." · B1a (provider failed or cancelled): declined alert "We couldn’t continue with Google. Try again, or use your email." · B2: "That code doesn’t match. Try again." · "This code has expired. Resend a new one." · "Too many attempts. Try again later." (resend link then reads "Didn’t get it? Check your spam folder.") · B2a/B3 empty: "Enter your first name." · "Enter your last name." · "Enter your company’s name." · password "Use at least 8 characters." · B3a expired. | States boards |
| No permission | Not applicable. | — |
| Normal | B1, B2, B2a, B3 desktop and phone. | RB*-Desktop / Phone |
| Long content | 70-char email; long first/last name and a 63-char company name (fields wrap nothing, the heading wraps); Microsoft with a long identity. | RB1-States, RB2a-States, RB3-States |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Continue with Google / Microsoft | B1 | Provider (E1 → E2 → E1) → B3. Fails / cancelled → B1 with the alert. | no |
| Continue with email | B1 | Sends M1 (code), opens B2. | no |
| Typing / paste in `CodeInput` | B2 | Paste fills all six; the 6th digit submits by itself. | no |
| Continue | B2 | Checks the code → B2a. | no |
| resend | B2 | Sends a new code; "We’ve sent a new code. Check your spam folder too." Same limit as B1. | no |
| Create my company | B2a, B3 | Creates the company, opens the session → `first-run-setup` (S1). | no |
| Not you? | B3 | Back to B1 (provider account chooser next time — `prompt=select_account`). | no |
| Start again | B3a | B1. | no |
| Log in | B1 | `sign-in-root` A1. | no |

## Words
Full list: `words.md`. Product copy: as quoted in Layout and States above, plus the orbit labels "Workflows · Approvals · Time off · Onboarding · Reviews" and the card "Every yes, handled." / "Approve once. noddo does everything that follows."

## Values
Heading 40/44 Inter Tight 600 (Changes to SPEC, § Common), lead 15/22, controls lg 44, form max 400. `CodeInput`: six equal boxes filling the form width (max 400), 56 high, gap 8, radius control 8, 1 px `border-field` on `surface-card`; digits Inter Tight 600 24/32 tabular; the next box has the focus (accent border + 3 px `accent-muted` ring) and a caret; error = `status-declined-fill` border on all six.

## Changes to SPEC
§ Common. B2a/B3 required fields carry the grey asterisk (FORMS_AND_FIELDS).

## New components
- **`CodeInput`** — 6 boxes; states empty, typing (caret in the next box), checking (boxes disabled + button busy), error (all boxes declined, `FieldError` under), expired. Paste fills all six. Also used by C10 and D1.
- **Identity row** (B3) — avatar 32 + name 15/22 500 + email 13/18 tertiary + "Not you?" link; read-only.

## Open questions
- Q-15 — terms as a line vs a checkbox (legal, EU). Blocks nothing.
