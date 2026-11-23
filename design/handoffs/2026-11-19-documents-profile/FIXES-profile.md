# Person profile and small things outside Documents — every fix, with the exact target

Checked live on local-sandbox.noddo.so on 19 Nov 2026 against the "decisions sandbox" board (newest decisions win). Every line: what's there now → what it must be. The one new screen, Manage account, is in `screens/manage-account/` with HTML, PNG, measurements and spec. Time off and the calendar are NOT in this package (they come separately).

Codes: P = profile header · M / MA = the ⋯ menu and the Manage account dialog · T = tabs · D = "Waiting on you" bar · A = Attendance.

## Product-wide words (Ulia 19 Nov)
- Every string follows the noddo voice & tone guide (Notion "noddo voice & tone guide — English (source)"), with one exception decided by Ulia: **toasts have no period at the end**. A string approved once is used **word for word everywhere** it applies (Ulia 19 Nov) — e.g. a wrong code is always "That code doesn’t match. Check your email or get a new code." (login and signing alike) ("Expiry date saved", "Request sent to Reza"). US English spelling ("canceled").

## Outside login (found while testing sign-in)
- Settings › Onboarding template card: "Updated 18.11.2026" → "Updated 18 Nov" (date format rule).
- A person added by an admin is labelled "Sample" and shows the "deleted when you go live" banner.
- "Delegate My Approvals While I'm on Leave" is not sentence case → "Delegate my approvals while I'm on leave".

## Person profile — checked 19 Nov against the "decisions sandbox" board
Sources, newest wins: board https://claude.ai/artifact/Sy9hpgy1pSVH1MxcKMiqGD (3–4 Nov) → Notion "Noddo — правки по дизайну" (fixes 1–10 + answers A1–D3, 1.1–4.3) → Notion "правки 5 ноября" → repo rules/SPEC → later rounds.
Superseded, not tested here: Documents fixes 7–8 (the Documents round of 17–18 Nov replaced them); selection bar (DESIGN_SYSTEM § 7, 17 Nov); dark sidebar (SPEC: sidebar follows the theme); account-state options (B4 chose the pill on the right).
Live at 1710 × 1112 and 1470 × 956 (layout holds at 1470), Reza Karimi (admin view) and Ulia's own profile.

