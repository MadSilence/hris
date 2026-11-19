# Design fixes: login flow, round 1 (live check, 19 Nov)

For Petya's Claude Code. Same rules as the other fix packages.

**Scope of this package**

- These rows are **new**.
- The login rows already sent in `design-fixes-misc-1` still stand and are not repeated here. They are:
  - C1: "Send a new one".
  - C2: "powered by" once.
  - C4–C7: the code link, the label row, field padding, "Not your company?".
  - C8: the logged-out alert.
- Z1 (ring grid clipping) is in `design-fixes-company-hub-1`.

## How to use this package

- **`references/`** holds the board frames this file points to.
  - They are the same files as `design/screens/sign-in-*/export/` in the repo, and the same as the "noddo · Login flow" board.
  - Open them in Chrome. The frames are drawn at 1280 × 800; resize the window to compare at 1710.
  - They use the Acme / plum demo company. Build in the company's colour.
- **How it was checked.**
  - Checked live at 1710 × 1112 and 375 × 812.
  - Company pages were checked on local-sandbox.
  - Root pages were checked on noddo.so: login, find your company, trial.
  - Test addresses were used (`nobody.test@example.com`), never a real account.
- **Precedence:**
  - A number in this file wins over the HTML.
  - The HTML wins over a vague sentence.
  - The specs (`design/screens/sign-in-*/spec.md`) give the words.
- **Change nothing that isn't listed.**

| Name | Value |
|---|---|
| Ink | #0B0B0C |
| text-secondary | #45454A |
| text-tertiary | #6B6B70 |
| border-field | #DADADF |
| Mist | #F7F7F8 |
| Error text | #A12215 |
| Error border | #C42B1C |
| Declined soft | #FDEDEB |

---

## A. Shared — every login screen

