---
status: built
screen: profile-header
owner: Ulia
updated: 2026-11-20
---

# Person profile header (product-wide)

Approved by Ulia on 19 Nov 2026. Board "noddo · Calendar", page **Profile header**: QR3 (the header on a real screen) and QR3s (every status), both Done. Drawn at 1710 wide. Pages `export/`, pictures `images/`, measured: `../../measurements/profile-header/`.

## What it is for
Says who the person is and where they stand, on every profile tab, before anything else.

## Where it lives
The top of the person profile, the same on every tab (Public profile, Personal info, Documents, Time off, Salary, Attendance, Forms, Reviews, Tasks, Notes), for every viewer and on the own profile.

## Layout (QR3)
One row, vertically centred, full width of the content column; the tabs 40 below it.
- **Photo** 96 × 96, round; without a photo the initials (DESIGN_SYSTEM § 5 rule) on the person's tag tint.
- 24 → **Name** 30/38 600 Inter Tight, −0.02em, Ink, one line (cut with … + tooltip when long); 14 → the **status slot**. 8 under the name: **job title** 16/24 400 #45454A.
- **Facts**, pushed right, 48 apart. Each: round mark 36 · 12 · label 12/16 400 #6B6B70 over value 14/20 500 Ink (2 apart).
  - Manager — the mark is the manager's avatar 36; value = name; click opens their profile.
  - Team — Mist circle 36 (#F3F3F5) with UserMultiple 16 #45454A; value = team.
  - With us — Mist circle 36 with Calendar03 16; value "3y 5m"; hover → white tooltip "Since 19 Jun 2023". Before the start date: "—", no tooltip.
  - A fact with no value is not shown.
- 56 → **account status pill** · 24 · **Edit** (secondary 36, only for those who may edit) · 8 · **⋯** (secondary icon 36).
- Not in the header: email, a "Log in as" button.

## Two kinds of status (QR3s)
### Beside the name — one at a time, the first that applies
1. **Starts Tue, 1 Dec** — before the start date. Pill Scheduled, Calendar03 14.
2. **Last day Mon, 30 Nov** — notice given. Pill Pending, Logout03 14.
3. **Off until Fri, 20 Nov** — off right now. Pill tinted in the policy's leave colour (marker dot 8 + text 12/16 600).
4. **Annual leave · 16–20 Nov** — time off within the next 14 days. Text 13/18 500 #45454A with the policy dot 8; click opens the Time off tab.
5. Otherwise empty.
Pills: 24 high (border inside, box-sizing border-box), radius pill, padding 0 10 0 8, icon 14, gap 5, 12/16 600, status tokens.

### On the right, before Edit — the account, always shown
Active (status-approved, CheckmarkCircle02) · Invited (status-pending, Mail01) · Draft (status-draft, dashed border, PencilEdit02) · Blocked (status-declined, CancelCircle) · Inactive (Mist #F3F3F5, text #45454A, no icon; the name turns #45454A). The shared status chip (STATUS_AND_BADGES § 1).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Not drawn — keep today's skeleton | — |
| Normal | QR3 | QR3 |
| Every status | QR3s | QR3s |
| Long name | … + tooltip | — |
| No photo / no manager / no team | initials; the fact is not shown | QR3s |
| Own profile | the same header; Edit as the rights say | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Manager | fact | opens the manager's profile | no |
| Time off within 14 days | beside the name | opens the Time off tab | no |
| Edit | right | edit the profile (as today) | no |
| ⋯ | right | the profile menu (profile package M1) | — |

## Words
Manager · Team · With us · Starts {Ddd, D Mon} · Last day {Ddd, D Mon} · Off until {Ddd, D Mon} · {Policy} · {D–D Mon} · Active · Invited · Draft · Blocked · Inactive · Edit · "3y 5m" · Since {D Mon YYYY}. No year in the current year. (`words.md` also lists the board's explanation labels on QR3s — those are notes, not product strings.)

## Changes to SPEC
- Header layout above replaces the previous header (profile package P1–P8 where they differ).
- Off-now pill and the marker use the leave colours (`../leave-colours/`).

## Open questions
Q-51 ("With us" under a week) — answered in the code's way; not blocking.

---

## Built
- **Where to see it:** any person profile, `/organization/people/{id}/…`. Code:
  `components/modules/organization/modules/profile/components/UserDataHeader` (`UserDataHeader.tsx`; which status shows
  is `headerStatus.ts`, with its test). Built 2026-11-20, not walked yet.
- **Data:** "Off until" and the next leave come from `GET /calendar/company/people/{id}/absences/current-and-next`
  (BFF `app/api/calendar/company/people/[userId]/absences/current-and-next`), read only by a holder of
  `PEOPLE.CALENDAR` VIEW, disclosed as the board is: a policy the reader may not see is gray and named "Away".
- **Differs from the design:**
  - **No Edit button** (the owner, 2026-11-20): editing stays per tab.
  - ~~The ⋯ menu is today's~~ — since 2026-11-23 it is AQ-08's per status (below). ~~Your own profile keeps "Export
    personal data"~~ — it left your own ⋯ too (B4).
  - **The account pill** also says **Locked** (declined) and **Login paused** (pending); it is the shared status chip,
    so **Inactive keeps the chip's icon**. A joiner who already has an account shows no pill (R11).
  - **Invite / Resend invitation** is the main (primary) button while the person has no account; not in a demo.
  - **Sample** shows beside the name only in a demo (R14).
  - The line under the header (when they start, where the invitation is, a lock) stays, without the start date while
    the Starts pill says it; the scheduled changes stay below it.
  - "With us" before the first day reads "—"; with no start date at all the fact is not shown.
  - Two type roles were added for the numbers: `text-profile-name` (30/38) and `text-profile-job` (16/24).
- **Images of the real screen:** not taken yet.

## Built from manage-account-answers (AQ-08, U8 — 2026-11-23)
*Plan `DESIGN_ANSWERS_2026_11_20_PLAN.md` item 6. Not walked yet.*
- **The ⋯ per status**, two groups and a hairline: **Draft** — View in org chart, Start preboarding | Delete profile
  (red). **Joining** (invited) — View in org chart, Manage account, Start preboarding | Cancel invitation (Ink, red
  `cancel-01`). **Active** — View in org chart, Log in as {first}, Manage account | Start offboarding, Terminate
  employment (Ink, red `unavailable`), Set to inactive (Ink, red `user-remove-01`, the tooltip "You can delete a profile
  once it’s inactive." as the item's title). **Inactive** — View in org chart, Manage account | Set to active
  (`user-check-01`), Delete profile (red). Icons as the spec lists them.
- **An item shows only where it acts** (nothing disabled): Start offboarding needs a termination recorded; Terminate is
  gone while one waits (Last day beside the name says it); Log in as needs an open account; **Cancel invitation shows
  for a Joining person** — a scheduled invitation is withdrawn, one already sent is revoked (C4, 2026-11-23): its link
  stops working and the person is a Draft again. **Delete profile** is refused by the backend too unless the person is
  a Draft or Inactive (C1, `U00042`).
- **Differs from the design:**
  - **Start onboarding** stays — after Start preboarding for a joiner, first in the second group for an active person:
    the board drops it, and nothing else on the profile starts one.
  - **Set to inactive / Set to active ask first** (the spec says no confirm): Set to inactive is an archive, and every
    archive is confirmed (`ACTIONS_AND_MENUS.md` § 7). "Set {first} to inactive?" / "…to active?", toasts "{first} is
    inactive" / "{first} is active again". *Reactivate* is gone — Set to active replaces it.
  - **Cancel invitation** asks "Cancel {first}’s invitation?" — for a sent one, "The link already sent to {first} will
    stop working…" — toast "Invitation canceled".
  - Your own profile: View in org chart and Change password; no export (B4).
- **The pill:** ARCHIVED reads **Inactive**; Invited, Sign-in paused, Blocked; **Locked stays** (U2); Active stays as
  built. Sample beside the name as built.
- **"With us" under a week counts days** (DQ-05) — already built: "Joined today", "1 day" … "6 days", then weeks.
