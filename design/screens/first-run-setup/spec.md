---
status: built
screen: first-run-setup
owner: Ulia
updated: 2026-11-13
---

# First run — setting up the company (S1–S3)

## What it is for
The owner, right after registration, answers a few questions so noddo arrives set up, picks whether to start with an example company or empty, and waits while it is built.

## Where it lives
`<company>.<root>/setup`, only for the owner who created the company, until setup finishes. noddo's brand (Wine) — the setup wizard is noddo's (DESIGN_SYSTEM § 4). Continues the registration base (form + Wine card with the orbit). Behaviour: Notion § 14.8. Common: `sign-in-root/spec.md` § "Common". After S3 → the owner's welcome (`first-run-welcome`) and M18 is sent.

## Layout
Stepper: two short bars (28 × 4, pill; accent = done/current, grey = ahead) + "Step 1 of 2 · Your company" above the heading — deliberately not the ring Stepper of SPEC § 13.10 (the owner: the wordmark and the orbit already carry rings; more read as clutter).
- **S1** "Let’s set up *Acme*" (company name in the accent) · "A few questions, so noddo arrives set up, not blank. You can change any of it later." · "What does the company do?" (select, "Choose an industry") · "How many people are in the company?" (select, "Choose a size") · "Where is the company based?" (searchable select, "Choose a country"; once chosen its hint says what it sets) · "Language" (pre-filled, hint "Everybody in the company sees noddo in it — screens, emails and exports.") · "Continue".
- **S2** "Step 2 of 2 · What to start with" · "Where do we start?" · "Start with example data or with nothing. Every feature works either way." · two choice cards stacked: **Example company** "Offices, departments, job titles, time off policies and example people. Enough to see how it works." — when chosen it opens the size slider "Example people" (stops 8 · 25 · 60 · 150, starts at the S1 size; thumb sits exactly on a stop; the chosen number in accent 600) · **Start empty** "Just your own account. Fields, roles and time off types are ready, nothing is filled in." · back arrow · "Set up my company". "Full demo" is not offered (Q-18).
- **S3** "Setting up your company" · "This takes a few moments. You can leave this page — it will pick up where it left off." · a progress list: done = accent check, current = the one nodding accent ring, ahead = small grey dot: Getting started · Setting your time zone and working week · Building your public holiday calendar · Creating your example company (not with Start empty) · Almost there. No buttons.
- **S4** = S2 with declined alert "The last attempt stopped: we couldn’t build the public holiday calendar. Your answers are still here — try again." **S5** (returning owner) = S3.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | "Setting up…" on the button; S3 is the long wait. | S2-States, S3-* |
| Empty | S1 placeholders; S2 nothing chosen. | S1-Desktop, S2-States |
| No results | Country search: "No country matches that." | S1-States |
| Error | S4 alert; selects' required errors as FieldError ("Choose an industry." etc. — same pattern). | S2-States |
| No permission | Anyone but the owner never reaches /setup. | — |
| Normal | S1–S3 desktop and phone. | S*-Desktop / Phone |
| Long content | Long company name in the heading wraps. | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Continue | S1 | S2 (answers kept). | no |
| Choose a card / drag the slider | S2 | Selects; the slider snaps to a stop. | no |
| Set up my company | S2 | Starts the build → S3; failure → S4. | no |
| (automatic) | S3 | Done → the welcome. | no |

## Words
Quoted above; full list `words.md`.

## Values
Bars 28 × 4 gap 6; cards radius card, padding 16, chosen = accent border on accent-subtle; slider track 4 high, thumb 20 white with a 2 px accent edge. Rest § Common.

## Changes to SPEC
§ Common. The two-bar stepper instead of the ring Stepper (owner).

## New components
- **Choice card (radio card)** — radio + title 15/22 600 + text 14/20 secondary; chosen = accent border, accent-subtle fill; may expand content (the slider).
- **Stops slider** — discrete stops with labels under them; keyboard ←/→ moves a stop.
- **Progress list** — done / current (nodding ring) / ahead.

## Open questions
- Q-18 — "Full demo" leaves the wizard; does it stay reachable anywhere (sales demos)? Blocks nothing.

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/setup` for the owner of a company not set up yet —
  `components/modules/firstRun/components/CompanySetupContainer.tsx` on `AuthFirstExperience`; the pieces (two-bar
  stepper, choice card, stops slider, progress list) in `FirstRunPieces.tsx`, their look `.fr-*` in
  `styles/globals.css`. Built 2026-11-13, **not yet looked at in a browser**, no images yet.
- **Differs from the design:**
  - S1's required errors appear when *Continue* is pressed (the button is never disabled); the API itself still
    accepts an unanswered question.
  - S2 with nothing chosen and *Set up my company* pressed says "Choose what to start with." — a sentence not in
    `words.md`.
  - S4's alert names the step the run stopped on — one sentence per step (time zone, holiday calendar, example
    company, the start, the end); the drawn one is the holiday-calendar case.
  - S3 lists *Setting your time zone* and *Building your public holiday calendar* for every company; without a country
    they pass straight to done.
  - "Full demo" is removed from the code, not hidden (Q-18 stays open for sales demos).
