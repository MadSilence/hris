# Open questions — design and code

Only open questions. When one is answered, delete it and write the answer where it lives (the
screen's spec, the package, or the owner's rules). The format is in `HANDOFF.md` § "Questions".

## Q-1 — A segmented control is used on almost every automations window, and the package has none · automations-triggers, automations-steps, automations-test-and-turn-on · from code · 2026-11-06
Before / After, Requested · Approved · Declined · Cancelled, Day · Week · Month · Quarter · Year, Assign / Unassign, And / Or, Approves / Declines / No answer — every one is drawn as a segmented control. `styles/noddo/SPEC.md` has no such component and it is not under "New components" in any spec. The code builds it from the frames (height 32, radius 8, the picked segment white on Mist, level 1) and lists it in `CHANGELOG.md`.
Recommended: the designers add it to the package as drawn; the code's values are replaced by theirs when it lands.
**Blocks:** nothing (built from the frames)

## Q-2 — The word for an approval's time-out "Go on" · automations-steps · from code · 2026-11-06
With branches there is nothing after an approval but its two paths. The owner settled that "Go on" follows the **Declined** path (nothing is granted without a yes). "Go on" now reads like approval.
Recommended: "Treat it as declined". The code uses that until the designers answer.
**Blocks:** nothing
