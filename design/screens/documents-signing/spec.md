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
- **SignerChain** — the read-only step chain.
- **QrHandoff** — the QR code and the waiting state. The same mechanics as first-run-photo.

## Open questions
Q-35 (reading before your turn), Q-36 (the drawn signature and the phone hand-off), Q-37 (the font in the PDF). None blocks the drawing; Q-36 sizes the work.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/documents/sign/[id]` (in the company), `/sign/[token]` and `/sign/copy/[token]` (a
  guest), `/m/sign` (the phone), `/preboarding/sign/[taskId]` (a joiner) — `components/modules/signing`. Built 2026-11-18, walked in the built-in browser the same day (`(claude)/HISTORY.md` § "Documents" → "The second part"). The guest's signing was walked; the PDF viewer has not been seen drawing in a visible window.
- **Differs from the design:** nothing known since documents batch 11 (2026-11-18): the document is drawn by our own
  `PdfViewer` on pdf.js (`components/ui/PdfViewer`, also the tab's preview), and a signing sent from a profile has
  its Home card (`/me/actions`, `toSign.ts`, `waitingOnYouDeck.ts`).
