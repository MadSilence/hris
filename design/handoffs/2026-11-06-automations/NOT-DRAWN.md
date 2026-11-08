# In the code, not on the board

Things from Petya's B1–B9 that the board does not draw. For each one: what to do. "Build as described" means the words and behaviour are written here or in the named spec, and no picture is needed.

| # | What | What to do |
|---|---|---|
| N1 | **Duplicate confirm** (ACTIONS_AND_MENUS § 7: Duplicate always confirms) | Build as described in `automations-list` spec → Actions. |
| N2 | **Turn off from the card menu** | It fires at once (like Deactivate, § 7). Toast: "Automation turned off" + Undo. The words are in the list spec. |
| N3 | **Change owner** / **Also tell** | Change owner is drawn (O1, O2) and is in the `automations-list` spec, and every card now shows its owner. **Also tell is not in the product** (Ulia, 6 Nov): drop it from the menu and the API surface. |
| N4 | **System automation banner** ("owned by the system, changed in …") | Not designed. Show it as a `Banner` (Mist) above the canvas, in the read mode of R3 with no Edit button. Words: "noddo keeps this automation. You can see it, not change it." |
| N5 | **Save held for reasons other than missing details** (B3) | F3 draws one reason ("2 steps need details"). Every reason uses the same banner, with a line per reason and "Show next". |
| N6 | **"Only Save" mode** (only the name or description changed) | Save changes saves at once. No dialog, even with runs going (V7 is only for step changes). |
| N7 | **Editor couldn't load** | Described in the `automations-editor` spec → States. |
| N8 | **Notifications that automations send** (the rule's message, a task assigned, a run failed, an automation paused, a wait ran out) | Not designed. Use the product's notification item. Words for the system ones are in the `automations-run-history` spec → Words (notifications). |
| N9 | **Toasts** (saved, turned on/off, owner changed, retried, cancelled…) | The full list of words is in each spec. Position: bottom left, 24 px from the bottom on canvas screens. |
| N10 | **Profile → Personal info: last 20 runs about a person** | Parked by Ulia: not in this round. |
| N11 | **/tasks: an approval task with Approve / Decline** | Parked: Tasks is not designed yet. The approval reaches the manager the way the code already does it. |
| N12 | **Assignment dialogs on other screens** ("Select everyone who matches", "From rule: …" / "Set by hand · Return to rule" on the profile) | Only "From rule: <name>" is drawn, in the Who sees what examples (S5, S6). The rest is not designed. Keep the code's current UI. |
| N13 | **Run statuses not seen in Activity frames** | All seven are drawn in V1 / V8b: In progress, Failed, Waiting, Scheduled, Done, Skipped, Cancelled. The ~27 reasons for a failed or skipped step use the sentence pattern of G2: what happened, then why. They are written by the code, in the voice of `NAMING.md`. |
