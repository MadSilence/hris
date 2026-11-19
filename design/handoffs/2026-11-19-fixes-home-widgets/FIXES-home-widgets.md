# Design fixes — Home widgets, every state (round 1)

For Petya's Claude Code. Same rules as the Home, Company hub and misc packages. Ulia asked for every widget in every state and size to match the board exactly.

## How to use this package

- **This file.** Each fix gives exact values (px, hex, size/line height/weight) and the words.
- **`board/`** holds the approved boards. They are the same files as `design/screens/home-widgets/export/` in the repo, and the same as the "Home dashboard" design artifact (Ready for handoff).
  - `LW*.html` with a full-page PNG of each.
  - `LW06-states/` crops each state of This week (S, M, L side by side).
  - Open the HTML in Chrome and inspect any element for a value this file does not spell out.
- **`references/HF02-home-light@1710/1470`** shows the Light top (H1).
- **`now/`** holds screenshots of the live widgets in the same states, taken 19 Nov at 1710. Most show S and M on top and L under them, at 1.5×.
- **How it was checked.**
  - Each state was produced in the live app at 1710 × 1112 by putting the board's data into the page's query cache: names, counts, dates, overdue, many, empty.
  - Each widget was checked in S, M and L, plus loading (API slowed) and error (API 500).
  - So every "Now" below is the real component with board data.
- **Precedence:**
  - A number in this file wins over the HTML.
  - The HTML wins over a vague sentence.
  - The board wins over `design/screens/home-widgets/spec.md` where they differ. The spec lines are in `spec-updates` at the end.
- **Change nothing that isn't listed.**
- **Overlap with packages already sent:**
  - Confetti: misc T2.
  - Today's sentence in This week: misc T1.
  - Light-top greeting: misc L1.
  - Those rows still stand and are not repeated here, except where this pass found more.

| Name | Value |
|---|---|
| Ink | #0B0B0C |
| text-secondary | #45454A |
| text-tertiary | #6B6B70 |
| border-divider | #EAEAEC |
| border-field | #DADADF |
| gray fill | #F3F3F5 |
| Mist | #F7F7F8 |
| accent | #6E1630 |
| accent-subtle | #F6F1F3 |
| Pending text | #7A4800 |
| Error text | #A12215 |

---

## A. Shared (fix once)

