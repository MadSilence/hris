# Paste into design/QUESTIONS.md

Q-1 and Q-2 are open in `QUESTIONS.md`, so these start at Q-3. All four are about where data is kept. The design does not change with the answer, and none blocks.

## Q-3 — How the layout with sizes is saved · home, home-edit · from designers · 2026-11-11
Each widget has a size (S / M / L), and the order runs across all widgets. Today `homeLayout` is `[{ id, hidden }]`.
Recommended: `[{ id, hidden, size }]` in the same place, order = array order. Keep the rule that a widget the person lost the right to keeps its place.
**Blocks:** nothing

## Q-4 — Where the Colour / Light header is saved · home, home-edit · from designers · 2026-11-11
Recommended: one more user setting next to `homeLayout` (`homeHeader: "COLOUR" | "LIGHT"`, default Colour), saved by the same Save.
**Blocks:** nothing

## Q-5 — Where the Skip order of Waiting on you is kept · home-widgets · from designers · 2026-11-11
Skip puts a card at the back of the person's deck, and it stays there after a reload.
Recommended: per person on the server, a list of skipped ids, each cleared when its item is answered.
**Blocks:** nothing

## Q-6 — The per-day automation read · home-widgets · from designers · 2026-11-11
Automations Large shows runs per day for 7 days (ran fine, failed, skipped) and the next scheduled run.
Recommended: one aggregate read over the runs that returns the seven days and the next run together.
**Blocks:** nothing
