# Brief: Documents — expiry, requests, templates and e-signature

**From the owner's side, 2026-11-16. Input for drawing, not a spec.** The backend behind every screen here is built
and was walked through the API on 2026-11-16; **nothing new is drawn yet**. Each screen is still drawn into
`screens/<name>/spec.md` by `../HANDOFF.md`, and is built only when its spec says `status: ready`.

How to read it — as `SCREENS_BRIEF.md`:

- **What exists** — built; the screen can show it today.
- **Decided** — the owner's answers. Draw to them.
- **States to draw** — every state the code can produce.
- **> Note for the designer** — a call left to you. Answer it in the screen's spec.

Every word quoted below is the product's current English text — an error, a notification, an email. Use it, or propose
better words in the spec; the code translates them (English and Russian today).

---

## 0 · The whole picture in one page

Documents used to be file storage: folders on a person's profile, categories, "HR only" or "visible to the person",
a trash. They are now an HR tool:

| Capability | In one line |
|---|---|
| **Expiry** | A document can have a last valid day; a category can require one and remind before it |
| **Expiring documents** | A company list of what is about to expire or has expired, and a Home widget |
| **Requests** | Ask one person, a selection or a whole filter for a document — "upload your new passport by Friday" |
| **Templates** | A Word file with placeholders, filled from a person's profile, made into a PDF in their documents |
| **Signing** | Send a PDF — or a template made for a person — for signature, to people in the company and guests outside it |
| **Signing in processes** | A preboarding, onboarding or offboarding task "Sign the NDA" that sends itself and closes when signed |
| **Signing in automations** | A step "Send for signature", which the next step can wait on |
| **Bulk sending** | One template to many people at once, each their own document |

What a signature is: **our own simple electronic signature** (eIDAS SES). The signer reads the document, gets a
six-digit code to their email, types it and their name. The finished PDF carries the signatures where the template
marked them, a **certificate of completion** page, and a digital seal. A **qualified** signature (QES) through an outside
provider comes later — do not draw it, but leave room for "how is this signed" to have a second answer one day.

---

## 1 · The Documents tab on a profile

### What exists (unchanged)

Folders and files; upload with a **category** and **visibility** (*HR only* / *Employee*); row menu **Download, Rename,
Move, Change visibility, — Delete**; bulk selection (zip, move, delete, restore, star); the trash with restore and
erase; a star. Empty states are drawn (`empty-state-illustrations` 3 and 4).

### What exists (new)

Each document now also has:

