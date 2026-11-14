# Board notes — every sticky and title from the board, word for word

From "noddo · Login flow", 2026-11-13. The specs say the same in their own words; this file is the raw source, in board order.


## A1–A4 · Root

### A1 · Log in to your company — first visit
- today · noddo.so/login · new base (Ulia chose option 1): the Wine pane is brand only — rings, the noddo wordmark large, “Every yes, handled.” — and the white side has the heading and the form. Always noddo’s Wine — no company is known yet. Continue goes to <address>.noddo.so/login and never asks the server whether the company exists. States show the white side only — the Wine pane never changes.
### A2 · Log in to your company — remembered
- today · Offered, never followed automatically. The company’s logo and name (first letter on its colour when no logo is uploaded). Use another company opens A1 empty. States show the white side only — the Wine pane never changes.
### A3 · Find your company
- today · noddo.so/find-company · the back arrow sits top-left of the white side. The answer is the same whether or not the email exists (A4). States show the white side only — the Wine pane never changes.
### A4 · Find your company — sent
- today · The same answer whatever exists. Resend sends the same email again (same limits as A3). Back to login → A1; the back arrow → A3 to try another email. States show the white side only — the Wine pane never changes.

## B · Registration

### B1 · Start your free trial
- changed · noddo.so/trial · the first-experience base: the form on white with a two-tone heading, the Wine card with “Every yes, handled.” and the orbit (Workflows, Approvals, Time off, Onboarding, Reviews). Always noddo’s Wine. Email first: Google / Microsoft, or the business email → B2 code. Terms as a line. States show the white side only — the Wine card never changes.
### B2 · Check your email — the code
- new (today: a link) · 6-digit code on the same page; it fills itself from the clipboard and sends on the 6th digit. The back arrow → B1 to use another email. → B2a. States show the white side only — the Wine card never changes.
### B2a · Create your company — after the code
- new · email confirmed, the rest of the details. Creates the company and the owner, opens the session → /setup. States show the white side only — the Wine card never changes.
### B3 · Create your company — from Google or Microsoft
- new · after Google or Microsoft, no email confirmation. Name and email from the provider; email read-only; no password. → /setup. States show the white side only — the Wine card never changes.

## C · Company login

### C1 · Log in — password only
- today · the company switched Google / Microsoft off and has no SSO. The everyday base: the pane carries the company — its logo and name, “powered by noddo” — and the rings; the white side has “Log in to Acme” and the form. The pane, the buttons and the links take the company’s accent colour (a muted dark violet here as a sample); the rings are tints of it.
### C2 · Log in — password and Google / Microsoft
- new · the default for every company · acme.noddo.so/login. Google / Microsoft above, the password below; “Email me a login code” under the Email field → C10. On the phone the strip carries the company’s logo and name, “powered by noddo” sits at the foot.
### C3 · Log in — company SSO optional, with Google / Microsoft
- changed · the company’s own button first (Okta here). If its provider is Entra it reads “Log in with your company account”, so it can’t be confused with Continue with Microsoft.
### C4 · Log in — company SSO optional, Google / Microsoft off
- today.
### C5 · C6 · Log in — company SSO required
- changed (Ulia) · only the company’s button, as the accent button. The way back in when SSO breaks stays, but quiet: a small grey “System Owner login” under the form → C6. No Google / Microsoft, no login code, no Forgot password.
### C7 · Log in — the company connected its Google Workspace
- new · OPTIONAL looks like C2 (the Google button is the company’s own). REQUIRED, drawn here: one Continue with Google as the main action; the quiet “System Owner login” as on C5.
### C8 · Log in — just after a password change
- today · any login variant with the notice on top; the email is filled in.
### C9 · Log in — refusals and states
- today + new · one message inside the form for every refusal; the same sentence for a lock, a restriction and an attack, no time given. States show the white side only — the pane never changes.
### C10 · Log in with a code (magic login)
- new (Ulia) · the password stays the main action; under the Email field, “Email me a login code” sends a code to that email (empty → “Enter your email.”) → this screen. The same whether or not the account exists. Code → the second step (D) if the person has one → the app. Hidden when company SSO is REQUIRED. The email also carries a one-click link. States show the white side only — the pane never changes.

