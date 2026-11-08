# Every string in the automations-triggers frames

Pulled from the board HTML on 2026-11-06. Names, dates, numbers and the people in the examples are example data; the product copy is in spec.md → Words.

## T1-Trigger-date — A date comes up: related date, offset, if the date has passed

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · probation ends in 14 days · , noddo · does the steps · . · 14 days before probation ends · Every person, once · What should happen next? · Add the first step · 100% · What starts it · A related date comes up · Date · End of probation · 14 · days · Before · After · On the day · Every year · Turn on for birthdays and work anniversaries. · If the date has already passed · Run it late · For people whose date passed before this was turned on, or while it was paused. · Skip it · Run late for up to · 30

## T1b-Trigger-date-pick — Picking the date: long list scrolls, Pick a date at the bottom

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · probation ends in 14 days · , noddo · does the steps · . · 14 days before probation ends · Every person, once · What should happen next? · Add the first step · 100% · What starts it · A related date comes up · Date · End of probation · Search · About the person · Hire date · Last working day · Date of birth · Your company's fields · Visa expires · Custom · Contract ends · Medical check due · Work permit expires · Driving licence expires · Security training due · Car lease ends · Passport expires · Next salary review · Pension enrolment · Pick a date · 14 · days · Before · After · On the day · Every year · Turn on for birthdays and work anniversaries. · If the date has already passed · Run it late · For people whose date passed before this was turned on, or while it was paused. · Skip it · Run late for up to · 30

## T1c-Trigger-specific-date — A specific date, once: calendar open

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · On 1 March 2027 · , noddo · does the steps · . · When · A specific date, once · What should happen next? · Add the first step · 100% · What starts it · A related date comes up · Date · 1 March 2027 · March 2027 · M · T · W · F · S · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 30 · 31 · days · Before · After · On the day · Runs once: Mon, 1 Mar 2027

## T1d-Trigger-specific-date-set — A specific date, once: picked, calendar closed

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · On 1 March 2027 · , noddo · does the steps · . · When · A specific date, once · What should happen next? · Add the first step · 100% · What starts it · A related date comes up · Date · 1 March 2027 · 14 · days · Before · After · On the day · Runs once: Mon, 1 Mar 2027

## T2-Trigger-field-change — A field changes: from → to, changes dated ahead

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · someone's office changes · , noddo · does the steps · . · Office changes · From any office to any office · What should happen next? · Add the first step · 100% · What starts it · A field changes · Field · Office · From · Any office · To · If the change starts later · On the day the change starts · Someone moves to Vilnius from 1 Dec: it runs on 1 Dec. · As soon as the change is saved · It runs today, when the move is entered.

## T3-Trigger-event-conditions — Time off: requested / approved / declined / cancelled, with conditions

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · time off over 10 days is requested · , noddo · does the steps · . · Time off over 10 days is requested · Vacation · Sales or Warsaw · What should happen next? · Add the first step · 100% · What starts it · Time off · Time off is · Requested · Only when · Leave type · is · Vacation · And · Or · Days · more than · 10 · Department · Sales · Office · is not · Warsaw · Add a condition · Add a group · Count step days from · Request · First day · Last day · Steps with “days before / after” count them from the first day off.

## T3b-Time-off-full-settings — Time off: the whole settings window, scrolled content shown in full

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · time off over 10 days is requested · , noddo · does the steps · . · Time off over 10 days is requested · Vacation · Sales or Warsaw · What should happen next? · Add the first step · 100% · What starts it · Time off · Time off is · Requested · Only when · Leave type · is · Vacation · And · Or · Days · more than · 10 · Department · Sales · Office · is not · Warsaw · Add a condition · Add a group · Count step days from · Request · First day · Last day · Steps with “days before / after” count them from the first day off.

## T6-Trigger-process — Process is completed

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · an onboarding is completed · , noddo · does the steps · . · An onboarding is completed · Any onboarding process · What should happen next? · Add the first step · 100% · What starts it · Process is completed · Process · Any onboarding · Only when · Office · is · Vilnius · And · Or · Department · is not · Sales · Employment type · Full-time · Days to complete · more than · 30 · Add a condition · Add a group

## T4a-Schedule-daily — Schedule · Daily: time and the time zone list

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · Every day at 09:00 · , noddo · does the steps · . · When · Every day, 09:00 · Once for each person it runs for · What should happen next? · Add the first step · 100% · What starts it · Schedule · Every · Day · Week · Month · Quarter · Year · At · 09:00 · Time zone · Each person's time zone · Lena in Warsaw gets it at 09:00 Warsaw time · Company time zone · Europe/Vilnius · everyone at the same moment · Pick a time zone · Any city or UTC offset

## T4b-Schedule-weekly — Schedule · Weekly: pick the days

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · Every Monday and Thursday at 09:00 · , noddo · does the steps · . · When · Mondays and Thursdays, 09:00 · Once for each person it runs for · What should happen next? · Add the first step · 100% · What starts it · Schedule · Every · Day · Week · Month · Quarter · Year · On · Mo · Tu · We · Th · Fr · Sa · Su · At · 09:00 · Time zone · Each person's time zone

## T4-Trigger-schedule — Schedule · Monthly: a day of the month

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · On the 15th of every month at 09:00 · , noddo · does the steps · . · When · 15th of every month, 09:00 · Once for each person it runs for · What should happen next? · Add the first step · 100% · What starts it · Schedule · Every · Day · Week · Month · Quarter · Year · On · A day of the month · A weekday · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 30 · 31 · Last day · For months with fewer days, it runs on the last day. · At · 09:00 · Time zone · Each person's time zone

## T4c-Schedule-quarterly — Schedule · Quarterly: month of the quarter and day

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · On the 1st day of every quarter at 09:00 · , noddo · does the steps · . · When · 1st day of each quarter, 09:00 · Once for each person it runs for · What should happen next? · Add the first step · 100% · What starts it · Schedule · Every · Day · Week · Month · Quarter · Year · Month of the quarter · First · Second · Third · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 30 · 31 · Last day · Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct. · At · 09:00 · Time zone · Each person's time zone

## T4d-Schedule-yearly — Schedule · Yearly: month and day, no year

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · Every year on 1 March at 09:00 · , noddo · does the steps · . · When · Every year on 1 March, 09:00 · Once for each person it runs for · What should happen next? · Add the first step · 100% · What starts it · Schedule · Every · Day · Week · Month · Quarter · Year · On · 1 March · March · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 30 · 31 · No year: it repeats every year. 29 February runs on 28 February in other years. · At · 09:00 · Time zone · Each person's time zone

## T5-Trigger-joins-group — Joins a group: when someone stops matching

A · UT · Untitled automation · Draft · Test run · Save draft · Turn on · When · someone joins Engineering · , noddo · does the steps · . · Someone joins Engineering · They start matching who it runs for · What should happen next? · Add the first step · 100% · What starts it · Someone joins a group · It starts when someone begins to match · Who it runs for · : Department is Engineering. · Department is Engineering · Change it in Who it runs for. · When someone stops matching · Take back what this automation gave · Removes them from Developers and takes back the policy. Things set by hand stay. · Leave everything as it is
