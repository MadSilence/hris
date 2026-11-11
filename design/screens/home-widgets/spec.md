---
status: built
screen: home-widgets
owner: Ulia
updated: 2026-11-11
---

# Home widgets (the first ten)

## What it is for
These are the cards on Home (`home`), and the same cards appear as previews in Edit home (`home-edit`). Each one answers one everyday question and lets the person act on it without leaving Home: approve a request, request time off, start or finish the day, sign, tick a task. Anything that needs more opens its page.

## Where it lives
Home's grid, and the preview inside each row of the Widgets panel. **Who sees each widget** is in its own section below. A widget the person has no right to, or whose module is off, is not shown and not offered in the panel. It has no "no permission" card.

## Layout: the system (LW00)
- **Grid:** 4 columns × 254, gap 24, rows 160, content 1088 at 1440. Sizes: **Small** 254 × 160 (1 × 1), **Medium** 254 × 344 (1 × 2), **Large** 532 × 344 (2 × 2). A widget never grows with its content: long lists scroll inside the card, with a fade at the bottom and a thin scroll thumb.
- **Card:** white, radius 28, no border, shadow `0 1px 2px rgba(11,11,12,.06), 0 8px 24px rgba(11,11,12,.08)`, padding 24 (Small 20), gap 12. **New:** `WidgetCard` (a change to SPEC § 13.9, see "Changes to SPEC").
- **Title row:** the title (Inter Tight 20/26 500, −0.02em) on the left; on the right a link (13/18 500 `accent-text`: "Inbox", "My time off", "Calendar", "All documents", "See all", "All", "All processes") or quiet info (12/16 `text-tertiary`: "Started 09:02", "2h ago").
- **Big numbers:** Inter Tight 400, tabular, −0.02em: **44 in every Small** (one size across all Small cards), 40 in Medium, 52–72 in Medium and Large heroes (Time off 52 / 72, Next time off 96). The word after the number is 14/20 `text-secondary`, on the same baseline.
- **Counter pill** next to a title (Processes "3"): 22 high, `accent-subtle` fill, `accent-text` 12/16 600. It is SPEC § 13.4 "Counter", in the soft version.
- **Rows:** 13–14 px text, a hairline between rows (`border-divider`), avatar 22–32.
- **Buttons:** SPEC § 13.2 inside cards: 32 (sm), and the full-width main action is 36. Segmented controls (Who’s out) are pills, as in `home-edit` → Values. One primary per card at most. **Approve** always has the nod ring.
- **States, the same for every widget:**
  - **Loading:** a skeleton in the card's shape after 2 s; under 2 s, nothing (SPEC § 12). Every skeleton shape has radius 8.
  - **Empty:** the S illustration (96), a title (15/22 600), one line, and at most one action.
  - **Error:** **something-broke** scene, "Couldn’t load {thing}" / "Check your connection." + "Try again" (secondary). Only this card fails; the rest of Home works.
- Tooltips are the light tooltip (DESIGN_SYSTEM § 7): white, hairline, level 2, radius 10, no arrow.
- Every name that is cut with … shows its full text in a tooltip on hover.

Each widget has a board with its sizes (S / M / L), its states and its edge cases: `images/LW01-…png` to `LW10-…png`.

---

## 1. Waiting on you (LW01, LW01b, LW01c, LW01d)
**Who sees it:** people who approve something (managers, HR, finance) and everyone who has something to sign, do or read. When nothing waits it shows "All caught up" (the code hides it today; that changes). **Data:** the person's inbox (*Needs action*): approvals assigned to them, things only they can do, things to read. Today only time-off requests and cancellations exist; the other kinds arrive as their modules do (`DESIGN-ONLY.md` § 2). **Sizes:** S, M, L (L is the default).