## D · Second step

### D1 · Two-step login — code from the app
- today · after the password (C1–C4, C6, C8) or the login code (C10) when the person has two-step on. The same 6-box input as B2 / C10; it sends itself on the 6th digit. “Remember this device” only when the company allows it and the person isn’t a System Owner. The back arrow starts over (→ the company’s login). In the company’s accent, as group C. States show the white side only — the pane never changes.
### D2 · Two-step login — a backup code
- today · from “Use a backup code” on D1; the back arrow returns to D1. States show the white side only — the pane never changes.
### D3 · Logged in with a backup code
- today · how many are left, and the advice to set up a new phone. 1 or 0 left → “Set up again” leads to D4 (D5 issues a new set). States show the white side only — the pane never changes.
### D4 · Set up two-step login — required by the company
- today · the company requires two-step and the person hasn’t set it up. No back arrow: they can’t skip it. → D5. States show the white side only — the pane never changes.
### D5 · Set up two-step login — the backup codes
- today · ten codes, Download (.txt) and Copy. Continue needs the checkbox → the app. States show the white side only — the pane never changes.
### D6 · Set up two-step login — failed to start
- today · our side failed before the QR could be shown.

## E · To a provider and back

### E1 · On the way to Google or Microsoft
- new · auth.<root>, for a moment, both ways. Usually not seen; drawn because a slow network shows it. A clean white page, no pane (a pane would flash between the company’s colour and Google): the noddo wordmark whose “o” nods (the loader, SPEC § 9: 1.1 s loop) and one line. No action.
### E3 · Something went wrong on the way
- new · auth.<root>, when it can’t send the person back anywhere (no company known, the request broken). The everyday base in noddo’s Wine; the grey circle with an icon, like every other login error screen (illustrations live inside the product, not on login). Go to login → A1.

## F · Forgot password

### F1 · Forgot your password
- today · acme.<root>/forgot-password, from “Forgot password?” on C1–C4, C9. The back arrow → the login. → F2. In the company’s accent, as groups C and D. States show the white side only — the pane never changes.
### F2 · Forgot your password — sent
- today · the same screen whatever exists (as A4). Resend: the same limits as F1. Back to login → the login; the back arrow → F1. States show the white side only — the pane never changes.
### F3 · Set a password
- changed · one screen for everyone, with or without a password before (F5 merged in, Ulia) · acme.<root>/reset-password?token=… from the email. One field with the eye, as B2a (no Confirm). → F7. States show the white side only — the pane never changes.
### F4 · Set a password — Google or Microsoft will be disconnected
- new · F3 with a warning notice (InlineAlert tone pending) when Google or Microsoft is connected (S4, § 5.5). The provider’s name changes.
### F6 · Set a password — locked account with two-step
- today · F3 plus the code from the authenticator app (the 6-box input). States show the white side only — the pane never changes.
### F7 · Password changed
- today · Log in → the login with C8’s notice and the email filled in. (Or it opens the session directly — decided in the build.)
### F8 · The reset link doesn’t work
- today · expired (1 hour) or used. Request a new link → F1.

## G · Invitation

