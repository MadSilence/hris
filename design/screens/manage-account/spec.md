status: built

# Manage account (MA) — person profile › ⋯ › Manage account

Approved by Ulia 19 Nov 2026 (variant C on the "decisions sandbox" board, page 2). Seven account actions leave the ⋯ menu (M1) and live in this one dialog.

## Pictures and values
- `export/ManageAccount.html` — the board page as drawn (open in a browser). It has four dialogs: MA1 (normal), MA2 (blocked), MA3 (Emails sent › Show all), MA4 (Block confirm).
- `images/MA1-Manage@2x.png` … `MA4-BlockConfirm@2x.png` — each dialog at 2×. `images/ManageAccount-board@2x.png` — the whole board.
- `../../measurements/MA1-Manage.md` … `MA4` — every element with position (relative to the dialog), size, font, colour, border, radius, padding, gap, shadow. Take every number from there.
- The board page is written with raw hex values; their tokens: #FFFFFF surface-card · #0B0B0C text-primary · #45454A text-secondary · #6B6B70 text-tertiary · #EAEAEC border-divider · #DADADF border-field · #6E1630 accent / accent-text · #F7F7F8 surface-subtle · #F3F3F5 surface-mist · #C42B1C danger · #F3C9C4 danger border (outlined danger button) · #FDEDEB status-declined-bg · #A12215 status-declined-text · radius 20 = radius-panel · 8 = radius-control · shadow 0 8 32 rgba(11,11,12,.14) = shadow-3.
- Icons on the board are drawn by hand; use Hugeicons: close = `Cancel01Icon` 16, back = `ArrowLeft01Icon` 16, blocked mark = `UnavailableIcon` 14 (#C42B1C).

## Layout (MA1)
- Dialog 800 wide, radius-panel, shadow-3, no footer. Header: padding 20 24 0; title "Manage account" Inter Tight 18/26 600; sub "{Full name} · {email}" 13/18 #6B6B70, 2 below; × icon button 32 (radius 8) on the right.
- Body: padding 20 24 24, sections 24 apart. Each section: heading Inter Tight 16/24 600 with a 1 px #EAEAEC line under it (4 below the text); an action link on the heading's right when there is one (13/20 500 accent). Rows: grid 200 · 1fr · auto, gap 16, min-height 40, 1 px #EAEAEC under each; key 14/20 Ink, value 14/20 #6B6B70 (one line, …), action link 13/20 500 accent, right-aligned.
- Sections, in this order:
  1. **Login** — Password · "Set · changed 12 Oct" · Send reset link / Two-step login · "On · authenticator app" · Reset / Google · {email} · Unlink. A row shows only what the person has (no Google → no Google row).
  2. **Sessions · {n} devices** + "Log out everywhere" — each device: "{Device} · {Browser}" · "{City} · active now" or "{City} · today, 09:14" · Log out.
  3. **Emails sent · {n}** + "Show all" — the last 3: subject · "18 Nov, 14:02" (no action).
  4. **Personal data** — "Everything noddo keeps about {First name}" · "One file" · Export.
  5. Separate last block, 16 above it a 1 px #EAEAEC line: "Block account" 14/20 500 + "{First name} can’t log in until you unblock. They’re logged out everywhere at once." 13/18 #6B6B70 (one line, …); on the right a small outlined danger button 32 "Block account" (13 px 500, text #C42B1C, border #F3C9C4, white fill, radius 8, padding 0 12).

## States
- **Blocked (MA2):** a bar on top of the body: 40 high, radius 10, bg #FDEDEB, padding 0 12, gap 8 — blocked icon 14 #C42B1C · "Blocked" 14 600 #A12215 · on the right "on 3 Nov · can’t log in" 14 #45454A. Sessions: heading "Sessions" with no count and no link; one row "No devices" · "Logged out when the account was blocked". The last block becomes "Unblock account" + "{First name} can log in again right away." + a plain secondary small button "Unblock account".
- **Emails sent › Show all (MA3):** the same dialog changes content (no second dialog): a back icon button 32 left of the title "Emails sent" (−8 margin), sub "{n} emails to {email}"; rows 44 high, subject 14 Ink (…) and when 13 #6B6B70 tabular on the right, a 1 px line under each; newest first; after 6 rows "Show 8 more" 13 500 accent, 12 above. Back returns to MA1.
- **Block confirm (MA4):** dialog 400: "Block {First name}’s account?" 18/26 600; "{First name} won’t be able to log in. Their profile and data stay. You can unblock any time." 14/20 #45454A (padding 8 24 20); footer right-aligned, no line: Cancel (secondary 36) · "Block account" (primary 36 with #C42B1C fill).
- **Log out everywhere, confirm (MA5, approved 19 Nov):** dialog 400, same shape as MA4: "Log {First name} out everywhere?" 18/26 600 · "{First name} is logged out on every device and has to log in again." 14/20 #45454A · Cancel (secondary 36) · "Log out everywhere" (**primary** 36, accent — not red: nothing is lost). After it: toast "Logged out everywhere". Pictures/values: `images/MA5-LogOutEverywhere@2x.png`, `../../measurements/MA5-LogOutEverywhere.md`.
- **Act at once with a toast** (no period at the end of a toast): Send reset link → "Reset link sent"; Reset → "Two-step login reset"; Unlink → "Google unlinked"; Log out → "Logged out of MacBook"; Export → "Export started".
- **Loading:** rows show skeleton bars (Mist #F3F3F5, shimmer) in the value column; headings stay. **Error (MA6, approved 19 Nov):** the dialog keeps its header (title, sub, ×); the body is the product ErrorState, centred, padding 56 24 64: illustration `something-broke` 160×100 (accent ring) · "We couldn’t load the account" Inter Tight 18/26 600, 14 below · "Nothing is lost. Try again in a moment." 14/20 #45454A, 6 below · secondary 36 "Try again" (no icon), 20 below. Pictures/values: `images/MA6-Error@2x.png`, `../../measurements/MA6-Error.md`. **No permission:** the menu item isn't shown to people who can't manage accounts. **Long:** email and values cut with … on one line.

## Words
Every string above, sentence case, US English. First names in sentences, full name in the sub line.

## Built
- **Where to see it:** a person profile › ⋯ › Manage account, for a holder of `PEOPLE.PROFILE` BLOCK over the person
  (never on your own profile). Code: `components/modules/organization/modules/profile/components/UserDataHeader/modals/ManageAccountDialog`
  (with its test). Built 2026-11-20, not walked yet.
- **Data:** `GET /users/{id}/account` and `/sessions` (BFF routes `app/api/users/[id]/account`, `…/sessions`), the emails
  `GET /users/{id}/emails?page&size` (20 a page; the section shows the first three and the total). Log out one device,
  unlink Google/Microsoft: server actions in `profile/actions/manageAccountActions`.
- **Rows hidden by right (R13):** Emails sent needs PROFILE MANAGE, Personal data needs PROFILE EDIT (and never while
  acting as somebody else), the Unlink of the company sign-on needs `SETTINGS.IDENTITY` MANAGE.
- **Differs from the design:**
  - ~~Reset and Block open today's confirms~~ — since 2026-11-23 they are the windows of `manage-account-answers`
    (below).
  - ~~Unblock acts at once~~ — since 2026-11-23 it opens its window (AQ-07).
  - **Export** downloads the file there and then, so the toast is "Export downloaded", not "Export started".
  - **Rows the board does not draw:** Locked / Login paused with **Unlock** (today's confirm — our lock stays, U2), and
    **Single sign-on** with Unlink, in Login. A Login section with
    nothing in it says "No way to log in yet"; Sessions with none says "No devices · Not logged in anywhere".
  - **A session row is the device and the time** (B2, 2026-11-23): "Mac · Chrome" · "active now"; the IP is in the
    time's tooltip ("IP address {ip}"). "active now" means seen in the last five minutes. The device is read from the browser's user agent ("Mac · Chrome").
  - **Show all** pages by 20: "Show {n} more" is the next page's size.
  - The error state is the product ErrorState (the `something-broke` illustration at its small size, the words of MA6);
    its "Try again" keeps the shared component's icon.
- **Images of the real screen:** not taken yet.

## Built from manage-account-answers (AQ-06, AQ-07, AQ-08 — 2026-11-23)
*`hris/design/handoffs/2026-11-20-answers-from-design/specs/manage-account-answers`, plan `DESIGN_ANSWERS_2026_11_20_PLAN.md`
item 6. Code: `ManageAccountDialog` and `modals/AccountAccessModal` (both with tests). Not walked yet.*
- **AQ-06 · Reset two-step login** is one window: "Reset {first}’s two-step login?", the line, the admin's own proof, the
  tick, Cancel · Reset. The proof follows step-up's rule (`MFA_DESIGN.md` § 3.5): **"Your password"** for an admin with
  no factor; **"Code from your authenticator app"** (with "Use a backup code") for an admin with one — the owner's rule
  kept; **"Enter the code we sent to you"** for an admin who logs in by code (the code is emailed as the window opens).
  The line's second sentence follows the proof. The proof rides on `POST /users/{id}/mfa/reset` and is the step-up.
  A wrong password turns the field red, "That password doesn’t match"; a wrong code shows its own line there; Reset
  stays pressable. Toast "Two-step login reset".
- **Differs from Ulia's AQ-06:** the **out-of-band tick stays** (owner U3): "I checked it’s really {first name},
  another way than email", under the field; Reset without it is refused (AUTH00032) with that line red under the tick.
  The window is the shared confirm (400 wide, not 440).
- **A protected account — only the owner sees Reset — is not hidden yet**: nothing in `GET /users/{id}/account` says the
  account is protected, so a non-owner gets the server's refusal (AUTH00016) in the window.
- **AQ-07 · Block / Unblock** windows as drawn, the reason field with its placeholders ("For example: lost laptop" /
  "laptop found"); Block's button is red. Toast "Account unblocked" (B3); a block shows itself in the red line.
  **"Optional" is not written beside "Reason"**: our rule is that optional is the absence of the asterisk
  (`technical_documentation/ui/FORMS_AND_FIELDS.md` §§ 1, 3).
- **AQ-08 · the bounced row** is the first row of Login: "Email" · "Bounced on {d Mon} · {email}" · **Try again**
  (`POST /users/{id}/email/try-again`; toast "Email sent again"). It shows for a holder of PROFILE MANAGE (who reads the
  emails); the old "Send to this address again" alert above the emails is gone.
- **Inactive (U8):** a person set to inactive reads **Inactive** in the red line (not Blocked), and the Block / Unblock
  block is not offered — they come back through *Set to active* in the header's ⋯.
- **Locked and Unlock stay** (U2).