- **Small:** "{n} requests" as a big number + up to 3 stacked avatars.
- **Medium:** "{n} need your answer" (count in accent), up to 3 rows (avatar, name, "3 days vacation · 12–14 Nov"), then "Review {n} requests" (primary, full width).
- **Large:** a **deck of cards**. Under the title is the counter "1 of {n}" + one dash per card (the current one accent; max 9 dashes, then the counter alone). Under it the front card sits slightly tilted (−0.5°). Behind it are as many cards as there are items left, **2 at most** (3 left → 2 behind, 2 left → 1, 1 left → none). The back card is pink (`accent-subtle` + rose tint), the middle one is white with a hairline. **New:** `DecisionDeck`.
- **One card:** at the top left a 36 tile with the kind's icon (time off `calendar-03`, expense `invoice-01`, attendance `clock-01`, document `file-01`, review `star`, task `task-done-01`, missing data `user-edit-01`, policy `book-open-01`, announcement `megaphone-01`, failed automation `cancel-circle` on red soft). Next to it: a 20 avatar + the person's name (600) and what they want ("wants 3 days of vacation"), with the time ago on the right. Then the main line (Inter Tight 22/28 500: "Thu 12 → Sat 14 Nov", "€84.20"). Then one of these:
  - a **warning line** with an avatar ("Rūta from Design is out on 12 Nov too", Pending text);
  - **fact chips** (Mist pills 24, 12 px: "3 working days", "12.5 days left after", "✓ Receipt attached" with a Pine tick);
  - the person's **note**, quoted with a 2 px left rule ("Client lunch with Acme, 3 people").
  
  At the bottom: "← Skip" on the left, the actions on the right.
- **Card kinds (LW01b).** Order in the deck: Decide (oldest first), then Do (by due date), then Read (newest first).

| Kind | Example | Main line | Under it | Buttons |
|---|---|---|---|---|
| Decide · time off | Lena Novak wants 3 days of vacation | Thu 12 → Sat 14 Nov | an overlap warning **or** chips "3 working days" · "12.5 days left after" | Decline · Approve |
| Decide · expense | Tomas Petrauskas sent an expense · Vilnius | €84.20 + chip "Receipt attached" | the note | Decline · Approve |
| Decide · attendance correction | Ana Silva fixed her hours | Mon 9 Nov · 09:02 → 18:10 | "Forgot to clock out. Was 09:02 → —" | Decline · Approve |
| Do · document | Remote work policy, from HR · to sign | Sign by Fri, 13 Nov | chips "4 pages" · "Takes about 3 minutes" | Sign |
| Do · review | Q4 review, your self-review | Due in 3 days | chips "5 questions" · "Your manager sees it after you send" | Start |
| Do · task | Set up Ana’s laptop, Onboarding · Ana Silva | Due today, 10:00 | "Assigned by Inga (HR)" | ✓ Mark done |
| Do · missing data | Inga from HR asks you to add | Emergency contact | "Your profile is missing it" | Add now |
| Do · policy | Travel policy was updated | Read and confirm | "What changed: hotel limits, per diem" | I’ve read it |
| Read · answered | Your time off was approved by Jonas | Fri, 4 Dec | status Approved | Mark as read |
| Read · announcement | Inga from HR posted an announcement | Office closed on 24 Dec | "Enjoy the long weekend." | Mark as read |
| Read · failed automation (HR) | Automation didn’t run | Time off approval | "The approver has left the company." (Error text) | Mark as read · Fix it |

- Rules: no "Open" and no "Later" buttons. Clicking the card opens its page, and Skip is "later". A hover over any avatar or name shows a light tooltip with the full name and job title.
- **Approve, in motion (LW01c, 6 s loop on the board).** Hover: the button darkens (`accent-hover`, 100 ms) and the ring dips. Press: `accent-strong`. Then "Approving…" with the ring nodding (`NodRing`, 1.1 s loop); the width does not change. On success it nods once (600 ms). The card leaves to the **right**, tilting, and fades (240 ms). The deck moves forward (300 ms). The counter becomes "2 of 3" and one card fewer is behind. Toast "Time off approved" + Undo (5 s). Reduced motion: no nod, the card just fades (SPEC § 11).
- **Skip, in motion (LW01d).** Skip darkens on hover (text only). On click the card leaves to the **left** (−5°, 300 ms, no pause) and drops under the deck as the back card, its text fading (330 ms), while the next card moves forward at the same time. The counter does **not** change (nothing was answered) and there is no toast. Skip only changes the order for this person.
- **States:** loading (LW01), empty "All caught up" / "Nothing waits for your answer." (**all-caught-up**), error "Couldn’t load requests". A long name is one line with … and the full name in a tooltip.