- **Description** — free text.
- **Expiry date** — the last day it is valid, or none. The code works out a state: **Valid**, **Expiring** (inside its
  category's reminder window, 30 days when the category names none), **Expired** (the day after its date). No date → no
  state.
- **Where it came from** — made from a template (which one), or the signed result of a signing.
- **Signed** — a signed document is **final**: it cannot be renamed ("A signed document cannot be changed."), its file is
  never replaced. It can still be moved, starred, opened to the person, deleted.
- **Out for signature** — while a document is being signed, it points at its signing (§ 6).
- **Scan status** — always "not scanned" until a virus scanner is connected (with the production hosting). **Do not
  draw it now**; leave a place a small warning could go later ("This file did not pass the virus check").

New actions:

- **Edit details** — description and expiry date. The person may edit details only on files they uploaded themselves;
  HR on anyone's they look after.
- **Make from a template** (§ 4) and **Send for signature** (§ 5) — for whoever may edit this person's documents.
- **Request a document** (§ 3).

Upload gains two fields: **expiry date** (required when the category requires it — "Documents of this category need an
expiry date.") and **description**. The **category's default visibility** pre-selects the visibility.

`.xlsm` (Excel with macros) is no longer accepted: "Uploaded file type is not allowed" (existing text).

### States to draw

- A row with each expiry state: valid (quiet), expiring ("Expires in 9 days" / "Expires 26 Nov"), expired, no date.
- A **signed** document (and the absence of Rename in its menu).
- A document **out for signature** — with how far it got (1 of 2 signed).
- A **generated** document that is not sent yet.
- The upload dialog with a category that requires an expiry, the date empty and the error under it.
- The person looking at their own tab: they never see HR-only files; their own signed contract **is** visible to them
  (decided — a signer is owed what they signed).

> **Note for the designer** — expiry as a column, a chip on the name, or both. It must be readable at a glance in a
> list of 40 files, and filterable ("show expired").

---

## 2 · Expiry: category settings, reminders, the company list

### What exists

**Settings → People → Documents** (the categories page, exists) gains three settings per category:

- **Requires an expiry date** — on / off.
- **Remind … days before it expires** — 1 to 365, or no reminder. ("Choose between 1 and 365 days.")
- **Visible to the person by default** — *HR only* / *Employee* / *the uploader decides* (the old rule: HR's uploads HR
  only, the person's own visible).

**Reminders.** Once a day, for a category with a reminder: when a document enters its window, and again the day after it
expires. Told: the person (only if the document is visible to them) and everybody who may edit their documents. Each
notice once per date; a new date re-arms it; a document uploaded already expired is history and announces nothing.

- Notification **"Document expires soon"** — to the person: "Your passport.pdf is valid until 26 Nov 2026. Renew it or
  upload the new one."; to HR: "Meryem Alaoui: passport.pdf is valid until …".
- Notification **"Document expired"** — "… has expired on 15 Nov 2026. Upload the new one."
- Both are also emailed at once.

**The company list of expiring documents** — every expiring and expired document of the people the reader may see,
soonest first, with the person's name. A person with no HR rights sees only their own visible documents there.

### Decided

- **Expiring documents are a list and a Home widget**, not a column or filter on the People table and not a report field
  — not now (the owner, 2026-11-16).
- Reminders go to the person and to HR; never an HR-only document to the person.

### Screens and states to draw

1. **Category editor** with the three settings; the reminder field disabled while "no reminder".
2. **Expiring documents** — a page (or a section of Documents; your call) with *Expiring* and *Expired*, the person, the
   file, the date, a link to the person's documents and **Request the new one** (§ 3) on each row. States: none (a
   good state, not an error), loading, error, no permission.
3. **Home widget "Expiring documents"** — the next few, count of expired, link to the list. Follow `home-widgets`.

> **Note for the designer** — where the list lives. There is no Documents item in the main navigation (see
> `automations-list` spec); Settings is wrong for a working list. Options: a tab on People, a page under the profile
> menu for HR, or only the widget plus a full-page view. Ask in `../QUESTIONS.md` if it changes navigation.

---

## 3 · Requests — "please upload this"

### What exists

HR asks for a document **outside any process**: one person from their profile, several selected on the People table,
or everyone matching the table's filter (up to 1,000).

- Each person gets a **task** "Upload: Passport" (the category's name, or a title HR types), with an optional **note**
  and **due date**, and a notification **"Document requested"**: "Hana HR asks you to upload Passport by 23 Nov."
  (emailed at once).
- With a category, the task **closes by itself** when the person uploads a file of that category — **filed after the
  request**: an old passport already on file does not answer a request for the new one.
- Without a category, the person closes it by uploading through the task.
- Who cannot be asked is **skipped and named**, the rest go: a draft with no way to sign in ("DRAFT"), a person outside
  the asker's rights ("NO_ACCESS").
- The task appears where tasks appear today (the person's task list, Home "Waiting on you").

### Screens and states to draw

1. **Request dialog** — category (optional), title, note, due date; who (one person, or "12 people", or "everyone in
   this filter — 37 people").
2. **Result** — "Asked 35 people. 2 were not asked:" with names and why.
3. **The task, from the person's side** — the request's note and date, an upload button straight in the task.

---

## 4 · Templates

> **Superseded on 2026-11-18.** Templates are no longer uploaded Word files: a template is written in noddo's own
> editor, with field chips and signature blocks, versions, DOCX import and export (`QUESTIONS.md` Q-44). The
> Templates round gets a brief of its own. What follows is how the first build worked, kept for the record.

### What exists

**Settings → People → Document templates** (a new page, behind the new right *Document templates — manage*):

- **Upload a Word file** (`.docx` only, up to 20 MB) with a name, an optional description and a **category** its
  documents are filed under.
- The file is read on upload; every placeholder must be one the product knows, or the upload is refused **naming the
  word**: "The template uses {{salary}}, which is not a field noddo knows."
- **Replace the file**, **download** it, **delete** the template, turn it **inactive**.
- **Signers** — who signs a document made from it (§ 5), set on the template.
- **"Needs a qualified signature or paper"** — for a German fixed-term contract or any termination letter: such a
  document can be generated, **never sent for signature here** ("This document needs a qualified signature or a
  signature on paper. Sign it outside noddo and upload it.").
- **Days to sign** — how long a signing of it stays open (30 by default, 1–365).
- **Problems** — placeholders that cannot be filled any more because an attribute was renamed or deleted since the
  upload. Shown on the template before somebody tries to use it.

**The placeholder vocabulary** — written `{{name}}` in Word; a template author needs this list on screen to copy from:

| Placeholder | What it prints |
|---|---|
| `{{firstName}}`, `{{lastName}}`, `{{fullName}}` | The person's name |
| `{{email}}` | Their email |
| `{{startDate}}`, `{{lastWorkingDay}}`, `{{probationEnd}}`, `{{dateOfBirth}}` | Dates, written out in the company's language ("9 June 2026") |
| `{{employmentType}}` | Full time, part time … |
| `{{jobTitle}}`, `{{department}}`, `{{office}}`, `{{legalEntity}}` | Their position and placement |
| `{{managerName}}` | Their line manager |
| `{{companyName}}` | The company |
| `{{today}}` | The day it is made |
| `{{field:Any field name}}` | A custom field by its name: text, number, date, email, phone, link, a choice from a list, country, language, currency, time zone |
| `{{sign:person}}`, `{{sign:manager}}`, `{{sign:any-key}}` | **Where somebody signs** — invisible in the document; the signature is drawn there |

**Rules a template author must be told** (on the page, short):

- A placeholder may be typed in any formatting; Word splitting it is fine.
- **Leave an empty line after each `{{sign:…}}`** — the signature is drawn on that line and the one below it.
- One `{{sign:…}}` key per signer; a signer with no mark in the file signs on the certificate page only.

**Making a document** — on a person's profile, **Make from a template** → pick → a PDF appears in their Documents, in
the template's category, *HR only* unless the category opens it to the person.

- The values are read **as the person making it may see them**: a field they may not see refuses the whole document —
  "The template uses {{field:Salary}}, which you cannot see for this person." An **empty** field refuses it too — "These
  are empty for this person: startDate, Based in. Fill them in first." (A contract with a hole is worse than none.)
- The PDF engine can be briefly unavailable: "Could not make the PDF right now. Try again in a minute."

### Screens and states to draw

1. **Templates list** — name, category, signers in short ("Person, then Director"), problems flag, inactive. Empty
   state with what a template is and a link to the vocabulary.
2. **Template page** — file (download / replace), the placeholders found in it, the signers editor (§ 5), "needs QES or
   paper", days to sign, active, delete. States: problems listed; a signer mark in the file with no signer set ("Check
   the signers: …"); upload refused naming the unknown word; not a `.docx`.
3. **The vocabulary** — a panel or a drawer to copy placeholders from, the company's own custom fields included.
4. **Make from a template** (profile) — pick; success (the new PDF highlighted in the list); refused for a hidden field,
   for empty fields (with a way to the profile to fill them), engine unavailable.

---

## 5 · Sending for signature

### What exists

**From a document** (a PDF in a person's Documents) or **from a template** for a person (made and sent in one go).

**Signers** — up to 10, each with:

- **who**: *the person* the document is about, *their manager* at the time of sending, *a named person* in the company,
  or **a guest** outside it — a name and an email, typed when sending;
- **order** 1–20: lower signs first, **the same number signs in any order**;
- a **label** the certificate prints ("Employee", "Employer").

On a template the signers are set once (§ 4). A template's guest is named at sending. When sending a plain document,
the sender lists the signers.

Refusals at sending:

- "This document is already out for signature."
- "Only a PDF can be sent for signature."
- "Every signer needs a person or a name and an email." (a template's guest not named; a person without a manager)
- "This document needs a qualified signature or a signature on paper. …"
- "A signed document cannot be changed."

**Many people at once** — one template to a selection or the People table's filter (up to 500), each person their own
signing. Who could not be sent to is listed with the reason (an empty field, no manager, …). A template with a guest
cannot go to many people (the guest would be the same for all) — say so before sending.

**After sending**, the sender — and whoever may edit the person's documents — sees on the document:

- each signer, their status — *waiting for an earlier signer*, *to sign*, *signed (when)*, *declined (why)*;
- **Remind** — whoever's turn it is gets reminded now (a guest gets a fresh link; the old one stops working);
- **Cancel** — with an optional reason;
- the deadline.

Statuses of a signing: **Sent**, **Completed**, **Declined**, **Cancelled**, **Expired**.

Automatic: reminders on the 3rd and 7th day of each signer's turn; expiry after the template's days ("Not signed in
time" to the sender).

Notifications: **"Signature requested"** (to a signer in the company whose turn it is — also on a reminder),
**"Signed by everyone"** (to the sender, and to the person when the signed copy is visible to them), **"Signature
declined"** with the reason (to the sender), **"Not signed in time"** (to the sender). All emailed.

### Decided

- Sending is its own right, beside editing documents — not the right to erase.
- A person cannot send their own documents for signature; HR can.
- The signed copy is visible to the person when they signed it, even if the draft was HR-only.

### Screens and states to draw

1. **Send for signature** — from a document and from a template: title, signers (the template's, guests to name; or a
   list to build), order, deadline shown. All the refusals above.
2. **Send to many** — template, the people (count), the result with the skipped and why.
3. **Signing status** on a document — a panel or a side sheet: signers in order, timeline, Remind, Cancel; completed
   with a link to the signed copy; declined with the reason; expired; cancelled.

> **Note for the designer** — signers with the same order number sign "in any order". Draw it so a person understands
> it without the word "order": steps, groups, or a simple numbered list with "together".

---

## 6 · Signing — the signer's side

### What exists

**A signer in the company** (signed in):

1. sees **what waits for their signature** (a list of their open signings; also a notification);
2. opens the PDF — **always readable while it is their turn**, even if the document is HR-only;
3. presses **Sign** → a six-digit code goes to their email ("… is your code to sign"; valid 10 minutes) → types the
   code and **their name as their signature** → signed;
4. or **Decline** — a reason is required.

**A guest** gets an email "**{Company} asks you to sign {title}**" with **Open and sign**. The link opens a **public page**
(no sign-in, the company's branding as on its login page) for that one signing and that guest only: the document, Sign
with the code to their email, Decline with a reason. They do not see the other signers' emails. When everybody has
signed, the guest gets an email "**Signed: {title}**" with **Download the signed copy** — a link valid 30 days.

**A new joiner** (preboarding, no account yet) signs on the **preboarding page**, inside their "Sign the NDA" task, the
same way: the document, a code to their personal email, their name.

Refusals and states the signer can meet:

- "It is not your turn to sign yet." — an earlier signer has not signed;
- "This signing request is already closed." / "This signing request is not there any more." — cancelled, declined,
  expired, or a link replaced by a reminder;
- "The code is wrong or has expired. Ask for a new one." — five codes an hour, then "too many attempts";
- signing **while impersonating** somebody is refused — a signature is the person's own act.

**The finished document** — a new PDF "… (signed).pdf" in the person's Documents:

- each typed name drawn **at its `{{sign:…}}` mark**, in a script style, with "Signed electronically · 2026-11-16 14:02
  UTC" under it;
- a last page **Certificate of completion**: the document, the company, sent when and by whom, completed when; per
  signer — name, email, how they confirmed ("a one-time code sent to …, signed in" / "a guest, by a link sent to them"),
  when, IP address, browser, and the document's fingerprint (SHA-256) as sent and as seen;
- sealed: a PDF reader shows one signature by noddo.

### Screens and states to draw

1. **To sign** — the signer's list (where it lives is yours: Home's "Waiting on you", the Tasks tab, the inbox's Needs
   Action — today a request notification opens the person's documents as a stand-in).
2. **The signing screen** — a PDF viewer, what is asked ("Sign as Employee"), Sign → code → name → done; Decline →
   reason. Every refusal above; signed (with what happens next: "waiting for the Director"); the signed copy once all
   have signed.
3. **The guest page** — the same, public, branded; plus: link expired/replaced, closed, declined, done; the **signed
   copy** page (download; expired after 30 days).
4. **On the preboarding page** — the SIGN task's own small version of the same.
5. **The emails** — "… is your code to sign", "{Company} asks you to sign {title}", "Signed: {title}" — built on the
   sign-in emails' layout (`sign-in-emails`); review the words.

> **Note for the designer** — the PDF viewer. The product has none; a signer must be able to read a 10-page contract on
> a phone before signing. Propose one component for this and for previewing documents in the tab.

> **Note for the designer** — the typed name is the signature (no drawing pad in v1). If you want a drawn signature,
> ask: the code can add it, the certificate would record it.

---

## 7 · Signing inside processes and automations

### What exists

- **Process templates** (preboarding, onboarding, offboarding) gain a task kind **Sign** — "the person signs a document
  made from template X". When the task opens, the document is made and sent automatically **by whoever started the
  process**; the task closes by itself when everybody has signed. If sending fails (an empty field, …), the task stays
  open and shows why — the person running the process fixes it.
- **Automations** gain a working step **Send for signature** — pick a template; the person and the template's signers
  sign. A **Wait until** step can wait for it: "until the document is signed". The test run says "Would send for
  signature".

### Screens and states to draw

1. **Task editor in a process template** — kind *Sign*, the template picker. Only the person can be its assignee.
2. **A Sign task in a running process** — not sent yet, out for signature (with the signing status), signed, sending
   failed with the reason and a way to retry.
3. **Automation step "Send for signature"** — the step card and its settings (template picker); "Wait until signed" as
   an option of Wait. It was drawn as a "not connected" step before: it is connected now.

---

## 8 · Notifications and emails — the full list

| Notification | To | Emailed |
|---|---|---|
| Document added (exists) | the person, when somebody else uploads a file **visible to them** | in the digest |
| Document expires soon | the person (visible files) and their HR | at once |
| Document expired | the same | at once |
| Document requested | the person asked | at once |
| Signature requested | a signer in the company, when it is their turn, and on a reminder | at once |
| Signed by everyone | the sender; the person when the copy is theirs to read | in the digest |
| Signature declined | the sender, with the reason | at once |
| Not signed in time | the sender | at once |

Emails that are not notifications: the code to sign, a guest's invitation, a guest's signed copy.

The inbox texts and the emails exist in English and Russian; the inbox entries currently open the person's documents.

---

## 9 · Who may do what

| Who | May |
|---|---|
| A person | See their visible documents, their own expiring ones; upload their own; edit details of files they uploaded; sign what is sent to them; answer requests |
| Whoever may **edit** a person's documents (HR, a manager with that right over their team) | Upload, edit details, request, make from a template, send for signature, remind, cancel; see signing status |
| *Document templates — manage* (new, given to HR Admin by default) | Upload, configure and delete templates |
| *Document categories — manage* (exists) | Category settings, expiry and reminders included |
| A guest | One signing, through its link only |

Somebody who handles documents **company-wide** may also make and send documents on their own record.

---

## 10 · Not now — do not draw

- A qualified signature (QES) or any outside signing provider — later, behind the same screens.
- A column or filter "expiring documents" on the People table, a report field — not now.
- Drawing a signature by hand; signing on paper and scanning.
- An editor for templates in the browser — the template is a Word file.
- Document versions; OCR; full-text search of files; a company-wide document library (policies live in the hub).
- Electronic HR document workflow under Russian law (КЭДО) — out of scope.
- The virus scanner's warnings — with the production hosting.

---

## 11 · Questions to send back

Put them in `../QUESTIONS.md` as usual. The owner expects at least:

- where *To sign* and *Expiring documents* live in the navigation;
- the PDF viewer component;
- how an expiry state reads in a long list;
- how "the same order signs together" is shown.
