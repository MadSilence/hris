---
status: built
screen: automations-test-and-turn-on
owner: Ulia
updated: 2026-11-06
---

# Test run, turn on, and changes to a live automation

## What it is for
Before an automation goes live, the person checks it in two ways. A **test run** shows what each step would do on a real case, with nothing sent. A **check for missing details** stops it from being turned on half set up. **Turning on** says plainly who it will touch, and whether requests already waiting are included. Once it is live, saving step changes asks what happens to runs already going.

## Where it lives
The editor header: "Test run", "Turn on", "Save changes" (`automations-editor`). The test run opens as a tool-style window on the left, the same size as a tool window (G1). Its expand icon makes it a full-size dialog (G1m). Managers only.

## Layout
**Test run window** (G1a → G1). It is a tool window, 400 wide, joined to the tool block.
1. Header: "Test run · nothing is sent", then the expand and × icons. Under it, the grey line "Nothing is sent or changed."
2. **Try it on**: a select of real requests from the last 30 days, shown as "Lena Kowalska · 2–19 Dec", with the hint "A real request from the last 30 days." (Q-1).
3. **What does their manager do?**: segmented Approves / Declines / No answer. This only appears when the automation has an approval; there is one such question per approval.
4. Before running (G1a): "Pick a request and their manager's answer, then run the test." + "Run test" (primary).
5. After running (G1): **What would happen**, a list of the steps in run order.
   - Each step has a grey square badge with a white number; the trigger's badge shows a bolt.
   - Each step has a title and a hint line: "Would go to …" / "Would be created: …" / "Skipped: only when declined" / "Approved: your pick above".
   - Steps that send something have "Send it to me" (ghost, small). After sending it shows "Sent to you" with a check.
6. When something was sent: a Mist block "{n} test item(s) sent to you" + "Delete test items".

**Test run dialog** (G1m): the same content in an 800 dialog titled "Test run · {name}". The shrink icon takes it back to the window.

**Missing details** (F3): on Turn on with incomplete steps, nothing turns on.
- A warning banner sits over the canvas (pending colours, white-backed): "{n} steps need details before you can turn this on." + "Show next".
- Each incomplete card gets a declined border and an "Add …" / "Choose …" line with an alert icon.
- The first one's settings open, with a `FieldError` on the empty field.

**Turn on dialog**, no requests waiting (F4): 560.
- Title "Turn on {name}?".
- Three icon lines: who it runs for (count + where), what it starts with, and who will hear from it.
- Footer: "Test run first" (link-style, play icon) on the left; Cancel (ghost) and Turn on (primary).

**Turn on dialog**, requests already waiting (V6):
- **Who should it run for?**: radio Only new requests ("From now on.") / Also the {n} requests already waiting ("Sent before today and not yet decided. They start right away.").
- If the choice sends more than 200 messages, a pending `InlineAlert` appears: "This sends **{n} messages** right away." + ☐ "I understand, send them". Turn on stays disabled until it is ticked.

**Live automation** (F5):
- The canvas banner "This automation is on. Changes apply to runs that start after you save."
- Changed cards show "· edited".
- After turning on: toast "Automation turned on" + Undo, bottom left.

**Save with runs going** (V7): 560 dialog.
- Title "Save changes to {name}?", then "{n} runs are still going. What should happen to them?"
- Radio Keep them as they are (default; hint) / Move them to the changes (hint).
- Cancel · Save changes.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | Test run: the request select loads with a nod ring. "Run test" shows "Running…" with the nod ring; the result list shows 3 skeleton rows. | not drawn |
| Empty | No real request in the last 30 days: the select is empty, with the hint "No requests in the last 30 days. Try it on a made-up one." It then offers an example person (Q-1). The test run never starts empty-handed. | not drawn |
| No results | A search inside the request select finds nothing: "No requests match". | not drawn |
| Error | The test couldn't run: an `InlineAlert` declined in the window, "We couldn't run the test. Nothing was sent." + Try again. Turn on failed: the dialog stays open with `InlineAlert` declined, "We couldn't turn it on. Try again." | not drawn |
| No permission | Viewers see no Test run, Turn on or Save buttons (read mode). | R3 in automations-editor |
| Normal | G1a → G1, F4, V6, F5, V7. | G1a, G1, F4, V6, F5, V7 |
| Long content | The test run with every step and one item sent (G1b, drawn in full; on screen it scrolls). The dialog size (G1m). | G1b, G1m |
| Missing details | F3. | F3-Needs-details.png |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Test run | header | Opens the test window (G1a). | no |
| Run test | test window | Shows "What would happen". Nothing is sent or changed. | no |
| Send it to me | a step in the result | Sends that one item to the tester only, marked [Test]. The block "{n} test items sent to you" appears. | no |
| Delete test items | test window (also later in the inbox, tasks and notifications) | Removes every [Test] item this person got from this automation. | no |
| Expand / shrink | test window header | Window ↔ dialog. | no |
| Turn on | header | Missing details → F3. Requests already waiting → V6. Otherwise F4. | yes (dialog) |
| Show next | F3 banner | Selects the next incomplete step. | no |
| Test run first | F4 / V6 | Closes the dialog and opens the test window. | no |
| Undo | toast after turning on | Turns it off again (back to Draft if it never ran; otherwise Paused). | no |
| Turn off | header (Active) | Paused at once. Toast "Automation turned off" + Undo. Scheduled runs are cancelled; nothing done is undone. | no |
| Save changes | header (Active / Paused) | Step changes with runs going → V7. Otherwise it saves. Toast "Changes saved". | V7 |