## 2. Time off (LW02)
**Who sees it:** everyone with a time-off policy. Without a policy it shows the empty state "No time-off policy yet" / "Ask HR to add you to one." (**time-off-s**). **Data:** balances by type and the person's requests. **Sizes:** S, M, L.

- **Small:** a "Time off" label + the "My time off" link; "14.5 vacation days"; "Request time off" (primary, full width).
- **Medium:** the big number (52) + "vacation days"; a hairline, then the other types as a quiet list ("Personal 2 days left", "Sick leave No limit"); the nearest request as a one-line pill (dates + status; pending = dashed `accent` edge + Pending status with no fill); "+N" counter if there are more; "Request time off".
- **Large:** the big number 72 and the other types on the left; on the right "Coming up", up to 3 one-line pills (approved on `bg-subtle`, pending dashed), then "+N more"; "Request time off" at the bottom right.
- "+N" opens a small menu (popover, level 2) with the other requests. A click on a request opens its page. The last line is "All in My time off".
- Rules: only what is left, never "of N", a total or "used". A type without a limit says "No limit". The main type is the first in the policy (usually vacation).
- **Actions:** "Request time off" → the request dialog (L 800, DESIGN_SYSTEM § 7). "My time off" / a pill → My time off.

## 3. Next time off (LW03)
**Who sees it:** everyone with a time-off policy. **Data:** the next approved request (pending ones are not counted) and the public holidays of the person's work location; the nearest wins. **Sizes:** S, M.

- **Small:** a calendar leaf in the top right (month 11 px accent, day 15) + "24 days to vacation".
- **Medium:** title + status (Approved, or "Holiday" for a public holiday). A quiet date line with a `calendar-03` icon: "Fri 4 – Mon 7 Dec · 2 days" (also across months: "Wed 31 Dec – Thu 15 Jan"). Then 96 big number + "days to your vacation".
- The line names the type in lower case ("days to your vacation / personal day / parental leave") or the holiday ("days to Christmas"). If the name is too long: "days to your time off". One day before: "Tomorrow". On the day: "Enjoy your time off", with no number.
- Empty: "No time off booked" / "Plan your next break." + "Request time off" (**calendar**). Click → the request (or the holiday calendar).

## 4. My time (LW04)
**Who sees it:** only with the Attendance module on, for people who track time. **Data:** today's entries and the last 7 days. **Sizes:** S, M, L.

- **Title "My time ↗"**: the whole title is the link to My attendance (`arrow-up-right-01` 16 after it). Top right: "Started 09:02".
- **Medium:** a dial (156): a tick ring, the accent arc for time worked out of the day's target, and a knob at the end of the arc. Inside the dial: "5:37" (44) / "of 8h today". Below it: a square Break icon button (`pause`, secondary 36) + "Finish the day" (secondary), then a dashed divider and "3 breaks" | "55m".
- **Small:** "5:37 of 8h" + "3 breaks · 55m" + the Break icon button.
- **Large:** the dial on the left; on the right the last 7 days as bars ("36h 22m last 7 days", days Wed…Tue, today in accent) + "3 breaks · 55m today".
- **Never empty.** Before the day starts it shows "0:00" / "Not started" and "Start the day" (primary). On a break the dial goes pale, the button is Play (`play`, primary) = "Back to work", the label is "Break · 12m", and the totals count the break ("4 breaks · 1h 07m").
- Hover "3 breaks": a tooltip lists each break ("12:30–13:00 30m"…). Hover a bar: "8h 14m · 2 breaks".
- **Actions:** Break (starts a break), Back to work, Finish the day (ends the day; no confirm, Undo in a toast "Day finished" + Undo), Start the day.

