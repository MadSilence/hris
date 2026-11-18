# noddo emails — the one template (rules for every email we draw)

Ulia, 2026-11-17: every noddo email must be built the same way. The login emails (`design/screens/sign-in-emails`, M1–M18, approved 2026-11-13) are the base. The signing emails (Documents page 6: G14–G16) follow them, and every later email does too: internal, processes, documents, onboarding.

**Before drawing any email:** open `design/screens/sign-in-emails/spec.md` and `export/assets/auth-m2.css` from the repo. Copy the values from there; don't draw from memory. Then put the new email next to M16 (or the nearest login email) and compare them pixel by pixel: band, heading, rings, logo, button, code box, footer. If anything differs, it's a bug unless Ulia approved the difference here.

## The frame (same in every email)
- **Mail app around it** (board only, not built): the subject plus an "Inbox" tag. Sender line: avatar = the company logo, "Acme <no-reply@acme.noddo.so>", "to me", time.
- **Canvas:** Mist (`surface-canvas`), padding 32/16. **Card:** white, max 600, radius 20, `overflow:hidden`, shadow `0 1px 2px rgba(11,11,12,.06)`.
- **Logo in the band:** company = a white tile 36 (radius 8) with the company's mark 22, then the name in Inter Tight 600 18/24, white. noddo's own emails (sent from the root) use noddo's white wordmark with the Rose "o", 26 high. The logo is always the real asset, never typed as text (SPEC § 3).
- **Body:** padding 32 40 36. Text 16/26 secondary; bold 600 primary.
- **Button:** one only, in the accent. 48 high, radius control, Inter 600 16/22, padding 0 24, arrow 18 after the label.
- **Small print:** under a hairline, 14/22 tertiary.
- **Footer** (company emails):
  - the noddo wordmark (Ink with the Wine "o", 26 high);
  - "Sent by noddo on behalf of Acme" (14/20 secondary);
  - "Acme · {address} · You get this because …" (13/18 tertiary).
  - noddo's own emails carry only "noddo · Six Software, Vilnius".
- **Narrow (< 480):**
  - the card goes edge to edge, paddings 20;
  - band heading 24/30;
  - rings scale down;
  - the button and the code box go full width.

## The three kinds of email (pick one; don't invent a fourth without asking)

### 1. Moment
Something happened to *you*: a welcome, an invite to the product, a code.
- **Band:** accent, padding 32 40 0, the logo top-left.
- **Heading:** two tones, Inter Tight 600 44/46, letter-spacing −0.03em, margin 40 above and 28 below. The second line is in `color-mix(accent 35%, white)` (Rose on Wine). No full stop.
- **Rings:** one row of 6, r 20, stroke 6, spread across the band's width.
  - Colours: `color-mix(accent 72%, white)`; two light ones (2nd and 5th) in `color-mix(accent 30%, white)`.
  - The 5th is dropped 9 px — that's the nod.
  - The row is cut exactly in half by the band's bottom edge: SVG 600×56, cy 23 (the 5th 32), margin-bottom −20.
  - Built as a static image; emails don't animate.

### 2. Notice
Information or a warning: account locked, a certificate expiring, a password changed.
- **Slim band:** padding 20 40, the logo (tile 28, name 16), and 3 small rings with a 4th cut in half by the card's right edge.
- **Body:**
  - a 48 icon circle: grey Mist = neutral, accent-subtle = good news, pending = warning;
  - heading Inter Tight 600 28/34;
  - text;
  - details in a Mist "facts" table: label left tertiary, value right 600.

### 3. Document *(approved by Ulia 2026-11-17 — the signing emails G14 and G16)*
Someone asks you to do something with a document, or a document is ready.
- **Band:** accent, the logo, then a white sheet of paper rising from the band's bottom edge (340 wide, radius 10 at the top, soft shadow, grey text lines). The sheet shows the state:
  - **asking to sign:** a dashed accent "Sign here" box;
  - **signed:** a hand-drawn signature and a green "Signed" pill.
- **Body:**
  - heading Inter Tight 600 28/34, e.g. "Lena Novak asks you to sign";
  - one line of text;
  - a document card: PDF tile, name, then meta like "PDF · 4 pages · sign by 17 Dec";
  - the button;
  - small print.
- **Why it exists:** Ulia found that request emails looked exactly like the login emails, so you had to read them to understand what was being asked. The picture in the band tells you at once.

## Codes
- **Code email = the login code email (M16) exactly, with only the words changed.**
  - Moment band: "Here’s your / code to sign".
  - The code: one selectable string in an accent-subtle box. Radius 14, border 1 px `color-mix(accent 18%, white)`, padding 18 16. JetBrains Mono 600 36/44 (30 narrow), letter-spacing .16em.
  - Shown as 3 + 3 by a visual gap only (two spans, gap 18). The text itself is "482913" with no space.
  - The code is also in the subject. No "Copy" button.

## Words
- Subject = what it is: "{code} is your code to sign", "Lena Novak asks you to sign {document}", "Signed: {document}".
- Product copy is English, US spelling, sentence case, no full stop in headings.
- Articles never break from their word.
- The system never uses "HR" as a concept.

## Light company colour / light background
As the login emails:
- Gray 50 band with Gray 200 rings, the heading in Ink with its second line in the company colour.
- White canvas, and the card gets a 1 px Gray 200 border.
- On a light accent, text on the fill is Graphite #2A2A2E.

## Mistakes already made (don't repeat them)
- Rings drawn as separate boxes, cut too deep, wrong colours. Copy the M16 SVG.
- Heading spacing guessed, headings glued together. The values are 40 / 28 and 44/46.
- Logo typed as text, or a stock icon used instead of the company mark.
- Code box in the wrong font size or weight, with the wrong radius or border.
- Button 44 instead of 48, label 15 instead of 16.
- Every email looking the same because every one used the "moment" band. Pick the kind by what the email is for.
