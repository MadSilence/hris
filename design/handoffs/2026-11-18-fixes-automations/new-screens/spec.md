---
status: ready
screen: automations-sign-and-split
owner: Ulia
updated: 2026-11-18
---

# Automations — two new steps: Send for signature, Split by a condition

Approved by Ulia on 2026-11-18. Reference screens are in this folder, in three sizes, as everywhere in this package:
`<screen>@1710.html` (MacBook Air 15, main), `@1470.html` (MacBook Air 13), `@1440.html` (as drawn), each with a PNG.
In the 1710 and 1470 files the canvas keeps its 1440 positions; the dashed line still runs to the window (C1b in `FIXES-automations.md`).

Everything shared — the step window, cards, connectors, conditions, Who sees what — is already specified in `FIXES-automations.md` (sections B–D). This file covers only what is new.

| Reference | What it shows |
|---|---|
| `S9-Sign-add-step` | Quick add from the "+": **Send for signature** is a working step in the list (with a "New" badge) |
| `S9b-Sign-step-settings` | The step's settings: pick a template; who signs and time to sign come from the template (read-only); Who sees what |
| `S9c-Sign-wait-until-signed` | Wait until: a new choice "A document from this run is signed" |
| `S9d-Sign-test-run` | Test run: "Would send for signature", signers in order, "Send the document to me" |
| `S9e-Sign-notify-after` | The notification after signing, with the `full name` field |
| `S10-Split-settings` | Split by a condition: question, paths with conditions, Anyone else, Who goes where (the whole window, 1300 high; on screen it scrolls) |
| `S10b-Split-just-added` | Split just added: Path 1 and Anyone else, nothing picked |
| `S10c-Split-path-needs-condition` | A path without a condition: the card and the window say what to add |

## 1. Send for signature

### What it is for
An automation sends a document made from a contract template for signature, then can wait until it is signed. It uses the Documents signing flow (Documents board, page 7).

### Where it lives
Add a step list and the "+" quick add, group **Ask people**. The step in the list is named **"Send for signature"** (today the live list says "Ask to sign a document" and the step is "Not connected yet").

### Layout (step window, `S9b`)
- Header: "Step N" + signature icon 16; title "Send for signature" (C2).
- **Template** — select (C5) of the company's contract templates. Hint under it 12/16 #6B6B70.
- **Who signs** — read-only box: #F7F7F8, radius 10, padding 8 12; rows min 32 high, gap 10: a 20 × 20 circle #F3F3F5 with the order number 11/20 600 #45454A, then the signer 14/20 400. Under it 12/16 #6B6B70 "Set on the template." + link "Open the template" 13/18 500 #6E1630.
- **Time to sign** — read-only box, same look, one row 36 high: "30 days" 14/20 left, "from the template" 12/16 #6B6B70 right.
- Who sees what (C12–C13): the signer's inbox item, avatar = company logo tile 24, radius 6.

### Card on the canvas
Kind "Send for signature" + icon; title = template name; meta "{signers in order} · {n} days to sign" (e.g. "The person, then their manager · 30 days to sign").

### Wait until (`S9c`)
"Wait for" select gets a third option **"{template} is signed"** with the signature icon, hint "From step {n}. Signed means everyone has signed." Under "If it's not signed by then": the usual radios; hint "Declined or cancelled counts as not signed: the run doesn't wait for the date."

### Test run (`S9d`)
The row for this step reads "Would send for signature", line 2 = the signers in order. "Send the document to me" (F6 link style) makes the PDF and sends it only to the tester, marked [Test].

### Notification after (`S9e`)
A field token **full name** (one token, never first name + last name) and **document** are available in the message.

### Words
| Where | Text |
|---|---|
| Step name (list, card kind, window title) | Send for signature |
| New badge in the quick add | New |
| Template hint | The document is made for the person when the step runs, and filed in their Documents under Contracts. |
| Who signs hint | Set on the template. · Open the template |
| Time to sign, right | from the template |
| Wait until option | {Template} is signed |
| Wait until hint | From step {n}. Signed means everyone has signed. |
| Wait until, under the radios | Declined or cancelled counts as not signed: the run doesn't wait for the date. |
| Who sees what, item title | Signature requested |
| Who sees what, item text | {Company} asks you to sign {template} by {date}. |
| Who sees what, under it | Then {name}, her manager, gets the same when it's her turn. Guests get it by email. |
| Test run line 1 | Would send for signature |
| Test run link | Send the document to me |
| Notification example | {full name} signed {document}. Everyone has signed, the copy is in their Documents. |

## 2. Split by a condition

### What it is for
The flow goes down different paths for different people (e.g. by office). Each person goes down the first path they match, from the top; everyone else goes down **Anyone else**.