## 5. Who’s out (LW05)
**Who sees it:** everyone. People without a team see Everyone by default. **Data:** time off and public holidays, approved and pending. The type shows only if the company allows it; otherwise "Away". Sick days never show a reason. **Sizes:** S, M, L.

- **Small:** "3 out today" + avatars; "My team" in the top right (it follows the last choice made in M / L).
- **Medium:** a `SegmentedControl` "My team | Everyone" + the "Calendar" link; a list of who is out today: avatar, name, type, "back Thu".
- **Large:** the switch; days Mon–Fri as columns (today in accent); one bar per leave, with the type tag colour. Approved = solid soft fill. Pending = 1.5 dashed edge in the type colour on white. Leave that goes past Friday runs off the right edge (no round end, fades out, →) and says "back 4 Jan". A one-day bar is avatar + first name + … .
- Hover any bar: tooltip "Tomas Petrauskas / Sick day · Tue, 10 Nov".
- With few people, the free space shows "Upcoming" (name · type · dates, as many as fit); with nothing upcoming, "No leave scheduled". With many people (Everyone), the people scroll inside the card under the fixed row of days.
- Empty: "Everyone is in today" / "No one on your team is away." (**people-s**). Click a person → their profile; "Calendar" → the team calendar.

## 6. This week (LW06)
**Who sees it:** everyone. Birthdays only of people who chose to show theirs. **Data:** birthdays (shared), start dates (work anniversaries in whole years, new joiners). **Sizes:** S, M, L.

- **Today first, then the rest of the week by date. No buttons:** the card only tells. A click on a person opens their profile.
- Confetti in the top right only when someone celebrates today. The big ring, dots and stick take the company accent. The small ring is Ink. The triangle is a light tint of the accent.
- **One today** — S: avatar 36 + "Marta’s birthday is today" (Inter Tight 16, up to 3 lines) + "+3 more this week" with faces. M: the same sentence (19), divider, "Later this week" + rows. L: on the left avatar 64 + the sentence (24/28); a hairline; on the right "Later this week" rows (avatar 28, name, what, day in accent "Thu 12").
- **Two today** (and three in L): S lists them as rows (avatar 22, name, what, "Today" accent). M has the label "2 celebrations today" + rows on an `accent-subtle` tint (radius 12), then the divider and "Later this week". L shows "2 celebrations today" (24) + the people on the tint.
- **Three or more** (four or more in L): faces (max 3) + "+N" + "5 celebrations today" (all birthdays: "5 birthdays today"). Hovering the faces or "+N" shows a tooltip "Today" with everyone. S adds "+5 more this week" (dotted underline, a tooltip with the list).
- **Nobody today:** no confetti. S: "Nothing today · coming up this week" + 2 rows. M: "Nothing to celebrate today" (14/20 `text-secondary`), divider, "Later this week". L: "Nothing to celebrate today" + "Coming up this week →" pointing at the right column.
- **Nothing this week:** S has one quiet line; M and L show "Nothing to celebrate this week" / "Birthdays, work anniversaries and new joiners will show up here." (**celebrations**).
- Words: "{Name}’s birthday is today", "{Name} joins today", "{Name}: {n} years at the company today"; rows: "birthday", "{n} years" (1 year), "joins". Never "joined". The birthday year is never shown. Days in lists are in the accent.
- Many this week: rows scroll inside with a fade; the card never grows. Long names wrap to 3 lines, then …; rows cut with … + tooltip.

## 7. To sign (LW07)
**Who sees it:** everyone who has something to sign; with nothing, the empty state. **Data:** the person's pending signature requests. **Sizes:** S, M, L.

