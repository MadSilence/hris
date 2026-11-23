---
status: ready
screen: manage-account-answers
owner: Ulia
updated: 2026-11-20
---

# Manage account — reset two-step, block with a reason, the ⋯ menu on the real statuses (AQ-06, AQ-07, AQ-08)

Added 20 Nov 2026 — approved by Ulia ("noddo — decisions sandbox" board, page 2, frame AQ06-08-ManageAccount, Done). It adds to `manage-account` (MA, approved 19 Nov) and the person profile header.

The frame is a sheet (1880 × 2500, light grey canvas) with the windows and menus drawn side by side. The grey captions under each one describe behaviour; they are not UI text.

## What it is for
- How an admin resets a person's two-step login, and blocks or unblocks an account.
- What the profile's ⋯ menu holds for each status.

## Where it lives
- **Reset, Block, Unblock:** from Manage account (the 800 dialog), as small confirm windows over it.
- **The ⋯ menu:** the profile header.

## Layout and values
Exact values for every window and menu: `../../measurements/manage-account-answers/AQ06-08-ManageAccount.md`, and the crops in `../../components/AQ06-08-ManageAccount__1…9`.
- **Confirm windows:** 440 wide, radius 16, padding 24; title 18/26 600 Inter Tight; text 14/20 #45454A.
  - Field: label 13/18 500; field 36 high, 1 px #DADADF, radius 8.
  - Footer: Cancel (secondary) · the action.
  - Error: the field gets a 1 px #C42B1C border, with an alert icon 16 and the text 12/16 #A12215 under it.
- **⋯ menus:** 240 wide, radius 10, 1 px #EAEAEC, shadow-2, padding 4. Items 36 high, icon 16 + 14/20.
  - `dng` items (Delete profile): #C42B1C text and icon. `cau` items (Cancel invitation, Terminate employment, Set to inactive): Ink text, #C42B1C icon.
  - A hairline separates the groups.

### AQ-06 · Reset two-step login
- **The window.** "Reset Reza’s two-step login?" / "Reza sets it up again the next time they log in. Enter your password to go on." · field "Your password" · Cancel · Reset.
- **Wrong password:** the field turns red, with "That password doesn’t match" under it. Reset stays pressable.
- **After:** toast "Two-step login reset".
- **An admin who logs in with a code** gets "Enter the code we sent to you" instead.
- **A protected account:** only the owner sees Reset.
- No tick and no second step (Ulia).

### AQ-07 · Block and unblock with an optional reason
- **Block:** "Block Reza’s account?" / "Reza won’t be able to log in. Their profile and data stay. You can unblock any time."
  - Field "Reason", marked Optional, placeholder "For example: lost laptop".
  - Buttons: Cancel · "Block account" (red).
- **Unblock:** "Unblock Reza’s account?" / "Reza can log in again right away."
  - The same field, placeholder "For example: laptop found".
  - Buttons: Cancel · "Unblock account".
- The reason goes to the journal.

### AQ-08 · The ⋯ menu per status
A person is **Active** or **Inactive**. There is no "Archived".

| Status | Items (first group | second group) |
|---|---|
| Draft (not invited yet) | View in org chart, Start preboarding | Delete profile (red) |
| Joining (invited, start date ahead) | View in org chart, Manage account, Start preboarding | Cancel invitation (red icon) |
| Active (also with a last day ahead) | View in org chart, Log in as {first name}, Manage account | Start offboarding, Terminate employment (red icon), Set to inactive (red icon) |
| Inactive (by hand, or after the last day) | View in org chart, Manage account | Set to active, Delete profile (red) |

- **Set to inactive** carries the tooltip "You can delete a profile once it’s inactive."
- **Invite / Resend invitation** is the header's main button while the person has no account.
- **Edit** stays per tab.
- **The account pill** (right of the header) shows Invited, Sign-in paused or Blocked. There is no "Locked": nothing is locked any more (`../../../7-product-wide/NO-LOCK.md`).
- **The Sample chip** stays beside the name.

### Manage account · email bounced
- **When it shows:** only when an email bounced, at the top of the Login section.
- **The row:** "Email" · "Bounced on 12 Nov · reza.karimi@example.com" · "Try again".
- **Try again** sends the email again at once; toast "Email sent again".
- **The Locked row is removed.**

## Icons (Hugeicons, stroke rounded, 16)
The sheet draws them by hand; build them with these:
- View in org chart → `hierarchy-square-02`
- Log in as → `login-03`
- Manage account → `user-account`
- Start preboarding → `arrow-right-02`
- Start offboarding → `logout-03`
- Terminate employment → `unavailable`
- Set to inactive → `user-remove-01`
- Set to active → `user-check-01`
- Delete profile → `delete-02`
- Cancel invitation → `cancel-01` (a cross, not a bin)
- Close (×) in the windows → `cancel-01`
- The error alert → `alert-circle`

## States
| State | What the reader sees | Image |
|---|---|---|
| Normal | Every window and menu above | images/AQ06-08-ManageAccount.png |
| Error | The wrong password on Reset | same |
| Loading | The action button's loading state, as every confirm (the shared Button) | — |
| No permission | The items are hidden (AQ-01) | — |

## Actions
| Action | What happens | Confirms? |
|---|---|---|
| Reset (two-step) | Resets after the admin's password; toast "Two-step login reset" | The window is the confirm |
| Block account / Unblock account | Blocks / unblocks; the reason goes to the journal | The window is the confirm |
| Delete profile | Deletes a draft or an inactive person | Yes, a red confirm |
| Cancel invitation | Cancels the invitation | Yes, a confirm |
| Set to inactive / Set to active | Changes the status | No |
| Try again (email) | Sends again; toast "Email sent again" | No |

## Words
`words.md`.

## Changes to SPEC
None.