### G1 · You’re invited — choose how to log in
- changed (today: a password form) · acme.<root>/invite?token=… from the invitation email. Sandbox variant E (Ulia) on the approved base: the pane in the company’s colour carries the company’s logo, the ring grid and a huge two-tone “Welcome to Acme, Anna.” (the name lighter); the “Hi, Anna!” greeting belongs to the welcome right after (group W, Ulia), “powered by noddo” under it; the white side has “Join your team” and the form. On the phone the welcome becomes the heading. No inviter and no colleagues before login. Google / Microsoft first, then the password. Either way activates the account and opens the session → D4 if the company requires two-step → /welcome. States show the white side only — the pane never changes.
### G2 · You’re invited — Google or Microsoft failed
- new · G1 with one message above the buttons; the invitation is still unused.
### G3 · You’re invited — password only
- today · the company switched Google / Microsoft off. Also what a System Owner sees when invited into a company with SSO required.
### G4 · You’re invited — the company logs in through its provider
- new (E-Q1) · company SSO REQUIRED: one accent button, as C5. No password, no Google / Microsoft. States show the white side only — the pane never changes.
### G5 · The invitation doesn’t work
- today · an error, so the everyday company base (as C, D, F), not the celebratory card: the grey circle, one sentence per reason. Only “already used” has an action (Log in → the company’s login); the others tell the person whom to ask. G6 (“You’re in”) is removed: accepting opens the session. States show the white side only — the pane never changes.

## S · Company setup

### S1 · Set up — your company
- today · acme.<root>/setup, step 1 of 2, right after registration (B3) and before the welcome. Only the owner ever sees it, once. The first-experience base continues: the form on white, the Wine card with the orbit. noddo-branded, always Wine (no company colour yet). The stepper is two short bars with “Step 1 of 2 · Your company” — not rings: the screen already has the ring in the wordmark and the orbit (Ulia). Every field may be left empty; the language is pre-filled. Continue → S2. States show the white side only — the Wine card never changes.
### S2 · Set up — what to start with
- today · step 2 of 2. Two ways to begin, one to choose (Ulia: filled or empty — “Full demo” is dropped) — cards, not a form field; each says what you’ll see on day one. Example company carries a size slider (8 · 25 · 60 · 150 people), shown only when it’s chosen; it starts at the step-1 answer (Ulia). The back arrow → S1. Set up my company → S3. The only answer on these two steps that can’t be skipped. States show the white side only — the Wine card never changes.
### S3 · Setting up your company — progress
- today · nothing to press; when done, the app opens and the owner’s welcome follows. It can take up to a minute, so it must not look stuck: done steps get a check, the current one is the one accent ring that nods (the loader), the rest are small grey dots. S5: an owner who closed the tab and logs in again lands here, where it is, not on S1. States show the white side only — the Wine card never changes.

## W · Welcome

