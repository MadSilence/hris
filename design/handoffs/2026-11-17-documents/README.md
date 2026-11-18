# Documents — handoff (2026-11-17)

From the board "noddo · Documents" (https://claude.ai/artifact/D79TsX2fnM1nbkV2niLHSo). Brief: Notion `DOCUMENTS_BRIEF` (16 Nov 2026).

**Unpack this archive into the repo root.** Everything goes under `design/`.

## Scope
Everything in the brief **except Templates**:
- the template list and editor;
- the placeholder vocabulary;
- Make from a template;
- sending a template to many people.

Those come with the Templates round. The Templates settings page is linked from these screens, but it isn't drawn here.

## What's inside
| Folder | Screens | Status |
|---|---|---|
| `design/screens/documents-tab` | V2, M3, T01–T26 · the profile's Documents tab, redrawn (folders, views, upload, trash, sort, hide columns, rename) | ready |
| `design/screens/documents-expiry` | X01–X11, F4 · expiry dates, Expiring view, category settings, Home widget | ready |
| `design/screens/documents-requests` | R01–R10 · asking for a document, the person's side, many people | ready |
| `design/screens/documents-send-for-signature` | S01–S13 · Send for signature, Signing panel, endings, Send again, history | ready |
| `design/screens/documents-signing` | G01–G13, G03a–G03i, P08 · the signer's side: company, guest, phone drawing, new joiner | ready |
| `design/screens/documents-signing-emails` | G14–G16 · invitation, code, signed copy | ready |
| `design/screens/automations-send-for-signature` | A01–A05 · the step, Wait until signed, test run, notification | ready |
| `design/screens/process-sign-task` | P01a, P01d · the Sign task in a process template | ready |
| `design/screens/documents-section` | D01–D06, D09–D12 · the new **Documents** sidebar item (managerial roles only) | ready |

Each folder has:
- `spec.md` — the source of truth;
- `words.md` — every string in the frames;
- `export/` — the frames as HTML; open them in a browser, the assets are next to them;
- `images/` — a PNG of every frame.

## Also in this folder
- `QUESTIONS-to-add.md` — Q-31 … Q-43. Append them to `design/QUESTIONS.md`. None blocks a screen; Q-36 (the drawn signature) and Q-41 (the company-wide lists) size the work.
- `PRODUCT-RULES.md` — the owner's product-wide UI rules, including those settled this round:
  - a list of records has no frame;
  - the selection bar sits above the list, tinted;
  - no "HR" in system text;
  - articles never break from their word;
  - a dropdown is its own search;
  - one "Signing powered by noddo" footer on company-branded pages;
  - phone pages from a QR code have a colour band and no rings.

  Carry them into `rules/` (then `node design/sync-rules.mjs`).
- `EMAIL-RULES.md` — every noddo email is built on the login email template. It describes three kinds, Moment, Notice and Document; Document is new this round, and is what G14 and G16 use.
- `decisions-for-petya.md` — what was decided and why, page by page.

## Decisions that change the brief
- **Reminders:** on day 3 of a signer's turn and one day before the due date, not on day 3 and day 7 (Q-33).
- **No "Signs as" when sending:** the label comes from the template (Q-31).
- **A drawn signature**, besides typing, with a phone hand-off by QR code (Q-36). The brief's § 10 said "not now"; the owner decided otherwise on 17 Nov.
- **The typed signature font is Marck Script** (Q-37, an exception to SPEC § 5).
- **Expiring documents** are a view of the new **Documents** sidebar item (D02), not only a widget. The item is only for people who manage others' documents.
- **No Russian** in the product (Q-42).
- **Processes:** only the Sign task's window is drawn. The task inside a running process waits for the processes design.

## Not in this round
- Templates (see above).
- Bulk send.
- The preboarding page itself: P08 shows only the signing it opens.
- The running process.
- Notification inbox entries (they exist; their texts are the brief's).