### Header (fix 5 + B4)
- P1. Next to the name: `Active` status chip + account chip. Must be: no chip next to the name; the person's status is a StatusPill on the right, before Edit and ⋯ (Active / Invited / Draft / Blocked / Inactive; Inactive = Mist #F3F3F5, text #45454A, per answer 3.1).
- P2. Status slot next to the name is not built. Must show one thing, by priority: Starts 1 Dec (scheduled pill, calendar icon) → Last day 30 Nov (pending pill, exit icon) → Off until Fri 20 Nov → upcoming time off in 14 days "Vacation · 25–27 Nov" (quiet 13/500 #45454A, opens the Time off tab) → nothing. Reza is off today and the header says nothing. How the policy colour shows in the two leave cases follows the calendar work (not decided yet).
- P3. Email shown under the job title (12/16). Must be: removed from the header (it lives in Personal info).
- P4. Name 18/26 600. Board: 22/1.25 600, −0.02em (Inter Tight).
- P5. No Edit button. Board: "Edit" secondary 36 + "⋯" 36×36 outlined. Now: "Login as user" icon button 36 and a ghost ⋯ 32.
- P6. "Log in as" is an icon in the header. Must be a menu item "Log in as Reza" (fix 6).
- P7. Two-row grid: name row and labels share one line, role row and values share the second. Now the identity column has three lines (name, role, email) and labels/values float between them.
- P8. Own profile (Ulia): no Manager / Team / With us at all and no Edit — check what shows when these are empty.

### ⋯ menu (decided by Ulia 19 Nov)
- M1. Now 12 items. Must be:
  - Active, already in the system: View in org chart · Log in as {name} · Manage account · Terminate employment · Set to inactive (light tooltip "You can delete a profile once it's inactive.").
  - Not in the system yet (not invited): the same + Invite and Start onboarding. Once the person is in the system, neither shows.
  - Inactive: View in org chart · Manage account · Set to active · Delete profile (red text and icon, #FDEDEB hover, confirm).
  - Send password reset, Export personal data, Reset two-step login, Remove single sign-on link, End all sessions, Block account, Emails sent leave the menu and live in the Manage account dialog.
- M2. "Delete profile" is offered on an active profile — only on an inactive one.
- M4. Items 32 high; board 36. Hover: accent-subtle ✓ but label and icon stay Ink / #6B6B70; board: label and icon in the accent.
- M5. Width 234; board 240 min.
- MA. Manage account dialog — NEW SCREEN, board page 2 (ManageAccount), variant C, approved 19 Nov: 800 wide, everything open. Sections: Login (Password · Two-step login · Google, each with a text link Send reset link / Reset / Unlink), Sessions (each device + Log out; “Log out everywhere”), Emails sent (last 3 + Show all → full list in the same dialog with a back arrow), Personal data (Export), and a separate last block “Block account” with a red-outlined button. Blocked: red bar on top “Blocked … on 3 Nov · can’t log in”, sessions empty, the last block becomes Unblock account. Block and Log out everywhere confirm (400); the rest act at once with a toast. Two more states approved 19 Nov (Documents board, page 9): MA5 Log out everywhere confirm — "Log Reza out everywhere?" / "Reza is logged out on every device and has to log in again." / Cancel · "Log out everywhere" (primary, not red), toast "Logged out everywhere"; MA6 error — header stays, body = ErrorState "We couldn’t load the account" / "Nothing is lost. Try again in a moment." / Try again.

### Tabs — confirmed by Ulia 19 Nov
- T1. Built as underline (gap 24, no motion). Must be the segmented track, on every tab row in the product (profile, office, legal entity, roles…): track Mist #F3F3F5, radius pill, padding 4, gap 4, as wide as its content; tab a pill 28 high, padding 0 12, 14/20 500 #6B6B70, hover Ink with no fill; picked = accent-muted fill + accent-text, no shadow, no border; focus only on :focus-visible, 2 px accent outline, offset 2, pill-shaped; switching is instant, no motion; too many tabs → the track scrolls sideways with soft fades at the edges, the picked tab kept in view, never wraps.

### Decision bar "Waiting on you" (answers A3, B5, 3.2)
- Built as answered ✓ (title + counter, strips 40, radius 10, accent-subtle, icon 20, Not now 88 + Approve 112, Show N more / Show less, Not now per session).
- D1. "Show N more" has no down arrow; answer 3.2 asks for one.
- D2. Real requests never reach the bar: approvers are empty (`timeOff/approvers` → `deciders: []`), so nobody gets requests. Checked with injected data only.

### Attendance (fixes 2–3, C3, 5 Nov fix 3)
- Soft band radius 10 ✓, chips tabular ✓, presets as sm buttons ✓, summary "8 h a day · 24 h in total" ✓, button "Log 24 h" ✓.
- A1. Range ends: number in a 23×20 tint, board 24 circle.
- A2. Hint "Pick a day, or drag across several." stays when days are picked; board: only in the empty state.
- A3. No × (Clear selection) in the panel head.
- A4. Empty times: one long line "Enter a start and an end on the same day, the end later than the start." under both fields; board: error under the field that's empty.
- A5. Panel padding 24 (board 20), title 15/22 (board 16/600), textarea 80 (board 72), panel stretches to the calendar's height.
- A6. On someone else's profile there's no Log hours panel (admin on Reza: `canLog: false`, `canManage: true`). Ulia, 19 Nov: logging hours for someone else must be possible; the company decides who may (manager, admin…) in role permissions. Then their Attendance tab shows the same Log hours panel. Petya: confirm such a role permission exists, or add one.