- **Small:** title + "All documents" link; "2 pending" (44); "Next due Fri, 13 Nov".
- **Medium:** title + "All documents"; "2 pending" (40); rows: name / "Due Fri, 13 Nov" + "Sign" (secondary 32).
- **Large:** title + "All documents"; "3 pending"; rows: a 32 file tile + name / "From HR", then "Due Fri, 13 Nov" in grey + "Sign" on the right.
- Only pending documents: once signed, a document leaves the widget (it stays in All documents). Overdue: the due text becomes the Error status "Overdue". Many: the list scrolls inside with a fade.
- Empty: "Nothing to sign" / "All your documents are signed." (**signing**). "Sign" → the signing view; a row → the document.

## 8. My tasks (LW08)
**Who sees it:** everyone. **Data:** tasks assigned to the person (by processes and by people), open first, by due date. **Sizes:** S, M, L.

- **Small:** "4 to do" (44) + "1 due today".
- **Medium:** "See all"; rows: a round checkbox (SPEC § 13.11), the name / "Today · Onboarding". Overdue rows show "Overdue" (Error 12/16 500) with the due day under it on the right.
- **Large:** two columns. **Today** sits on an `accent-subtle` panel (radius 16) with the label in accent. **This week** has no background. Each row has its due time or day on the right. Footer: "4 open · 1 overdue · 6 done this week".
- Tick the circle → done, crossed out in grey until the end of that day (so Undo is easy), then it leaves the widget; toast "Task done" + Undo. Overdue = the due date has passed and it is still open. It stays on top until done.
- Empty: "All caught up" / "Nothing is assigned to you." (**tasks**). Click a task → its process.

## 9. Processes (LW09)
**Who sees it:** HR and admins; managers see only their reports' processes. **Data:** running onboarding / offboarding / preboarding, steps done / total, overdue steps. **Sizes:** S, M, L.

- **Small:** "3 in progress" + status "1 overdue" (Pending).
- **Medium:** "Processes" + counter pill "3" + "All"; rows: avatar, name, "Onboarding" (or "Offboarding · 1 overdue" in Pending text, "Preboarding · starts 16 Nov"), and a progress bar with "4/12".
- **Large:** the same + a lane per person (bar with the avatar riding on it) and status chips at the bottom: "2 onboarding" (In progress), "1 starts next week" (Scheduled), "1 overdue" (Pending). Many: the list scrolls and fades out above the chips, which stay put.
- Bar colour by type: onboarding accent, offboarding Ink 70 %, preboarding Scheduled teal. Overdue is Pending amber, never red.
- Empty: "Nothing in progress" / "Onboarding and offboarding show up here once they start." (**onboarding**), with no button. Click a person → their process; "All processes" → Processes.

## 10. Automations (LW10)
**Who sees it:** HR and admins only. **Data:** runs of the last 7 days (per day: ran fine, failed, skipped), failures with their reason, the next scheduled run. **Sizes:** S, M, L.

- **Small:** "128 runs" + Error status "1 failed".
- **Medium:** "See all"; "128 runs this week"; a red soft block "1 failed today" / "Time off approval: the approver has left." / "Fix it"; "Next" / "Probation reminder · Mon 09:00".
- **Large:** "See all"; "This week · 128 runs" under the title; a dot chart, one column per day (W…Today, today in accent, a failed run as a red dot); the failure block and "Next" on the right.
- Hover a day: tooltip "Today · 36 runs" / Ran fine 35 / Failed 1 / Skipped 0, with dots in the chart's colours.
- **All good:** a Pine soft block "All ran fine" / "No failures this week." and no red dot. The card itself is always white (SPEC § 4.6).
- Empty: "No automations yet" / "Let noddo do the routine work." + "Create automation" (**automations**). "Fix it" → the failed run; the chart → Automations.