| # | Where | Now | Must be |
|---|---|---|---|
| A1 | **Avatars with initials in every widget** | Initials **500**, 11–13 px whatever the size, Ink or #45454A. The colour depends on the widget: the first person in This week is grey #F3F3F5/#45454A, Waiting and Who's out use Ink on a tint | **One rule.** The tag tint is picked per person, always the same for that person: berry #FBE7ED/#661642, ocean #E4EBF2/#14426B, indigo #E7E8F5/#2A2D79, teal #E3F3F3/#0B5257, sand #F5EBDD/#6B4410, plum #ECE6EF/#441F56. Initials **600**, about a third of the avatar: **22 → 8 px, 24 → 9, 28 → 10–11, 32 → 11, 36 → 12, 44 → 14, 48 → 15, 64 → 20**. A 2 px white ring where faces overlap. |
| A2 | **Small-size layout** (Waiting on you, Who's out, Processes, Automations, This week with 4+ today) | Number row right under the title; faces or status chip on the **next line, on the left** | As the boards: the title row on top, then **one bottom row** at the card's bottom. The number (Inter Tight 44/44 400) + 8 + the word (14/20 #45454A) sit on the left. The faces (28, step 20) or the status chip (24 high, 12/20 500) sit **on the right of the same row**. |
| A3 | **Links in Small** | Waiting S shows "Inbox"; Processes S shows "All"; Automations S has no "See all" | As the boards. **Waiting S: no link. Processes S: no link. Automations S: "See all".** Time off S: see C2. Who's out S: the scope word "My team" / "Everyone" 12/20 400 #6B6B70 (as now). |
| A4 | **Rows with two lines** (Waiting M, Who's out M, To sign M/L, My tasks M/L, Processes) | Name 14/20, line 12/16; row padding 10 0 or 10 8; gap 12 | Name **14/18** 500 Ink; line **12/18** 400 #6B6B70; row padding **9 0** (Processes L 12 0), gap **10**; a hairline 1 px #EAEAEC between rows (To sign: above every row). The hover fill may extend 8 to each side, but the content must not shift. |
| A5 | **Dates with a weekday** | "Fri 20 Nov", "Due Fri 20 Nov", "Agree by Wed 2 Dec", "Sign by Fri 27 Nov" | SPEC § 1: **"Fri, 20 Nov"**, with a comma. So: "Due Fri, 20 Nov", "Next due Fri, 13 Nov", "Agree by Wed, 2 Dec", "Sign by Fri, 27 Nov", "Fri, 4 Dec". Ranges keep the board form: "Fri 4 – Mon 7 Dec", "Thu 12 → Sat 14 Nov" (Waiting card). |
| A6 | **Days inside this week** (This week M, My tasks, Who's out M) | "19 Nov", "Fri 20 Nov", "back Sat 21 Nov" | The **weekday only** while it is this week: This week M "Thu" / "Sat"; This week L "Thu 12"; My tasks "Thu · Onboarding", "Overdue / Mon"; Who's out M "back Thu". Today: "Today" / "today". **Replaces H3 of the Home package ("21 Nov"): the board was changed since.** |
| A7 | **Year in dates** | "8 Jan 2027", "16–20 Feb 2027", "back Mon 4 Jan 2027" | No year (boards: "8 Jan", "back 4 Jan"). |
| A8 | **Relative time** | "15 hr. ago" | **"15h ago"**, "2h ago", "Yesterday", "Mon" (board). |
| A9 | **Leave type words** (Time off, Next time off, Who's out) | The **policy name**: "annual leave days", "days to your annual leave", "Standard Sick Leave", "Rūta · Vacation" | The **leave type**, lower case inside a sentence: "vacation days", "days to your vacation" (S: "days to vacation"), "Sick leave", "Personal", "Rūta · vacation", "Marius · parental leave". A name too long to fit falls back to "days to your time off" (board note). |

## T. This week (LW06) — `board/LW06-states/`

Every state was checked in S, M and L.

| # | State · size | Now | Must be |
|---|---|---|---|
| T4 | One today · **S** (`now/week-one-today-S`) | Avatar 36 grey; sentence Inter Tight 16/22 **400** on one line, starting 8 under the title, so it runs under the confetti; "+3 more this week" as text only, 12/16 #6B6B70; card gap 8 | Card gap **12**, an empty spacer, then the row at y 70: avatar 36 (A1), 10, sentence **Inter Tight 16/20 500** in a 168 column, wrapping to up to 2 lines (misc T1). Bottom row: **3 faces 22** (step 14, white ring) + 8 + "+3 more this week" **12/20 #45454A** (dotted underline; hover = the list). |
| T5 | One today · **M** | Avatar 36, sentence 19/24 **400**, gap 12; "Later this week" → rows 4 | Avatar **44** (14/600), gap **10**, sentence **Inter Tight 19/23 500**. Then a full-width hairline, 12, "Later this week" 12/16 500 #6B6B70, **12**, rows (T8). |
| T6 | One today · **L** | The left column is **top-aligned**; sentence 24/28 **400**; **no vertical hairline**; right rows on one line ("Tomas · 5 years", "19 Nov") | Left column 218 wide, **bottom-aligned**: avatar 64 (20/600), 10, sentence **Inter Tight 24/28 500**. A **vertical hairline** 1 px #EAEAEC, 24 on each side. Right column: "Later this week" 12/20 500 #6B6B70, 10, rows **on two lines**: avatar **28**, 10, name 13/17 500 Ink / what 12/17 #6B6B70; day "**Thu 12**" 12/20 500 accent on the right. Rows 34 high, **12** apart. |
| T7 | Two today · **M** (`now/week-two-today-M`) | "2 celebrations today" **13/18 500 Ink**; both people in **one** tinted block (padding 4 8), avatar 22, gap 10 | Label "2 celebrations today" **12/16 500 #6B6B70**. Each person is **their own pill**: #F6F1F3, radius 12, padding 5 10 5 6, 34 high, **6** apart; avatar 24, gap 8; "Marta" 13/22 500 + "· birthday" #6B6B70, "Today" 13/22 500 accent on the right. |
| T8 | Later rows · **M** (every state) | 36 high (padding 6 8), avatar 24, gap 10 | **32** high (padding 4 0), **6** apart, avatar 24 (9/600), gap **8**; name 13/22 500 Ink + "· what" 13/22 #6B6B70; day 13/22 500 accent (A6). The list scrolls inside with a fade (now OK). |
| T9 | Two / three today · **L** (`now/week-three-today-SML`) | Title at the top; one tinted block with small rows "Marta · birthday … Today" | Left column **bottom-aligned**: "3 celebrations today" **Inter Tight 24/28 500**, 12, then **one pill per person**: #F6F1F3, radius 12, padding 6 12 6 6, 44 high, 6 apart; avatar **32** (11/600, white ring), 10, name **14/20 500** Ink + what 14/20 400 #6B6B70. **No "·" and no "Today"** on these pills. Up to 3 people by name in L. |
| T10 | Four or more today · **S** (`now/week-five-today-SML`) | Faces about 22 on their own line; "5 celebrations today" below in Inter 14 600; "+5 more this week" #6B6B70 | Faces **32** (11/600, step 24, "+2" a 32 #F3F3F5 circle 11/600 #45454A) + 10 + "5 celebrations today" **Inter Tight 16/20 500, beside the faces** (wraps to 2 lines). Under it "+5 more this week" 12/16 **Ink** with a dotted underline; hover = the list "Later this week" (name · what, day in accent). |
| T11 | Three or more today · **M** | No label; faces 22; "5 celebrations today" in bold below | Label "**Today**" 12/16 500 #6B6B70, then one row: faces **28** (10/600, step 20) + 10 + "**5 celebrations**" 14/20 500 Ink. Hover the faces or "+N" → tooltip "Today" listing everyone. |
| T12 | Four or more today · **L** | Small faces at the top; sentence 24 **400** at the top | Bottom-aligned: faces **48** (15/600, step 40) + 10 + "5 celebrations today" Inter Tight 24/28 500. "+2" hover → tooltip "Today" + everyone (name · what). |
| T13 | Nothing today, some later · **S** | "Tomas · 5 years", "19 Nov" 13 | Rows 22 high, 6 apart: avatar 22 (8/600), 8, "Tomas" 13/22 500 + "5 years" 13/22 #6B6B70 (**no "·"**); day "Thu" **12/22** 500 accent. Lead "Nothing today · coming up this week" 12/16 #6B6B70 (OK). |
| T14 | Nothing today · **L** (`now/week-nothing-today-SML`) | "Nothing to celebrate today" 14/20 at the top; "Coming up this week →" as an **accent** link; **no vertical hairline** | Bottom-aligned: "Nothing to celebrate today" **Inter Tight 20/24 500 #45454A** (2 lines), 6, "Coming up this week" **13/18 400 #6B6B70** + chevron-right 14 (gap 4; plain text, not a link colour). The vertical hairline is there in **every** L state. |
| T15 | Many this week · **S** (`now/week-many-SML`) | "+6 more this week" without faces | Faces 22 in front (as T4). |
| T16 | Nothing this week · **S** | "Nothing this week" 14/20 #6B6B70 | **"Nothing to celebrate this week."** 13/18 400 #45454A, at the bottom of the card. M and L are OK. |
| T17 | Long names · S/M/L (`now/week-long-names-SML`) | S runs under the confetti (T4); list rows cut with … | With T4 fixed, OK. Keep the tooltip on cut rows. |

Loading (skeleton after 2 s) and error ("Couldn't load celebrations" / Try again) are OK.

## W. Waiting on you (LW01, LW01b) — `board/LW01-waiting`, `board/LW01b-cards`

| # | Where | Now | Must be |
|---|---|---|---|
| W1 | **S** (`now/waiting-3-requests-SML`) | Inbox link; faces below the number | A2 + A3: no link; "3" + "requests" on the left, faces 28 on the right, on the bottom row. |
| W2 | **M** subtitle | "3 need your answer" 14/20 #45454A | "3" **13/20 600 accent** + "need your answer" **13/20 400 #6B6B70**, gap 8. |
| W3 | **M** rows | Line "Time off · 3 days · 19–21 Nov" | Board words: "**3 days vacation · 12–14 Nov**" (days + type, then dates), "Expense · €84.20", "Sick day · today". Sizes A4. |
| W4 | **M** "Review 3 requests" | No icon | With the **nod ring** before the text: a 10 ring, 2 px #D6BEC5 (as on Approve). |
| W5 | **L** progress | "1 of 3" 13/18 500; segments 6 apart, track #F3F3F5 | "1 of 3" **13/20 600** accent, 10 to the bar. Segments 4 high, **4** apart, track **#EAEAEC**. |
| W6 | **L card header, every kind** (`now/waiting-cards-1`, `-2`) | One line: "Lena Novak wants 3 days", "A page needs your yes", "A document waits for your signature", "Automation didn't run" | **Two lines.** Line 1: avatar 20 (when a person) + name or object **14/18 600** Ink. Line 2, under it: the action **13/18 #6B6B70**. Time on the right 12/20 #6B6B70 (A8). Card gap **4** (now 12).<ul><li>Time off: "Lena Novak" / "**wants 3 days of vacation**".</li><li>Task: "Set up Ana's laptop" / "Onboarding · Ana Silva".</li><li>Review: "Q4 review" / "your self-review".</li><li>Sign: "Remote work policy" / "from Inga Ozola · to sign" (board says "from HR"; the product never says "HR", so use the sender's name).</li><li>Failed run: "Automation" / "didn't run".</li></ul> |
| W7 | L time off title | "Thu 19 – Sat 21 Nov" | "**Thu 19 → Sat 21 Nov**": an arrow, Inter Tight 22/28 500. |
| W8 | L "someone else is out" line | 13/18 **500** | 13/18 **400** #7A4800. |
| W9 | L Skip | Chevron-left | "**←**" arrow-left 14 + "Skip" 13/20 500 #45454A. |
| W10 | Task card | "**Due Today**" (capital T); button "Start" for a plain task | "**Due today**" (with the time when there is one: "Due today, 10:00"); line "Assigned by {name}". A plain task gets "**Mark done**" (primary sm, check icon 16) as on the board; "Start" only for a review. |
| W11 | Review card | Title "Due Sat 21 Nov"; line = the person's own name ("Ulia Tykoon") | Title "**Due in 3 days**" (today: "Due today"); chips "{n} questions" and "Your manager sees it after you send" (Mist chips, 12/20). Never the reader's own name. |
| W12 | Sign card | Title = document name; line "Sign by Fri 27 Nov" | Title "**Sign by Fri, 27 Nov**"; the document name moves to the header (W6); chips "{n} pages" and "Takes about {n} minutes" when known. |
| W13 | Failed automation card | Only "Fix it" | **"Mark as read"** (secondary sm) + "Fix it" (primary sm), 8 apart (board "Something failed"). |
| W14 | Time-off chips (nobody else out) | "3 days" | "**3 working days**" (when the policy counts working days; otherwise "3 days") + "12.5 days left after" (OK). |
| W15 | **Page to agree** card (Ulia, 19 Nov: as the board "Policy to confirm", but **no agreeing from Home** and the title is the date) | Header "A page needs your yes"; title = page name; line "Agree by Fri 27 Nov"; button "Read" | Header line 1 the page name (14/18 600) with the page icon tile, line 2 "**was updated**" (13/18 #6B6B70); title "**Agree by Fri, 27 Nov**" (Inter Tight 22/28 500; the page's agree-by date, A5; Ulia, 19 Nov — not "Read and confirm"; an overdue page keeps the wording the app already has for overdue); line "**What changed: {points}**" 13/18 #6B6B70 (the page's What changed points, joined with commas; left out when the page has none); button "**Read and agree**" (primary sm). The button **only opens the page** (`/hub/handbook/{id}`); the person agrees there, with "I agree" in the page's agree bar. **Nothing on Home records an agreement** — the product must be sure the page was opened and read. The card leaves the deck once the person has agreed on the page. A click anywhere else on the card opens the page too. Skip as on every card. |

## C. Time off (LW02) — `now/timeoff-SML`

| # | Where | Now | Must be |
|---|---|---|---|
| C1 | Words | "annual leave days", "Standard Sick Leave" | A9: "vacation days", "Sick leave", "Personal". |
| C2 | **S** | 20 title; button 36, 14/20; gap 8 | The header is a **small label** "Time off" 13/20 500 #6B6B70 + "My time off" 13/20 500 accent; number row 2 under it; button "Request time off" **32** high, 13/20 500, full width; card gap 12. |
| C3 | Other types (M, L) | 14/20; value 500 Ink; padding 12 | **13/18** 400 #45454A; value "**2** days left" (number 600 Ink, words #45454A); "No limit" 13/18 400 #45454A; hairline then padding **10**, rows 4 apart. |
| C4 | M request chip and "+N" | Chip padding 0 12; "+3" a 37 × 32 pill #F3F3F5 13/18 | Chip 36 high, padding **0 14 0 12**; pending = **1 px dashed** accent on white; approved = Mist. "+2" = a **36 circle**, #F7F7F8, 12/20 500 #45454A. |
| C5 | M "+N" opened | The same pills as on the card | Board "+2 opened": **plain rows** 32 high, padding 0 8, radius 8 (hover #F7F7F8); date 13 500 Ink on the left, status (icon 14 + word, 12 500) on the **right**; a hairline; "All in My time off" 32 high, 13 500 accent. |
| C6 | **L** | Number 72/76; columns 24 apart; "Coming up" 12/16 600; status right after the date; "4 Dec"; "8 Jan 2027"; "+1 more" a grey pill button; "Request time off" full column width | Number **72/72**; columns **28** apart; "Coming up" 12/20 **500** #6B6B70. Rows 36 high, radius full, padding **0 18 0 16**, date on the left and status **right-aligned**; pending 1 px dashed. A one-day request with its weekday: "**Fri, 4 Dec**"; no year (A7). "+2 more" = **plain accent text** 12/20 500, padding-left 16. "Request time off" **hugs its text** and sits **at the bottom right**. |

## N. Next time off (LW03) — `now/next-time-off-states`

| # | Where | Now | Must be |
|---|---|---|---|
| N1 | Words | "days to your annual leave" | A9: "days to your vacation" (S: "days to vacation"). |
| N2 | M status chip | 20 high, 12/16 600, padding 0 6 | **24** high, 12/20 **500**, padding 0 8 0 6, icon 14. |
| N3 | M range line | 13/18 500 | 13/20 **400** #45454A, calendar icon 14, gap 6. |
| N4 | M line under the number | 14/20 400 #45454A | **14/20 600 Ink**. |
| N5 | Holiday | Chip **blue** #ECF1FA/#2F63C4 with a clock icon; "Thu 24 – Sat 26 Dec" | Chip **teal** (Scheduled) #E3F3F3 / #0B5257 with the **calendar** icon, "Holiday". Range "**24 – 26 Dec · 3 days**". |

Tomorrow ("Tomorrow"), on the day ("Enjoy your time off", no number), empty, loading and error are OK.

## O. Who's out (LW05) — `now/whos-out-SML`, `now/whos-out-states`

| # | Where | Now | Must be |
|---|---|---|---|
| O1 | **S** | Faces under the number | A2. |
| O2 | M switch | Stretched across the card (234) | **Hugs** its two words (about 147), left-aligned. |
| O3 | M rows | One line under the name "Vacation · back Sat 21 Nov" 12/16; a pending person in **amber** | Under the name, the **type only** 12/18 #6B6B70 ("Vacation", "Sick day", "Parental leave"). The return goes **on the right**, 12/20 #6B6B70: "back Thu", "back Mon", "back 4 Jan"; a one-day leave today: "**today**". No amber in this list. Sizes A4, avatar 28. |
| O4 | **Return day — logic bug** | Lena out until Fri → "back **Sat** 21 Nov". Tomas, a sick day today → "back Fri 20 Nov" | "back" is the **next working day** (skip weekends and the person's public holidays): out until Fri → "back Mon". A one-day leave that is today → "today". |
| O5 | L bars | Avatar 26 **tinted in another colour** than the bar, initials 12/500; gap 8; "Rūta · Vacation" | Avatar 26 = a **white** circle with initials 10/600 in the bar's ink colour; padding 0 3, gap **6**; label 13/20 500 "Rūta · **vacation**" (A9). Pending bar: **1 px dashed** in the bar's ink on white (now 1.5 px). |
| O6 | L leave running past the week | "Marius · Parental leave, back Mon 4 Jan 2027" | "Marius · parental leave, back 4 Jan →": no round end on the right, the bar fades out at the card's edge (OK), "→" after the text. |
| O7 | L "Upcoming" | Shown under a **full** week: the "Upcoming" title with nothing under it, or "No leave scheduled" | Upcoming appears **only when few people are out** this week (board: the one-person states). With the rows filling the card, there is no Upcoming block. |
| O8 | L many (Everyone) | One row per person | People whose days don't overlap **share a row** (board: Rūta Mon–Wed + Lena Thu–Fri on one row; Marta + Jonas on one row). The list scrolls with a fade (OK). |

## S. To sign (LW07) — `now/to-sign-SML`

| # | Where | Now | Must be |
|---|---|---|---|
| S1 | Dates | "Due Fri 20 Nov", "Next due Fri 20 Nov" | A5: "Due Fri, 20 Nov". |
| S2 | Number | 40/44 | 40/**40**. |
| S3 | Rows | Padding 10 0, gap 12 | A4; a hairline **above every row**, the first one too. |
| S4 | L rows | Name only | Second line "**From {sender}**" 12/18 #6B6B70 (the person's name; never "HR"). File tile 32 (radius 8, accent-subtle) on the left; due date 13/20 #6B6B70, then 12, then Sign. |

## K. My tasks (LW08) — `now/my-tasks-SML`

| # | Where | Now | Must be |
|---|---|---|---|
| K1 | S count | "2 due today" with one task today and one overdue | Counts **today's** tasks only: "1 due today" (board). |
| K2 | Checkbox | 1.5 px border at **opacity 0.5**, so it looks disabled | 18 round, white, **1 px #B4B4BA**, full opacity (product rule: nothing looks disabled). Done: accent fill with a white check (OK). |
| K3 | Rows | Name 14/20, line 12/16, gap 12, padding 10 0 | A4. |
| K4 | Days | "Fri 20 Nov · Onboarding"; right "Mon 16 Nov" | A6: "Thu · Onboarding"; overdue on the right "Overdue" / "Mon". |
| K5 | Overdue row | The date in the line **and** on the right; red #C42B1C | Line = the process only ("Offboarding"); right "Overdue" 12/16 500 **#A12215**, the day under it 12/16 #6B6B70. |
| K6 | Done row | No line under the name | "**Done · {process or source}**" ("Done · Documents"), name struck through in #6B6B70 (OK). |
| K7 | L rows | Line "Onboarding"; today's task shows "Today" on the right | Line "**Onboarding · Ana Silva**" (process · person); a task due today with a time shows the **time** ("10:00") on the right; this week "Thu", "Fri" (A6). |

## P. Processes (LW09) — `now/processes-SML`

| # | Where | Now | Must be |
|---|---|---|---|
| P1 | **S** | "All" link; overdue chip on its own line | A2 + A3: no link; "3 in progress" on the left, "1 overdue" chip on the right of the bottom row. |
| P2 | **L** | The Medium layout stretched: avatar on the left, name, line, a thin bar under them | Board: one row per person, 60 high, padding 12 0, gap 16. Left: name 14/18 500 + line 12/18 in a **150** column. Middle: the **lane**, a 6-high #F3F3F5 track with the type-colour fill, and the person's **avatar 28 riding on the end of the fill**. Right: "4/12" 14/20 #45454A. |
| P3 | L status chips | "1 onboarding", "1 offboarding", "2 start next week" (an offboarding that **ends** next week is counted as starting) | Board: "{n} onboarding" (In progress), "{n} starts next week" (Scheduled, preboarding only), "{n} overdue" (Pending). An offboarding is not "starting". |
| P4 | Preboarding line | "Preboarding · starts 23 Nov" in M and L | M "Preboarding · starts 23 Nov" (OK); L "**Preboarding · 23 Nov**". |

## U. Automations (LW10) — `now/automations-SML`

| # | Where | Now | Must be |
|---|---|---|---|
| U1 | **S** | No "See all"; "1 failed" on its own line | A3: "See all"; bottom row "144 runs" on the left, "1 failed" chip (Error) on the right. |
| U2 | **L chart** | One thin column of large, sparse dots per day, so a busy week looks almost empty | Board: **one 5 px dot per run**. Each day is a 32-wide, 190-high column: `display:flex; flex-wrap:wrap-reverse; align-content:flex-start; gap:3px`, so the dots fill **from the bottom, 4 across**. Colour #D3D3D8; today accent; a failed run is a red dot (#C42B1C) on top. Label 12/20 #6B6B70 under it; "Today" 600 accent. Columns 36 wide, 1 apart. **A day with more runs than fit** (Ulia, 19 Nov): the column is shown **full** — as many dots as fit (4 across × 24 rows = 96) — and the exact numbers are in the hover tooltip ("Today · 312 runs" / Ran fine / Failed / Skipped, as on the board's "Hover a day"). A failed run is still a red dot on top. The other days keep one dot per run. |

## H. Home header

| # | Where | Now | Must be |
|---|---|---|---|
| H1 | **Light top greeting** (`now/home-light-top`, `references/HF02-home-light@1710`) — Ulia, 19 Nov: still wrong | "Good evening, Ulia" is an **h1 in Inter 14/20 400**, the size of body text | As HF02 and misc L1: date 500 accent, then **10**, greeting **Inter Tight 52/56 500, letter-spacing −0.02em, Ink**, one line. Only the colours differ from the Color top. |
| H2 | My profile pill (Light top) | Border #DADADF; "My profile" 400; initials 12/16 500 | Border **#EAEAEC**; "My profile" **500** Ink; avatar 34 with initials **11/600** (tag tint, A1). |

## Q. Ulia's decisions (19 Nov)

- **Empty-state pictures inside widgets stay at 96, as the boards** (celebrations in This week, all-caught-up in Waiting, and the other widgets' empty states), although those scenes have no `-s` file. Widgets are the exception to the "no scene without `-s` under 160" rule; full pages keep the rule.
- **Page to agree on Home:** W15 — title "Agree by {date}", button "Read and agree" that only opens the page; agreeing happens only on the page, never from Home.
- **Automations, a day over the limit:** U2.

## R. Not built yet / for you to check (Petya)

- **My time (LW04)**: the widget is not in the catalogue yet. The board has every state.
- Waiting card kinds on the board that the app has no source for yet: **Expense**, **Attendance correction**, **Missing data** ("Emergency contact"), **Your time off was approved**, **Announcement**. Tell us which come with which module.
- **Skeletons**: they show after 2 s (OK), but as generic rows. Board: each widget's skeleton in its own shape (each LW board, "Loading").

## spec-updates (`design/screens/home-widgets/spec.md`)

- § 6 This week: days in lists follow A6 ("Thu" in M, "Thu 12" in L).
- § 2/3/5 Words: leave type names, not policy names (A9).
- § 1 Waiting: card header on two lines (W6); Review / Sign / Task card words (W10–W12); failed run has "Mark as read".
- § 5 Who's out: "back" = next working day; Upcoming only with few people out.
