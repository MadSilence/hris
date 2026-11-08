# Paste into design/QUESTIONS.md

## Q-1 — May the test run use a real request from the last 30 days? · automations-test-and-turn-on · from designers · 2026-11-06
The test run (G1a, G1) runs the automation on a real request that already happened, for example "Lena Kowalska · 2–19 Dec, a real request from the last 30 days". The person testing picks the manager's answer. Nothing is sent or changed, but the tester sees what the steps would do with a real person's data (names, dates, who gets what).
Options: (a) real requests from the last 30 days, limited to people the tester may see; (b) only made-up example data.
Designers recommend **(a)**: it is the only way to check an automation against real cases. Visibility is the same as the run history, so it shows nothing the tester can't see already.
**Blocks:** automations-test-and-turn-on

## Q-2 — How long are runs kept? · automations-run-history · from designers · 2026-11-06
The run history says "Runs from the last 12 months." The code keeps runs forever.
Options: (a) keep forever and drop the line; (b) show 12 months by default, with older runs on request.
Designers recommend **(a)**. Then G2 and V1b lose that line, and nothing else changes.
**Blocks:** nothing (one line of copy)

## Q-3 — Is there a set of country flags in the code? · automations-steps · from designers · 2026-11-06
The holiday calendar and policy pickers (S5c, S6b) show a 20 × 14 flag, radius 2, beside each country. The design system has no flags.
If the code has a set, use it. If not, drop the flags: the country name already says it.
**Blocks:** nothing

## Q-4 — Do company and personal settings for time format, date format and first day of the week exist? · system · from designers · 2026-11-06
The board draws 24 h and Monday first only as an example. Ulia's rule: these follow the company's default, and each person's own preference if the company allows one. It applies to every time field, weekday picker and calendar.
**Blocks:** nothing (the code uses what exists)

## Q-5 — "(optional)" in labels · system · from designers · 2026-11-06
Ulia had asked for a grey "(optional)" after optional labels. SPEC § 13.3 says the same. `rules/FORMS_AND_FIELDS.md` § 3 forbids it (optional = no asterisk), and the code follows the rules. The board now follows § 3, and required fields get the grey `*`.
Answer only if § 3 should change.
**Blocks:** nothing

## Q-6 — The noddo AI prompt shows an example as placeholder · automations-list, automations-start · from designers · 2026-11-06
The AI field shows "When someone's probation ends in 14 days, remind their manager to book a review" in grey (E2). FORMS_AND_FIELDS § 2 forbids example placeholders. This is a prompt, not a form field, and the example teaches what to type.
Designers recommend **an exception** for the AI prompt only, like Quick Fill.
**Blocks:** nothing

## Q-7 — A tone for "Paused" · system · from designers · 2026-11-06
Automations have Draft, Active, Paused and Archived. The nine tones have no "paused". The board draws Paused grey with a pause icon.
Designers recommend **the inactive tone with the `pause` icon** in `RuleStatusBadge`. Active = approved tone, Draft = draft, Archived = archived.
**Blocks:** nothing

## Q-8 — Who may open Activity? · automations-activity · from designers · 2026-11-06
Activity lists every run in the company.
Designers recommend: anyone who may view automations. Rows about people outside their access are not shown, and are counted in a closing line "Plus N runs you can't see.", the same as the run history.
**Blocks:** nothing (the spec follows the recommendation)

## Q-9 — Status filter chips on the automations list · automations-list · from designers · 2026-11-06
`TABLES_AND_LISTS.md` § 1 keeps filters to lists of people and query screens. The automations list (a list a person maintains) has the chips All / Active / Paused / Drafts and a "Starts when" pill.
Designers recommend **keeping them**: they are `FilterChip`s over one field, not the audience builder.
**Blocks:** nothing
