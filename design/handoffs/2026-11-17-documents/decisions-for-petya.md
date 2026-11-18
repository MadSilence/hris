# Documents — what was decided, and why (owner: Ulia, 16–17 Nov 2026)

## 1–2 · The Documents tab
- Fix and complete what exists rather than rethink it, with Google Drive logic.
- Folders are Drive-style tiles above the files, with an icon and a colour. They are never rows in the list.
- Views: Not in a folder (the default), All documents, Starred, and Expiring.
- Trash is a labelled button and opens like a folder. There is no Add inside the trash.
- The list has no frame. Every column sorts. Columns can be hidden with an icon at the end of the header row; Name always stays.
- Rename: a window with the name selected and the extension outside the field. In the preview, one click on the name edits it.
- The selection bar sits above the list it acts on, white and tinted with the company colour. This is an exception to DESIGN_SYSTEM § 7.

## 3 · Expiry
- The Expires column shows just the date:
  - amber with an hourglass when it's soon;
  - red with a cross when it's past;
  - grey when valid;
  - "—" when there is no date.
- All documents is grouped under folder headings.
- The company-wide list is the Expiring view of the new Documents sidebar item (page 8). It's not a People column or a report field.

## 4 · Requests
- One **Request** button next to Add, plus "Request the new one" on an expiring file.
- The person's request sits on top of their tab, and as a Do card on Home.
- An upload made for a request asks no folder and no category; they come from the request.

## 5 · Sending for signature
- **Window:** the button says "Send". Signers are in step boxes: "Add co-signer" inside a box signs at the same time; "Add next signer" adds a new step. The word "order" is never shown.
- **Signs as:** no "Signs as" field; the label comes from the template.
- **The signed file:** "(signed)" in its name, plus a green signature mark with a tooltip saying when and by whom.
- **Menus:** no Rename and no Send while a file is out for signature. A non-PDF has no Send item at all (options that don't apply are left out of menus, not disabled).
- **Signing panel, in the preview:**
  - "Sent by … on …";
  - the step chain;
  - Due + days left + a time bar;
  - "Reminders go out on day 3 and the day before it’s due";
  - Send a reminder now;
  - Cancel signing in the bottom bar, left of Download.
- **Endings:** Signed; Declined (with the comment); Expired (red); Cancelled (who + comment).
- **Send again** opens the usual window, filled in as last time, on the same file. A corrected document is uploaded and sent separately; there is no "upload a corrected file" inside the flow.
- **Signing history:** a log of events, oldest first.

## 6 · The signer's side
- A full signing screen: the PDF viewer on the left; on the right, who asks, the step chain, and Sign / Decline.
- **Sign:** a code to the email first, then Your signature — **Type | Draw**.
  - Draw: on the pad, or on the phone via a QR code (10 minutes, one-time). The mechanics are the same as the profile-photo upload.
- **Decline:** a comment is needed.
- **Not your turn:** the document is readable, with no Sign button.
- **Closed:** the document isn't shown.
- **Guests:** the company's colour and logo, "Signing powered by noddo", and no other signers' emails.
- **Phone pages:** the company colour band, no rings, the same footer.
- **Emails:**
  - the code email is the login code email;
  - the invitation and the signed copy use the new Document kind (a sheet of paper in the band) so they read differently from login emails.
- **Typed signature font:** Marck Script.

## 7 · Processes and automations
- **Automations:**
  - Send for signature is a working step. Its settings: the template; who signs and the time to sign are read-only from the template; Who sees what shows the signer's request.
  - Wait until has one field, "Wait for", which lists only what is in this automation.
  - The test run says "Would send for signature" and offers "Send the document to me".
- **Processes:** the Add task window, kind Sign, asks only Document and When. The document field is its own search. Onboarding and processes aren't designed yet, so nothing else of them is in this round.
- **New joiner:** signs on the same page as a guest. The preboarding page itself is designed later.

## 8 · Documents in the sidebar
- A new sidebar item, only for managerial roles. Employees use their profile.
- **Views:** All documents · Expiring · Out for signature · Requests.
- **Filters:** only Person and Category. Several picked values keep the pill on one line ("Identity +3").
