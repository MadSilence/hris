# Login flow — design decisions and why (groups A–G)

For Petya. What the designs on the board "noddo · Login flow" (https://claude.ai/artifact/H9grLNUm3zppHx2Wt3TNT9, pages A, B, C) change against Notion "SOCIAL_SIGN_IN_DESIGN" § 14, and the reasoning behind each change. Decided by Ulia on 2026-11-11. Groups A and B are approved; group C is in review.

---

## Product-wide

### 1. "Log in", never "sign in"
**Notion / code:** "Sign in" everywhere (Sign in to your company, Signing in…, Sign in with Okta, Two-step sign-in…).
**Now:** "Log in" as a verb ("Log in to your company", "Logging in…", "Log in with Okta"), "login" as a noun ("Back to login"). It applies to every group still to come: D, F, G and the emails.
**Why:** this is Ulia's product voice decision: one word across the whole product. It's a copy change, so every string in the specs lists the new wording.

### 2. Plain, short copy
Lines that don't help the person act were cut: the A1 lead line, the "Your company will be at …" previews in registration, "Acme will be at …". Sentences that hedge in order not to leak information were made direct, as long as that keeps them safe (see A4).

### 3. Google / Microsoft always above the password
On every screen that offers them (B1, C2, C3, C8), "Continue with Google" and "Continue with Microsoft" come first as the primary options, then an "or" divider, then the email form.
**Notion:** on the company login (C2) the buttons were under the password form.
**Why:** one order everywhere. The person sees the same layout on registration and on login, so they learn it once.

### 4. Going back: an arrow in the card's top-left corner, not a link at the foot
**Now (Ulia):** every screen reached *from* a first screen (A3, A4, B2, C6, C10, and every later group's follow-up screens) has a back arrow in the top-left corner of the card: a ghost icon button 36 (SPEC § 13.2), `arrow-left-01`, 16 px from the card's edges (12 on phone), accessible name and tooltip "Back". It returns to the previous screen. The foot links that did the same job are gone: "Back to login" (A3), "Try another email" (A4), "Use another email" (B2), "Log in with Okta instead" (C6), "Log in with a password" (C10).
**Kept:** A4's "Back to login" button stays — it is the screen's main action (to A1), while the arrow goes one step back (A3).
**Why:** one consistent, familiar way back; fewer lines at the bottom of each card.

---

## Group A — finding a company (root)

### A1 — company address first: kept on purpose
The flow starts with the company address (acme.noddo.so), not with an email. **This is decided and isn't a question.**

### A1 — no hint under the company address
The line "You'll go to your-company.noddo.so" under the field is removed for good (Ulia: if I type the company address, I know that's where I'm going). No hint under this field on any login screen.

### A1 — no "Start a free trial" link
**Notion:** A1 had a link to start a trial.
**Now:** A1 has only "Forgot company address?". A2 has no trial link either.
**Why:** people who reach the login already have a company. A trial link here is noise for 99% of visitors and competes with the one action on the page. The trial starts from the website.

### A2 — the remembered company shows its logo and name
**Notion:** a "Continue to acme.noddo.com" button.
**Now:** a tile with the company's logo (or its first letter on the company's colour when no logo is uploaded), its name and its address, plus a plain "Continue".
**Why:** people recognise their company by its logo and name faster than by an address. A 63-character address can't fit in a button.
**Needs from the code:** today the browser remembers only the address. The root page must fetch the company's public logo and name, the same data its own login page already shows publicly. → QUESTIONS.md.

### A3 — copy
Lead: "You'll get an email with the address of each company you can log in to." The field is labelled "Work email". "Enter your work email." was cut (Ulia: the field already asks for it).

### A4 — "Check your email" with resend
**Notion:** "If that email can sign in to any company, we have sent it the addresses." No resend.
**Now:** "We've sent a list of your companies and their addresses to anna@acme.com." Below it: "Not there in a few minutes? / Check your spam folder or resend."
**Why:**
- The "If …" wording was hard to read (Ulia rejected three versions). The screen still shows the same message whatever exists, so it never reveals whether the email has an account. If there's no account, simply no email arrives. Slack and most products do the same.
- Resend is the normal way out when the email doesn't arrive. It uses the same rate limit as A3 and shows "Too many attempts. Try again later." when that limit is hit.

---

## Group B — registration (the biggest change)

### The new flow
1. **B1 · Start your free trial** — Continue with Google · Continue with Microsoft · or · Business email only → "Continue with email".
2. **B2 · Check your email** — a 6-digit code on the same page.
3. **B2a · Create your company** — "✓ anna@acme.com is confirmed", first and last name, company name, password → the company is created and the session opens → /setup.
4. **B3 · Create your company** after Google or Microsoft — name and email from the provider, email read-only, company name, no password → the company is created and the session opens → /setup. **B3a** covers the 10-minute handoff expiring.

**Removed from Notion:** B4 (Microsoft "confirm your email first"), B5 ("Choose how you'll log in" after the email link), B6 (verification link doesn't work).

### B1 — email first, details later
**Notion:** one long form before any verification: email, first and last name, company name, consent checkbox. After the email link came B5, a choice of Google, Microsoft or a password.
**Now:** B1 asks only for the email. Name, company and password come after the email is confirmed (B2a).
**Why:**
- It's the pattern people know from Notion, Slack, Linear and Figma.
- If someone mistypes their email, they lose one field, not a whole form.
- We don't collect a name, company and password for an address we haven't confirmed yet.
- Each step is easy. More screens, but less work per screen.

### B2 — a code, not a link
**Notion:** a verification link in the email.
**Now:** a 6-digit code typed on the same page. Paste fills all six boxes, and the code sends itself on the 6th digit. States: typing, checking, wrong code, expired, resent, too many attempts.
**Why:**
- A link breaks the flow when the email is opened on another device. The person registers on a laptop, opens the email on their phone, and the company gets created and opened on the phone. With a code they stay where they started.
- Some mail security scanners open links before the person does and burn single-use tokens. A code doesn't have this problem.
- It's what people expect today.
- With no link there's no "link doesn't work" screen (B6 is gone). Expiry and wrong code are inline states.
- The same code mechanism is reused for the login code (C10).
**New component:** the 6-box code input. → "New components" in the spec.

### B2a — password after the code
**Notion S7:** the password was optional. B5 offered Google, Microsoft or a password after the link.
**Now:** the email path always sets a password on B2a. The provider paths (B3) stay password-less, as in S7. People can add other ways in later.
**Why:** B5 was a strange screen. The person had already chosen email on B1, and B5 asked them again how they want to log in, offering Google and Microsoft a second time. Asking for the password inside the details form removes a whole step, and it's what people expect after choosing email.

### B3 — Google and Microsoft go straight to "Create your company"
**Notion R2 / B4:** Microsoft's `email` claim doesn't prove ownership (nOAuth), so a Microsoft registration had to confirm the email first (B4).
**Now:** both Google and Microsoft land directly on "Create your company", with no extra confirmation step.
**Why:**
- Every mainstream product (Slack, Notion, Figma, Linear) lets you in right after "Continue with Microsoft". An extra email step after choosing Microsoft feels broken: you chose Microsoft precisely to skip email.
- The real nOAuth risk is attaching a Microsoft login to an *existing* account by matching the email. Registration creates a *new* company, so the worst case is someone starting a trial with an address they don't own. That gives them no access to anyone else's data.
**What the backend must do instead of the screen:**
1. Identify the person by `tid` + `oid` (Microsoft) / `sub` (Google), never by email. This is already the rule in Notion § 7.
2. Never link or merge accounts by email.
3. Where the email matters, trust it only when Microsoft marks the domain as verified (the verified-domain claim). Otherwise treat it as unverified in the background, without adding a visible step.

### Terms: a line, not a checkbox
**Notion:** a consent checkbox on B1 and B3.
**Now:** one line under the B1 actions: "By continuing, you agree to the Terms and the Privacy policy."
**Why:**
- A checkbox is an extra action people forget, and it causes a validation error.
- The Google and Microsoft buttons on B1 skipped the checkbox anyway. One line covers all three ways in.
- It's the common pattern.
**Check:** legal should confirm that an explicit checkbox isn't required for our markets (EU). → QUESTIONS.md.

### Provider buttons with the official logos
**DECISIONS.md:** no provider logo on the SSO button.
**Now:** "Continue with Google / Microsoft" carries the official Google and Microsoft marks. These are secondary buttons, except in the cases under C5/C7 below.
**Why:** Google's branding rules require its logo on this button, and people find the button by its logo. This is an exception to the DECISIONS rule for these two buttons only. The build uses the official files from Google's and Microsoft's brand kits.

### No address preview in registration
The "Your company will be at acme.noddo.so" lines were removed from all registration screens. Ulia: they add a line without helping the person act.

---

## Group C — the company's login (in review)

### C2 is the default for every company
The company's logo and name sit at the top of the card. The title is **"Log in to Acme"**, with no lead line. Below it: Google / Microsoft (first, as the primary options), "or", Email and Password, then "Log in"; under the Email field the link "Email me a login code" (→ C10). "Forgot password?" sits on the Password label row. At the foot: "Not your company? Log in to another one", and "powered by noddo" at the bottom of the page (SPEC § 2).
**Title — Notion / first draft:** "Welcome back" / "Log in to continue to Acme."
**Why it changed:** "Welcome back" is wrong for someone who arrives for the first time, for example a person invited long ago who logs in only now. "Log in to Acme" is true for everyone and needs no second line. The company can override the headline and sub-heading in Appearance (group L).

### C10 — log in with an emailed code (magic login) — new
**Ulia: "There must be a way to log in by magic link."**
**Now:** both ways sit on the same screen at once, and the password stays the main one. Right under the Email field there is a hint line: the link "Email me a login code". It sends a 6-digit code to the email in that field; while sending, the line reads "Sending a login code…"; if the field is empty, the field shows "Enter your email." This applies to C1, C2, C3, C4 and C8.
Next comes **C10 "Check your email"**: the company's logo, "Enter the 6-digit code we sent to anna@acme.com.", the same 6-box input as B2, "Log in", "Didn't get it? Check your spam folder or resend.", and "Log in with a password". States: sending, checking, wrong code, expired, resent, too many attempts.

**Iterations (Ulia):**
1. A small link "Email me a login code" under "Log in": it wasn't clear that the code goes to the email typed in that same form.
2. A separate code *mode* that swaps the password out: rejected, because it makes the code look like the default and hides the password.
3. A second, secondary button under "Log in": rejected, too heavy.
4. **Kept (option 2 of four drawn, without a "No password?" lead-in):** the link sits under the Email field, so it's obvious where the code goes, and the password with its primary "Log in" stays the main way.

**Why a code at all:**
- It's the standard way in today (Slack, Notion, Linear). People who forgot their password just log in, without a reset.
- One mechanism and one component with registration (B2): a code, not only a link, so the cross-device and mail-scanner problems don't apply.
**What the backend must decide:**
- the email carries the code and a one-click link (a new M-entry);
- the screen is the same whether or not the account exists, so it reveals nothing;
- lifetime, single use, and the link bound to the browser that asked for it;
- the second step (group D) is still asked after the code;
- lock and restriction rules, and rate limits shared with Forgot password;
- hidden when company SSO is REQUIRED (C5, C6, C7);
- whether a successful code login resets the password-failure counter (probably not, as with providers in Notion § 5.3 R5).

### Provider button labels stay "Continue with Google / Microsoft"
Considered "Log in with Google" on the login screens. Ulia: change nothing. The same label on registration and login is what Google's own guidelines suggest, and it works for both new and returning people.

### The company's own button is the accent when it's the only way in (C5, C7)
**Notion / DECISIONS:** "a provider is never the primary, accented button: a sign-in through somebody else's page is not the company's main action".
**Now:** when the company makes its own provider the only way in, that button is the primary, accented button. This covers SSO REQUIRED ("Log in with Okta", C5) and a connected Google Workspace that is required ("Continue with Google", C7). Everywhere else (C2, C3, C4, C8) provider buttons stay secondary.
**Why:** the DECISIONS rule exists because, next to a password, the provider isn't the company's main action. Under REQUIRED it *is* the company's main and only action. A lone grey button reads as secondary or disabled, and people hesitate. Ulia agreed.

### SSO REQUIRED: the System Owner's way back in stays, but quiet (C5, C6, C7)
**Notion / code today:** under REQUIRED, a "System Owner? Log in with a password" link (accent colour, right under the button) opened the password form under the Okta button (C6).
**Now (Ulia):** the company's button is the only visible way in. At the very foot of the card, under "Not your company?", a small grey "System Owner login" (12/16, `--text-tertiary`, no accent) opens **C6**, a separate screen: "Log in with a password", "Only the System Owner can log in this way, if Okta isn't working.", Email, Password, "Log in", "Log in with Okta instead". The same quiet link on C7 (Google Workspace required).
**Why:** the path is needed so a company isn't locked out when its SSO breaks, but nobody else should notice it. The first draft gave it too much weight; mixing the Okta button and a password form on C6 was confusing (Ulia).

### Considered and kept as Notion has it (Ulia)
- **C3, many ways at once** (Okta + Google + Microsoft + password): an email-first "identifier" step was considered and rejected. All options stay visible.
- **No "Keep me logged in" checkbox.** The session lifetime is the company's setting, and the remembered device lives in the second step (D).

### Other C details
- C3 with Entra: the company's button reads "Log in with your company account", so it isn't confused with "Continue with Microsoft".
- C9: every refusal is one message inside the form, never a toast. "That email and password don't match. Check them, or check the company address." · "Too many failed attempts. Try again later." (the same sentence for a lock, a restriction and an attack, with no time given) · "We couldn't log you in with Google. Use another way you've logged in before, or reset your password." · "We couldn't log you in with Okta. Try again, or ask your IT team." · "Something went wrong on our side. Try again."

---

## Group D — the second step (in review)

Drawn on the company's look (Acme), page D. Status of every screen: `today`, redrawn.

- **Wording:** "Two-step login" (not "sign-in"). D1: "Enter the 6-digit code from your authenticator app."
- **D1 uses the same 6-box code input as B2 / C10** (one component for every code); it sends itself on the 6th digit. Notion has a single code field.
- **"Start over" is the back arrow** (rule 4) → the company's login. "Use a backup code" stays as a link (a different way, not "back"). On D2, "Use the app instead" is the back arrow → D1.
- **Remember this device:** a checkbox "Remember this device for 30 days", shown only when the company allows it and the person isn't a System Owner (MFA_DESIGN § 3.4; today's code always shows it). D1-1 draws it hidden. **30 days is an assumption** — the length should come from the company's setting. → QUESTIONS.md.
- **Messages:** wrong code "That code doesn't match. Try again." · too many "Too many attempts. Try again later." (the same sentence as C9) · empty backup code "Enter a backup code." · wrong or used backup code "That code doesn't work. Check it, or use another one."
- **Timed out (5 minutes):** its own screen, grey circle (clock), "Your login timed out", "For your safety, the second step has to be done within 5 minutes.", "Log in again".
- **D3:** "You're logged in" + how many codes are left. With 1 or 0 left the screen offers "Set up again" (primary) and "Later"; with 0 the icon is grey (warning). "Set up again" → D4 then D5 with a new set. Needs a backend check that re-setup from here is allowed. → QUESTIONS.md.
- **D4 (required by the company):** no back arrow — it can't be skipped. Two numbered steps: "1. Scan this with your authenticator app" (QR in a white tile), "Can't scan? Enter a key instead" reveals the key (JetBrains Mono, Mist panel, "Copy key"); "2. Enter the 6-digit code it shows" (6 boxes), "Turn on". Wrong code: "That code doesn't match. Check the time on your phone and try again."
- **D5:** ten codes in a Mist panel, two columns, JetBrains Mono; "Download" and "Copy" side by side (secondary, Copy → "Copied" with a tick); the checkbox "I've saved these codes" is required for Continue; without it: "Confirm that you've saved the codes."
- **D6:** grey circle, "We couldn't set up two-step login", "Something went wrong on our side. Log in again to try once more.", "Log in again".
- **No Stepper on D4 → D5 (Ulia).** DESIGN_SYSTEM § 5 asks for a Stepper / StepRing on wizards; with only two screens and numbered steps inside D4, Ulia chose to leave it out. Record it as an exception.

---

## Group E — on the way to a provider and back (in review)

- **E1** (auth.<root>, both ways, usually not seen): noddo's own look, **no card** — the noddo wordmark whose "o" nods as the loader (SPEC § 9, 1.1 s loop; DESIGN_SYSTEM § 5 "Waiting": NodRing), and one line: "Taking you to Google…" / "Taking you to Microsoft…" / on the way back "Logging you in…". No action.
- **E3** (auth.<root>, nowhere to send the person back): the grey circle with an icon, "We couldn't finish logging you in", "The link may be out of date, or something went wrong on our side.", "Go to login" → A1.
- **Login error screens use the grey circle, not illustrations (Ulia).** B3a, D1 timeout, D6 and E3 keep a 48 px Mist circle with a 24 px icon. Illustrations are for inside the product. This is a deliberate exception to DESIGN_SYSTEM § 5 ("Empty, error → EmptyState / ErrorState with an illustration") for the login screens only. The Sandbox page on the board shows the variants that were compared.

---

## Group F — forgot and reset a password (approved)

Company look (Acme), page F.
- **F1** "Forgot your password?", "Enter your work email and we'll send you a link to set a new one.", Email, "Email me a link". Back arrow (rule 4) instead of "Back to sign in". Messages as A3: "Enter your email." · "Enter a valid email, like anna@company.com." · "Too many attempts. Try again later." · "Something went wrong on our side. Try again."
- **F2** written like A4 (Ulia rejected the "If an account exists…" wording there): "Check your email", "We've sent a link to set a new password to anna@acme.com. It works for 1 hour." The screen is still the same whatever exists — no email arrives if there's no account. Added resend ("Not there in a few minutes? / Check your spam folder or resend.", same limits as F1) and kept "Back to login" as the main button; the back arrow → F1.
- **F3** "Set a password" for everyone, "For anna@acme.com." (Notion: "Hi Anna" — the email says more about which account). **One password field with the eye, no Confirm**, hint "Use at least 8 characters." — the same as B2a. Button "Set password". Messages: "Enter a password." · "Use at least 8 characters."
- **F4** F3 + a warning InlineAlert (tone pending, Ulia): "Setting a password this way disconnects Google. If you can still log in, set a password in your preferences instead." (the provider's name changes).
- **F5 removed (Ulia).** It differed from F3 only by the title. F3 now says "Set a password", which is true both for someone who had a password and for someone who only logged in with Google, Microsoft or SSO. The code needs no "had a password" branch on this page.
- **F6** F3 + a warning (tone pending) "Your account is locked after too many failed logins. To unlock it, also enter the code from your authenticator app." + the 6-box code ("Code from your authenticator app"). Wrong code: "That code doesn't match. Try again."
- **F7** accent circle with a tick, "Password changed", "You've been logged out everywhere you used the old one.", "Log in" → login with C8's notice.
- **F8** grey circle, "This link doesn't work", "It may be more than an hour old, or it was already used.", "Request a new link" → F1.
- Still a link (not a code) for the reset — as today. Mail scanners can burn a single-use link; the backend should confirm the token only on the form's submit, not on opening the page.

---

## Group G — an invitation (in review)

Company look (Acme), page G.
- **G1** "Welcome, Anna", "You've been invited to join Acme as anna@acme.com." (the invited email in the lead, not a read-only field). Google / Microsoft first, "or", then **one Password field with the eye, no Confirm** (as B2a and F3), hint "Use at least 8 characters.", button "Set password and join" (busy "Joining…"). Messages: "Enter a password." · "Use at least 8 characters." · I9: "This Google account is already used by someone else at Acme. Use another one, or set a password."
- **Dropped:** Notion's line "more ways can be added later" — it doesn't help the person act (same rule as the cut previews in B).
- **G2** G1 + "We couldn't connect your Google account. Try again, or set a password." above the buttons; the invitation stays unused.
- **G3** password only (company switched the buttons off; also a System Owner invited into an SSO-required company).
- **G4** SSO required: lead adds "Acme logs in through Okta.", one accent button "Join with Okta" (as C5), busy "Taking you to Okta…".
- **G5** grey circle, one title per reason: "This invitation was already used" + "If you accepted it, log in to Acme." + "Log in" · "This invitation has expired" + "Ask the person who invited you to send a new one." · "This invitation was withdrawn" + "Ask the person who invited you if you should still join Acme." · "This invitation link doesn't work" + "The link may be cut short. Open it again from the email, or ask for a new invitation." Only "already used" has a button.
- **G6** is not drawn (removed by Notion: acceptance opens the session → D4 if required → /welcome).

---

## First impression — in exploration (Ulia, 2026-11-12)

Ulia: the invitation and the first login must feel welcoming and bright, not like every other auth card. She shared Personio's flow as a reference: a big soft shape in the brand colour behind the card, a large headline above it, then a full-screen "Welcome, Ulia!" → steps with a dot progress on the left and a live profile preview on the right (name, photo) → "Ready to dive in?".
Sandbox page, variant D: the page in the company's soft colour (accent-subtle) with one large arc (accent-muted) and a deeper accent glow bottom-left; "Welcome to Acme, Anna" at 56 px above the card; the next screen "You're in, Anna!" + "Get started" on the same background. **If chosen, it's a "Changes to SPEC" item**: a decorative accent-family background beyond AuthScreen's two corner glows, and a 56 px display size.
Ulia then set the bar: **these screens must read as a continuation of the landing page** (noddo.so: two-tone Inter Tight display headlines, "Every yes, handled.", Wine blocks with the ring grid where one ring nods) — "an experience, expensive and pleasant". Sandbox variant E: invitation = a solid block in the company's accent with the ring grid (one ring offset = the nod) and a 64 px two-tone "Welcome to Acme, Anna." (name at 60 % white), the form on white with a 32 px heading "Join your team."; the welcome after joining = white page, 96 px "You're in, Anna." (name in the accent), the ring grid in the accent family along the bottom. A Wine version shows a company on noddo's default colour = the landing exactly. Product controls stay product-sized (radius 8, lg 44); the landing's pill buttons stay marketing-only. Display sizes 64 / 96 are "Changes to SPEC" if chosen.

**Round 3 (2026-11-12).** Ulia liked E's direction (two-tone type + the rings) and "Join your team"; rejected D/D2 (too close to Personio), the onboarding and confetti illustrations (childish), plain accent fill. "You're in, Anna" doesn't sound native. New concepts on the Sandbox, all on the rings: F · orbit (Ink panel, the company ring at the centre, what noddo holds orbiting it); G · a giant cropped accent ring behind the card, 88 px "Welcome aboard, Anna."; H · colleagues as rings with initials and one empty accent ring "You" (sits lower — the nod), "Your team is here. There's a spot for you."; W1 · "Hello, Anna." with the noddo ring as the "o"; W2 · Ink page, "Glad you're here, Anna.", ring grid with accent rings. H needs teammates' initials/photos on the public invite page → QUESTIONS.md if chosen.

### Two standing rules (Ulia, 2026-11-12)
- **Everything is drawn in noddo's corporate colour (Wine) for now**, the company screens included (C, D, F, G were re-coloured from Denim). A company's own accent is a later step; the build still reads the company's accent where SPEC § 4 says so.
- **No black backgrounds or black fills anywhere.** Dark panels are Wine (accent); on Wine: text white, rings Rose, quiet rings Wine 500 (SPEC § 10 on-Wine recipe). On a Wine panel the main button is white with Wine text (a "Changes to SPEC" item if kept).

**Round 4 — the login base (2026-11-12).** Ulia: focus on the login itself first; every other auth screen will be redrawn on it. Kept from round 3: E (Wine pane + two-tone type) and F (form left, Wine panel right); dropped G (giant ring); H dropped for security (no colleagues shown before login — agreed). The ring-in-a-word idea (W1 "Hell◯") is parked: SPEC § 3 only rules the logo itself ("never retype noddo", "the nod never takes the workspace accent"), so a ring inside a headline is a new brand use → ask before using.
Sandbox top rows: **L1** Wine pane 520 left (company, an even 6×4 ring grid that fits the pane exactly — no cut rings, which made E look "broken" — one Rose ring dropped = the nod, 64 px "Log in to Acme." with the name in Rose, "powered by noddo" white at the foot), form alone on white; L1-b/L1-c show the pane unchanged while the right side becomes the code step / forgot password (back arrow top-left of the white side). **L2** form left with 40 px two-tone "Log in to Acme.", rounded Wine panel right with "Every yes, handled." and the grid. **L3** half/half, the grid as a field behind a 72 px headline.

**Round 5 (2026-11-12).** Ulia: develop L1 and a mix of L2 with F; L3 dropped (too many rings). Sandbox top rows: **L1 developed** — the company's logo and name moved from the top of the pane to sit right above "Log in to Acme." (it looked detached); grid on top. **L2 × F for the first experience (B1 registration)** — form left with "Start your free trial.", rounded Wine card right with the orbit. Selling point changed from "everything in one place" to what noddo does: "One yes. The rest runs itself." / "Approve once. noddo does everything that follows."; the Rose ring in the centre says "Yes", around it: Accounts created · Laptop ordered · Calendar updated · Payroll notified · Team welcomed. Headline alternatives offered: "Every yes, handled." · "Pick. Tweak. Nod." Likely split: the Wine card with the orbit for first-time screens (trial, invitation), L1 for the everyday company login.

### The new auth base — decided (Ulia, 2026-11-12); groups are being redrawn one by one
- **Everyday screens (root login A, company login C, second step D, password F):** the L1 base. Desktop: a Wine pane 520 wide on the left — an even 6×4 ring grid on top (rings Wine 500, a few Rose, one Rose ring dropped = the nod), at the foot the logo (the noddo wordmark white with a Rose "o" on root screens; the company's logo + name on company screens), the slogan (see group A below — the big pane headline was dropped) and, on company screens, "powered by noddo" in white. The white side holds only the step: left-aligned 32/40 heading, 15/22 lead, the form max 400 wide; the back arrow top-left of the white side. Phone: the pane becomes a strip on top (2 rows of rings, logo, 32 px headline), the form under it. The centred card, the dot grid and the corner glows are gone.
- **First-time screens (registration B, invitation G):** form on the left with a 40 px two-tone heading; on the right a rounded Wine card (radius 20, 12 px from the edges) with "Every yes, handled." + "Approve once. noddo does everything that follows." and the orbit: a Rose ring in the centre (no word inside), white rings on a dashed orbit labelled Workflows · Approvals · Time off · Onboarding · Reviews.
- **Colour:** root and trial screens are always noddo's Wine (no company yet). Company screens take the company's accent when it has one: the pane fill, buttons, links; Rose/Wine-500 rings become the accent's own light/mid tints (to be specified — SPEC § 10 has the on-Wine recipe only).
- **Group A redrawn and settled (page A, Ulia chose option 1).** The Wine pane is brand only: the ring grid on top; at the foot the noddo wordmark large (44 high, white with the Rose "o") and the slogan "Every yes, handled." (24/30 Inter Tight 600, "handled." in Rose). The white side of every screen has its own heading (32/40) above the form: A1/A2 "Log in to your company" (no full stop), A3 "Find your company", A4 "Check your email". Phone: the pane is a strip (two rows of rings, wordmark 28, slogan 18/24). **This replaces the earlier idea of a big headline on the pane** — the everyday base for C, D and F follows the same rule: brand on the pane, heading + form on white.
- **Group A approved by Ulia (2026-11-12), in its final form (brand pane + heading on white). The ring animation is approved too.**
- **Group B redrawn (page B), in review:** the first-experience base on B1, B2, B2a, B3. White side: the noddo wordmark top-left (back arrow before it on B2), heading 40/44 ("Start your *free trial*" two-tone; others plain), the same forms and copy as before; the Wine card on the right never changes. Phone: a Wine strip on top with the slogan and two rows of rings, then the wordmark and the form.
- **The rings nod (Ulia):** wherever the ring pattern is shown, the Rose rings dip quietly like on the website — **only the Rose rings nod — the quiet Wine-500 rings of the pattern never move (Ulia)**. The motion is scripted, not random: one 24 s loop with a nod every 3 s — one ring, then a pair (the second 0.14 s behind), then one, and so on through eight steps — so **never more than two rings move at once** (Ulia disliked three in a row); each nod is 7 px down with a 2 px overshoot, the nod's easing `cubic-bezier(.5,0,.3,1)`; **the orbit's centre ring is still** (Ulia) — on the orbit only the two dashed circles turn, slowly and in opposite directions (the dashes crawl: `stroke-dashoffset` ∓180 over 20 s (9 px a second), linear), the labelled rings and the labels don't move. Off under `prefers-reduced-motion`. SPEC § 9 limits the nod to loaders, Approve and splash screens; **Ulia's ruling: the auth screens are half marketing, half product, so they may deviate from the design system — the nodding rings are approved here.** The same ruling covers the other deviations of this base (split layout, display sizes, the ring pattern, the white-on-Wine wordmark): record them in the spec as approved exceptions for the auth screens, not as changes to the product-wide SPEC.
- All of this is "Changes to SPEC": the split layout, display sizes 40/56/64, the ring grid as a brand pattern, the white-on-Wine wordmark use.

---

## Visual decisions (for the spec's "Changes to SPEC")
- Login background: the 16 px dot grid and a soft accent-muted glow in two corners (AuthScreen today). SPEC only has the dot grid for the editor canvas.
- Login card: width 480, padding 48, gap 32, radius 20, shadow-2, no border, everything centred. SPEC § 6 has 400/560 dialogs; 480 exists only for side panels. Ulia asked for more air.
- Confirmation screens (A4, B2, C10): a 48 px accent-subtle circle with a 24 px icon above the title. Error and expired screens (B3a): the same layout with a grey circle. The accent is wrong on an error.
- Controls are size lg 44 everywhere on login screens, desktop and phone.
- Login screens have no asterisks (FORMS_AND_FIELDS § 1). Registration details forms (B2a, B3) carry the grey asterisk.
- Company login: the company's logo tile (40) and name (18/26 Inter Tight 600) at the top of the card, with no logo → first letter on the accent, radius 8 (SPEC § 4.7). The "powered by noddo" lockup sits 24 px from the bottom of the page.
- The 6-box code input (B2, C10) is a new component.

### 2026-11-12 — group B (registration)
- Orbit: the big Rose centre ring sits exactly at the orbits' centre (no 8 px "nod" offset — it read as a layout bug, Ulia's comment on B3). The lowered-ring motif lives only in the ring grid.
- Ulia approved group B desktop screens and states (B1, B2, B2a, B3). Phone screens of B are NOT approved yet — to be reworked.
- Phone header (A and B, and every later group): the big Wine header is replaced by a slim Wine strip — the noddo wordmark (white, Rose “o”, 24 px high) + one row of 7 rings (two Rose ones nod, same scripted loop). No slogan on phones (it stays on desktop). The white part starts with air: 48 px from the strip to the heading, or 20 px + the back arrow (36) + 16 px when there is a back arrow. Ulia chose this on Sandbox (first option 2 with the slogan, then option B with the wordmark instead) — the big header is out of place on a phone, and the wordmark glued to the heading on white looked wrong.
- Phone, vertical position (Ulia): the content (heading + form) sits in the vertical centre of the space under the strip, not at the top. If it does not fit, it starts 64 px under the strip and the page scrolls. The back arrow is pinned top-left of the white part (20 px from the strip) and does not move with the content.
- Phone, vertical position — refined (Ulia): (1) a form shorter than the screen is centred in the space under the strip; when a screen has an icon above the heading (Check your email), the icon hangs above the block and the heading + form are what gets centred, so the heading sits at the same height as on icon-less screens. (2) A form as tall as the screen or taller (Create your company) starts at the top: 40 px under the strip (72 px when there is a back arrow) and the page scrolls.
- An email inside a sentence wraps as a whole word when it fits on the next line (overflow-wrap:anywhere, not break-all).
- Groups A and B are approved in full (desktop, states, phones).

### 2026-11-12 — group C (company login) on the everyday base
- Desktop: the Wine pane (520) carries the company instead of noddo's brand — the ring grid on top; at the foot the company's logo (56 px white tile; the first letter in the accent colour when no logo is uploaded) and name (Inter Tight 600 40/44, white; 26/32 and wrapping when longer than ~16 characters), under it “powered by noddo” (white wordmark, 15 px high). No slogan on a company's pane. The white side: “Log in to <Company>” + the form, left-aligned, max 400.
- Phone: the strip carries the company's logo (28) and name (18/28, one line, ellipsis) + the row of rings; “powered by noddo” (grey) sits at the foot of the white part. Same centring rules as A and B (short form centred, long form from the top: C3, C8, a long company name).
- Company accent (Ulia, logic rule): on a company's login (group C and everything after the company is known) the company's accent colour is applied — the pane / phone strip, the primary button, links, focus ring, the icon circle. Root and trial screens (A, B) are always noddo's Wine. Group C is drawn with a sample company accent — a custom HEX, muted dark violet #4A2C63 (not a preset; set the way tokens/accent.js applyAccent() does). Ulia wants the mockups on a muted colour; the preset Iris was too loud to review on, though a company may of course pick it. On an accent other than Wine the rings are tints of the accent: resting rings = accent 78% + white, nodding rings = accent 30% + white (Wine keeps its Wine-500 / Rose pair). The company's logo tile stays white; the letter fallback is the accent colour on white.
- Content and copy of C1–C10 unchanged from the approved card version. Added phone frames for C6 and C8 and a “Taking you to Okta” state for C5.
- Board hygiene (Ulia): superseded versions never stay on the pages being redesigned. They go to the last page, “Outdated” (page id O), grouped by letter. When a group is redrawn, its old boards move there in the same publish (files left unreferenced in canvas.json get dropped onto the first page by the canvas, so every old file must be placed on O explicitly).
- “Email me a login code” under the Email field: an accent-coloured link without an underline at rest; the underline appears on hover / keyboard focus (Ulia — she first tried it always underlined and took that back).
- Google and Microsoft buttons are always the standard white provider button with the provider's mark, never the company's accent — also when it is the only action on the screen (C7, Google Workspace required). Provider brand guidelines (Ulia). Only the company's own SSO button (Okta etc., C5) is the accent button.
- Spacing of the login-code link: 6 px under the Email field, 24 px before the Password label — it belongs to the Email field (Ulia).
- Group C approved by Ulia (2026-11-12).

### 2026-11-12 — group D (the second step) on the everyday base
- Same frame as group C, in the company's accent: the pane / strip with the company, the white side with the heading and the form. Content and copy of D1–D6 unchanged from the approved card version.
- Everything on the white side is left-aligned now, also what used to be centred in the card: the error line under the 6-box code (also on B2 and C10), the QR code, the “enter a key” block.
- Phone: D4 (QR) and D5 (backup codes) still fit an 812-high screen, so they are centred like the short forms.
- D5 (backup codes): the “I’ve saved these codes” checkbox stays, as in today's product (Ulia asked why it is there, tried the screen without it and took it back): Continue needs the checkbox, otherwise “Confirm that you’ve saved the codes.”
- Group D approved by Ulia (2026-11-12).

### 2026-11-12 — group E (to a provider and back) on the new base
- E1 (the moment on the way to Google / Microsoft and back): a clean white page without a pane — the noddo wordmark whose “o” nods + one line, centred. No pane on purpose: the person comes from a company-coloured login and leaves to Google within a moment, a Wine pane would only flash. The old dotted / glow background is gone.
- E3 (something went wrong on the way): the everyday base in noddo's Wine (no company is known at auth.<root>): brand pane + grey circle, heading, “Go to login”. Copy unchanged.
- Group E approved by Ulia (2026-11-12).

### 2026-11-12 — group F (forgot and reset a password) on the everyday base
- Same frame as groups C and D, in the company's accent. Content and copy of F1–F8 (no F5) unchanged from the approved card version; warning notices on F4 / F6 stay in the pending tone. Every phone screen fits 812, so all are centred.
- F4 / F6 warning notices: the second sentence starts on a new line (Ulia).
- Group F approved by Ulia (2026-11-12).

### 2026-11-12 — group G (an invitation) — Sandbox variant E on the approved base
- Ulia rejected the invitation drawn like registration (form + rounded card with the orbit): it must not look the same as the free trial. She chose the structure of Sandbox variant E.
- G1–G4, desktop: the 520 pane in the company's accent carries, top to bottom, the company's logo + name (40 px tile, 20/28), a 6×3 ring grid (rings = tints of the accent, the light ones nod), and at the foot a huge two-tone welcome — “Welcome / to Acme, / Anna.” (Inter Tight 600 60/60, the name in accent 45% + white) with “powered by noddo” under it. The white side: “Join your team” (32/40) + “You’ve been invited to join Acme as <email>.” + the form.
- Phone: the company strip as in group C; the welcome becomes the heading on white — “Welcome to Acme, Anna” (the name in the accent colour); form centred; “powered by noddo” at the foot.
- No inviter, no colleagues before login (security). “Right after joining” (welcome) is not touched yet.
- G5 (the invitation doesn't work) is an error and stays on the everyday company base like C / D / F.
- Form content and copy of G1–G5 unchanged from the approved card version; only the heading on white changed from “Welcome, Anna” to “Join your team” (the welcome moved to the pane).
- Invitation copy, rewritten in noddo's voice (Ulia: the first wording was officialese; SPEC § 1 — a calm colleague, plain and brief):
  - Pane: back to “Welcome / to Acme, / Anna.” (the name in the accent tint) — Ulia moved the greeting “Hi, Anna!” to the welcome right after login (group W), so it is said once, there.
  - White side: heading “Join your team”; lead “You’re joining as <email>.” (was “You’ve been invited to join Acme as <email>.”).
  - The password field is labelled “Create a password” (was “Password” — it sounded like a password the person should already know); hint “Use at least 8 characters.”; the button is “Join Acme” (was “Set password and join”), busy “Joining…”.
  - G4: “You’re joining as <email>. At Acme, everyone logs in with Okta.” + “Join with Okta”.
  - Alerts end with “…or create a password.” (was “set a password”).
  - Phone: heading “Welcome to Acme, Anna” (name in the accent), lead “You’re joining as <email>.”
- Group G approved by Ulia (2026-11-12). Groups A–G are all approved on the new base.

### 2026-11-12 — group S (§ 14.8, the owner's first login: setting up the company) — first drawing
- Frame: the first-experience base continues from registration (B3 → S1): the form on white with the noddo wordmark, the rounded Wine card with “Every yes, handled.” and the orbit. noddo-branded, always Wine (DESIGN_SYSTEM § 4: the setup wizard is noddo's). Phone: the Wine strip; S1 and S2 are long forms and start from the top, S3 is centred.
- Stepper: two short bars (28 × 4, pill; accent = done or current, grey = ahead) + “Step 1 of 2 · Your company” above the heading. Deliberately NOT the ring Stepper of SPEC § 13.10 (Ulia): this screen already carries the ring in the noddo wordmark right above and the orbit on the card — more rings read as clutter and as the logo repeated. An auth-screen exception.
- S1: heading “Let’s set up Acme” (two-tone, the company name in the accent). § 14.8 has “Welcome to Acme”; Ulia: welcoming an owner to the company they have just named themselves (B2a / B3, “Company name”) reads odd. The name is known — it comes from registration; lead “A few questions, so noddo arrives set up, not blank. You can change any of it later.” — § 14.8 says “Three questions…”, but the step has four fields, so the count is dropped (Claude's wording, for Ulia to confirm). Four selects with placeholders (“Choose an industry”, “Choose a size”, “Choose a country”), Language pre-filled. Label “How many people are in the company?” (Ulia: what we want to know is the company's size, not how many will use noddo; § 14.8 says “How many people will use it?”). The country, once chosen, shows what it sets as the field's hint. The country picker is a searchable select; “No country matches that.” inside its popover.
- S2: heading “Where do we start?” — a short, simple question (Ulia; § 14.8 has “What should we start you with?”, too long; “Pick a starting point” was tried and read as complicated). Lead: “Start with example data or with nothing. Every feature works either way.” (§ 14.8’s “Whichever you pick, every feature is switched on. This is only about what is in it on day one.” was hard to follow, Ulia). Two choice cards stacked — “Example company” (filled, sized to the step-1 answer) and “Start empty”. “Full demo” is dropped from the wizard (Ulia: it is the same as the example company; the choice is only filled or empty). Today the code has three presets — the build drops the third from this step (question for Petya: does the full demo stay reachable anywhere else, e.g. for sales demos?). When “Example company” is chosen, the card opens a size slider (“Example people”, four stops 8 · 25 · 60 · 150 — today’s preset sizes), starting at the step-1 company size; the person can drag it (Ulia, “like a volume control”). A slider is a new component (DESIGN_SYSTEM § 5 has none) — accent track and fill, white thumb with an accent edge sitting exactly on a stop, the four numbers under the stops; the chosen number is highlighted (accent, 600) — no separate value label (Ulia). The cards were: (radio + title + what you'll see on day one), the chosen one outlined in the accent on accent-subtle. Card copy rewritten short, in the product's words (“time off”, “people”). Back is the arrow top-left (auth rule), so the foot has one button: “Set up my company”. Drawn with “Example company” chosen; whether anything is pre-chosen is a question for the build (a state without a choice is drawn).
- S3: a list of steps — done = an accent check (no ring), current = the one accent ring that nods (the loader), ahead = a small grey dot. One ring only, for the same reason as the stepper. No stepper, no buttons. “Start empty” has no “Creating your example company” step.
- S4 is a state of S2 (FormError / InlineAlert declined above the cards). S5 is not a drawing: a returning owner lands on S3.
- New pieces (questions for DESIGN_SYSTEM § 5): the choice card (radio card) and the progress list with rings; the Stepper exists.
- Group S approved by Ulia (2026-11-12).

### 2026-11-12 — group W (§ 14.9, everybody's first login: the welcome) — first drawing
- Frame: the invitation's frame continues, in the company's accent (the welcome is in the company's brand, SPEC § 1/§ 4): the company pane (logo, ring grid) with the greeting “Hi, Anna! / Glad you’re here” (no full stop, Ulia) on every welcome step — Ulia moved “Hi, Anna!” here from the invitation, which went back to “Welcome to Acme, Anna.”. The white side: the step. Phone: the company strip; W1's heading on the phone is the greeting “Hi, Anna!”.
- W1 “Log in faster next time” (spec: “Sign in faster”; product says log in): lead “Connect Google or Microsoft and skip the password from now on.”, white provider buttons “Connect Google” / “Connect Microsoft”, “Skip” as a quiet text action under them. W1a: approved InlineAlert “Connected as anna@gmail.com.” + Continue. W1b: declined InlineAlert with the reason (used by someone else / provider failed) above the buttons; trying again is pressing the button again, so no separate “Try again” button.
- Stepper (W2–W4): the two bars from group S, “Step 1 of 2 · About you” / “Step 2 of 2 · Your preferences”. W1 sits outside the two steps.
- W2 “Add your photo” / “So your colleagues can put a face to your name.”; the photo block P1 (96 avatar with initials on accent-muted, “Upload from this computer”, “Use my phone”); note “Everything else about you is on your profile. Change it any time.”; Continue; Skip.
- On a phone the photo block has ONE button, “Upload a photo” (camera or library; Ulia: it is an upload) — “Use my phone” makes no sense on a phone. Question for the build: § 14.10 doesn't cover the welcome opened on a phone.
- W3 “A bit about you” / “Your photo and a few details. All of it can wait.”: the photo block, then the person's blank own fields (drawn: Preferred name, Date of birth, Phone; and eight), each with its own validation (drawn: “Enter a real date.”).
- W4 “How should things look?” / “Two settings. Change them whenever you like.” (spec: “How would you like things shown?”): Time zone (“Same as the company (UTC+01:00)”, hint “Dates on the calendar never move with your time zone.”), Date format (“Same as this device”); Finish; Skip; the back arrow → W2/W3.
- W5 (the owner's version) is not a separate drawing: the same steps; the owner's W3 never lists company-wide fields.
- “Skip” is a quiet text button (secondary text, no underline) under the main button on every step; skipping counts as done.

### 2026-11-12 — group W reworked: Sandbox “mix 1 on white” (Ulia)
- New first screen W0 before W1: white, centred — the company's logo on top, a huge two-tone “Hi, Anna! / Glad you’re here” (Inter Tight 600 112/104 on desktop, 56/54 on the phone; the second line in the company's accent; no full stops), “A few quick settings, and you’re ready to go.” (no “Welcome to Acme” — the invitation already said it), “Let’s go” → W1 (or W2 when W1 is absent). Two rows of rings along the bottom, cut by the edge: resting = accent-muted, strong = accent (they nod).
- The company's logo sits on a white tile with a hairline (border-divider) and shadow-1, 44 px (36 on the phone), so a logo that is itself white or light still reads on the white page (Ulia).
- W1–W4 keep the same frame: no pane, no strip — the logo on top, one centred 400 column (stepper, heading and lead centred; fields left-aligned), the rows of rings at the bottom. The back arrow sits top-left of the page. “Skip” is centred under the main button. The greeting is only on W0; W1's heading is “Log in faster next time” on the phone too.
- The earlier W drawing (company pane with “Hi, Anna! Glad you’re here” on every step) is replaced.
- W2 on a computer (Ulia: too squeezed and no drag and drop): the column widens to 560 and the photo becomes a drop zone — dashed 1.5 px border-strong, radius card, a 128 avatar with the initials, “Drag your photo here”, “Square, at least 400 × 400 px. PNG, JPG or WEBP.”, “or”, two buttons “Choose a file” / “Upload from my phone”. Dragging a file over: accent border, accent-subtle fill, “Drop it here”. Continue stays 400 wide. The drop zone is a new component (question for DESIGN_SYSTEM § 5); W3 and the phone keep the compact photo row.
- W2 copy and details (Ulia): lead “Help your colleagues recognize you. You can change it any time.” (was “So your colleagues can put a face to your name.” — read as blunt; the note about the profile is gone). The second button is “Upload from my phone” (was “Use my phone”, unclear). The stepper names the two parts, not the screen: “Step 1 of 2 · Profile” (W2 and W3), “Step 2 of 2 · Preferences” (W4) — “Your photo” repeated the heading “Add your photo” and read as two photo steps (Ulia). The rows of rings are now fully on screen with 32 px under them on every W screen (they had slid off the bottom).
- W2 is drawn at 1440 × 900 (a MacBook Air, Ulia) and fits it without scrolling: the drop zone is tighter (112 avatar, 28 px inside), 24 px between blocks, the rings 24 px from the bottom.
- The rows of rings at the bottom of every W screen: the lower row is cut exactly in half by the bottom edge (Ulia) — desktop margin-bottom −36 px (rings r 22, stroke 7), phone −24 px (r 12, stroke 5).
- Every W desktop frame is 1440 × 900 (MacBook Air, Ulia). W3 on a computer is two columns so it fits without scrolling: the photo drop zone on the left (360 wide, 96 avatar, the two buttons stacked), the person’s fields on the right; Continue (400) and Skip centred under both. With many fields (eight) the right column grows and the page scrolls. The phone keeps one column.
- W3 split off (Ulia): the photo and the person’s fields are no longer on one screen. W2 is always the photo; W3 “A bit about you” / “A few details for your profile. All of it can wait.” is a step of its own with only the blank own fields, shown only when the person may fill some in. The stepper then counts three — “Step 1 of 3 · Profile” (photo), “Step 2 of 3 · Profile” (about you), “Step 3 of 3 · Preferences”; without W3 it is “Step 1 of 2 · Profile” / “Step 2 of 2 · Preferences”. W3 is one centred column like the other steps; the two-column W3 is gone.
- The welcome is drawn in its three-step version (Ulia): W2 “Step 1 of 3 · Profile”, W3 “Step 2 of 3 · Profile”, W4 “Step 3 of 3 · Preferences”. When there is no W3, the same screens count to two.
- W3’s fields are not chosen by design: they are the person’s own fields that their role may edit and that are still blank, so the list differs per company and person. The drawing uses preferred name, date of birth and “Languages you speak” (text, date, multi-select dropdown with chips inside the field and checkboxes in the list — Ulia’s pick; no pronouns; the phone moved to the eight-field state).
- W4 asks for the time zone and the LANGUAGE, not the date format (Ulia). Language: “Same as the company (English)” first, then the product’s languages. Question for Petya: today the language is the company’s (S1: “Everybody in the company sees noddo in it”) — a personal language is new; does it override the company’s for screens only, or also for emails and exports? The date format moves to the profile’s preferences only.
- W4 (Ulia: “Same as the company” twice read badly): the fields show the company’s values plainly, pre-filled — Time zone “(UTC+01:00) Warsaw” with a clock icon, Language “English” with a globe icon; the lead says it once: “We’ve used Acme’s settings. Change them if they don’t fit you.” The calendar-date hint is dropped from this step. If the person never changes them, they keep following the company’s settings (the build decides whether that is stored as “same as company” or as a copy).
- The photo from a phone (§ 14.10, P2–P10), in the W frame (Ulia asked for the flow):
  - P2 (computer): “Upload from my phone” turns the drop zone into the QR code (168, white tile) + “Scan the code with your phone” / “You’ll pick a photo on your phone and it will appear here. The code works once, for the next 15 minutes.” + one link “Choose a file instead” (no “Hide code” — Ulia). No “waiting” line (Ulia). Nothing else to press.
  - P3 (computer): the photo appears by itself (short fade-in), a check badge, “Your photo is in” / “It came from your phone. You can change it any time.”, “Choose another file” / “Upload from my phone”.
  - P4 (computer): “The code has expired” / “Codes work once, for 15 minutes. Press “Show a new code” and scan it again.” (names the button, Ulia), “Choose a file” / “Show a new code”.
  - Phone page acme.<root>/m/avatar?token=… (no login; same white frame, company logo, rings): P6 “Hi, Anna” / “Pick a photo for your profile at Acme.” + one big button in thumb reach “Choose a photo” + “From your gallery.” (the gallery, not the camera — Ulia); P7 “Uploading…” / “Keep this page open for a moment.” + progress bar, the avatar still shows the initials until the upload is done (Ulia); P8 “That’s your photo” / “It’s already on your profile. You can close this page and go back to your computer.”; P9 “That didn’t work” / “Show a new code on your computer and scan it again.”; P10 “This code has expired” / “Codes work once, for 15 minutes. Show a new one on your computer and scan it again.” (shown before the gallery opens).
  - P5 (uploading from the computer) is the drop zone’s busy state — not drawn separately yet.
- W2 / P2 / P4: no “Continue” while there is no photo — it would only repeat “Skip” (Ulia). The upload buttons and “Skip” are the only actions; “Continue” appears once the photo is in (P3, and W2 after a file upload).
- “Skip” on every W / P screen is in the company’s accent colour (accent-text), not grey (Ulia) — still a text button, no underline.
- Groups W and P approved by Ulia (2026-11-12).

### 2026-11-12 — groups N and M (first drawing)
- N1 “This link doesn’t work” / “It may be out of date, already used, or cut short. Open it again from the email, or ask for a new one.” + Go to login; N2 “You don’t have access to this page” / “Ask your administrator if you think you should. Your work is safe.” + Go to home + “Log in as someone else”; N3 the company’s login with an info notice “You were logged out. Log in again to pick up where you left off.” — all on the everyday company base, grey circle icons. Question: inside the product, 403 is the ErrorPage with an illustration (DESIGN_SYSTEM § 5) — which one shows when?
- M (emails): one template — subject; white card (radius card, hairline) on mist; the company’s logo tile and name (noddo’s wordmark for M1 and M6, which are sent from the root); heading Inter Tight 600 24/30; 15/24 paragraphs; at most one button in the company’s accent; small print under a hairline; “powered by noddo” + the company’s address at the foot. M1 now carries the 6-digit code shown big in a mist box (B2 uses a code, not a link). No inviter’s name in M2 (as on G). M3 not drawn (not about logging in). M8 / M15 are one template each with one sentence per case (listed on the board); M11 is M10 with “because you set a new password”. One phone view (M2) — the card simply narrows, the button goes full width.
- N2 removed (Ulia, 2026-11-12): a “no access” page in the login frame never happens. A logged-in person always sees the 403 inside the product (ErrorPage with the illustration, DESIGN_SYSTEM § 5, with the sidebar). A logged-out person who opens any link — inside the company or an external one — first gets that company’s login (N3 / C with `next`), and after login, if they still may not see the page, the in-product 403. A link into another company the person isn’t logged in to leads to that company’s login. N1 and N3 stay: both are for logged-out people. The N2 drawing is on the Outdated page.

### 2026-11-12 — group M (emails) redrawn (Ulia)
- Ulia: emails shown as loose cards were hard to judge, and they were plain. Every email is now drawn opened in a mail app, on a computer (1440) and on a phone (375). The mail app around it is a neutral stand-in, not part of the build.
- **The email is one responsive block** (`.mailx` / `.mx` in auth-m2.css, group_m2.py): 600 px wide at most, fluid below it. Under 480 px (container query) the card goes edge to edge, paddings shrink to 20, the heading drops from 44 to 34, the button and the 6 code boxes stretch to the full width. Build it as table-based email HTML with the same look; the rings are a static image (PNG/SVG per accent) — emails don't animate.
- Two kinds:
  - **Moments** (M1, M2, M2b, M4, M6, M7, M12): a band in the accent — the logo (noddo's white wordmark with the Rose “o”, or the company's white logo tile + name), a big two-tone heading (Inter Tight 600 44/46, white + Rose / the accent's light tint; ends with a full stop like the landing), two rows of rings with the lower row cut by the band's edge and one ring dropped (the nod). Then the text on white, one accent button with an arrow.
  - **Notices** (M5, M7b, M8, M9, M10, M13, M14, M15): a slim band (logo + four small rings), a 48 px icon circle (grey for neutral, accent-subtle for good news, pending tone for warnings), a 28/34 heading, a short text, and the details as a mist “facts” table (before / now, the Google account, expiry date, the provider's error).
- M1: the code is six boxes like the 6-box input on B2 (3 + 3), on accent-subtle.
- M6: one row per company with its logo tile, name, address and “Log in”.
- Sender (to confirm, QUESTIONS.md): noddo's own emails from “noddo <no-reply@noddo.so>”; company emails from “Acme <no-reply@acme.noddo.so>” with the company's logo as the avatar.
- Footer under the card: “powered by noddo”, the company's address, “You get this because you have an account at Acme.”
- The earlier M drawing is on the Outdated page.
- M round 2 fixes (Ulia): no full stop at the end of the hero headings. Fewer, wider-spaced rings (one row of 6 on the hero, 3 on the slim band; dense grids read as a trypophobic pattern). On a phone (<480 px) the hero heading runs on one line at 24/30 and the band is compact. noddo's sender avatar = the mark: Wine circle, Rose ring 8% below centre (SPEC § 3). M2 no longer lists the ways to join (the page it opens shows them).
- M1 code: one selectable string (482913) in an accent-subtle box, not six separate boxes — so mail apps (Gmail, iOS, Android) recognise the code and offer “Copy” on their own. A “Copy code” button can't work inside an email: mail apps don't run scripts.
- M1 code, how to build it (Ulia asked that it is recognised and easy to copy): the code is live text, never an image; in the text the six digits are contiguous (“482913”) — the 3 + 3 split is visual only (two cells / padding, no space character), so copying and the mail apps' code detection get one string; the code is also in the subject line (“482913 is your noddo code”), which iOS / macOS Mail use to offer it in the code field and Gmail uses for its “Copy code” button.
- M2b removed (Ulia): one invitation email for every company, button “Join Acme”; the provider (“Join with Okta”) appears only on the page it opens (G4).
- Notices’ slim band (Ulia): three small rings + a fourth on the right cut in half by the card’s edge (as the hero row is cut by its bottom edge).
- Added (Ulia, 2026-11-12), at the end of page M:
  - **M16 · Log in with a code** (C10's email, was missing): company colour, hero “Here’s your login code”, the same code block as M1 (subject “482913 is your Acme login code”), “Or log in with one click in the same browser.” (the link works only in the browser that asked), “The code works for 10 minutes. If you didn’t ask for it, ignore this email — no one can log in without it.” Same email whether or not the account exists; nothing is sent when it doesn't.
  - **M17 · Your password was changed** (new, not in § 14.12): a notice after any password change (F7 reset, preferences, after M12); says other sessions were logged out; “When” fact; “If it wasn’t you, reset your password now and tell your administrator.”
  - **M18 · Acme is ready** (new, not in § 14.12): once, to the owner, after the company is created (S3). noddo's Wine; the company's address as a tile row; three next steps (invite your team · add your logo and colour · check the time off rules); “Open Acme”.
- **Out of this round, not forgotten (Ulia):** onboarding / preboarding emails (M3 and everything before a person's first day) and any other product emails are drawn later, in their own round. This board covers only login emails.
- M16 reworked (Ulia): the code and the one-click login are almost equal — lead “Log in to Acme as <email> with this code, or with one click.”; the code block; an “or” divider; a full-width accent button “Log in with one click” (56 high); under it “The button works in the browser where you asked for the code.”
- Every company email (M2, M4, M5, M7–M17) takes the company's accent if set, otherwise noddo's Wine with the company's logo and name. Not drawn (Ulia: a corner case); the violet on the board is only the sample company's colour.
- The very first login is never M16: an owner starts with the trial code (M1, noddo's own email, B2); an invited person starts with the invitation (M2). M16 is only for someone who already has an account in that company.
- M18 (Ulia): an email takes nobody anywhere — no button, no links, no arrows. “What’s next” explains, but visually: “Nothing else is needed from you right now. When you’re ready:” + a vertical 3-step flow — 44 px icon tiles on accent-subtle (users · sparkles · calendar) joined by a dashed accent line; “Step 1/2/3” (12 px 600, accent) to the LEFT of each icon tile, vertically centred on it (Ulia), then title 16/24 600 and one line of text to the right of the tile. Steps, in this order (Ulia: set the company up first, invite people last): 1 Add your logo and colour (“Acme’s login page, emails and noddo itself will use them.”) · 2 Tell noddo how Acme works (“A few answers about how your company runs, and noddo fits itself around them.” — deliberately general, Ulia: what exactly is pre-set per country isn't decided yet) · 3 Invite your team (“When everything looks right, invite people. Each gets an email and joins in a minute.”). Not clickable. The company's address stays as an information row.
- Group M approved by Ulia (2026-11-12): M1, M2, M4–M10 (M11 = M10 variant), M12–M18. M2b and the colourless M16 variant are on Outdated.

- Group M approved by Ulia (2026-11-13), M18 included.

### 2026-11-13 — status
- Ulia approved every group on the board: A, B, C, D, E, F, G, S, W (+ P), N (N1, N3), M. Next: group L (company login appearance, § 14.11 L1–L9). Handoff (specs, QUESTIONS.md, zip) only when she says "prepare the handoff".

### 2026-11-13 — group L (§ 14.11, Settings → General → Appearance) — first drawing
- **Ulia's decisions:** no background photo for the login and no custom headline / sub-heading (both were on the Sandbox, rejected). The company can't change the home page background either (Home has its own band). The login is always: the company's color, its logo and name, “Log in to Acme”. → Remove from Appearance: the image upload (L3), both switches (L4), Headline and Sub-heading (L5); remove the matching fields from `company_appearance` or leave them unused.
- **The page now:** app sidebar (Settings active); SettingsPageHeader (back + “Appearance”); description “How noddo looks for everyone at Acme: your login page, your emails and the app itself.”; two columns — the form (480) and a sticky preview card.
- **Workspace color:** the ten presets as 40 px swatches with their names (5 × 2), the picked one ringed with a tick; “Custom color” #rrggbb with a colour chip, hint “Leave empty to use a color above.”; wrong value → FieldError “Enter a color as #rrggbb, like #2f63c4.”; adjusted → InlineAlert info “We adjusted your color for readability. Buttons keep your color; links and text are a little darker.” Description: “Your color marks what to act on: buttons, links, the page you’re on. People see it on your login page, in emails and inside noddo. Text, backgrounds and status colors stay noddo’s.”
- **Logo moved here from Company (proposed):** it now shows on the login, in emails, in the sidebar and the org chart, so it sits with the color. 64 px tile, “Replace logo” / “Remove” (red text; puts the first letter back), or “Upload logo” when none. Hint “Square works best: PNG, JPEG or SVG, at least 256 × 256 px. It’s saved as soon as it’s uploaded.” Uploading: shimmering tile + busy button “Uploading…”. Refused: “That file can’t be used. Upload a PNG, JPEG or SVG up to 5 MB.” (formats / size to confirm with the code). Company page keeps a pointer here (to decide).
- **Preview (L6 changed):** card “Preview” + SegmentedControl “Login page · Inside noddo · Email”. Login page = the real login (RC2) scaled down, with Google / Microsoft / the company SSO exactly as the company has them, note “This is your login page as people see it. Google and Microsoft show because they’re on in Login & SSO.” Inside noddo = a mini home (sidebar active item, a tab, an Approve button). Email = the invitation email. A draft colour shows only in the preview with a “Not saved yet” chip; the page around stays in the saved colour until Save.
- **Light colours:** on a light accent the login pane's name, “powered by noddo” and the button text turn dark (the accent's on-colour) — the build must apply the on-colour on the login pane too.
- **Save:** at the foot of the form; off until something changes; “You have unsaved changes.” next to it; busy “Saving…”; then “Saved. Everyone sees the new look now.” Conflict (a colleague saved in between, version check): InlineAlert declined “Someone else saved Appearance while you were editing. Reload to see their changes, then make yours again.” + “Reload”. Other failure: “We couldn’t save your changes. Try again.”
- **Page states:** loading = skeleton; couldn't load = ErrorState with “something-broke” illustration, “We couldn’t load these settings” / “Something went wrong on our side. Try again in a moment.” / “Try again”; view only (may see settings, not change them) = Mist Banner “Only people who can manage company settings can change Appearance.”, everything read-only, no Save.
- Product copy is US English (“color”); M18 corrected to “Add your logo and color”.

### 2026-11-13 — group L redrawn on Sandbox B1 (Ulia chose it; supersedes the first L drawing above, which is on Outdated)
- The page is half landing, half settings — it is one of the first things a trial owner sees, so it sells. App sidebar (Settings active); no SettingsPageHeader title row — the back button alone, then the page's own heading.
- **Left (420):** heading “Make noddo / feel like Acme” (Inter Tight 600 44/46, second line in the accent — display size is a “Changes to SPEC” item, as on the auth screens); lead “Your color and logo go on the login page, in every email and all over noddo.”; step 1 “Pick your color” — the presets as noddo rings (44 px, 9 px stroke, two rows of five with names; the picked ring nods 7 px down, its name bold) and a tenth ring “Your own” drawn as a gradient ring; when “Your own” is picked, the code shows under the rings: “Your own · #4A2C63”; it opens a picker popover — saturation square, hue bar, “Color code” field (#rrggbb, with or without #). Step 2 “Add your logo” — a drop zone (dashed, radius 16): the logo tile + file name + “Drop a new one here or choose a file.” + “Remove”; empty: “Drop your logo here / or choose a file. Until then, the first letter of Acme stands in.”; hint “Square works best: PNG, JPEG or SVG, at least 256 × 256 px. It’s saved as soon as it’s uploaded.” Save (lg) + “Everyone sees it right after you save.”
- **Right — the stage:** Mist background, radius 32 on the left corners, quiet grey ring grid (the nodding ring in the accent), so the company colour on the previews is the only colour (Ulia: the stage painted in the company colour made violet-on-violet). Tabs as pills “Inside noddo · Login page · Email” (picked = accent fill). Inside noddo = the real Home (design/screens/home HF01) in the colour, in a browser frame; Login page = the company login in a browser frame + the phone login (frame 3 px); Email = the invitation email. Everything centred in the stage. “Live — this is what Acme sees” at the foot.
- **Draft vs saved:** picking a ring or a code repaints only the stage, with a “Not saved yet” chip; the page keeps the saved colour until Save (the stage is an island in the draft colour — DESIGN_SYSTEM § 2 already supports data-accent on a subtree).
- **States drawn:** saved (3 tabs), no logo, teal picked (draft), picker open, wrong code (“Enter a color as #rrggbb, like #2f63c4.” — the stage keeps the last good colour), light colour adjusted (InlineAlert info “We adjusted your color for readability. Buttons keep it as picked; links and text are a little darker.”; on the login pane the name / powered-by / button text turn dark), logo drag-over (“Drop it here / It replaces the current logo.”), uploading, refused (“That file can’t be used. Upload a PNG, JPEG or SVG up to 5 MB.” — limits to confirm), saving, saved (“Saved. Everyone at Acme sees it now.” — the page itself turns to the new colour), conflict (“Someone else saved Appearance while you were editing. Reload to see their changes, then make yours again.” + Reload), couldn’t save, loading (skeletons), couldn’t load (ErrorState “We couldn’t load Appearance”), view only (Mist banner “Only people who can manage company settings can change Appearance.”, rings dimmed, no drop zone, no Save).
- The preset palette itself is still open (Ulia will discuss later; a proposed deeper set is on the Sandbox).
- L, Ulia: the heading's second line (“feel like Acme”) always shows the colour being tried — it follows the draft live like the stage (for a light custom colour, its darkened text shade).
- **Product rule (Ulia): a button is never disabled / greyed out.** Save on Appearance is always the accent button; with nothing changed it simply saves nothing; with a wrong colour code the field shows its error on Save. Apply everywhere.
- L, Ulia: the heading line “feel like Acme” always shows the exact picked colour, even a light one (no darkening); only links / small text use the readability shade.
- L, Ulia: the Save button also takes the colour being tried right away (with dark text on a light colour), like the heading line and the stage.

### 2026-11-13 — handoff on hold for two points (Ulia)
- The zip sent on 2026-11-13 is **not final for `sign-in-appearance` and `sign-in-emails`**: the preset palette isn't chosen yet, and Ulia wants noddo visible on company emails (“we communicate from the system”). Three ways are on the Sandbox (SMN-A noddo in the band next to the company · SMN-B “Acme via noddo” above the card · SMN-C noddo signs the footer, “Sent by noddo on behalf of Acme” — SPEC § 15's own line). The other folders stand.
- Emails (Ulia chose Sandbox variant C): every **company** email ends with noddo's signature — the noddo wordmark (Ink, Wine nod, 26 high), “Sent by noddo on behalf of Acme” (14/20 secondary), then “{Company} · {address} · You get this because you have an account at Acme.” (13/18 tertiary; admin emails M13–M15 drop the generic reason — their small print says why). noddo's own emails (M1, M6, M18) keep only “noddo · Six Software, Vilnius” (the band already has the wordmark). Matches SPEC § 15.
- Presets: the muted proposal was rejected (“dirty”). Round 2 on the Sandbox: Wine, Cherry #BE123C, Orange #C2410C, Amber #B45309, Emerald #047857, Teal #0F766E, Ocean #0369A1, Cobalt #1D4ED8, Violet #6D28D9, Graphite #2A2A2E — clean, saturated, white text 5:1+. Not decided yet.
- Appearance, final (Ulia, 2026-11-13; page L, group_l3.py): drawn at 1512 × 982 (MacBook Pro 14"). Order: 1 Add your logo → 2 Pick your color → 3 Pick a background; Save + status pinned to the bottom of the left column.
  - “From your logo”: up to three colours taken from the uploaded file (skip near-white, near-black and greys) shown above our presets, divided by a hairline; only the picked one shows its HEX. With several logo colours the company picks only the accent — no separate choice for the rings.
  - The logo's size hint (“Square PNG, JPEG or SVG, 256 × 256 px or more. Saved on upload.”) shows only while there is no logo. A logo without its own background always sits on white (sidebar, login, emails).
  - 3 Pick a background: a pill segmented control Your color (default) · Light, on one line with the heading; no thumbnails — the stage shows it.
  - Light, for every company: login pane, phone strip and email band in Gray 50 with Gray 200 rings; the nodding rings in the accent, or in the logo's colours when it has several. Light emails: white canvas round the card + 1 px Gray 200 border (mail apps drop shadows; many inboxes are grey).
  - Home is not redrawn: the company's background sets the default of Home's own Colour / Light top (HF01 / HF02) for everyone; each person can still switch (ties into Home Q-4: where the Colour / Light choice is saved — now a company default + a personal override).
  - The colour picker opens beside “Your own”, over the edge of the stage. Alerts (adjusted colour, conflict, save failed) sit right above Save.
  - Auto-Light (Ulia): when an uploaded logo has two or three colours and the company has never changed its background, Light goes into the draft (the stage shows it); it is saved only with Save. A background already chosen is never touched.
  - Messages never push the page (Ulia): the light-colour adjustment is a quiet line under the picked colour (“Text and links a little darker to stay readable”); save errors take the place of the status next to Save (“Someone else saved first. Reload to see their changes, then make yours.” / “We couldn’t save your changes. Try again.”). A logo is a file — its colours never follow the picked accent.
- Presets, final (Ulia, 2026-11-13): Wine #6E1630 (default) · Cherry #BE123C · Tangerine #C7501E · Sunflower #F5C518 · Basil #2E7D32 · Indigo #4338CA · Ocean #0369A1 · Mulberry #5B2A6E · Black #0B0B0C, plus “Your own”. Graphite, Brick, Terracotta, Sun, Forest, Teal, Denim, Iris, Raspberry are gone. Basil replaced Emerald and Indigo replaced Cobalt to keep every preset clear of a status hue (Ulia).
  - Sunflower is light: on it buttons, the login pane, Save and the active tab take Graphite #2A2A2E; links and text take the same yellow darkened to 4.5:1 on white. Same rule for any light “Your own” colour, decided by contrast, never by a list.
- A company colour close to a status colour (Ulia, 2026-11-13; SPEC § 4.5 stands — statuses are never themed):
  1. A status never takes the accent. Approved stays Pine, Declined red, Pending amber, and a status is always icon + word.
  2. Status pills are always soft (light bg, dark text, icon). Solid fills only for counters and toast icons.
  3. In a workspace whose accent is a red (Cherry, Tangerine, or a “Your own” within 25° of Declined #C42B1C), the destructive button in a confirm dialog becomes a red outline instead of a red fill; everywhere else it keeps its fill.
  - In Appearance, when the picked colour is within 25° of a status hue, a quiet line shows under the rings: “Close to the color noddo uses for approvals. Statuses always show an icon and a word, so they stay readable.” Nothing is blocked. After the swap no preset is within 25° of a status: the closest are Basil 29° from Approved, Indigo 20° from In progress, Cherry 20° and Tangerine 13° from Declined, Sunflower 11° from Pending, Ocean 17° from Scheduled — the line is mainly for a colour from “Your own”. Full separation is impossible: the statuses occupy red, amber, green, cyan and blue, which leaves only the yellow-green and violet sectors free.