---

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Each widget's skeleton in its shape, after 2 s. | each LW board, "Loading" |
| Empty (nothing yet) | Per widget, see the sections (illustration, title, line, at most one action). My time is never empty. | each LW board, "Empty" |
| No results | Not applicable: widgets have no search. | — |
| Error | Per widget: "Couldn’t load {thing}" + Try again; only that card. | each LW board, "Error" |
| No permission | The widget is not shown and not offered. | — |
| Normal | S / M / L of each widget. | LW01–LW10 "Sizes" |
| Long content | Many rows scroll inside, names cut with … + tooltip (Who’s out, This week, To sign, Processes); long names in This week. | LW05, LW06, LW07, LW09 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Approve | Waiting on you | Approves at once with motion (above). Toast "{Kind} approved" + Undo (5 s). The deck moves on. | no (Undo) |
| Decline | Waiting on you | Opens the request's page with the decline reason field focused. (The inline decline dialog is not designed in this round.) | on its page |
| Skip | Waiting on you | Moves the card to the back of this person's deck. No toast. | no |
| Sign / Start / Add now / I’ve read it / Fix it | Waiting on you, To sign, Automations | Opens the place where it is done (signing view, review, profile field, policy, failed run). "I’ve read it" confirms at once; toast "Marked as read" + Undo. | no |
| Mark done | Waiting on you, My tasks | Done at once; toast "Task done" + Undo. | no |
| Mark as read | Waiting on you | It leaves the deck (it stays in Inbox). | no |
| Request time off | Time off, Next time off (empty), AI box | Opens the request dialog. | its own dialog |
| Break / Back to work / Finish the day / Start the day | My time | Records the entry at once; toast for Finish: "Day finished" + Undo. | no |
| My team / Everyone | Who’s out | Switches the scope, remembered for this person (S follows it). | no |
| Click a person, a row, a link, the title | all | Opens its page (profile, request, document, process, My time off, My attendance, Calendar, Inbox, Automations). | no |

## Words
Every product string is written in the sections above, in English, sentence case. Counts in both forms:

| Where | One | Many |
|---|---|---|
| Waiting S / M | 1 request · 1 needs your answer · Review 1 request | 3 requests · 3 need your answer · Review 3 requests |
| Time off | 1 vacation day · 1 day left | 14.5 vacation days · 2 days left |
| Next time off | 1 day to your vacation · Tomorrow | 24 days to your vacation |
| My time | 1 break · 1h 07m | 3 breaks · 55m |
| Who’s out S | 1 out today | 3 out today |
| This week | 1 year · 2 celebrations today · +1 more this week | 5 years · 5 celebrations today · 5 birthdays today · +5 more this week |
| To sign | 1 pending | 2 pending |
| My tasks | 1 to do · 1 due today | 4 to do · 4 open · 1 overdue · 6 done this week |
| Processes | 1 in progress · 1 overdue · 1 starts next week | 3 in progress · 2 onboarding · 2 start soon |
| Automations | 1 run · 1 failed | 128 runs this week |
| Deck counter | 1 of 1 | 1 of 3 |

The numbers keep their word on the same line (a non-breaking space, `PRODUCT-RULES.md`). Toasts: "Time off approved" / "Expense approved" / "Correction approved" + Undo; "Task done" + Undo; "Marked as read" + Undo; "Day finished" + Undo. Errors: "Couldn’t load requests / time off / your time / who’s out / celebrations / documents / tasks / processes / automations" + "Check your connection." + "Try again". `words.md` lists every string in the boards, including the example data.

## Values
- Card, grid and type: § System above. The page around them: `home`.
- Status pills and status text: SPEC § 4.5 and `StatusBadge` (Approved Pine, Pending amber, In progress blue, Scheduled teal, Error red). Inside a time-off pill the status is icon + word with no fill.
- Leave bars: tag palette (SPEC § 4.7), avatars 22–32 on white rings.
- Chips 24 (SPEC § 13.4), buttons 32 / 36 (SPEC § 13.2), round task checkbox 18 (SPEC § 13.11).
- Deck: card radius 20, padding 18 20, level-1-like shadow `0 8px 24px 8%`; back card offsets 9 / 5 px at 1.75° and 18 / 10 px at 3.5°.
- Today tint (This week, My tasks): `accent-subtle`, radius 12 (rows) and 16 (the My tasks panel).
- Motion: SPEC § 11 (100 ms hover, 300 ms reorder `cubic-bezier(.2,0,0,1)`, nod 600 ms / loader 1.1 s), reduced motion respected.

