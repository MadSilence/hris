---
status: built
screen: automations-steps
owner: Ulia
updated: 2026-11-06
---

# Step settings: every step type

## What it is for
After adding a step, the person sets what it does and to whom, when it happens, and whether it happens only in some cases. Next to it they see what the result would look like for a real person.

## Where it lives
The step settings window (right, 340), with Who sees what under it (`automations-editor`). It opens by selecting a step card.

## Layout
Header: "Step {n}" over the static step type, then ⋯ and ×. Then the step's own fields, a divider, and **the common part every step has**:
- **When**: radio Right away / Later. Under Later, indented:
  - [N days] + segmented Before / After (no label over them);
  - **Counted from**: select with The step before / Hire date / End of probation / any date field;
  - **At** [09:00], then the grey text "each person's time zone" (not changeable here).
- **Only if**: "+ Add a condition" opens the ConditionBuilder.

Fields per step type:

| Step | Fields | Who sees what shows | Frames |
|---|---|---|---|
| Send a notification | **Who gets it** (people picker) · **Message** (text with field tokens; "Type @ to insert a field.") | the notification in the person's inbox | S1, S1b, S1c |
| Send an email | **To** (people picker) · **Subject** (one line, field tokens inline, ellipsis when long) · **Message** + "Insert a field" | the email | G4 (in editor) |
| Create a task | **Title** · **Description** · **Assignee** (people picker) + hint · **Due**: [7] days "after it's created" (plain text, no dropdown) | the task in the assignee's tasks | S2, S2b |
| Ask for approval | **Who approves** (people picker) · **If there's no answer in** [3 days]: then (select: Ask their manager / Stop the run / Go on) · ☐ Remind them every day | the request in the approver's inbox with Decline / Approve, and the request in the asker's time off as Pending | D3 (in editor), F3 |
| Wait until | radio A task from this run is done / A field is filled. Task: select (tasks above in this run). Field: select. **Wait at most** [10] days. **If it's not done by then**: radio Go on with the next steps / Stop / Stop and tell someone; under the last option, "Tell" (people picker) | — (no card) | S3, S4 |
| Assign or unassign | **Action** (segmented Assign / Unassign) · **What** (Role, Department, Team, Office, Legal entity, Holiday calendar, Job title) · **Which** (follows What; relations first, then items A–Z) · Mist note | the person's profile field with "From rule: {name}" | S5, S5b, S5c |
| Grant a time-off policy | **Policy** (relations first, then policies A–Z with "Everyone" / "{n} days") · Mist note | the policy in the person's time off with "From rule: {name}" | S6, S6b |
| Start a review | **Review form** (select) · **Reviewer** (people picker) · **Due** [N] days "after it starts" | — | S7 |
| Ask to sign a document | Document(s) · Who signs (people picker) | the signing request | design-only, drawn on the canvas only (H4); fields as listed |
| Send a survey | Survey · Who gets it | — | design-only; fields as listed |
| Split by a condition | **Question** (the label on the card) · paths: each path is a ConditionBuilder + name, the last one "Anyone else" | — | H4 (canvas) |

**People picker** (S1b, S1c): chips inside the field, and no placeholder.
- Clicking it opens the list in two parts:
  - **Roles**: The person (Who the automation runs for) · Their manager · Their manager's manager, "Changes with each person" · then the company's roles: Department head, Onboarding manager, Marketing lead…, "A role in your company".
  - **People A–Z**: avatar · name · "job · office".
- Typing filters both lists, and the typed letters are bold.

**Pickers with relations** (S5c, S6b):
- "Changes with each person" comes first: Their office's / country's / legal entity's calendar or vacation policy.
- Then "Calendars A–Z" or "Policies A–Z", with a country flag beside each country (Q-3).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Select options load inside the open list with a nod ring. The window itself opens with the step. | — |
| Empty | A new step: required fields empty, with a grey `*` (FORMS_AND_FIELDS § 1). The card shows "needs details". | F3 in automations-test-and-turn-on |
| No results | A picker search finds nothing: no-results-s S, "No one matches" / "No calendars match" / "No policies match". | not drawn |
| Error | The options can't load: "We couldn't load the list" + Try again in the open list. | not drawn |
| No permission | Read mode: icon rows (R3). | R3-Read-icon-rows.png |
| Normal | One frame per step type. | S1–S7 |
| Long content | Later fully open (S2b, S5b drawn in full; on screen the window scrolls). Long names in chips: one line + ellipsis + tooltip. | S2b, S5b |
| Wait until with no task above | "A task from this run is done" is disabled, with the hint: Add a "Create a task" step before this one. | S4 |
| Missing details | The field shows `FieldError`, and the card shows the declined border + "Add …" line. | F3 |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Insert a field | Message / Subject: "@" or "Insert a field" | A list of fields; the pick becomes a token chip. Backspace removes a whole token. | no |
| Pick people / roles | people picker | Adds a chip. × on a chip removes it. | no |
| Later | When | Shows the indented settings. Right away hides them; the values are kept until saved. | no |
| Add a condition | Only if | The ConditionBuilder, with the field list open. | no |

