---
status: built
screen: profile-time-off
owner: Ulia
updated: 2026-11-20
---

# Person profile › Time off tab — the calendar, the request, the request opened in full

Approved by Ulia on 19 Nov 2026. Board "noddo · Calendar", page **Profile · Time off**, 34 frames, every one with a green Done sticky. Drawn at **1710 × 1112**. Pictures `images/`, pages `export/`, every element measured in `../../measurements/profile-time-off/`, components in `../../components/`.

## Scope of this round — read first
This round designed **the calendar**: the company calendar and the calendar on the profile's Time off tab, with the request window and the request opened in full, because they live on it. **It is not the time off feature's design.** Some time off states and corner cases are missing on purpose (listed at the end under "Not in this round"); they come when the time off feature is designed. **Build exactly what is drawn here and nothing more; don't invent the missing states** — where something isn't drawn, keep what the product does today.

## What it is for
Anyone looking at a person's profile sees their time off on a month calendar and their balances. The person (or someone allowed) requests time off: picks the days, sees what it takes and what's left, sends. A manager approves or declines from the same place.

## Where it lives
Person profile › **Time off** tab, under the profile header (`../../../2-product-wide/screens/profile-header/`). Visible to the person and to whoever may see their time off. Assign policy and Adjust balance only for people with that right.

## Layout (Q01)
Header (product-wide) → tabs (segmented track, full width) → 40 → the body: a grid **340 | the rest** (gap as measured): the **time off card on the left**, the **month calendar on the right**.

### Time off card (left, 340)
One white card, padding 20:
1. **Request time off** — primary, full width, Add 16, at the top.
2. "Balances" label 12/16 500 tertiary. Rows: policy marker (dot on a tint) · policy name 14/20 500 · number 24/28 Inter Tight 600 + unit 12/16 tertiary ("days left"; "day taken" / "days taken" for sick leave). The whole row is clickable → Balance history (Q20); no chevron. Long names cut with … + tooltip (Q07).
   - Many policies (Q24, Q27): all of them, Vacation-type first, then the most used; the list shows ~4–6 rows and **scrolls inside** the card (fade + thin scrollbar). No "N more" link.
