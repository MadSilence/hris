# noddo for Petya — the calendar (19 Nov 2026)

Start here. This package is the **calendar** round: the company calendar, the calendar on the person profile's Time off tab (with the request and the request opened in full), and three things that became product-wide while doing it — the profile header, the filter and the leave colours. Every screen in it was approved by Ulia frame by frame on the board "noddo · Calendar".

## The 1:1 rule
The boards are the design. Build each state so that a screenshot of it, taken at the board's size, laid over the board's PNG (`tools/overlay.html`, Difference on) shows **no difference**. The boards are drawn at **1710 × 1112** (N24 at 1440 × 932; K01 and QR3s are tall sheets). Also check every state at 1440 × 932 and 1470 × 956: the layout must hold (fewer days on the timeline, nothing cut).

**Measurements win over pictures; the spec wins over the export.** The export pages are reference pictures in HTML, never a source of values that contradict SPEC — such values are listed under "Changes to SPEC" in each spec.

## Scope — read before building (Ulia, 19 Nov)
This round designed the **calendar first**. It is not the time off feature's design. Some time off states and corner cases are missing on purpose — they will be covered when the time off feature is designed. **Build exactly what is drawn here; don't invent the missing ones** — where something isn't drawn, keep what the product does today. The list of what's left out is in `1-calendar/screens/profile-time-off/spec.md` § Not in this round.

## What's inside
```
1-calendar/                       the calendar
  FIXES-calendar.md               § 0 fix first (found live) · § 1 live → new design · § 2 every board → file → spec
  screens/company-calendar/       30 states (N01–N25): spec.md, words.md, export/*.html, images/*.png
  screens/profile-time-off/       34 states (Q01–Q32): the tab, the request, the request in full, balance history
  measurements/<screen>/<frame>.md|.json   every element: x,y, size, font, colour + token, bg, border, radius, padding, gap, shadow, ::before/::after, icon name
  renders-2x/                     every frame at 2×
  components/                     50 component crops at 2× + their computed values and board CSS (index.html)
  icons/                          every Hugeicons glyph used, by name (SVG)
  illustrations/                  the scenes used (no-results, no-match, something-broke, policies, time-off-s, time-off-m)
  tokens.css / tokens.json        the package tokens (styles/noddo)
2-product-wide/                   applies everywhere, not only on the calendar
  screens/profile-header/         QR3, QR3s — the person profile header on every tab
  screens/filter/                 N09b–N09d — every FilterPopover and ConditionBuilder
  screens/leave-colours/          K01 — leave colours and the "dot on a tint" policy marker
  measurements/ renders-2x/ components/ icons/ tokens.*
tools/
  overlay.html                    board PNG vs your screenshot: opacity + difference
  measure.js shots.js components.js dc2export.py components-*.json   how the measurements were made (Playwright)
```

## Rules everywhere
- Only the design system: SPEC, tokens, DESIGN_SYSTEM § 5 components; Hugeicons by the names in the measurements (stroke 1.75).
- Words: the noddo voice & tone guide; sentence case; **toasts and field errors have no period**; US spelling ("canceled"); a string approved once is used word for word everywhere; dates "Mon 23 Nov", no year in the current year.
- Never disabled buttons; a field's error under the field; empty / no results / error states centred in the free area.
- People are sorted A–Z by **first name** everywhere on the calendar.
- Tooltips are white (light tooltip), as on every board.

## Not in this package
The time off feature itself (Assign policy dialog, Decline dialog, cancelling approved leave, half days, policy settings); anything outside the calendar and the three product-wide pieces above.

Ulia's checker re-tests the screens live after your round.