## Changes to SPEC
1. **Widget card radius 28, no border, neutral soft shadow** `0 1px 2px 6% + 0 8px 24px 8%` (SPEC § 7 level 0 and § 13.9: radius 16 with a border). It was chosen on a white page on 11 Nov (N7).
2. **Widget title 20/26 Inter Tight 500** (SPEC § 5 card title 15/22 Inter 600).
3. **Big numbers 40–96, weight 400** (SPEC § 5 big number 32/40 500). 44 in every Small, 40 in Medium lists, 52–96 heroes.
4. **Widget sizes and grid** (254 / 532 × 160 / 344, gap 24). SPEC § 13.9 has no sizes.
5. **Deck cards radius 20** (the panel radius used on a card) and the tilted deck. SPEC has no deck.
6. **Radius 12** for the today tint rows and the panel preview (`home-edit`). SPEC § 8 lists no 12. Alternative: 10.
7. **Pending leave in Who’s out:** 1.5 dashed edge on white (SPEC § 13.13: solid edge, light tint and a dot pattern). At widget size the dots read as noise.
8. **Status inside a pill with no fill** (Time off "Pending", icon + word in the status colour). SPEC § 13.4 draws a status as its own filled pill.
9. **Confetti** (This week) in the accent: a decorative element SPEC § 10 does not describe.
10. **Light tooltips with a title line** — already DESIGN_SYSTEM § 7.

## New components
- **`WidgetCard`** (`S | M | L`; states default, hover (level 1 if clickable), loading, empty, error).
- **`DecisionDeck`** + **`DecisionCard`** (kinds Decide / Do / Read, front / middle / back, motion approve-right, skip-left) — used on Home; later in Inbox.
- **`TimeDial`** (My time: running, paused, not started; sizes 156 and 96).
- **`WeekBars`** (My time L, Automations L: bars or dots per day with a tooltip).
- **`LeaveLanes`** (Who’s out L: a day header, bars per person, the past-week edge, a scroll under fixed days) — a small sibling of the team calendar.
- **`CelebrationsList`** (This week: hero, faces + count, today tint, confetti).
- **`FactChip`** (Mist 24 pill, optional icon) — the deck's facts and the receipt tick.
- **`CalendarLeaf`** (Next time off S: month + day, 36).

## Open questions
Q-5 (where the Skip order is kept), Q-6 (the per-day automation read) — in `handoffs/2026-11-11-home/QUESTIONS-to-add.md`. Both are about storage only; the design does not change. Neither blocks.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** the widgets on `/dashboard` — `components/modules/home/widgets/`. Built 2026-11-11, **not yet
  looked at in a browser**.
- **Differs from the design:**
  - **My time (§ 4) and To sign (§ 7) are not built** (the owner).
  - **Waiting on you's cards are the kinds with a module** (the owner): time off and its cancellation, an
    automation's approval, tasks, review steps, and for HR a failed automation run. Expense, attendance correction,
    document, missing data, policy, answered request and announcement arrive with their modules. A failed run offers
    **Fix it only** — a run has no "read" state to mark.
  - **Approve's Undo delays the answer** (the owner): it is held five seconds and sent when the toast closes.
  - **Mark done** is offered only for a task with nothing to fill (to do, acknowledge); others offer Start.
  - **Who's out Large** shows Monday to Friday but has data only from today on (the read is "the rest of the week");
    the "Upcoming" filler in the free space is not built.
  - **My team / Everyone** is remembered in the browser, not on the server.
  - **Next time off Small** shows the countdown at 44; the calendar leaf sits where the title's link would.
- **Images of the real screen:** owed by the first walk.
