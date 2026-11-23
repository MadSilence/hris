---
status: ready
screen: profile-time-off-answers
owner: Ulia
updated: 2026-11-20
---

# Time off — answers of 20 Nov (A3, A5, AQ-02, AQ-04, AQ-13, AQ-16, Q21b)

Added 20 Nov 2026 — approved by Ulia (every frame has a green Done sticky on the board "noddo · Calendar", page Profile · Time off).

These are additions to `profile-time-off` and `company-calendar`; everything not named here stays as in those specs. Board size 1710 × 1112 (the calendar package's size); check also at 1440 × 932 and 1470 × 956.

## What it is for
- How a request in full (Q30) behaves for the requester and the approver.
- The chain when several people approve.
- The Decline window and what the person is told.
- The reduced leave card.
- The half-day holiday in the request window.
- Adjusting a balance with a date.
- The shared date picker in range mode.

## Where it lives
- **Request in full.** A dialog over the page you were on. Notifications and emails open it too (AQ-12 b).
- **Request time off.** The 520 window (Q13).
- **Balance dialog** (Q20/Q21). Opened from a policy's balance.
- **Leave card** (N04). On the company calendar board.
- **Date picker.** Everywhere a date is picked.

## Layout and values per frame
Exact values: `../../measurements/profile-time-off-answers/<frame>.md` and the crops in `../../components/<frame>__1@2x.png` / `.md`.
Components: the Q30 dialog (`tq-dlg fc-one`), `StatusChip`, `Button`, `InlineAlert` (pending), the month grid (`rm-g`), `Avatar`.

### Q13h · Request time off with a half-day holiday picked
- The balance row shows the real count: **"−2.5 working days"** and **"15.5 days left after"**.
- **One amber line under it.** `#FFF3DF` / `#7A4800`, radius 10, padding 10 12, gap 8, 13/18 400, info icon 16 (Hugeicons `information-circle`).
  - Text: "24 Dec is a half-day holiday, so it counts as half a day".
  - Shown only when a half-day holiday is among the picked days.
- **The button** reads "Request 2.5 days".
- **Rule:** a half-day holiday always takes half a day, even when the company has half-day requests off.

### AQ16a–d · Actions inside the request in full (the list row keeps only × on hover)
- **AQ16a · Own pending request.**
  - Status block: grey clock circle + **"Waiting for approval"**, no second line.
  - Footer: "Cancel request" (ghost, red text `#C42B1C`, LEFT) · "Edit dates" (secondary, RIGHT).
- **AQ16b · Own approved future leave, when the company asks for approval to cancel.**
  - Status: "Approved by Meryem Alaoui" / "Fri 20 Nov, 10:42".
  - Footer: "Ask to cancel" (ghost, red text, RIGHT).
  - When people may cancel on their own, the same place reads "Cancel time off".
- **AQ16c · The approver answers a cancel ask.**
  - Badge stays **Approved** (green); meta "Approved Fri 20 Nov".
  - Amber status block: "Rūta asks to cancel this time off" / "The 5 days go back to her balance if you agree".
  - Balance row "+5 working days back" · "18 days left after"; her comment below.
  - Footer: "Keep it" (secondary) · "Cancel time off" (primary filled `#C42B1C`, white text).
- **AQ16d · The approver, balance too short.**
  - The balance row turns red (`fin-bal neg`): "−5 working days" / "Rūta has 3 days left" · "−2" "days".
  - Footer: "Decline" (secondary) · "Approve anyway" (primary).
- **Rule:** destructive actions are always red.

### AQ04a–c · Several approvers
Built on `../../../7-product-wide/STEPS.md`.
- **AQ04a · In order, as the 2nd approver sees it.** Label "Who approves" with "1 of 3 approved" on the right.
  - Step 1: done tick, "Meryem Alaoui", "Manager · Approved Fri 20 Nov" (green).
  - Step 2: now, "You", "Head of people · Waiting for you".
  - Step 3: not yet, "Tomas Petrauskas", "Finance lead · After you".
- **AQ04b · Any 2 of 3.** No numbers: done tick, accent dot, grey dot. The count is on the right of the label row.
- **AQ04c · The requester's own request.** "Waiting for approval · 1 of 3 approved", with no names of who hasn't decided. After the last yes: "Approved by …" with every approver's name (Q30b).

### AQ13 · Decline
- One small window (400, `sm-dlg`). Title "Decline Rūta’s time off?".
- **Field "Comment"**, marked Optional, with the placeholder "Rūta sees this". The subline under the title is "Annual leave · Mon 30 Nov – Fri 4 Dec".
- **Buttons:** Cancel · "Decline" (red).
- **Toast:** "Time off declined".
- **What the person gets:**
  - **In the product:**
    - "{full name} declined your time off request" / "{Policy}, {dates}";
    - with a comment, a third line "Comment: {text}".
  - **Email, the Notice kind** (the login emails' notice layout: slim band, 48 grey circle, heading 28/34, facts table):
    - Subject: "Your time off was declined: {Policy}, {dates}".
    - Heading: "Your time off was declined".
    - Text: "{full name} declined your request."
    - Facts: Type · Dates · Days.
    - With a comment, a block "Comment" with the text.
    - Button: "Open request".
- The exact words of the frame are in `words.md` § AQ13-Decline.

### A3 · The reduced leave card
- **Who sees it:** people who may not see the person's time off.
- **What it shows:** the policy dot and name — or "Away" in gray when the policy is private — then the dates and "Back Mon 23 Nov".
- **What it hides:** the comment, the length, Approve / Decline and ↗.
- The frame shows the full card next to it for comparison.

### AQ02 · Shared date picker — range
- **The shared picker.** X5, 300 wide, with the month and year menus.
- **Range:** the first click is the start; the hovered end previews the band.
- **The band** follows `../../../7-product-wide/DATE-RANGE.md`. A range from the month before shows the band coming in from the left edge.
- **Typing stays everywhere.** A typed date makes the calendar jump to it (the 1974 example).

### Q21b · Adjust balance with a date
- **The adjust row:**
  - Days: the +/− switch and a number field 72 wide;
  - Date: a field 156 wide, with a calendar icon 16 and "Thu, 1 Jan" — **Today by default**, past or future;
  - Reason: takes the rest.
- **Under it:** "Balance after: 19 days" · Cancel · Save (sm).
- **No hint** under the fields.
- **A past date** puts the line in its place in the history and recounts the balances after it.
- **A future date** waits in the history as planned (grey).
- Replaces Q21.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading / Error / No permission | As `profile-time-off` (Q09, Q10) and the Q30 dialog | — |
| Normal | Every frame above | images/*.png |
| Long content | Long names truncate with … as in Q30; a long comment wraps in the bubble | Q30 frames of the time-off package |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Cancel request | AQ16a | Withdraws the pending request | Yes — the Q31 confirm |
| Edit dates | AQ16a | Opens Request time off filled in | No |
| Ask to cancel | AQ16b | Sends a cancel ask to the approver | No |
| Cancel time off | AQ16c / own, when allowed | Cancels approved leave; days go back | Yes when the person does it (Q31); the approver's red button acts at once |
| Keep it | AQ16c | Declines the cancel ask | No |
| Approve anyway | AQ16d | Approves with a negative balance | No |
| Decline | AQ13 | Declines, with the optional comment | The window is the confirm |
| Save | Q21b | Adds the adjustment at its date | No |

## Words
`words.md` (every string per frame). Key strings are quoted above.

## Icons (Hugeicons, stroke rounded)
The board draws two icons by hand. Use the Hugeicons ones:
- the info icon in the Q13h line → `information-circle`;
- the chevrons of the month and year menus in AQ02 → `arrow-down-01` (12) and `arrow-left-01` / `arrow-right-01` (16).

The rest are named in the measurements.

## Changes to SPEC
None. Every value is a token or an existing component value.