### W0 · Welcome — hi
- new (Ulia: Sandbox “mix 1 on white”) · the first screen after the first login, before W1. White, centred: the company’s logo on a white tile with a hairline and shadow-1 (any logo reads on white), a huge two-tone “Hi, Anna! / Glad you’re here” (the second line in the company’s colour), one line of what comes next, Let’s go → W1 (or W2 when W1 is absent). The rows of rings along the bottom in the company’s colour, the strong ones nod. Every welcome step keeps this frame.
### W1 · Welcome — log in faster
- new · acme.<root>/welcome, the first step, right after the first login, for a person who set a password at the invitation or registration. Absent when the company switched the buttons off, when its SSO is required, or when the person already connected an account. The W0 frame: white, the logo on top, one centred column, rings along the bottom. Google / Microsoft are the white provider buttons. Skip counts as done. → W2. States show the white side only — the pane never changes.
### W2 · Welcome — your photo
- today · the usual case: a person who may fill in nothing about themselves. The stepper is two bars (as S). On a computer the photo is a wide drop zone (Ulia: it was too squeezed, and drag and drop was missing): a 112 avatar with the initials, “Drag your photo here”, the file rules, or “Choose a file” / “Upload from my phone”; while a file is dragged over, the zone turns accent (“Drop it here”). On a phone the block has one button, “Add a photo” (camera or library) — “Use my phone” makes no sense there. Skip / Continue → W4.
### P · The photo from a phone (§ 14.10)
- today · from W2’s “Upload from my phone”. On the computer the drop zone turns into a QR code (P2): scan it with the phone’s camera; the computer waits by itself (the nodding ring), nothing else to press. The phone opens acme.<root>/m/avatar?token=… — no login, the code is the key: the person picks a photo from the gallery or takes one (one big button in thumb reach), it uploads, and a few seconds later it appears on the computer by itself (P3, a short fade-in is welcome). The code works once, for 15 minutes; when it expires the zone says so (P4). The photo itself is a placeholder in the drawing.
### W3 · Welcome — about you (only when the person may fill in their own fields)
- today, changed (Ulia) · a step of its own after the photo, not on the same screen. Shown only when the person’s role lets them edit some of their own fields; then the welcome has three steps — photo · about you · preferences (“Step 2 of 3 · Profile”); otherwise two. The fields still blank — any field type the product has, each with its own validation; drawn with three fields of different types (text, date, multi-select: preferred name, date of birth, languages you speak) and with eight (the page scrolls). The owner’s version (W5) never lists company-wide fields. The back arrow → W2. States show the white side only — the pane never changes.
### W4 · Welcome — your preferences
- today · the last step — drawn as “Step 3 of 3”; “Step 2 of 2” when there is no W3. Both fields come pre-filled with the company’s values, shown plainly — “(UTC+01:00) Warsaw”, “English” — with a clock and a globe icon; the lead says once that these are the company’s settings (Ulia: “Same as the company” in both fields read badly). Time zone is a searchable list; Language lists the product’s languages. The back arrow → W2/W3. Finish → the app.

## N · Link and access pages

### N1 · This link doesn’t work
- today · the generic page for any link with a token that is out of date, used or broken (except the invitation, which has its own G5). The everyday company base in the company’s colour; the grey circle like every other login error. Go to login → the company’s login.
### N3 · Logged out — your session ended
- new (proposed) · the company’s login with an info notice on top: “You were logged out. Log in again to pick up where you left off.” After login the person goes back where they were (next). No reason given (time-out, password changed elsewhere, admin action).

## M · Emails

### M · Emails (§ 14.12) — as they look when opened
- Each email is shown opened in a mail app — on a computer and on a phone. The mail app around it is a neutral stand-in, not part of the build. The email itself is one responsive block, 600 wide at most and fluid below that (on a phone the card goes edge to edge, the code boxes and the button stretch). Two kinds: moments (invitation, codes, links to act on) open with a band in the company’s colour, its logo, the rings and a big two-tone heading; notices (something changed) have a slim band and an icon above the heading. The rings are still — emails don’t animate. noddo’s own emails (M1, M6) are in Wine with the noddo wordmark; everything after the company is known is in the company’s colour.
### M1 · Trial — confirm your email
- today, changed to a code (B2) · noddo’s own email (no company yet). The code looks like the 6 boxes on B2. No link.
### M2 · Invitation
- changed · one invitation for every company: “Join Acme” opens the invitation page, which shows the ways in that the company allows (G1, or G4 “Join with Okta”). No inviter’s name (no colleagues before login).
### M4 · Password reset
- changed · when Google or Microsoft is connected, a warning says it will be disconnected (as F4).
### M5 · Account locked
- today.
### M6 · Your company addresses
- today · noddo’s own email (sent from the root, A3/A4). One row per company, with its logo; nothing is sent if the email has none.
### M7 · Confirm your new email
- today · sent to the new address.
### M7 · Your email was changed
- today · sent to the old address.
### M8 · Security notices
- today · one template, one sentence each: “Two-step login was turned on / turned off / reset by your administrator”, “Someone entered wrong two-step codes several times”, “A backup code was used — 6 left”.
### M9 · Google or Microsoft connected
- new.
### M10 · Google or Microsoft disconnected
- new · M11 (removed by a password reset) is the same email with “because you set a new password”.
### M12 · Set a password
- new · the company stopped logging in through its provider, or turned the Google / Microsoft buttons off.
### M13 · To administrators: the SSO certificate expires
- new · 30 and 7 days before.
### M14 · To administrators: logins through the provider are failing
- new.
### M15 · To System Owners: a domain connected, the provider changed or removed
- new · one template, one sentence each.
### M16 · Log in with a code (magic login)
- new · sent from C10 “Email me a login code”. The same code block as M1, in the company’s colour. The one-click link logs in only in the browser that asked for the code. The same email whether or not the account exists — nothing is sent if it doesn’t.
### M17 · Your password was changed
- new (proposed) · sent after any password change: reset (F7), the person’s preferences, a set password after M12. Says that other sessions were logged out.
### M18 · Acme is ready (to the owner)
- new (proposed) · sent once to the owner when the company is created (after S3). noddo’s own email (Wine): the company has no logo or colour yet, so its tile is the first letter. Keeps the company’s address in the owner’s inbox.