### Where it lives
Add a step list, group **Shape the flow**: "Split by a condition". Today clicking it in the live list adds nothing.

### Canvas (`S10`)
- The split card: kind "Split by a condition" + split icon; title = the question ("Which office are they in?"); meta "{n} paths". Before a question is typed the title reads "Add a question" in #6B6B70 (`S10b`).
- Under the card: one connector down 44, then a horizontal 1.5 px #B4B4BA line across all paths, then a connector down to each path (76).
- On each path's connector, centred: a path label — 24 high, padding 0 8, radius 6, white, 1 px #DADADF, 12/16 500 #45454A ("Warsaw", "Vilnius", "Anyone else").
- Steps under a path are numbered with letters: 2A, 2B, 2C (step numbers as B4).
- A new path's first slot: a dashed placeholder card (1 px dashed #B4B4BA, radius 10, transparent): "What should happen next?" 14/20 #45454A + secondary button 32 "Add a step" with a plus 16.
- Cards keep their own bottom padding 16: a title that would wrap is clamped, not allowed to push the meta to the border.

### Step window (`S10`)
- Header: "Step N" + split icon; title "Split by a condition".
- **Question** — text input 36 (C5 look), placeholder "For example: Which office are they in?", hint "Shown on the card above the paths."
- **Paths** label, then one box per path: 1 px #EAEAEC, radius 10, padding 12, gap 10.
  - Row: path name input 32 high, radius 8, 1 px #DADADF, padding 0 10, 14/20 **500**; then a remove button 28 × 28, × 14 #6B6B70.
  - The path's conditions: the people condition boxes (D2–D5). Between two conditions: **"and"** 12/16 400 #6B6B70 between two 1 px #EAEAEC lines, gap 8 — as built today. No And / Or switch, no groups.
  - "Add a condition" link (C11).
- **Anyone else** box: #F7F7F8, radius 10, padding 12, gap 2: "Anyone else" 14/20 500, "Everyone who doesn't match a path above." 12/16 #6B6B70. It can't be removed or renamed.
- "Add a path" link (C11). Then the hint "Each person goes down the first path they match, from the top." 12/16 #6B6B70.
- Who sees what: label "Who goes where" 12/16 500 #45454A; rows white, 1 px #EAEAEC, radius 10, padding 8 10, gap 10: avatar 24, name 14/20 + office 12/16 #6B6B70, and on the right a tag (22 high, padding 0 8, radius 6, 1 px #DADADF, 12/16 500 #45454A) with the path's name. Before any path has a condition: "Add a condition to Path 1 to see who goes where." 12/16 #45454A.

### A path without a condition (`S10c`)
- The split card: 1.5 px #C42B1C border; under the meta a line 12/16 #A12215 with an alert icon 14 #C42B1C: "Add a condition to {path}". The card grows so this line keeps the card's 16 bottom padding.
- The path label on the canvas: border #C42B1C, text #A12215.
- In the window: the path's box gets a 1 px #C42B1C border and, under "Add a condition", 12/16 #A12215 "Add a condition, or remove this path."
- Turn on with such a path opens the usual "needs details" flow (F3).

### New split
A split is added with two paths: **Path 1** (one empty condition, the field list opens at once) and **Anyone else**.

### Words
| Where | Text |
|---|---|
| Step name | Split by a condition |
| Card title before a question | Add a question |
| Card meta | {n} paths |
| Question label / placeholder / hint | Question · For example: Which office are they in? · Shown on the card above the paths. |
| Paths label | Paths |
| First path's default name | Path 1 (then Path 2, Path 3…) |
| Between conditions | and |
| Last path | Anyone else · Everyone who doesn't match a path above. |
| Links | Add a condition · Add a path |
| Hint under the paths | Each person goes down the first path they match, from the top. |
| Who sees what label | Who goes where |
| Who sees what, nothing yet | Add a condition to {path} to see who goes where. |
| Card error | Add a condition to {path} |
| Window error | Add a condition, or remove this path. |
| Placeholder card | What should happen next? · Add a step |

## States
| State | Where |
|---|---|
| Normal | `S9b`, `S10` |
| Just added / empty | `S10b` |
| Error (missing details) | `S10c` |
| Long content | path names and card titles ellipsis after one line in the label / two lines in the card |
| Loading, no permission | same as every step window (nothing new) |

## Out of scope
- **Send a survey** is not designed: there is no surveys module yet.

## Open questions
- Send for signature: who is the sender of a document an automation sends — the automation's owner? (from the Documents notes)
- Send for signature test run: can the engine make the PDF and send it to the tester only, marked [Test]?