## Words
| Where | Text |
|---|---|
| Common | When · Right away · Later · Before · After · Counted from · The step before · Hire date · End of probation · At · each person's time zone · Only if · Add a condition |
| Notification | Who gets it · Message · Type @ to insert a field. |
| Email | To · Subject · Message · Insert a field |
| Task | Title · Description · Assignee · If there's no one to assign, the step fails and the run tells you why. · Due · after it's created |
| Approval | Who approves · If there's no answer in · Ask their manager · Remind them every day · Choose who approves, like "Their manager". (error) · Who sees what shows up once you choose who approves. |
| Wait until | A task from this run is done · A field is filled · Task · Field · Wait at most · If it's not done by then · If it's not filled by then · Go on with the next steps · Stop · Stop and tell someone · Tell · Add a "Create a task" step before this one. |
| Assign | Action · Assign · Unassign · What · Role · Department · Team · Office · Legal entity · Holiday calendar · Job title · Which · If they already have this calendar, the step is skipped. Only what this automation assigned can be taken back by it. |
| Policy | Policy · If they already have this policy, the step is skipped. · Everyone · {n} days |
| Review | Review form · Reviewer · Due · after it starts |
| Pickers | Roles · The person · Who the automation runs for · Their manager · Their manager's manager · Changes with each person · A role in your company · People A–Z · Calendars A–Z · Policies A–Z · Their office's calendar · Their country's calendar · Their legal entity's calendar · Their country's vacation policy · Their office's vacation policy · Their legal entity's vacation policy |
| Split | Which office are they in? (example question) · Anyone else · {n} paths |
| Who sees what examples | In {Name}'s inbox · {role} · In {Name}'s tasks · {role} · Due {date} · On {Name}'s profile · From rule: {automation} · In {Name}'s time off · {n} days a year |
| Step cards (examples) | Tell HR Admin and their manager / Only if approved · Book the probation review / For their manager · due in 7 days · The task is done / At most 10 days, then stop and tell HR · Vacation · their country · Probation review / 80 days after the hire date · only if on probation |
| No results | No one matches · No calendars match · No policies match · We couldn't load the list · Try again |

## Values
- As in `automations-triggers` (fields, segmented control, hints, dividers).
- The indented Later block: 24 in from the radio's left edge (§ 6 scale).
- Field tokens: tag chips, radius 6, `--accent-subtle` / `--accent-text`, 13/18 (§ 13.4, § 8).
- Mist note: Mist, radius 8, padding 10 12, an info icon 14 tertiary, text 13/18 secondary. This is the `InlineAlert` info tone in a neutral look; use `InlineAlert tone="info"` if the code has no neutral variant.
- Picker rows: 36 high (people 44, with a 28 avatar). Group labels 12/16 500 tertiary. A relation row has a grey "Changes with each person" group label.
- Flags (Q-3): 20 × 14, radius 2.

## Changes to SPEC
1. **Country flags** (radius 2, 20 × 14). The package has no flag set and no radius 2 (Q-3).
2. **Field tokens inside text** (accent-subtle chips inside a field). § 13.4 has no "token" kind. The closest is a tag in accent colours, which § 4.7 forbids for tags. This is a new chip kind.

## New components
- **TokenTextField**: a text field or textarea with field tokens, "@" to insert, and "Insert a field". States: default, focus, token selected, error.
- **PeoplePicker with roles**: SearchableSelect with two groups and chips inside the field. Check whether the code's person picker can take the roles group.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-3** — flags: yes, the code's `CountryFlag`. **Owner:** "Ask to sign a document" and "Send a survey" can be picked and saved; until their modules exist a run skips them ("This step isn't connected yet, so it was skipped.") and the card says "Not connected yet". **QA1** — an approval's time-out "Go on" follows the Declined path; the option reads "Treat it as declined" until the designers word it (`QUESTIONS.md`). **QA2** — the policy picker has no "Changes with each person" group (a policy is not bound to a place); the calendar picker keeps it. **QA3** — "Start a review" is a one-person review from the form, one reviewer, due N days after it starts. Design-only steps and settings are in DESIGN-ONLY.md § 2.

---

## Built
- **Where to see it:** a step's settings in the editor. Code: `components/modules/automations/settings/steps`.
- **Differs from the design:** people rows show "office" without the job (the people search returns no job); a picked
  person reads "a person" in card titles; a policy shows "{n} days" or "No limit" ("Everyone" has nothing behind it);
  the approval's no-answer option reads "Treat it as declined" (QA1, `QUESTIONS.md` Q-2); sign and survey steps carry
  "Not connected yet".
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