## L · Appearance

### L · Appearance — what a company sets (§ 14.11)
### The presets, final
### L1 · Appearance — saved, nothing changed
- Settings → General → Appearance, for whoever holds SETTINGS.GENERAL. Drawn at a MacBook Pro 14" screen (1512 × 982). Left: “Make noddo feel like Acme”; 1 Add your logo; 2 Pick your color — “From your logo” (up to three colours taken from the file; near-white, near-black and greys skipped; the picked one shows its HEX) above our presets; 3 Pick a background (Your color · Light); Save pinned to the bottom of the column. Right: a neutral stage; tabs Inside noddo (Home) · Login page (computer + phone) · Email. A logo without its own background always sits on white.
### L2 · Picking a color — the stage is the draft
- Clicking a ring makes it nod and repaints the stage (“Not saved yet”), the heading’s second line and the Save button; the rest of the page keeps the saved colour until Save.
### L3 · Your own color — picker, wrong code, adjusted
- “Your own” opens a picker: a saturation square, a hue bar and the color code field (#rrggbb, with or without #). Wrong code: the field’s error, the stage keeps the last good colour. A very light or dark colour is adjusted for readability and said so.
### L4 · Logo — dragging, uploading, refused
- The logo is saved the moment it is uploaded (no Save) and the stage shows it at once; its colours appear under “From your logo”. Remove puts the first letter back.
### L5 · Saving
- Busy, then a short confirmation. A colleague saved in between: refused, not overwritten (the version check). Any other failure: the form’s message; the draft stays.
### L6 · Loading, couldn’t load, view only
- Loading: skeletons with shimmer. Couldn’t load: ErrorState with the illustration. May see settings but not change them: a Mist banner, rings, logo and background read-only, no Save; the stage still works.
### L8 · A colour close to a status colour
- Statuses are never themed (SPEC § 4.5): Approved is always Pine, Declined always red, and a status is always an icon and a word. When the picked colour is within 25° of a status hue, the page says so in one quiet line under the rings and nothing is blocked. None of the nine presets sits within 25° of a status any more (Basil is 29° from Approved, Indigo 20° from In progress); the line is for a colour from “Your own”, like this #0E7A54, 5° from Approved.
### L7 · Pick a background — Light
- Light, for every company: the login pane and the email band in Gray 50 with Gray 200 rings; the nodding rings in the company colour, or in the logo’s colours when it has several. In Light emails the canvas round the card is white and the card has a 1 px Gray 200 border (grey inboxes; mail apps drop shadows). Home is not redrawn: the company’s background sets the default of Home’s own Colour / Light top (HF01 / HF02) for everyone at Acme; each person can still switch. With several logo colours the company picks only the accent; the rings use all of them. Part of the draft; Save saves it. When an uploaded logo turns out to have two or three colours and the company has never changed its background, Light is put into the draft (the stage shows it); it is saved only with Save. A background the company already chose is never touched.

## L · Light background

### L · Light background — “Pick a background: Your color · Light”, for every company
### Login · computer
- Light = Gray 50 with Gray 200 rings. Only the pane changes. The white side and every state (errors, code, second step…) stay as they are.
### Login · phone
- The top strip follows the pane.
### Email · moment (M2 and the others with a big band)
- The band follows the login pane. In Light the card gets a 1 px Gray 200 border: many inboxes are grey too, and mail apps drop shadows. noddo’s own emails (M1, M6, M18) stay Wine.
### Email · notice (M8 and the others with a slim band)
### Home · the top
- Home is not redrawn. The company’s background sets the default of Home’s own Colour / Light top (HF01 / HF02) for everyone at Acme; each person can still switch it.
### A logo with several colors · login
- In Light the nodding rings take the logo’s colours (up to three, taken from the file).
### A logo with several colors · Home

## Sandbox

### Appearance · a brand with many colors (monday, ClickUp, Figma…)
- Today’s rule: Acme picks Violet from its logo; the pane is Violet. The other two logo colours sit on top of it in the white tile — fine for a one-colour brand, busy for a rainbow one.
- What you asked about: the pane in one brand colour (Coral), the buttons in another (Violet). Every pair has to be checked for contrast and for clashing — most pairs clash, and white text on Coral is hard to read (3.2 : 1).
- Recommended. The pane is Mist with our quiet grey rings; the nodding rings take the logo’s colours. The logo stays in full colour; buttons and links keep the one colour (Violet). Still loud enough — the colours are in the logo and the rings.
- The same on Ink: the logo’s colours glow on dark. Good for brands with a dark site.
### C + D in settings: logo first, colors from the logo, then a background
- The logo comes first, so we can offer its colours (“From your logo”) above our presets. Step 3 picks what sits behind the logo on the login page and the email band: Your color (today), Light or Dark. One colour still runs buttons, links and everything inside noddo — that’s what keeps it readable. Inside noddo doesn’t change.
### Presets · round 2 — clean colours (the muted set looked dirty)
- Clean, saturated, mid-dark: no grey in them, so they don’t look dirty next to noddo’s greys, and each carries white text at 5:1 or more. Wine stays the default. Today’s presets are right below for comparison (Brick → Cherry, Terracotta → Orange, Sun → Amber, Forest → Emerald, Denim → Cobalt, Iris → Violet; Raspberry out, Ocean in).
### Today’s presets, for comparison
### Emails · A · noddo in the band, next to the company
- The company stays first (left, its logo and name); “on noddo” with the white wordmark sits on the right of the band. On the slim band of notices it replaces the small rings. On a phone only the wordmark stays.
### Emails · B · a sender line above the card
- “Acme via noddo” above the card, like a postmark: the card itself is all the company’s; noddo signs who sent it.
### Emails · C · noddo signs at the foot (as SPEC § 15)
- The footer becomes noddo’s signature: the noddo wordmark (Ink, Wine nod) and “Sent by noddo on behalf of Acme”, then the company’s address. SPEC § 15 already asks for this line.
### Appearance · B1 — the right half painted in your color
- The right half is noddo’s neutral Mist grey with quiet grey rings (the nodding ones in the company’s colour), so the company’s colour on the previews is the only colour on the stage (Ulia: violet on violet didn’t read). First tab is “Inside noddo”: only the real Home in the company’s colour, big. “Login page” and “Email” tabs show those big. Picking a color repaints the half at once — the most “selling” moment. Swatches in two rows of rings with names (the picked one nods); “Your own” opens the picker.
### Appearance · B2 — everything at once, no tabs
- A soft tint of the color on the right. Four views one under another, never on top of each other, each with its label: Inside noddo (the real Home, big), then the login page and the phone side by side, then the email. The preview column scrolls; the left column with the choices stays.
### Appearance · B3 — one big login, bleeding off the edge
- The right half in the color, with one large login page running off the right edge — calm, big, about the login only. Tabs for the rest.
### Appearance · A — a stage
- A big stage on top in the company’s colour: the login page in a browser window and on a phone, labels “Your color · Your logo · In every email”. Under it, two quiet rows like Personio: color (chips + your own) and logo. The stage repaints live as you pick. Save at the top right.
### Appearance · B — make it yours
- Half landing, half settings. Left: “Make noddo feel like Acme”, two steps — pick your color (the swatches are noddo’s rings; the picked one nods down), add your logo (a drop zone). Right: a big live preview — the login page large, the app under it; tabs for login / inside noddo / email.
### Presets — today’s ten vs a proposed set (Ulia: pick the colors the system looks best in)
- Today’s presets are bright, “confident” shades; next to Wine and noddo’s greys several of them shout (Brick, Sun, Raspberry, Iris). Proposed: ten deep, slightly muted colors with the same weight as Wine, every one with white text at 5:1 or more. Names avoid the status words (no “Pine”, “Forest” used for Approved). The 11th option is always “Your own”: a picker + a HEX field.
### Appearance · C — a gallery of looks
- Like picking a theme: every color is a card showing the login in that color; one click and it’s yours (“Yours” badge). The last card takes your own HEX. Under it, the logo and a button that opens the login full size.
### L · Option 1 — the company’s photo instead of the rings
- If the company uploads a photo, it fills the pane; the rings go. The photo fades into the company’s colour at the bottom, so the logo, name and “powered by noddo” always read, whatever the photo. On the phone the strip shows the photo the same way. No photo → the rings, as now. The photo is only for the login (Ulia: the company can’t change the home page background — the home page has its own). The photos here are abstract stand-ins.
### L · Texts — A: the company’s own line on the pane
- The company can write one line under its name on the pane (up to 80 characters). “Log in to Acme” on the white side never changes. Empty → nothing is shown. Drawn: a short line, the longest line, the phone (one line, cut with …).
### L · Texts — B: no custom texts (Ulia leans to this)
- The company sets only its colour, logo and (option 1) photo. The pane always shows the logo and the name, the white side always “Log in to Acme”. Nothing to write, nothing that can look broken. The Headline and Sub-heading fields leave Appearance.
### Welcome — mix 1 · E2’s centred layout on the company’s colour
- A first welcome screen before W1, right after the first login. From E2: centred, huge two-tone line, the rows of rings along the bottom. From W2: the whole screen in the company’s colour, a white button. Greeting “Hi, Anna! Glad you’re here.” (Ulia: we say hi here).
### Welcome — mix 2 · W2’s layout on white
- From W2: left-aligned, the ring grid on the right. From E2: white background, the name in the company’s colour, the accent button.
### Welcome — mix 3 · W2’s layout and colour, E2’s line
- Closest to W2: the company’s colour, the grid on the right; the greeting and the line from E2.
### Phone — option A · The wordmark stays on white, more air before the heading
- A · the strip keeps “Every yes, handled.”; the gap between the noddo wordmark and the heading grows from 20 to 40.
### Phone — option B · The wordmark replaces the slogan in the strip
- B · the strip carries the noddo wordmark (white, Rose “o”) + the row of rings; the white part starts straight with the heading (or the back arrow).
### Phone header — option 1 · One row of rings
- 1 · the big Wine header is gone: a slim Wine strip with one row of rings (the Rose ones nod). The noddo wordmark moves to the white part, top-left, next to the back arrow.
### Phone header — option 2 · “Every yes, handled.” + one row of rings
- 2 · the same strip with the slogan in one line above the rings. About half the height of the old header.
### A1 · the white side — option 1 · The heading moves to white, the pane becomes the brand
- 1 · the white side gets the heading “Log in to your company” above the form (as A3 and A4 already have theirs); the Wine pane carries only the brand: rings, the noddo wordmark large, “Every yes, handled.”
### A1 · the white side — option 2 · The wordmark small in the corner
- 2 · the pane keeps the headline; the noddo wordmark sits small in the top-left corner of the white side, like a site header, not above the form.
### Round 5 · L1 developed — the company’s login
- L1 · the logo no longer floats alone at the top: the company’s logo and name sit right above “Log in to Acme.”, as one block at the foot of the pane; the ring grid is on top. The pane stays, the right side changes (code step shown).
### Round 5 · L2 × F — the first experience (registration)
- L2 × F · for people who meet noddo for the first time (B1, Start your free trial): the form on white with a two-tone heading; a rounded Wine card with the selling point and the orbit. The point is no longer “all in one place” but what noddo does: one approval and everything after it happens by itself — the Rose ring in the centre, the things noddo automates around it (Workflows, Approvals, Time off, Onboarding, Reviews). Headline chosen by Ulia: “Every yes, handled.” with the explaining line under it. Headline options: “One yes. The rest runs itself.” (drawn) · “Every yes, handled.” (the landing) · “Pick. Tweak. Nod.”
### Round 4 · The login base — L1 · Wine pane left (from E)
- L1 · E, made into the login’s base. Left: a Wine pane 520 with the company, an even ring grid that fits the pane exactly (no ring cut — the old pattern looked broken), one Rose ring dropped = the nod, and 64 px “Log in to Acme.” (the name in Rose). Right: the form on white, nothing else. The pane stays the same on every login screen; only the right side changes (L1-b, L1-c).
### Round 4 · The login base — L2 · Form left, Wine panel right (from F)
- L2 · F’s structure: the form on white with a two-tone “Log in to Acme.”, and a rounded Wine panel on the right with the landing’s line “Every yes, handled.” and the ring grid. Calmer than the orbit, which is better for a screen people see every day. Phone: the panel becomes a strip under the form.
### Round 4 · The login base — L3 · Half and half, the rings as a field
- L3 · the bravest: half the screen is Wine with a full field of rings behind a 72 px “Log in to Acme.”, the form alone on the other half.
### Sandbox · Invitation — E · The landing, continued
- E · built from the landing’s language: the company’s colour as a solid block with the ring grid (one ring nods), a huge two-tone welcome (“Anna.” lighter), and on the right a quiet form with a two-tone heading. Product controls stay product (radius 8, lg 44); the landing’s pill buttons are marketing only.
### Sandbox · Right after joining — E
- E · white, one huge two-tone line like the landing’s hero (“Anna.” in the company’s colour), the ring grid along the bottom in the company’s colour. Next: name, photo, done.
### Round 3 · Invitation — F · The orbit
- F · like Metaview’s split: the form on white with a two-tone “Join your team.”, and on the right a Wine panel with the Rose ring at the centre and the things noddo holds for you orbiting it (time off, approvals, documents, team, reviews).
### Round 3 · Invitation — G · The giant ring
- G · like Homerun’s big type: the page in the company’s soft colour, one giant ring in the accent cropped by the edge, 88 px “Welcome aboard, Anna.”, the card over the ring.
### Round 3 · Invitation — H · Your spot on the team
- H · the rings become your colleagues (initials on their soft colours) and one empty ring in the accent says “You” — it sits a little lower, the nod. “Your team is here. There’s a spot for you.”
### Round 3 · Right after joining — W1 · Hell◯
- W1 · the noddo “o” becomes the greeting: “Hello, Anna.” where the o is the company’s ring, sitting low like the nod. Replaces “You’re in, Anna.”
### Round 3 · Right after joining — W2 · On the corporate colour
- W2 · the landing’s Wine block: white two-tone “Glad you’re here, Anna.”, the ring grid on the right Rose rings on Wine (SPEC § 10 on-Wine recipe), one nodding.

## Outdated

### Where we started — the first login and the first emails (2026-11)
