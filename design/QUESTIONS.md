# Open questions — design and code

Only open questions. When one is answered, delete it and write the answer where it lives (the
screen's spec, the package, or the owner's rules). The format is in `HANDOFF.md` § "Questions".

## Q-9 — Who can manage the hub · company-hub, company-hub-manage · from designers · 2026-11-12
**Answered by the owner (CH2, CH4):** HR only in v1 — no team-lead mode yet (scoped authors come later); the right is granted in Manage hub → Settings, "Who can post and edit pages".

## Q-10 — What the hub's ask box answers from · company-hub, company-hub-page · from designers · 2026-11-12
**Answered by the owner:** as recommended — Pages and News from the hub's search over what the person may see; Ask noddo is Home's stub until the assistant exists.

## Q-11 — How "What changed" is made · company-hub-page, company-hub-manage · from designers · 2026-11-12
**Answered by the owner:** in v1 the editor writes the points in the publish dialog, with no "Drafted by AI" label; points drafted by the assistant come later, with the assistant.

## Q-12 — A widget required for everyone on Home · company-hub-manage, home, home-edit · from designers · 2026-11-12
**Answered by the owner:** deferred to the next Home round; `showOnHome` is stored on posts from the start and the toggle stays hidden.

## Q-13 — What "For me" means in News · company-hub · from designers · 2026-11-12
**Answered by the owner:** as recommended — For me is a narrowed audience that includes the reader; Everyone is everything they may see; the last choice is kept.

## Q-14 — The root's remembered company needs its public logo and name · sign-in-root · from designers · 2026-11-13
A2 shows the company the browser last logged in to as its logo, name and address. Today the browser remembers only the address. The company's own login page already shows its logo and name publicly.
Recommended: the root reads the same public data for the remembered address. Without it A2 shows the address only.
**Blocks:** nothing

## Q-15 — Terms as a line instead of a checkbox · sign-in-registration · from designers · 2026-11-13
B1 has "By continuing, you agree to the Terms and the Privacy policy." under the three ways in; Notion had a checkbox (which Google/Microsoft skipped anyway).
Recommended: the line. Legal should confirm an explicit checkbox isn't required for our EU markets.
**Blocks:** nothing

## Q-16 — "Remember this device" length · sign-in-second-step · from designers · 2026-11-13
D1 draws "Remember this device for 30 days". The length should come from the company's setting (MFA_DESIGN § 3.4); shown only when the company allows it and the person is not a System Owner.
Recommended: the setting's value in the label ("for {n} days").
**Blocks:** nothing

## Q-17 — Setting two-step up again from D3 · sign-in-second-step · from designers · 2026-11-13
With 1 or 0 backup codes left, D3 offers "Set up again" → D4 → D5 with a new set, right from the login.
Recommended: allow it (the person just proved a factor). If the backend can't, D3 keeps "Continue" and the warning only.
**Blocks:** nothing

## Q-18 — "Full demo" leaves the setup wizard · first-run-setup · from designers · 2026-11-13
S2 offers only Example company (with a size slider 8 · 25 · 60 · 150) or Start empty; the code has three presets.
Recommended: drop the third from the wizard. Does the full demo stay reachable anywhere (e.g. for sales demos)?
**Blocks:** nothing

## Q-19 — A personal language in the welcome · first-run-welcome · from designers · 2026-11-13
W4 asks for the time zone and the language, pre-filled with the company's. Today the language is the company's ("Everybody in the company sees noddo in it").
Recommended: a personal language overrides the company's for screens and emails; exports stay in the company's language. If not built, W4 shows the time zone only.
**Blocks:** nothing

## Q-20 — The welcome opened on a phone · first-run-welcome, first-run-photo · from designers · 2026-11-13
Notion § 14.10 covers the photo from a phone while the welcome is on a computer, not the welcome itself on a phone. Drawn: one "Upload a photo" button using the phone's own picker.
Recommended: as drawn.
**Blocks:** nothing

## Q-21 — Email senders · sign-in-emails · from designers · 2026-11-13
Drawn: noddo's own emails (M1, M6, M18) from "noddo <no-reply@noddo.so>"; company emails from "Acme <no-reply@acme.noddo.so>" with the company's logo as the avatar.
Recommended: as drawn if deliverability allows per-company senders; otherwise "Acme via noddo <no-reply@noddo.so>".
**Blocks:** nothing

## Q-25 — Logo file formats and size · sign-in-appearance · from designers · 2026-11-13
Drawn: "PNG, JPEG or SVG, at least 256 × 256 px", refused above 5 MB.
Recommended: the limits the code already uses for the logo; tell us and we fix the words.
**The code's limits (2026-11-13):** PNG, JPEG or WebP, up to 5 MB, checked by the file's bytes. No SVG: the logo is served without a session, and an SVG can carry script. No minimum size is enforced. The page says "PNG, JPEG or WebP" until you fix `words.md`.
**Blocks:** nothing

