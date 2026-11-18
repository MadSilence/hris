# Words — documents-signing

Every string in each frame, in reading order, exactly as drawn (English, sentence case). The app sidebar and the profile header are left out (they are the existing chrome). Names, dates, file names and counts are sample data, not copy. The spec quotes the copy that matters; where they differ, the spec wins.


## G01-HomeCard
_G01 · Where it waits: a “Do” card on Home (and the same in Inbox); Sign opens the signing screen_

- Home · Waiting on you · a “Do” card: a document to sign
- Waiting on you
- Inbox
- 1 of 3
- Employment contract 2026
- from Lena Novak · to sign
- Today
- Sign by Wed, 17 Dec
- 4 pages
- ← Skip
- Sign

## G02-SignScreen
_G02 · The signing screen: the document to read, who signs in what order, Sign and Decline_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Lena Novak asks you to sign
- Who signs
- MA
- You
- TP
- Tomas Petrauskas
- LN
- Lena Novak
- You sign by typing or drawing your name. First we’ll send a code to your email to make sure it’s you.
- Sign
- Decline

## G03-CodeName
_G03 · After the code: Your signature — Type (the name in a script style) or Draw_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Your signature
- Code confirmed
- Type
- Draw
- Your full name
- Meryem Alaoui
- This is how your signature will look
- Sign

## G03a-Code
_G03a · Sign → a code goes to the email; the 6th digit moves on by itself_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Check your email
- We sent a 6-digit code to
- meryem@acme.com
- . It works for 10 minutes.
- Send a new code

## G03b-DrawEmpty
_G03b · Draw: a pad to sign with the mouse or a trackpad; or move to the phone_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Your signature
- Code confirmed
- Type
- Draw
- Draw your signature here
- Draw on your phone
- Sign

## G03c-Drawn
_G03c · Drawn: Clear to start again; Sign_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Your signature
- Code confirmed
- Type
- Draw
- Clear
- Draw on your phone
- Sign

## G03d-PhoneQR
_G03d · Draw on your phone: a QR code with a one-time link (10 minutes); the screen waits for the phone_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Your signature
- Code confirmed
- Type
- Draw
- Scan the code with your phone
- Draw on your phone, and it shows up here.
- The code works once, for 10 minutes.
- Draw here instead

## G03e-FromPhone
_G03e · The phone sent it: the signature lands in the pad (a PNG with a clear background); Sign_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Your signature
- Code confirmed
- Type
- Draw
- From your phone
- Clear
- Sign

## G03f-PhonePad
_G03f · Phone: the page from the QR code — a big pad, Clear, Done_

- Acme
- Draw your signature
- For Employment contract 2026 · Meryem Alaoui
- Sign here with your finger
- Turn your phone sideways for more room.
- Clear
- Done
- Signing powered by

## G03g-PhoneDrawn
_G03g · Phone: drawn; Done sends it to the computer_

- Acme
- Draw your signature
- For Employment contract 2026 · Meryem Alaoui
- Turn your phone sideways for more room.
- Clear
- Done
- Signing powered by

## G03h-PhoneDone
_G03h · Phone: sent — go back to the computer_

- Acme
- Done
- Your signature is on your computer now. Go back there to sign.
- Signing powered by

## G03i-PhoneExpired
_G03i · Phone: the link is older than 10 minutes or already used_

- Acme
- This link has expired
- Make a new QR code on your computer and scan it again.
- Signing powered by

## G04-Signed
_G04 · Signed: what happens next, in one line_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- You signed
- Next to sign
- TP
- Tomas Petrauskas
- LN
- Lena Novak
- You’ll get the signed copy when everyone has signed.
- Your name, the time and how you confirmed it go on the last page of the signed copy.
- Back to Home

## G05-WrongCode
_G05 · A wrong or old code: the boxes turn red, one line says what to do (after 5 tries in an hour: “Too many attempts. Try again in an hour.”)_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Check your email
- We sent a 6-digit code to
- meryem@acme.com
- The code is wrong or has expired.
- Send a new code

## G06-Decline
_G06 · Decline: a comment is needed — the sender sees it in the Signing panel_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- Back
- Decline
- Lena Novak sees your comment and can send it again.
- Comment
- What’s wrong with it?

## G07-NotYourTurn
_G07 · Not your turn yet (Tomas opens it early): he can read it, there’s no Sign until it’s his turn_

- Employment contract 2026
- From Lena Novak · sign by 17 Dec
- Download
- Page 1 of 4
- It’s not your turn yet
- Meryem Alaoui signs first. We’ll email you when it’s your turn.
- Who signs
- MA
- Meryem Alaoui
- TP
- You
- LN
- Lena Novak

## G08-Closed
_G08 · Closed (cancelled, declined by someone else, or expired): nothing to sign; the document isn’t shown_

- Employment contract 2026
- From Lena Novak
- This signing request is closed
- It was cancelled, declined or it ran out of time. There’s nothing to sign now.
- Back to Home

## G09-GuestPage
_G09 · A guest’s page (no login): Acme’s colour and logo, the document, the same Sign and Decline. Other signers’ emails are never shown_

- Acme
- Signing as Daniel Kim
- Employment contract 2026
- Sign by 17 Dec
- Download
- Page 1 of 4
- Lena Novak from Acme asks you to sign
- Who signs
- MA
- Meryem Alaoui
- TP
- Tomas Petrauskas
- DK
- You
- You sign by typing or drawing your name. First we’ll send a code to daniel@kimlaw.com to make sure it’s you.
- Sign
- Decline
- Signing powered by

## G10-GuestLinkOld
_G10 · Guest, the link no longer works (a newer link was sent, or the request closed) — the same grey circle and words as the login’s dead-link page_

- Acme
- This link doesn’t work
- It may be out of date or already used. Open the newest email from Acme, or ask them for a new link.
- Signing powered by

## G11-GuestDone
_G11 · Guest, signed: what happens next; the signed copy comes by email_

- Acme
- You signed
- We’ll email you the signed copy when everyone has signed.
- Signing powered by

## G12-GuestCopy
_G12 · Guest, the signed copy page (from the email); after 30 days: “This link has expired. Ask Acme for the signed copy.”_

- Acme
- Everyone has signed
- Employment contract 2026 (signed).pdf
- Signed by everyone on 18 Nov
- Download the signed copy
- This link works until 18 Dec.
- Signing powered by

## G13-GuestPhone
_G13 · On a phone: the document full width, pages scroll; Sign and Decline stay at the bottom_

- Acme
- Employment contract 2026
- Lena Novak asks you to sign · by 17 Dec
- Page 1 of 4
- Decline
- Sign

## P08-PreboardingSign
_P08 · A new joiner signs on the same page as a guest (G09), opened from her preboarding page; the code goes to her personal email; done → back to her tasks. The preboarding page itself is designed later_

- Acme
- Meryem Alaoui
- Back to your tasks
- Employment contract 2026
- Sign by 17 Dec
- Download
- Page 1 of 4
- Lena Novak asks you to sign
- Who signs
- MA
- You
- TP
- Tomas Petrauskas
- LN
- Lena Novak
- You sign by typing or drawing your name. First we’ll send a code to meryem.alaoui@gmail.com to make sure it’s you.
- Sign
- Decline
- Signing powered by
