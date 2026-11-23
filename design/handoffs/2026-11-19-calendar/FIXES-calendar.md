# FIXES — calendar and the profile Time off tab (19 Nov 2026)

How this was made: the design was approved frame by frame by Ulia on the board "noddo · Calendar" (19 Nov). It was **not** tested against the live app in this round; § 0–1 list what the profile check of 19 Nov already found live (Reza Karimi, admin view, 1710 × 1112 and 1470 × 956). Everything else is the new design: build it from `screens/`, the measurements and the components, 1:1.

Words everywhere: noddo voice & tone guide; toasts and field errors have **no period**; US spelling ("canceled"); a string approved once is reused word for word ("Request sent to Meryem" follows the approved "Request sent to Reza"); sentence case; dates "Mon 23 Nov", no year in the current year; demo policy names in sentence case ("Annual leave", not "Annual Leave").

**Scope (Ulia, 19 Nov):** this round designed the **calendar** — the company calendar and the calendar on the profile's Time off tab, with the request and the request opened in full. It is not the time off feature's design: some time off states and corner cases are missing on purpose and come with the time off feature. Build what is drawn; where something isn't drawn, keep what the product does today (see `screens/profile-time-off/spec.md` § Not in this round).

## § 0 Fix first (broken behaviour found live)
- F0.1 **Requests reach nobody.** Approvers are empty in the data (`timeOff/approvers` → `deciders: []`), so "Goes to {approver}" never shows and nobody gets a request. Every request must have its approver (the person's manager by default) and the request window shows "Goes to {Name}".
- F0.2 **Who's out opens the profile.** On Home › Who's out a person must open the calendar filtered to them: `/calendar?person={id}`, visible and clearable as the Person chip (board N21). Now chips link to `/organization/people/{id}/personal`; Upcoming rows aren't clickable.

## § 1 Differences already seen live → the new design
- F1.1 Leave on the profile calendar is a 60-high solid dark bar with white text over the day numbers and a native tooltip → the leave pills (leave colours; approved fill / pending dashed), no tooltip, the compact card on click (Q01–Q03).
- F1.2 The profile calendar's look, the side panel and its place → Q01: the time off card on the **left** (340), the calendar on the right with no card frame.
- F1.3 Balance number 18/26 → **24/28** Inter Tight 600 with the unit under it.
- F1.4 Request dialog (800 with "23 d" / "19 d" / "Duration 4 days") → the request window Q13–Q17 (520): policy, a month calendar, one balance row ("−3 working days" · "15 / days left after"), Note · Optional, Goes to, Request 3 days.
- F1.5 Demo policy names "Annual Leave", "Standard Sick Leave" → sentence case.
- F1.6 Policy colour everywhere → the leave colours and the "dot on a tint" marker (`2-product-wide/screens/leave-colours`).
- F1.7 Profile header → `2-product-wide/screens/profile-header` (overrides profile package P1–P8 where they differ).
- F1.8 Filter popover → `2-product-wide/screens/filter` (every FilterPopover and ConditionBuilder).

## § 2 Decided / new screens
| Board frame | Folder | Spec |
|---|---|---|
| N01-Month | `1-calendar/screens/company-calendar/export/N01-Month.html` · `images/N01-Month.png` | `1-calendar/screens/company-calendar/spec.md` |
| N02-Week | `1-calendar/screens/company-calendar/export/N02-Week.html` · `images/N02-Week.png` | `1-calendar/screens/company-calendar/spec.md` |
| N03-Hover | `1-calendar/screens/company-calendar/export/N03-Hover.html` · `images/N03-Hover.png` | `1-calendar/screens/company-calendar/spec.md` |
| N04-Open | `1-calendar/screens/company-calendar/export/N04-Open.html` · `images/N04-Open.png` | `1-calendar/screens/company-calendar/spec.md` |
| N05-OpenPending | `1-calendar/screens/company-calendar/export/N05-OpenPending.html` · `images/N05-OpenPending.png` | `1-calendar/screens/company-calendar/spec.md` |
| N06c-GroupedThick | `1-calendar/screens/company-calendar/export/N06c-GroupedThick.html` · `images/N06c-GroupedThick.png` | `1-calendar/screens/company-calendar/spec.md` |
| N07-GroupMenu | `1-calendar/screens/company-calendar/export/N07-GroupMenu.html` · `images/N07-GroupMenu.png` | `1-calendar/screens/company-calendar/spec.md` |
| N08-View | `1-calendar/screens/company-calendar/export/N08-View.html` · `images/N08-View.png` | `1-calendar/screens/company-calendar/spec.md` |
| N08b-ManyViews | `1-calendar/screens/company-calendar/export/N08b-ManyViews.html` · `images/N08b-ManyViews.png` | `1-calendar/screens/company-calendar/spec.md` |
| N08c-ReorderViews | `1-calendar/screens/company-calendar/export/N08c-ReorderViews.html` · `images/N08c-ReorderViews.png` | `1-calendar/screens/company-calendar/spec.md` |
| N09b-FilterWide | `1-calendar/screens/company-calendar/export/N09b-FilterWide.html` · `images/N09b-FilterWide.png` | `1-calendar/screens/company-calendar/spec.md` |
| N09c-ManyFilters | `1-calendar/screens/company-calendar/export/N09c-ManyFilters.html` · `images/N09c-ManyFilters.png` | `1-calendar/screens/company-calendar/spec.md` |
| N09d-MoreOpen | `1-calendar/screens/company-calendar/export/N09d-MoreOpen.html` · `images/N09d-MoreOpen.png` | `1-calendar/screens/company-calendar/spec.md` |
| N10-SaveView | `1-calendar/screens/company-calendar/export/N10-SaveView.html` · `images/N10-SaveView.png` | `1-calendar/screens/company-calendar/spec.md` |
| N10c-Share | `1-calendar/screens/company-calendar/export/N10c-Share.html` · `images/N10c-Share.png` | `1-calendar/screens/company-calendar/spec.md` |
| N10d-LinkCopied | `1-calendar/screens/company-calendar/export/N10d-LinkCopied.html` · `images/N10d-LinkCopied.png` | `1-calendar/screens/company-calendar/spec.md` |
| N11-Scrolled | `1-calendar/screens/company-calendar/export/N11-Scrolled.html` · `images/N11-Scrolled.png` | `1-calendar/screens/company-calendar/spec.md` |
| N12-Search | `1-calendar/screens/company-calendar/export/N12-Search.html` · `images/N12-Search.png` | `1-calendar/screens/company-calendar/spec.md` |
| N13-NoResults | `1-calendar/screens/company-calendar/export/N13-NoResults.html` · `images/N13-NoResults.png` | `1-calendar/screens/company-calendar/spec.md` |
| N14-NoMatch | `1-calendar/screens/company-calendar/export/N14-NoMatch.html` · `images/N14-NoMatch.png` | `1-calendar/screens/company-calendar/spec.md` |
| N16-Loading | `1-calendar/screens/company-calendar/export/N16-Loading.html` · `images/N16-Loading.png` | `1-calendar/screens/company-calendar/spec.md` |
| N17-Error | `1-calendar/screens/company-calendar/export/N17-Error.html` · `images/N17-Error.png` | `1-calendar/screens/company-calendar/spec.md` |
| N18-NoAccess | `1-calendar/screens/company-calendar/export/N18-NoAccess.html` · `images/N18-NoAccess.png` | `1-calendar/screens/company-calendar/spec.md` |
| N19-Long | `1-calendar/screens/company-calendar/export/N19-Long.html` · `images/N19-Long.png` | `1-calendar/screens/company-calendar/spec.md` |
| N20-ManyPeople | `1-calendar/screens/company-calendar/export/N20-ManyPeople.html` · `images/N20-ManyPeople.png` | `1-calendar/screens/company-calendar/spec.md` |
| N21-OnePerson | `1-calendar/screens/company-calendar/export/N21-OnePerson.html` · `images/N21-OnePerson.png` | `1-calendar/screens/company-calendar/spec.md` |
| N22-WeekHoliday | `1-calendar/screens/company-calendar/export/N22-WeekHoliday.html` · `images/N22-WeekHoliday.png` | `1-calendar/screens/company-calendar/spec.md` |
| N23-LongHoliday | `1-calendar/screens/company-calendar/export/N23-LongHoliday.html` · `images/N23-LongHoliday.png` | `1-calendar/screens/company-calendar/spec.md` |
| N24-Air13 | `1-calendar/screens/company-calendar/export/N24-Air13.html` · `images/N24-Air13.png` | `1-calendar/screens/company-calendar/spec.md` |
| N25-OneOffice | `1-calendar/screens/company-calendar/export/N25-OneOffice.html` · `images/N25-OneOffice.png` | `1-calendar/screens/company-calendar/spec.md` |
| Q01-Month | `1-calendar/screens/profile-time-off/export/Q01-Month.html` · `images/Q01-Month.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q02-Open | `1-calendar/screens/profile-time-off/export/Q02-Open.html` · `images/Q02-Open.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q03-OpenPending | `1-calendar/screens/profile-time-off/export/Q03-OpenPending.html` · `images/Q03-OpenPending.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q05-Many | `1-calendar/screens/profile-time-off/export/Q05-Many.html` · `images/Q05-Many.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q05b-MoreThanTwo | `1-calendar/screens/profile-time-off/export/Q05b-MoreThanTwo.html` · `images/Q05b-MoreThanTwo.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q05f-WeekStrip | `1-calendar/screens/profile-time-off/export/Q05f-WeekStrip.html` · `images/Q05f-WeekStrip.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q06-LongLeave | `1-calendar/screens/profile-time-off/export/Q06-LongLeave.html` · `images/Q06-LongLeave.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q07-Long | `1-calendar/screens/profile-time-off/export/Q07-Long.html` · `images/Q07-Long.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q08-NoPolicy | `1-calendar/screens/profile-time-off/export/Q08-NoPolicy.html` · `images/Q08-NoPolicy.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q09-Loading | `1-calendar/screens/profile-time-off/export/Q09-Loading.html` · `images/Q09-Loading.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q10-Error | `1-calendar/screens/profile-time-off/export/Q10-Error.html` · `images/Q10-Error.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q11-OwnView | `1-calendar/screens/profile-time-off/export/Q11-OwnView.html` · `images/Q11-OwnView.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q12-PickDays | `1-calendar/screens/profile-time-off/export/Q12-PickDays.html` · `images/Q12-PickDays.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q13-Request | `1-calendar/screens/profile-time-off/export/Q13-Request.html` · `images/Q13-Request.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q14-RequestShort | `1-calendar/screens/profile-time-off/export/Q14-RequestShort.html` · `images/Q14-RequestShort.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q15-RequestLong | `1-calendar/screens/profile-time-off/export/Q15-RequestLong.html` · `images/Q15-RequestLong.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q16-RequestHalfYear | `1-calendar/screens/profile-time-off/export/Q16-RequestHalfYear.html` · `images/Q16-RequestHalfYear.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q17-RequestEmpty | `1-calendar/screens/profile-time-off/export/Q17-RequestEmpty.html` · `images/Q17-RequestEmpty.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q18-Requested | `1-calendar/screens/profile-time-off/export/Q18-Requested.html` · `images/Q18-Requested.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q20-BalanceHistory | `1-calendar/screens/profile-time-off/export/Q20-BalanceHistory.html` · `images/Q20-BalanceHistory.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q21-AdjustBalance | `1-calendar/screens/profile-time-off/export/Q21-AdjustBalance.html` · `images/Q21-AdjustBalance.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q22-NoLimit | `1-calendar/screens/profile-time-off/export/Q22-NoLimit.html` · `images/Q22-NoLimit.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q23-NoUpcoming | `1-calendar/screens/profile-time-off/export/Q23-NoUpcoming.html` · `images/Q23-NoUpcoming.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q24-NoUpcoming15 | `1-calendar/screens/profile-time-off/export/Q24-NoUpcoming15.html` · `images/Q24-NoUpcoming15.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q27-Upcoming15 | `1-calendar/screens/profile-time-off/export/Q27-Upcoming15.html` · `images/Q27-Upcoming15.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q29-AllRequests | `1-calendar/screens/profile-time-off/export/Q29-AllRequests.html` · `images/Q29-AllRequests.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q29b-RequestInAll | `1-calendar/screens/profile-time-off/export/Q29b-RequestInAll.html` · `images/Q29b-RequestInAll.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q30-RequestFull | `1-calendar/screens/profile-time-off/export/Q30-RequestFull.html` · `images/Q30-RequestFull.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q30b-RequestFullApproved | `1-calendar/screens/profile-time-off/export/Q30b-RequestFullApproved.html` · `images/Q30b-RequestFullApproved.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q30c-RequestFullManager | `1-calendar/screens/profile-time-off/export/Q30c-RequestFullManager.html` · `images/Q30c-RequestFullManager.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q30d-RequestFullTwoMonths | `1-calendar/screens/profile-time-off/export/Q30d-RequestFullTwoMonths.html` · `images/Q30d-RequestFullTwoMonths.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q30f-RequestFullLongB | `1-calendar/screens/profile-time-off/export/Q30f-RequestFullLongB.html` · `images/Q30f-RequestFullLongB.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q31-CancelConfirm | `1-calendar/screens/profile-time-off/export/Q31-CancelConfirm.html` · `images/Q31-CancelConfirm.png` | `1-calendar/screens/profile-time-off/spec.md` |
| Q32-NothingTaken | `1-calendar/screens/profile-time-off/export/Q32-NothingTaken.html` · `images/Q32-NothingTaken.png` | `1-calendar/screens/profile-time-off/spec.md` |
| QR3-Icons | `2-product-wide/screens/profile-header/export/QR3-Icons.html` · `images/QR3-Icons.png` | `2-product-wide/screens/profile-header/spec.md` |
| QR3s-HeaderStates | `2-product-wide/screens/profile-header/export/QR3s-HeaderStates.html` · `images/QR3s-HeaderStates.png` | `2-product-wide/screens/profile-header/spec.md` |
| N09b-FilterWide | `2-product-wide/screens/filter/export/N09b-FilterWide.html` · `images/N09b-FilterWide.png` | `2-product-wide/screens/filter/spec.md` |
| N09c-ManyFilters | `2-product-wide/screens/filter/export/N09c-ManyFilters.html` · `images/N09c-ManyFilters.png` | `2-product-wide/screens/filter/spec.md` |
| N09d-MoreOpen | `2-product-wide/screens/filter/export/N09d-MoreOpen.html` · `images/N09d-MoreOpen.png` | `2-product-wide/screens/filter/spec.md` |
| K01-LeaveColours | `2-product-wide/screens/leave-colours/export/K01-LeaveColours.html` · `images/K01-LeaveColours.png` | `2-product-wide/screens/leave-colours/spec.md` |

## Product asks from this round
- Policies can count in **weeks** (parental leave "26 weeks"), not only working / calendar days.
- A request across New Year: each year's days come out of that year's allowance **only if the company/policy is set up that way** (Q15); otherwise one balance.
- Decline: the reason is **optional**.
- Cancelling an **approved** future request: a company setting decides.
- Toasts as drawn: "Time off approved" · "Time off declined" · "Request canceled" · "Request sent to {First name}" · "Balance adjusted" · "Link copied".