## Words
| Where | Text |
|---|---|
| Test window | Test run · nothing is sent / Nothing is sent or changed. / Try it on / A real request from the last 30 days. / What does their manager do? / Approves · Declines · No answer / Pick a request and their manager's answer, then run the test. / Run test · Running… |
| Result | What would happen / Lena asks for 14 days off / Starts it: over 10 days / Marta approves / Approved: your pick above / HR Admin gets a notification / Would go to Ulia Tykoon, Jonas Petrauskas / Marta gets a task / Would be created: Plan cover for the team, due 1 Dec / Email to Lena / Skipped: only when declined |
| Per step | Send it to me · Sent to you |
| Test items | 1 test item sent to you / {n} test items sent to you · Delete test items |
| Marker on test items | [Test] (prefix of the title or subject) |
| Test dialog | Test run · {name} |
| Test empty / errors | No requests in the last 30 days. Try it on a made-up one. · No requests match · We couldn't run the test. Nothing was sent. · Try again |
| Missing details | 1 step needs details before you can turn this on. / {n} steps need details before you can turn this on. · Show next · Choose who approves · Add a subject · Choose who approves, like "Their manager". · Who sees what shows up once you choose who approves. |
| Turn on (F4) | Turn on {name}? / It runs for {48 people} in {Poland and Lithuania}. / It starts with new requests. Requests sent before today aren't affected. / Managers and HR Admin will get requests and notifications from it. / Test run first · Cancel · Turn on. Variants: "It runs for everyone." · "It runs for 1 person." |
| Turn on (V6) | Who should it run for? / Only new requests / From now on. / Also the {6} requests already waiting / Sent before today and not yet decided. They start right away. / This sends {240 messages} right away. / I understand, send them |
| Turn on error | We couldn't turn it on. Try again. |
| Live banner | This automation is on. Changes apply to runs that start after you save. |
| Toasts | Automation turned on + Undo · Automation turned off + Undo · Changes saved |
| Save with runs (V7) | Save changes to {name}? / {3} runs are still going. What should happen to them? / Keep them as they are / They finish with the steps they started with. New runs use the changes. / Move them to the changes / Their next steps follow the new version. / Cancel · Save changes. Count: "1 run is still going." |

## Values
- Test window 400, radius 16, level 2, joined to the tool block (`automations-editor`). Dialog G1m 800, radius 20, level 3.
- Step badge: 20 × 20, radius 6, `--text-tertiary` fill, number 12/16 600 `--on-accent` white. Trigger badge has a 12 bolt icon.
- Result row: title 14/20 500, hint 12/16 tertiary; rows 12 apart.
- Test items block: Mist, radius 10, padding 12.
- Warning banner on canvas (F3): `--status-pending-bg` #FFF3DF, border #DBC5A6, icon #985A00, text #7A4800, radius 10, level 1.
- Turn on dialogs: 560, radius 20, padding 24 (§ 13.7). The 200+ messages alert is `InlineAlert tone="pending"`.
- Toast: bottom left, 24 from the bottom, level 2, radius 10 (§ 13.7).

## Changes to SPEC
1. **A warning banner in status colours over the canvas.** § 12 / § 13.7 say page banners stay neutral Mist. On the canvas a Mist banner disappears into the dots. The warning is about the automation, not the page. The border #DBC5A6 is not a token.
2. **The test run window as a tool-style floating window** (as `automations-editor` change 1).

## New components
- **TestRunResult**: a list of steps with a badge, title, hint and "Send it to me". States per row: would happen, skipped, sent to you.

## Open questions
Answered by the owner, 2026-11-06 (`(claude)/DECISIONS.md` § "The automations redesign", the plan `AUTOMATIONS_REDESIGN_PLAN.md` § 1): **Q-1** — (a): real cases from the last 30 days, limited to people the tester may see; with none, a made-up example person.

---

## Built
- **Where to see it:** the editor's Test run and Turn on. Code: `editor/dialogs`, `runs/TestRunWindow`.
- **Differs from the design:** for a trigger other than time off, "Try it on" lists people or completed processes and
  V6 says "cases" instead of "requests"; "Delete test items" says emails stay (an email cannot be unsent). Turning on
  with unsaved changes saves them first.
- **Images of the real screen:** not taken yet. Walked 2026-11-07 against these frames (`(claude)/HISTORY.md` § "Automations and live rules").
