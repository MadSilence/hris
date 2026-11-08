# In the design, not in the code

This is checked against Petya's description of the automations code (B1–B9, 6 Nov). Each item says what the design does, what the code does today, and where to see it on the board. Ulia decided all of these on 6 Nov. They are not questions.

The **Size** column is a rough guess: S is UI only, M is UI plus API, L needs engine work.

## 1. Engine and lifecycle

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 1.1 | **Branches.** After "Ask for approval" the flow splits into Approved / Declined. "Split by a condition" makes 2–N paths ("Which office are they in?" → Warsaw / Vilnius / Anyone else). Each path has its own steps. | One straight line of steps, each with "Only if…". | D3, H2, H4, G1, V1 | L |
| 1.2 | **Words and statuses.** The buttons are Turn on / Turn off / Save draft / Save changes. The statuses are Draft (never turned on), Active, Paused, Archived. A person pauses by Turn off. The ⋯ menu has no separate Pause item. | Publish / Save, Enable / Disable. Enabled / Disabled / Paused / Archived. Only the system sets Paused. | E1, F3–F5, V6, V7 | M |
| 1.3 | **A system pause shows the reason and one button.** Owner left or lost the right → **Make me the owner** (replaces "Take over"). Something a step points to is gone → **Fix the step**. Turned off by hand → **Turn on**. | Resume / Take over. | E1, H6 | S |
| 1.4 | **Make me the owner** dialog with "Turn it on now". | Take over. | H6 | S |
| 1.5 | **Versions as a tool on the canvas**: a list of versions, each with what changed, who changed it and when, and "N runs still on this version". The current version is a green square. | A Versions tab. | V5 | S |
| 1.6 | **"When someone stops matching" choice** on "Someone joins a group": Take back what this automation gave / Leave everything as it is. | Always takes back. | T5 | M |
| 1.7 | **Undo after Turn on**: a toast "Automation turned on · Undo". | None. | F5 | S |

## 2. Steps

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 2.1 | **New step kinds:** Ask to sign a document, Send a survey, Split by a condition. | Not there. | D2, H4 | L |
| 2.2 | **Approval escalation and reminders:** "If there's no answer in [3 days]: ask their manager", "Remind them every day". | "At most N days, then stop". | D3, D5, F3, H2 | M |
| 2.3 | **When, on every step:** Right away / Later. Later = [N days] Before / After, Counted from (the step before, hire date, end of probation, any date field), and At [time] in each person's time zone. | A day offset per step, with no time of day. | S2b, S7 | M |
| 2.4 | **Pickers with relations.** The list first shows options that change with each person (Their office's / country's / legal entity's calendar or policy), then the real items A–Z. Country items have a flag (see Q-3). | A plain list. | S5c, S6b, S1b, S1c | S |
| 2.5 | **People pickers:** roles first (The person, Their manager, Their manager's manager, Department head, Onboarding manager, the company's roles), then people A–Z. Typing filters both. | Not described. | S1b, S1c | S |
| 2.7 | **Skip for now** in the step menu: the step stays on the canvas but runs skip it ("Skipped" pill on the card). | Not described. | G4 | S |
| 2.6 | **Step numbers on cards.** The trunk is 1, 2, 3…; a branch continues the number with a letter (2A, 3A, 2B). The numbers are computed from the order of the steps, never stored. | None. | every canvas frame | S |

## 3. Triggers

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 3.1 | **Pick a date**: one specific date with a year. It runs once and has no "Every year". | Dates relative to a person's date only. | T1c, T1d | M |
| 3.2 | **Schedule: Year** (a month and day, no year; 29 Feb runs on 28 Feb). | Daily / weekly / monthly / quarterly. | T4d | S |
| 3.3 | **Schedule time and time zone:** At [09:00]; Time zone = Each person's time zone (default) / Company time zone / Pick a time zone. | No time of day. | T4a–T4d | M |
| 3.4 | **Weekly with several days** (Mo–Su buttons, several may be picked). | Check whether weekly takes one day or several. | T4b | S |

## 4. Editor

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 4.1 | **Canvas editor.** The app sidebar is folded to 64 px; hovering opens it over the canvas. There is a floating tool block (noddo AI, Add a step, Who it runs for, Run history, Versions). Each tool's window joins the block like an ear. Step settings open on the right. The zoom sits bottom right, and the canvas zooms itself to fit when a window opens or closes. Steps can be dragged from the list, and "+" on a connector does a quick add. | A form-style editor. | D2, D4, D5, J2, J4 | L |
| 4.2 | **The sentence on top ("In short")**: the automation read as one sentence, key words highlighted. Before anything is picked, its parts are grey dashed chips. | There is a sentence. Check that the template state exists. | every canvas frame, F0 | S |
| 4.3 | **Who sees what**: a card under the step settings that shows the step on real names ("Example · nothing is sent"). It collapses, and that choice is remembered for every step. | Not there. | D3, J8, G4, S1–S7 | M |
| 4.4 | **Read mode for a live automation.** Settings show as icon rows (value, then what it is), with no disabled fields. An Edit button switches every window to editable. | Read mode only when there is no right, the automation is archived, or it is a system automation. | R3, R4 | S |
| 4.5 | **Name and icon dialog** on first save. It reopens by clicking the name in the header. The icon is picked from the trigger, and the name is suggested from the steps. | Name and description only. | I1 | S |
| 4.6 | **"Save your changes?"** when leaving with unsaved changes: Keep editing / Save and leave. Esc and × = Keep editing. | Not described. | H2 | S |

## 5. noddo AI

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 5.1 | Draft an automation from one sentence: on the empty list, in New automation, and on the empty canvas ("Describe it to noddo AI"). | Not there. | E2, Main, F0, F2 | L |
| 5.2 | AI chat as a tool in the editor. Replies are labelled "Drafted by AI — review before turning on". Questions come as buttons. A step being added shows a dashed placeholder with the nod ring. | Not there. | D1 | L |
| 5.3 | AI changes with Undo; "can't do that" and error replies. | Not there. | H1 | M |

## 6. Test run

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 6.1 | **Test run on a real request** from the last 30 days, with the manager's answer picked by hand (Approves / Declines / No answer). It shows what each step would do to whom. **Waits on Q-1.** | Simulate on chosen people. | G1a, G1, G1b | M |
| 6.2 | **"Send it to me" per step.** Test items are marked [Test], go only to the tester, and are counted. "Delete test items" removes them all. | One "Send a test to me" for the whole rule. | G1, G1b | M |
| 6.3 | The test run window expands to a full-size dialog and shrinks back. | — | G1m | S |

## 7. Runs and Activity

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 7.1 | **Fix a failed run in place**: "Skip this step" and "Choose an owner" under the failed step. Below a divider: "Or retry from the failed step" + "Retry the run". | Retry the whole run. | G2, V1b | M |
| 7.2 | **Endless scroll** in every run list, with status chips that carry counts ("All 312 · Failed 2 · …"). | 50 per page. | V1, V8 | S |
| 7.3 | **Activity as a tab of Automations**: chips All / Needs attention / Waiting / Next 7 days with counts, Search, a Filters builder, and an Automation pill. The card menu's "Run history" opens Activity filtered to that automation, with "Open in editor". | Activity is an idea (B8). | V8, V8b | M |
| 7.4 | **The list of automations is a grid of cards**: icon, name on up to 2 lines, what starts it, last run and number of runs, and the **owner's avatar bottom right** (tooltip: name + "Owner"). A failed last run is red with "See why". Every card has the same fixed height. The ⋯ is always visible. | A table of sentences. | E1 | S |
