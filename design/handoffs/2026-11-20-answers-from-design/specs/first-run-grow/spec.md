---
status: ready
screen: first-run-grow
owner: Ulia
updated: 2026-11-20
---

# Grow on wide windows — the colour pane and the ring art (AQ-20)

Added 20 Nov 2026 — approved by Ulia ("noddo · Documents" board, page "★ New — for review", W0g and RB1g). Both frames are drawn at 1710 × 1112.

## The rule
- **Covers** every `sign-in-*` and `first-run-*` screen with a colour pane or ring art. The company login is included, from its own 520 pane.
- **RB1g — the trial, and the company login.**
  - The colour panel's width = its 1280 width × window ÷ 1280: 600 → 802 at 1710 for the trial, and 520 × window ÷ 1280 for the company login.
  - The heading, the line under it and the orbit picture scale with the panel. The board does it with `zoom: 1.336` on the pane at 1710.
  - The margin stays 12.
  - Never smaller than at 1280; it stops growing at 1920.
- **W0g — the welcome.**
  - The ring strip is always 62.5 % of the window's width (900 at 1440).
  - The rings, lines and gaps scale with it.
  - No smaller than at 1440; it stops at 1920 (1200 wide).
  - The nod (the dropped ring) is never cut.

## Values
`../../measurements/first-run-grow/*.md`; crops in `../../components/`. The frames are self-contained HTML (inline CSS).

## Words
Unchanged from `first-run-welcome` and `sign-in-registration` (`words.md` lists what the frames show).

## States
Only the layout changes with the width; every state of those screens stays as specified.

## Changes to SPEC
None (auth-only exceptions already approved in `sign-in-root`).
