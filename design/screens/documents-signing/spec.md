---
status: built
screen: documents-signing
owner: Ulia
updated: 2026-11-17
---

# Signing — the signer's side (G01–G13, G03a–G03i, P08)

## What it is for
A signer reads the document and confirms it's them with a code from their email. They then sign by typing their name or drawing it — on the computer or on their phone — or decline with a comment. There are three kinds of signer:
- a signer in the company, logged in;
- a guest outside it, no login;
- a new joiner on their preboarding page, no account yet.

## Where it lives
- **In the company:**
  - Home → Waiting on you → a "Do" card (G01, the same in Inbox).
  - **Sign** opens the signing screen `/documents/sign/:signingId` (G02). It is a full page with its own top bar and no sidebar.
- **Guest:** `acme.<root>/sign/:token` (G09). Public, in the company's colour and logo, "Signing powered by noddo" at the foot (DESIGN_SYSTEM § 4).
- **New joiner (P08):** the same page as a guest's, opened from their preboarding page (that page is designed later). The code goes to their personal email; "Back to your tasks" returns there.
- **Phone page for drawing:** `acme.<root>/m/sign?token=…` (G03f–G03i). Opened by the QR code. One-time, 10 minutes, for this signer only.

## Layout
- **Top bar.** Back · a PDF tile · the title · "From Lena Novak · sign by 17 Dec" · Download.
- **Viewer** (left): page count, zoom −/100%/+, the pages scroll. The same component as the preview in the tab.
- **Right panel**, 360:
  - "Lena Novak asks you to sign".
  - "Who signs" as a step chain: numbered steps, "You" in the accent, people in one step stacked, and a line joins the steps.
  - The hint "You sign by typing or drawing your name. First we’ll send a code to your email to make sure it’s you."
  - **Sign**: lg 44, full width, with the signature icon. **Decline**: secondary, full width.
- **Code (G03a).**
  - "Check your email" / "We sent a 6-digit code to meryem@acme.com. It works for 10 minutes."
  - Six boxes; the 6th digit moves on by itself.
  - "Send a new code".
  - G05: a wrong or old code turns the boxes red, with the `FieldError` "The code is wrong or has expired." After 5 tries in an hour: "Too many attempts. Try again in an hour."
- **Your signature (G03).**
  - "Code confirmed" with a check.
  - A `SegmentedControl`: **Type | Draw**.
  - **Type:** "Your full name" (prefilled), and a preview "This is how your signature will look" in **Marck Script**.
  - **Draw (G03b–G03e):**
    - a pad with a baseline: "Draw your signature here";
    - Clear;
    - "Draw on your phone" → G03d. Like the profile-photo P2: a dashed zone, the QR code on a white tile, "Scan the code with your phone", "Draw on your phone, and it shows up here.", "The code works once, for 10 minutes.", and under the zone "Draw here instead";
    - G03e: the phone's PNG lands in the pad, with "From your phone" and Clear.
  - Sign.
- **Phone page (G03f–G03i), 375 wide.**
  - The company colour band on top with the logo. White below, no rings.
  - "Draw your signature" / "For Employment contract 2026 · Meryem Alaoui".
  - A big pad: "Sign here with your finger". The hint "Turn your phone sideways for more room."
  - **Clear · Done** at the bottom. "Signing powered by noddo" at the foot.
  - G03h, sent: "Done" / "Your signature is on your computer now. Go back there to sign."
  - G03i, expired or used: a grey Mist circle with a clock, "This link has expired" / "Make a new QR code on your computer and scan it again."
- **Signed (G04).**
  - "You signed".
  - A "Next to sign" box with their names.
  - "You’ll get the signed copy when everyone has signed." / "Your name, the time and how you confirmed it go on the last page of the signed copy."
  - Back to Home.
- **Decline (G06).** "Decline" / "Lena Novak sees your comment and can send it again." "Comment" is required, placeholder "What’s wrong with it?". Button: Decline.
- **Not your turn (G07).** The document is readable, with no Sign. "It’s not your turn yet" / "Meryem Alaoui signs first. We’ll email you when it’s your turn."
- **Closed (G08).** A neutral circle. "This signing request is closed" / "It was cancelled, declined or it ran out of time. There’s nothing to sign now." Back to Home. The document isn't shown.
- **Guest (G09–G13).**
  - Company colour and logo; "Signing as Daniel Kim"; other signers' emails are never shown.
  - G10: link dead — the grey circle and words of the login's dead-link page: "This link doesn’t work" / "It may be out of date or already used. Open the newest email from Acme, or ask them for a new link."
  - G11: signed, "We’ll email you the signed copy when everyone has signed."
  - G12: the signed-copy page — "Everyone has signed", the file, "Download the signed copy", "This link works until 18 Dec." After 30 days: "This link has expired. Ask Acme for the signed copy."
  - G13: phone layout, Sign and Decline pinned at the bottom.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Viewer pages as skeleton; Sign `loading` while the code is sent | — |
