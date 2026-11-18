# Questions to add to design/QUESTIONS.md (Documents round, 2026-11-17)

Append these entries to `design/QUESTIONS.md` as they are. Q-30 is the last number in the file today.

## Q-31 — A signer without a label · documents-send-for-signature · from designers · 2026-11-17
The owner decided that the signer's label ("Employee", "Employer", …) is **not** picked when sending: it comes from the contract template, where the signature mark is. A plain PDF sent without a template has no label, and the certificate prints the signer's name and email only. Does the API accept a signer with no label? Recommended: yes, the label is optional.
**Blocks:** nothing

## Q-32 — Telling signers that a signing was cancelled · documents-send-for-signature · from designers · 2026-11-17
The brief has no notification to signers when a signing is cancelled. Should the signers in the company and the guests be told, with the comment? Recommended: yes for those who were already asked to sign. They get one line: "Lena Novak cancelled the signing of Employment contract 2026", plus the comment if there is one. Today the comment only stays in the document's Signing panel.
**Blocks:** nothing

## Q-33 — Automatic reminders: day 3 and the day before the due date · documents-send-for-signature · from designers · 2026-11-17
CHANGE from the owner. Instead of day 3 and day 7 of a signer's turn, remind on **day 3 of their turn** and **one day before the due date**. There is no setting for it anywhere. The Signing panel says "Reminders go out on day 3 and the day before it’s due". "Send a reminder now" reminds whoever's turn it is; a guest gets a fresh link.
**Blocks:** nothing

## Q-34 — Signing history needs an event list · documents-send-for-signature · from designers · 2026-11-17
S13 shows a log per document, oldest first: sent, signed, declined + comment, sent again, cancelled + comment, expired, completed, each with who and when. "Send again" makes a new signing on the same document; the earlier one stays in this history. Is there an event list per document, or does it need adding?
**Blocks:** nothing

## Q-35 — Reading before your turn · documents-signing · from designers · 2026-11-17
G07 shows a later signer opening the document early. They can read it, but there's no Sign until it's their turn. The brief only guarantees reading while it is their turn. Allow reading earlier? Recommended: yes for signers in the company. A guest's link only starts working at their turn.
**Blocks:** nothing

## Q-36 — A drawn signature and the phone hand-off · documents-signing · from designers · 2026-11-17
NEW, from the owner. Besides typing the name, a signer can **draw** their signature:
- **On the computer:** a pad for the mouse or trackpad (estimate given to the owner: 2–3 days).
- **On a phone (estimate given: about a week):**
  - a QR code opens a one-time link, valid 10 minutes, for this signer only;
  - a mobile page with a pad; Done uploads a PNG with a transparent background;
  - the computer picks it up by itself — the same mechanics as the profile-photo QR upload (first-run-photo).

The PNG is drawn at the signature mark and on the certificate, which records "drawn" vs "typed". The same applies on the guest page.
**Blocks:** nothing (it sizes the work)

## Q-37 — The typed signature's font in the PDF · documents-signing · from designers · 2026-11-17
The owner chose **Marck Script** (Google Fonts, OFL, Latin + Cyrillic) for the typed name, on screen and in the signed PDF. Please embed it in the PDF engine. It is an exception to SPEC § 5: an e-signature, not design.
**Blocks:** nothing

## Q-38 — Who sends a document an automation sends · automations-send-for-signature · from designers · 2026-11-17
In processes, the sender is whoever started the process (the brief). Who is it for an automation's "Send for signature": the automation's owner, or the company? This decides "Sent by …" in the Signing panel and the email's "Lena Novak asks you to sign". Recommended: the automation's owner, with the email's sender line as the company.
**Blocks:** nothing

## Q-39 — "Wait until signed" ends on declined or cancelled · automations-send-for-signature · from designers · 2026-11-17
A03 says "Declined or cancelled counts as not signed: the run doesn’t wait for the date." So the wait ends at once and the "If it’s not signed by then" branch runs. Is that how the engine behaves?
**Blocks:** nothing

## Q-40 — Test run: "Send the document to me" · automations-send-for-signature · from designers · 2026-11-17
A04 lets the tester get the generated PDF, marked [Test], sent only to them (product rule for test data). Can the engine make the document in a test run without filing it in the person's Documents?
**Blocks:** nothing

## Q-41 — Company-wide documents lists and the Documents item · documents-section · from designers · 2026-11-17
The new sidebar item **Documents** shows four company-wide lists over everything the reader may see:
- every document, with a Person and a Category filter;
- expiring;
- open signings, with whose turn it is;
- open requests (uploaded ones kept 30 days).

It appears **only** for people who may see or edit other people's documents. Employees use their profile. Does the API give these lists, and which right shows the item?
**Blocks:** nothing in the design

## Q-42 — Languages: no Russian · system · from designers · 2026-11-17
The brief says the product's texts exist in English and Russian. The owner says there will be no Russian in the product; Ukrainian or Bulgarian may come later. Please align the brief and the translations.
**Blocks:** nothing

## Q-43 — A "document" field in notifications · automations-send-for-signature · from designers · 2026-11-17
A05 inserts **document** (the signed document, as a link) into a notification's message after a Send for signature step. Can `TokenTextField` offer fields from earlier steps?
**Blocks:** nothing