| # | Where | Now | Must be |
|---|---|---|---|
| A1 | **Field error text** (all forms: login, code, forgot, find your company, trial) | 12/16 **#C42B1C**, **14** under the field | 12/16 400 **#A12215** (Error text) with the alert icon 16, gap 6. **8** under the field. The field border is #C42B1C (as now). |
| A2 | **Label → field**, every field (Email, Company address, Work email, Business email) | 34 from the label's top to the field's top | **26**: label 18, then **8**, then the field 44. Misc C5 fixed this only for the Password row; it applies to every field. Field padding **0 14** (misc C6) everywhere too. |
| A3 | **Status screens with a circle** (Check your email in C10, F2 and B2; This link doesn't work F8; the invitation pages G5) | Circle 48 and heading in one group: **24** from the circle to the title | The circle is its own block: **20** from the circle to the title, then title, 8, line (board RC10, RF2, RF8, RG5). |
| A4 | **"Not there / Didn't get it?" line under a code or link** (C10, F2) | 14/20 400 #45454A, on two lines; "resend" a 14/20 400 accent button | **13/18 400 #6B6B70**, wrapping only when it must; "resend" **12/16 500 accent-text**, underlined on hover. |

## C. Company login (`sign-in-company-login`)

| # | Where | Now | Must be |
|---|---|---|---|
| C9 | **Empty fields** (RC9-States C9-1) | "Enter your email." **and** "Email me a login code" are both under the Email field | While the Email field shows an error, **the "Email me a login code" link is hidden**. The error takes its place (board C9-1). It comes back when the field is valid again. |
| C10 | **Wrong email or password** (RC9-States C9-3) | The alert sits **between the Password field and Log in**. It has a 1 px #EAB5B0 border, radius 8, padding 10 12, gap 10, text 14/20. Words: "That email and password do not match an account. Please check your company address." | The `InlineAlert` (declined) is the **first thing in the form**, above the provider buttons or the Email field, 28 under the title. It has fill #FDEDEB, **no border**, radius **10**, padding **12**, gap **8**, icon 16, text **13/18 400 #A12215**. Words: **"That email and password don’t match. Check them, or check the company address."** The same place and style for every refusal: "Too many failed attempts. Try again later.", the Google, Okta and our-side messages (spec C9). |
| C11 | **Login code: no way back** (C10 "Check your email") | No back arrow; the only way back to the password form is reloading | The **back arrow** (36, top left of the white side, as on F1/F2) goes back to the login form (board RC10-Desktop). |
| C12 | Login code: **the six boxes** | 53 × 52 each, 360 wide in all (not the form's width), border **#B4B4BA** | **60 × 56**, 8 apart, so the six fill the **400** form width. Border **#DADADF**, radius 8. The box in focus has a 1 px accent border. Digits Inter Tight 24 tabular (CodeInput). |
| C13 | Login code: words | "Not there in a few minutes? Check your spam folder or resend." | **"Didn’t get it? Check your spam folder or resend."** (board RC10). Style A4. |
| C14 | **Login code — wrong code for an email with no account** | "**This code has expired.** Resend a new one." straight after the first try | **"That code doesn’t match. Try again."** The screen behaves the same whether or not the account exists (spec C10), so it never says "expired" for a code that was never valid. "This code has expired. Send a new one." (misc C1) only for a real code past its time. |
| C15 | Login code — **resend** | The line becomes "Sent again. Check your spam folder too." and the old error stays under the boxes | **"We’ve sent a new code. Check your spam folder too."** (spec C9). Resending **clears** the error and empties the boxes. |

## F. Forgot password (`sign-in-password`)

F1, F2 (Check your email) and F8 (This link doesn't work) are OK apart from A1–A4. F3–F7 need a real reset link; see "Not checked".

## R. The root (`sign-in-root`, noddo.so)

| # | Where | Now | Must be |
|---|---|---|---|
| R1 | A1 "Company address" — the **".noddo.so"** ending | Plain grey text 14/20 laid over the input's right end (input padding-right 112) | An **add-on inside the field**: a Mist #F7F7F8 block on the right, full height (42), padding **0 14**, ".noddo.so" **15/22 400 #6B6B70**, no space after the dot. The input text stops where the add-on starts (board RA1). |
| R2 | A1 "Forgot company address?" | 14/20 400 | **13/18 500 accent-text** (board RA1). |
| R3 | **A1 with an address that has no company** ("no-such-company-zz") | Goes to `no-such-company-zz.noddo.so/login` and shows a **full login form "Log in to no-such-company-zz"** for a company that does not exist | Never show a login form for a company that doesn't exist. Stay on A1 with a field error (spec Actions: "Unknown address → field error"). Words (Ulia, 19 Nov): **"We can’t find that company. Check the address, or find your company by email."** — "find your company by email" is a link to A3 (Find your company). |
| R4 | "Log in to another one" on the **sandbox** login | Goes to **https://noddo.so/login** (the production root) | On a test environment it must go to **that environment's** root, never to production. Check where the root comes from in the sandbox config. |

## B. Free trial (`sign-in-registration`)

| # | Where | Now | Must be |
|---|---|---|---|
| B1 | Address | `/signup` redirects to `/login` (the "Last time you logged in here" tile). The trial lives at `/trial` | Spec: **`<root>/signup`** (then `/signup/verify`, `/signup/company`). Make `/signup` the trial, and keep `/trial` as a redirect if it is already shared. |
| B2 | B1 provider buttons | No "Continue with Google / Continue with Microsoft" and no "or" | As board RB1: both provider buttons (secondary 44), then "or", then the email form. If Google/Microsoft aren't configured on this environment, tell us. On production they must show. |
| B3 | B1 terms line | "Terms" and "Privacy policy" are **plain grey text** | **Links**: 12/16 500 accent-text (board RB1). |
| B4 | "Already have an account? Log in" | 14/20 #45454A + link 14/20 400 | "Already have an account?" **13/18 400 #6B6B70**, 8, "Log in" **13/18 500 accent-text**. |
| B5 | Right Wine panel | "Every yes, handled." and the line only | Plus the **ring illustration** under them (500 × 440, board RB1), as on the login pane. |

## Not checked: needs real email or a setting (for Petya)

- **Registration B2–B3a**: noddo.so answers "Registration is closed here. Ask your administrator for an invitation." Tell us which environment has the trial open.
- **Invitation G1–G4, first login, welcome**: these need an invitation email. We will run them with an address Ulia can read.
- **Reset password F3–F7**: these need a reset email. Same plan.
- **Two-step D1–D6**: turning it on in Login & SSO logs out everyone it covers, the owner included. To be done with Ulia.
- **SSO C3–C6**: these need a working test identity provider.
- **Too many attempts** (C9-4): not provoked on purpose, so as not to lock the sandbox's IP.

## P. My preferences → Two-step login → Set up (dialog; not on a board yet, Ulia's notes, 19 Nov)

| # | Where | Now | Must be |
|---|---|---|---|
| P1 | Line under the title | "Add your account to an authenticator app." and then the paragraph "Scan this with an authenticator app — …" | **Remove the first line** (Ulia: it repeats the paragraph). Title, then the paragraph. |
| P2 | The dialog's frame | A thick accent outline around the whole dialog, as if it were a focused field | No outline on the dialog. Focus goes to the first control inside; the dialog keeps the standard modal look (radius, level-3 shadow). |
| P3 | "Can't scan? Enter a key instead" | Straight apostrophe | Typographic apostrophe: "Can’t scan? Enter a key instead" (as every other string). |

## D. Second step at login (`sign-in-second-step`), checked with the owner's real account, 19 Nov

D1 "Two-step login", its wrong-code error, D2 "Use a backup code" (empty and wrong code) and the back arrow: **words and flow OK.** The fixes are the shared ones:
- the code boxes as C12 (60 × 56, the full 400 width, border #DADADF);
- error text as A1;
- label → field as A2.

Also:

| # | Where | Now | Must be |
|---|---|---|---|
| D7 | D1 "Use a backup code" | 14/20 500 button | Link **13/18 500 accent-text**, 28 under the form (board RD1). |

"Remember this device for 30 days" is not shown for the System Owner: correct (spec D1).
D3 (after a backup code), D4/D5 (setting it up at login) and D6 were not checked: they need a second admin, and a demo company can't invite one.

## E. Login code email (M16), received in Gmail, 19 Nov

| # | Where | Now | Must be |
|---|---|---|---|
| E1 | The person's email in the first line ("Log in to Local Sandbox as ulia@… with this code") | Gmail turns it into a **blue underlined link** | As board M16: the address in **500 Ink**, not a link. Stop mail apps auto-linking it: wrap it in a `<span>` with `color:#0B0B0C; text-decoration:none` **and** break the auto-detection (e.g. `ulia&#8203;@&#8203;6-software.com`, or an `<a>` with no href styled as text). Same everywhere an email address sits in an email's text (M1, M2, M7, M16…). |
| E2 | Sender | "Local Sandbox via noddo" | Misc M1 stands (Ulia: the sender is noddo). Gmail shows "via" because the From domain differs from the sending domain: sign the mail for the From domain (DKIM) so "via" disappears. |

## S. Protection against bots (Ulia, 19 Nov: "we seem to miss a captcha")

Every public form that sends an email or checks a secret can be repeated by a script. During this check, an automated browser could send login codes, reset links and trial codes for any address, and try passwords. Only "Too many attempts" is in the spec; we did not hit it, and we could not see whether it exists. The forms are:
- trial (B1), find your company (A3), login code (C10), forgot password (F1), log in (C1–C4), the code boxes (C10, B2).

Asked, in this order:
1. **Rate limits on the server, for every one of these.** Per email and per IP, on sending a code or link, on checking a code, and on passwords. When hit, the existing words: "Too many attempts. Try again later." / "Too many failed attempts. Try again later." Tell us the limits you set.
2. **An invisible bot check** (for example Cloudflare Turnstile in managed mode) on the forms that **send email**: B1, A3, C10, F1. No puzzle for people. If it ever needs to show something, that is a new piece of UI: tell us first, and Ulia draws it.
3. On the sandbox, give the test team a way to pass the check (a test key), so automated checks still work.

## Not testable now
- **A demo company sends no invitations** ("A demo company sends no invitations. Go live first, then invite your real people."). So the invitation (G1–G4), a new person's first login and the welcome can't be run on local-sandbox while it is a demo. Petya: a second sandbox company that is live, or a switch to allow invitations in the sandbox.