## Q-28 — The ring row in emails per company · sign-in-emails · from designers · 2026-11-13
The band's rings are a static image; with "Your own" and with the Light background they have to be generated per company (or drawn as a table of circles).
Recommended: generate the PNG when the colour or the background is saved.
**Blocks:** nothing

## Documents round (2026-11-17) — Q-31 … Q-43, answered by the owner on 2026-11-18

The owner took the round as drawn: **everything the design asks of the code is built as designed**. The entries keep
the designers' question in one line and the answer; the work is `(claude)/development_plan/DOCUMENTS_PLAN.md` § 7.

## Q-31 — A signer without a label · documents-send-for-signature · from designers · 2026-11-17
**Answered:** yes, the label is optional. The API already takes a signer with none; the certificate then prints the
name and email only.

## Q-32 — Telling signers that a signing was cancelled · documents-send-for-signature · from designers · 2026-11-17
**Answered:** as recommended. Whoever was already asked to sign, in the company or a guest, gets "Lena Novak cancelled
the signing of …", with the comment if there is one. Signers still waiting for their turn are not told.

## Q-33 — Automatic reminders: day 3 and the day before the due date · documents-send-for-signature · from designers · 2026-11-17
**Answered:** as drawn. It replaces the day-3-and-day-7 rule built on 2026-11-16 (`DECISIONS.md` D6). No setting.

## Q-34 — Signing history needs an event list · documents-send-for-signature · from designers · 2026-11-17
**Answered:** the events exist in the journal, one per sent, signed, declined, cancelled, expired and completed,
for every signing. A per-document list across all its signings is added for S13.

## Q-35 — Reading before your turn · documents-signing · from designers · 2026-11-17
**Answered:** as recommended, and already so: a signer in the company may read the document from the moment it is
sent. A guest's link is only issued at their turn.

## Q-36 — A drawn signature and the phone hand-off · documents-signing · from designers · 2026-11-17
**Answered:** yes, both the pad on the computer and the phone through the QR code, for people in the company, guests
and new joiners. The certificate records "typed" or "drawn".

## Q-37 — The typed signature's font in the PDF · documents-signing · from designers · 2026-11-17
**Answered:** yes, Marck Script is embedded in the PDF engine for the typed name. The certificate page stays in the
engine's text font.

## Q-38 — Who sends a document an automation sends · automations-send-for-signature · from designers · 2026-11-17
**Answered:** as recommended, and as built: the automation's owner is the sender ("Sent by …", "… asks you to sign");
the email's sender line is the company.

## Q-39 — "Wait until signed" ends on declined or cancelled · automations-send-for-signature · from designers · 2026-11-17
**Answered:** yes, as drawn. The engine did not do it yet: a declined, cancelled or expired signing left its task open
and the wait sat out its days. It is fixed in this round.

## Q-40 — Test run: "Send the document to me" · automations-send-for-signature · from designers · 2026-11-17
**Answered:** yes. The test run makes the PDF, marked [Test], and emails it to the tester only. Nothing is filed in
anyone's Documents.

## Q-41 — Company-wide documents lists and the Documents item · documents-section · from designers · 2026-11-17
**Answered:** yes. The API gains the three lists it lacks (all documents, open signings, requests; expiring exists).
The item shows for whoever may see documents beyond their own profile: a scope on *People documents — view* wider
than oneself.

## Q-42 — Languages: no Russian · system · from designers · 2026-11-17
**Answered: Russian stays.** The product keeps English and Russian, as built and walked
(`(claude)/DECISIONS.md` § "Internationalisation"); Ukrainian or Bulgarian may join later. Every new string of this
round gets its Russian. The spec line "there is no Russian in the product" (`documents-signing`, Changes to SPEC) is
superseded by this answer.

## Q-43 — A "document" field in notifications · automations-send-for-signature · from designers · 2026-11-17
**Answered:** yes. `TokenTextField` offers **document** after a Send for signature step: the signed document, as a
link.

## Q-44 — The Templates round: templates are written in noddo, not uploaded · documents templates · from code · 2026-11-18
The owner decided on 2026-11-18 that a document template is **a document written in noddo's own editor** (the
company hub's TipTap editor), not an uploaded Word file. Its text carries **field chips** from the attribute
vocabulary and **signature blocks** where each signer signs. It has versions, and every generated document remembers
the version it was made from. The PDF is made from it in the company's style. A DOCX is only imported (converted
into the editor) or exported. The AI drafts a template, proposes edits as changes to blocks and finds what is missing,
and a person publishes.
The brief for the Templates round follows this; the drawn screens already fit it ("who signs" and "time to sign" come
from the template).
**Blocks:** the Templates round's drawing only
