# noddo — for Petya, 20 Nov 2026 — start here

This package answers your two files and carries every frame drawn for those answers, plus five fixes. Your Claude Code can take it in on its own.

## The 1:1 rule
Build each screen so that your screenshot, taken at the board's size, lies over the board PNG with no difference. The board sizes:
- **1710 × 1112:** time off and first-run;
- **1440 × 932:** documents;
- **the sheet size** for the Manage account sheet and the login crops.

Use `tools/overlay.html`. Also check every state at 1440 × 932 and 1470 × 956. **Which source wins:** measurements, then the spec, then the pictures. Ulia's checker re-tests live after the round.

## What's inside

| Folder | What | New frames |
|---|---|---|
| `ANSWERS-2026-11-20.md` | **Read first.** Every DQ, A, B, AQ and E item, in your format (`### ID` / Decision / Values / Frames / Spec edited / Note); DQ-16 one line per number; Templates / Notifications lines | — |
| `1-time-off/` | Half-day holiday (A5), actions inside the request in full (AQ-16), approver chains (AQ-04), Decline (AQ-13), reduced leave card (A3), shared date picker — range (AQ-02), adjust balance with a date (Q21b) | 12 |
| `2-manage-account/` | Reset two-step (AQ-06), block / unblock with a reason (AQ-07), the ⋯ menu per status, the bounced email row (AQ-08) | 1 sheet |
| `3-documents/` | Category ⋯ Edit / Delete, deleting a category that has documents (AQ-19) | 4 |
| `4-login/` | No lock after wrong passwords: the alert offers a reset link from the 3rd try | 1 sheet |
| `5-first-run/` | Grow on wide windows (AQ-20) | 2 |
| `6-words/` | Word sheets for DQ-02 and DQ-10 (words only) | 2 |
| `7-product-wide/` | Rules decided in this round: DATE-RANGE, STEPS, MENU (RC12), LANGUAGES, NO-LOCK, NEVER-DISABLED, TOUCH, MULTI-VALUE, FIRST-NAME, SEARCH | — |
| `8-fixes/FIXES-2026-11-20.md` | RC9 (banner scroll — fix first), RC10, RC11, RC12, and the table of new screens | — |
| `tokens/` | tokens.css / tokens.json (unchanged since 19 Nov) | — |
| `tools/` | overlay.html; the scripts that made the measurements | — |

## In every screen folder (`<n>-<feature>/`)
- **`screens/<name>/export/*.html`** — the board frames as standalone pages; CSS in `export/assets/`. The Manage account, first-run and DQ sheets carry their CSS inline.
- **`screens/<name>/images/*.png`** — the frame at its board size, 1×.
- **`screens/<name>/spec.md`** — from SCREEN_SPEC_TEMPLATE: layout, values, states, actions, icons, "Changes to SPEC". Each one has the section "Added 20 Nov — approved by Ulia".
- **`screens/<name>/words.md`** — every string per frame. Grey captions on sheets are not UI text.
- **`measurements/<name>/<frame>.md` and `.json`** — every visible element: position, size, font, colour with its token, background, border, radius, padding, gap, shadow, ::before/::after, and the Hugeicons name of every icon.
- **`renders-2x/`** — 2× renders.
- **`components/<frame>__n@2x.png` and `.md`** — 2× crops of each dialog, menu or card, with the computed values of every element inside, relative to the crop.

**Icons.** Everything is Hugeicons, stroke rounded. Where a board drew an icon by hand ("custom" in the measurements), its spec names the Hugeicons icon to use.

## Rules everywhere
- English, US spelling, sentence case.
- Toasts have no full stop.
- A string approved once is reused word for word.
- First names in sentences, full names in lists and records.
- Dates "20 Nov", with no year in the current year.
- Nothing disabled.
- Destructive actions are red.
- No hint lines that repeat what the screen already says.
- No Russian anywhere.

## Not in this package
- **Templates and Notifications:** the next design round, template editor first.
- **Time off policy settings** (AQ-14): the policy-settings round.
- **The bot-limit numbers** (NO-LOCK): proposed; please confirm.
- **DQ-02:** how far back "people it missed" looks.