| Empty | — (a signing always has a document) | — |
| No results | — | — |
| Error | Wrong/expired code G05; too many attempts; the phone link expired G03i; a guest's dead link G10 | G05, G03i, G10 |
| No permission | Not your turn G07; closed G08; impersonating is refused — proposed words, not drawn: "A signature is the person’s own act. Log in as yourself to sign." | G07, G08 |
| Normal | G02, G03, G03b–e, G04, G09 | |
| Long content | Steps with two people in one step; a 4-page PDF; the phone layout | G02, G13 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Sign | G02 | Sends the code → G03a | no |
| Enter code | G03a | 6th digit → G03 | no |
| Send a new code | G03a/G05 | New code; old one dies | no |
| Type / Draw | G03 | Switch | no |
| Draw on your phone | G03b | G03d (QR); the computer waits by itself | no |
| Done (phone) | G03f | PNG uploads; G03h; the computer shows G03e | no |
| Sign (final) | G03 | Signed → G04 / G11 | no |
| Decline | G02 → G06 | Comment required; sender notified | the form is the confirmation |
| Download | top bar | the PDF | no |

## Words
`words.md` has every frame. The key strings are quoted in Layout above.

## Values
- Full-page signing screen. Panel 360; Sign/Decline lg 44, label 15, padding 18 (§ 13.2).
- Code boxes 48 × 56, radius control (§ 13.3).
- Pad: radius card, dashed `border-strong`.
- QR 148 on a white tile, radius popover, hairline (as first-run-photo P2).
- Phone: 375 × 812, band 52 high in the accent.
- Footer "Signing powered by noddo":
  - centred on the page, 44 high, hint style;
  - the grey wordmark 15 high, lifted 1 px so its letters sit on the text line.
- Guest and phone pages use the company accent; the wordmark is the image, never typed (§ 3).

## Changes to SPEC
- **The typed signature font is Marck Script** (Google Fonts, Latin + Cyrillic). It's an e-signature, not design: an exception to § 5's fonts, approved by the owner on 17 Nov. It is used only in the signature preview (G03) and on the signed PDF. Cyrillic is there for future Ukrainian or Bulgarian names; there is no Russian in the product.
- **Phone pages from a QR code** (product rule): a company colour band with the logo on top, white below, no rings. The same footer as every company-branded signing page.

## New components
- **PdfViewer** — pages, page count, zoom. Shared with the preview in the tab.
- **SignatureInput** — Type | Draw, with the pad, Clear and the phone hand-off.
- **CodeBoxes** — six one-digit boxes, error state.
- **StepList** (`components/ui/StepList`) — the read-only step chain, by the STEPS rule (2026-11-23).
- **QrHandoff** — the QR code and the waiting state. The same mechanics as first-run-photo.

## Open questions
Q-35 (reading before your turn), Q-36 (the drawn signature and the phone hand-off), Q-37 (the font in the PDF). None blocks the drawing; Q-36 sizes the work.

## Added 19 Nov 2026 — approved by Ulia (G04b)