3. "Upcoming" label. Rows: marker · "Mon–Fri, 16–20 Nov" 14/20 500 + "Annual leave · 5 days" 12/16 tertiary · `StatusBadge` (Approved / Pending), no icon. Public holidays never show here. When nothing is booked ahead (Q23, Q24) the Upcoming block isn't shown at all.
4. **All requests ›** — right-aligned under Upcoming → the All requests window (Q29).
5. Under the card, left: **+ Assign policy** — ghost text button, accent text, Add icon — only for people with that right (not on the person's own view, Q11).

### Month calendar (right)
No card frame — only its grid. Header row: ‹ › · "November 2026" · Today (secondary sm). Mon–Sun; cells 112 high; weekends Surface subtle; today accent circle; the person's office holidays = accent 9 % day with its name (no flag). Leave pills as on the company calendar (approved fill / pending dashed; card on click, centred on the pill and 6 px from it — Q02, Q03; ↗ opens the full request). A leave running past the month fades out at the grid edge (40 px mask), a week break inside the month is a square end (Q06). Overlaps:
- two requests on a day → two lanes (Q05);
- more than two → two lanes; the day's second lane becomes a Mist pill **"+3 more"** (28 high, 12/16 500 secondary) (Q05b); click → popover 300 under it: "Wed, 11 Nov" 14/20 600 + "4 requests" 12/16 tertiary; rows = marker · policy 14/20 500 · dates 12/16 tertiary · status, each with a small Mon–Sun strip of its days (this day outlined); a row click opens the usual card (Q05f).

### Picking days (Q12)
Click a day or drag across several: a light band (accent 4 % on white + 1 px accent 22 % edge; ends = accent-muted circles; one band per week row). Letting go opens the request window at once with those days.

### Request window (Q13–Q17)
`Dialog` 520 wide, radius 24. Top to bottom:
1. "Request time off" + × (close).
2. **Policy** select (marker + name + chevron), full width.
3. A normal **month calendar** to pick the days (bordered box radius 16): ‹ month › · M T W T F S S · weekends grey tiles · the person's office holidays tinted · today ringed · the picked range = a band with filled accent ends.
4. **Balance row** — styled like a Balances row: Mist box, radius 12, padding 12 16, min-height 68. Left: what this takes, 14/20 500 ("−3 working days"; when the policy splits years, a 12/16 tertiary line under it: "14 of them come from 2027"). Right: the number 24/28 Inter Tight 600 + its unit 12/16 tertiary ("15 / days left after"). **The policy name is not repeated** (it is in the select). Not enough days: the row turns red — bg #FDEDEB, number and unit #A12215: "−1 / day" (Q14); the Request button still sends. No-limit policy: "−26 weeks · No limit" (Q16). Nothing picked yet: "Pick the days on the calendar · 18 / days left" (Q17).
5. **Note** — label "Note" + "Optional" (13/18, Optional in tertiary), then the field 56 high, placeholder "Anything your manager should know" (every policy).
6. Footer: avatar 20 + "Goes to **Meryem Alaoui**" · Cancel (ghost) · **Request 3 days** (primary; "Request 21 days", "Request 26 weeks", "Request time off" when nothing is picked). Never disabled.
Under the hood (not on screen): carry-over, which year's allowance pays, the maths. The length is said in the policy's unit (working days / calendar days / weeks). No "now" number, no repeated dates, no week strip, no "also off" in the request.
After sending (Q18): the dialog closes, the request shows as pending on the calendar and in Upcoming, toast **"Request sent to Meryem"** for 5 s.

### Request opened in full (Q29b, Q30, Q30b, Q30c, Q30d, Q30f)
One column, 680 wide, radius 24 (Dialog). Opens from ↗ on a card, a row in All requests (then with ‹ back top-left, Q29b) or Upcoming.
1. Label row: (‹ back) · marker + policy 14/20 500 secondary · status pill · "Requested Thu 19 Nov" quiet meta · × on the right.
2. Dates as the headline 30/38 600 ("Mon 30 Nov – Fri 4 Dec"; with years when the years differ) and under it **only** "Back Mon 7 Dec" 15/22 secondary — the length lives in the balance row.
3. **Status block** (radius 14, avatar 36): waiting — "Waiting for Meryem Alaoui / Your manager" on a soft amber (50 % #FFF3DF on white); approved — "Approved by Meryem Alaoui / Thu 19 Nov, 14:40" on a soft green (50 % #E6F4EC on white); manager's own view — "Waiting for you / You approve Rūta’s time off".
4. **The days on a month calendar** (read-only, no arrows, the range band). One month when the range fits its grid (Q30: 30 Nov – 4 Dec shows in November's last row, December's days in the band in normal text). Runs into the next month and doesn't fit → **two months side by side** (cells 32), other-month days blank, the band runs across (Q30d). **Many months → every month as a small calendar in one row**, leave days filled (accent 45 %), weekends darker grey (Q30f).
5. **Balance row** as in the request: "−5 working days" · "13 / days left after" (approved: "13 / days left"); no limit: "−26 weeks · No limit".
6. The person's note: their avatar 28 + grey bubble.
7. Footer: own pending — **Cancel request** (secondary, red text) left · Close right; approved — Close; manager — Decline · Approve.

### All requests (Q29)
Window with Policy and Status filter chips on top, then the list: "Coming up" first, then each year with its total ("31 days taken"); each row = marker · dates · length · status (Declined shown too); it scrolls inside (max 520) with a fade and 24 bottom padding. A row click opens the request in the same window (Q29b). One action only, so no ⋯: hovering a request that can be cancelled shows a red **CancelCircle** icon button with the tooltip "Cancel request" → the confirm (Q31).

### Cancel confirm (Q31)
440, one column: "Cancel this request?" · marker **Annual leave** · Mon 30 Nov – Fri 4 Dec · 5 days · "Meryem won’t need to approve it anymore. The days stay in your balance." · **Keep it** (secondary) · **Cancel request** (red fill, no accent button beside it — SPEC § 4.6). After: toast "Request canceled"; the pill leaves the calendar.

### Balance history (Q20, Q21, Q22, Q32)
Opens from a balance row. 800 dialog: header = marker + policy (no person name — you know whose profile you're in) · ×; a grey card "23 days left" + **Adjust balance** (admins); a waiting request sits apart on top (soft amber "Waiting for approval" — "Not counted yet"); the history table, one line per change: Date · Change · Balance · What happened; years as small grey tags; scrolls down through the years.
- Adjust (Q21, admins): opens inside the grey card — + / − switch, "Days", "Reason"; "Balance after: 17 days" follows as you type; Cancel · Save; Save adds a line and a toast "Balance adjusted".
- No limit (Q22): days taken per year, no balance column, no Adjust.
- Nothing taken yet (Q32): the allowance line ("1 Jan · +2 days · 2 days · Yearly allowance"), then a quiet empty state — time-off-m at 160, "Nothing taken yet" / "Personal days Rūta takes will show up here." right under it, 48 to the dialog edge.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The calendar's days show at once with no shapes on them; only the balances load as skeleton shapes | Q09 |
| Empty — no policy | The card becomes an empty state: time-off-s 96, "No time off policy yet" 15/22 600, "Assign one so Rūta can request time off and see her balance." 14/20 secondary, primary "+ Assign policy" (for someone who may assign) | Q08 |
| Nothing booked ahead | No Upcoming block, nothing beside the name | Q23, Q24 |
| Error | In place of the calendar, no frame: "We couldn’t load time off" / "Rūta’s time off is safe." + Try again, centred | Q10 |
| No permission | **Not in this round** (keep what the product does) | — |
| Normal | Q01; own view Q11 | |
| Long content | Long policy name … + tooltip (Q07); 15 policies scroll in the card (Q24, Q27); long leave past the month (Q06); many requests on a day (Q05b, Q05f); a request over months (Q30d, Q30f) | |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Request time off | card top | request window, nothing picked (Q17) | no |
| Pick days | calendar | band, then the request window with those days (Q12) | no |
| Request N days | request footer | sends; toast "Request sent to Meryem" | no |
| Click a balance row | card | Balance history (Q20) | no |
| Adjust balance | Balance history (admins) | Q21; toast "Balance adjusted" | no |
| All requests › | card | Q29 | no |
| Cancel request | full request (own pending) / hover icon in All requests | confirm Q31; toast "Request canceled" | **yes** |
| Decline / Approve | card or full request (manager) | toast "Time off declined" / "Time off approved"; a decline reason is **optional** | no |
| + Assign policy | under the card (right holders) | the Assign policy dialog — **not drawn in this round**, keep today's | — |
| ‹ › Today | calendar header | month back / forward / this month | no |

## Words
`words.md` has every string per frame. Product strings:
Request time off · Balances · days left / day left · days taken / day taken · Upcoming · All requests · Assign policy · Today · Approved · Pending · {N} more · {N} requests · Policy · Note · Optional · Anything your manager should know · −{N} working days · −{N} weeks · {N} of them come from {YYYY} · days left after · day left after · days left in {YYYY} · day · days · No limit · Pick the days on the calendar · Goes to {Name} · Cancel · Request {N} days · Request {N} weeks · Request time off · Request sent to {First name} · Requested {Ddd D Mon} · Back {Ddd D Mon} · Waiting for {Name} · Your manager · Waiting for you · You approve {First name}’s time off · Approved by {Name} · Cancel request · Close · Decline · Approve · Cancel this request? · {First name} won’t need to approve it anymore. The days stay in your balance. · Keep it · Request canceled · Time off approved · Time off declined · Adjust balance · Days · Reason · Balance after: {N} days · Save · Balance adjusted · Date · Change · Balance · What happened · Yearly allowance · Carried over from {YYYY} · Adjusted by {Name}: {reason} · Time off · {dates} · Nothing taken yet · {Policy, plural} {First name} takes will show up here. · Coming up · {N} days taken · Declined · Status · Waiting for approval · Not counted yet · No time off policy yet · Assign one so {First name} can request time off and see her balance. · We couldn’t load time off · {First name}’s time off is safe. · Try again.
Toasts and field errors have no period. US spelling ("canceled"). Dates without the year in the current year.

## Values
Measured, every element: `../../measurements/profile-time-off/<frame>.md`. New values in this round (cal.css): balance row `.fin-bal` (Mist #F7F7F8, radius 12, padding 12 16, gap 12, min-height 68; short: #FDEDEB / #A12215), note label `.fin-lab` (13/18 500 secondary + 400 tertiary, 6 above the field), request calendar `.cl-cal` (1 px border-divider, radius 16, padding 12 16 14, cells 38 / circle 34), two months `.cl-two` (gap 12, cells 32 / circle 28), many months `.mm-row` (7 columns, gap 10, day squares radius 3: Mist / weekend #E6E6EA / leave accent 45 %), status block soft fills (50 % of the status bg on white).

## Changes to SPEC
- Leave colours, pills, marker, holidays: as in `company-calendar/spec.md` § Changes to SPEC.
- Request window 520 and the full request 680 (SPEC § 13.7 sizes are 400/560/800) — approved by Ulia.
- Status block fills at 50 % of the status bg — approved by Ulia (softer than the badge).

## New components
Balance row (request + full request) · month picker inside a dialog (one month / two months / many small months) · "+N more" day pill + day list popover · status block.

## Not in this round (Ulia, 19 Nov) — comes with the time off feature
Assign policy dialog; Decline dialog with its optional reason; cancelling an **approved** future request (it depends on a company setting); half days; no-permission state of the tab; a request that fails to send; All requests empty / filters; anything about policies' settings. Keep what the product does today for these.

## For Petya — product asks from this round
- Policies must be able to count in **weeks** (parental leave "26 weeks"), not only working/calendar days.
- A request across New Year: **only if the company/policy is set up that way**, each year's days come out of that year's allowance (Q15 shows that case: "14 of them come from 2027 · 11 days left in 2026"). Otherwise one balance, as the policy says.
- Cancelling an approved future request: a company setting decides.

## Open questions
None blocking.

---

## Built
2026-11-20, plan `DESIGN_ROUND_2026_11_19_PLAN.md` 5.2–5.3. Not yet walked in a browser.

- **Q01, Q11, Q23, Q24, Q27** — the 340 card on the left, the month on the right without a frame
  (`calendar/components/UserTimeOffBalances/UserTimeOffCalendar`, `TimeOffSidePanel`, `TimeOffMonth`). Every balance
  is listed (vacation first, then the most used) and scrolls inside the card with a fade; a row opens Q20; a cut name
  has the light tooltip, no native `title` anywhere. Upcoming: the next three, each opening Q30; absent when nothing is
  ahead. + Assign policy under the card for `PEOPLE.TIME_OFF_POLICIES` EDIT, never on one's own view. The "All
  policies" dialog is gone.
- **Q02, Q03, Q05, Q05b, Q05f, Q06** — pills in the leave colours (approved fill, waiting dashed + clock), two lanes,
  "+N more" with the day's list (rows: marker, policy, dates, the Mon–Sun strip; a row opens the card in place); a run
  past the month fades at the edge, a week break is a square end. The card: policy, status, ↗, dates, length · back
  date, the note, Decline · Approve for the person it waits on (Decline opens Q30 with the reason field).
- **Q08, Q09, Q10** — the no-policy card (time-off-s), balances as skeletons while the month draws at once, the month's
  error in its place.
- **Q12–Q14, Q16, Q17, Q18** — the request window at 520 (`RequestTimeOffModal`; the board and Home open the same):
  policy select, a month to pick on (first click the start, second the end), the balance row, Note · Optional, Goes to,
  Request N days — never disabled. Toast "Request sent to {First name}" ("Request sent" when nobody resolves).
- **Q29, Q29b** — All requests: Policy / Status pills, Coming up, each year with the days taken, the row's × on hover
  for a waiting request and every older action in its ⋯ (AQ-15, AQ-16 open). A row opens Q30 in its place with ‹ back.
- **Q30, Q30b, Q30c, Q30d, Q30f** — `components/modules/timeOff/LeaveRequestDialog` (680), exported for the company
  calendar's ↗. The requester sees **"Waiting for approval" with nobody named** (the owner's rule; AQ-04 asks for a
  redraw); the approver "Waiting for you / You approve {name}'s time off"; approved "Approved by {name}" with the date
  when the reader may see the approval steps, else "Approved". One, two or many months as drawn.
- **Q31** — `CancelLeaveRequestDialog` (440); the text does not name the approver, for the same rule ("Nobody will need
  to approve it anymore…").
- **Q20, Q21, Q22, Q32** — `BalanceHistoryDialog` (800): every period under its year's tag, Date · Change · Balance ·
  What happened, Adjust inline with + / −, Balance after, toast "Balance adjusted"; no limit as Days taken; the empty
  state with time-off-m.
- **Seed (F1.5)** — the sample policies are "Annual leave" and "Sick leave".

Not built, by the Blocked table: "Not counted yet" and the pending-apart balance (AQ-03 — today's model: a waiting
request is already taken off what is left, so the strip has no right-hand words); the split across years and weeks
(Q15, AQ-14); the optional-reason Decline dialog (AQ-13 — today's required reason stays); removing the request page
(AQ-12). Also not drawn and left as today: Assign policy's dialog, cancelling approved leave (a reason, in ⋯).
Not shown for want of data: who adjusted a balance ("Adjusted by {Name}" — the ledger carries an id only).

*2026-11-23, the answers of 20 Nov* (`hris/design/handoffs/2026-11-20-answers-from-design/specs/profile-time-off-answers`,
plan `DESIGN_ANSWERS_2026_11_20_PLAN.md` item 5; the owner's U5, U7). Not yet looked at in a browser.

- **AQ16a–d — actions inside the request in full** (`timeOff/LeaveRequestDialog`): own waiting — "Cancel request" (red
  text, left, Q31) · "Edit dates" (the request window filled in, saved as an edit); own approved leave ahead — "Ask to
  cancel" (red text); the approver answering a cancel ask — the badge stays Approved, "Rūta asks to cancel this time
  off / The 5 days go back to Rūta's balance if you agree", "+5 working days back", her reason, "Keep it" · the red
  "Cancel time off" at once; the approver with a short balance — the red row "Rūta has 3 days left" · "−2 days",
  "Decline" · "Approve anyway". **All requests' row keeps only the × on hover** (always on touch); its ⋯ is gone.
- **AQ04a–c — the chain** with the shared `StepList`: an approver of a chain of several sees "Who approves" (numbered)
  or "Any 2 of 3" (dots) with "1 of 3 approved" on the right, "You · Waiting for you" in the accent, "After you" grey;
  the requester "Waiting for approval · 1 of 3 approved", nobody named; approved, "Approved by" every approver.
- **AQ13 — Decline** is one small window everywhere (the month's card, the request in full, the board, Home):
  optional "Comment", "Rūta sees this", toast "Time off declined".
- **Q13h — a half-day holiday** among the picked days: the row counts it as half, the amber line "24 Dec is a half-day
  holiday, so it counts as half a day", the button "Request 2.5 days". Amounts carry their half everywhere.
- **AQ-03 / U7** — "days left" is the balance; "left after" in the request window and the request is the balance minus
  what still waits. The history's waiting request reads "… · Not counted yet" on its right.
- **Q21b — Adjust with a date**: the shared date field, today by default, past or future; a date outside the period is
  said under the field (ETOBB00010). **B5** — "Adjusted by {full name}: {reason}"; lengths say "working days" by the
  request's counting method.
- **AQ-12 — no request page.** A request opens over the page it was asked from (`?leaveRequest={id}`); a notification's
  email lands on Home with it open.

What differs, and why:
- **"Ask to cancel" is always the label** of one's own approved leave ahead: whether the company wants an approver to
  agree is the policy's edit rules, which an employee cannot read. The backend decides, and the toast says which it was
  ("Cancellation asked" / "Time off canceled"). It is sent at once with no comment, as the spec's Actions table says.
- **"The 5 days go back to Rūta's balance"**, not "her balance": the product does not know a person's pronouns.
- **The step's role** is the approver's job title ("Head of people", "Finance lead") since 2026-11-23 (C5) — for a
  reader who may see the Job field; otherwise "Manager" for a manager step and the fallback role's name. A step never needed (`SKIPPED`) is a grey dot, "Not needed" — the
  frames do not draw one.
- **The address parameter is `leaveRequest`**, not `request`: a document request already owns `?request=` on the
  profile's Documents tab (R7).