### G04b · You declined to sign
- Same screen as G04 (sign screen, panel 380 on the right); only the panel changes.
- Circle 48, bg status-declined-bg, CancelCircleIcon 20 in status-declined-icon (= danger #C42B1C). Title "You declined to sign" 18/26 600.
- Card (Surface subtle, radius card, padding 16, gap 12, 20 below the title): label "Your comment" 13/18 #6B6B70 · the comment in curly quotes 14/20 #45454A · "Lena Novak sees your comment and can send it again." 13/18 #45454A (the G06 line, word for word; the sender's full name).
- "Back to Home" secondary 44, full width, pinned to the bottom of the panel. No info line.
- Replaces the live grey line "You declined. Ulia Tykoon has been told."

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/documents/sign/[id]` (in the company), `/sign/[token]` and `/sign/copy/[token]` (a
  guest), `/m/sign` (the phone), `/preboarding/sign/[taskId]` (a joiner) — `components/modules/signing`. Built 2026-11-18, walked in the built-in browser the same day (`(claude)/HISTORY.md` § "Documents" → "The second part"). The guest's signing was walked; the PDF viewer has not been seen drawing in a visible window.
- **Differs from the design:** nothing known since documents batch 11 (2026-11-18): the document is drawn by our own
  `PdfViewer` on pdf.js (`components/ui/PdfViewer`, also the tab's preview), and a signing sent from a profile has
  its Home card (`/me/actions`, `toSign.ts`, `waitingOnYouDeck.ts`).

**The designers' round of 19 Nov (2026-11-20, built, not yet seen on screen):**
- **G0 — the code is checked on its own step.** `POST /documents/envelopes/{id}/code/check`, `/public/sign/code/check` and
  `/public/preboarding/tasks/{taskId}/sign/code/check` (`EnvelopeService.checkCode`): a wrong code counts one of the code's
  five tries, exactly as at the final Sign, and a right one is not spent — the signature spends it. Wrong → the step
  stays, the digits stay in red (G05), "That code doesn’t match. Check your email or get a new code." in one line, and
  "Send a new code" left-aligned without an underline. The fifth wrong try says the catalogue's "too many attempts".
- **G12 — the code step comes at once**; the email leaves after commit on its own thread (`notificationExecutor`), and a
  refusal (too many codes an hour) lands on the code step.
- **G7 — the phone link.** In code the link is ten minutes and one use; what could kill it at once was a session on the
  phone: `/public/sign/` was not a public backend path, so an expired access cookie travelled with the call, Java refused
  it before reading the token, and the page said "This link has expired". It is a public path now
  (`config/security/publicBackendPaths.ts`). Not re-checked on a phone.
- **G2 – G6, G13, G14b, G16b, G04b:** the top bar with the PDF tile and "sign by 17 Dec" (no year this year); the document
  on the grey stage — `PdfViewer layout="stage"`: "Page 1 of 4" on the left, zoom on the right, no file-name strip,
  pages 560 at 100 %, 20 apart; the panel 380; "Back" over every step; titles 18/26; the code boxes 44 × 52, 22/600,
  8 apart; Type / Draw with their icons; the name field on Type only, the preview card under it (Mist, radius 16) with
  the hint inside; the pad dashed, 180 high, its hint in the middle, the baseline 40 above its foot; Clear (eraser) only
  once there is ink; the QR on a white tile in a dashed zone and "Draw here instead" in ink under it; Sign, Decline and
  Back to Home pinned to the foot; "Not your turn" as a blue note with no title; the step chain (circles 22, the current
  step in the accent, a signed one green with a tick); the closed page inside the full-screen sign page with its
  header; the decline form with one red Decline; G04b as drawn.
- **G9 — the circles are green**, never the accent: "You signed", the guest's done page, the phone's Done, the signed copy.
- **G8, G10, G11, G12 (the page) — the company band** (64; 52 on the phone): the logo on a white tile and the company
  name; "Signing as Daniel Kim" on the right of a guest's band. The guest's page is centred, 1192 at most, the panel a
  white card; "{sender} from {company} asks you to sign"; the hint names the guest's or the joiner's email. G11 is a
  page of its own.
- **G1 — the Home card** of a signature a task stands for reads as one sent from a profile: the signature tile, "from
  Lena Novak · to sign", "Sign by Wed, 17 Dec", Sign with its icon.
- **The step chain on this screen is its own** (`WhoSigns` in `SigningScreen.tsx`), drawn with `StepList`; the old
  `SignerChain` was removed on 2026-11-23, unused.
- **Not done:**
  - **"4 pages"** on the Home card (G1) waits on AQ-11; the viewer's own page counter stays.
  - ~~Photos in the step chain~~ — since 2026-11-23 (B5) a signer's photo is drawn in the steps, here and in the
    sender's Signing panel (`EnvelopeDTO.Signer.avatarUrl`); initials in the person's colour when there is none, a guest
    keeps the person icon. Not walked yet.
  - **The signed-copy page's file row** ("Employment contract 2026 (signed).pdf", "Signed by everyone on 18 Nov") and the
    date in "This link works until 18 Dec": the page reads only its token, so it keeps "30 days from when everyone
    signed".
  - The typed signature's preview is the page-title size (24/32), not 30/36: the system has no 30 role.
  - The logo tile shows the company's initial when the company has no logo.

### Built from the designers' answers of 2026-11-20 (2026-11-23)
- STEPS (`handoffs/2026-11-20-answers-from-design/7-product-wide/STEPS.md`): the signing panel S07, the sign screen
  G02 / G03, the guest page G09 and "Next to sign" in G04 draw their steps with the shared `StepList`
  (`components/ui/StepList`): done a 16 Mist circle with an Ink tick, now a 16 accent ring with its number and the names
  in the accent, not yet a grey ring with its number; avatars 24; no frame; the grey label "Who signs" (or "Next to
  sign") on top. In S07 the role and the state share the line under the name ("The person · Signed …"). G04's later
  steps keep their own numbers; its copy line stays in its grey box under the list.
- B11 (the owner, 2026-11-23): a signer whose turn has not come reads "To sign", grey.
- Not seen in a browser.
