---
status: built
screen: leave-colours
owner: Ulia
updated: 2026-11-19
---

# Leave colours and the policy marker

Approved by Ulia on 19 Nov 2026. Board "noddo · Calendar", page **Leave colours**, frame K01 (Done). Page `export/K01-LeaveColours.html`, picture `images/K01-LeaveColours.png`, measured `../../measurements/leave-colours/`.

## What it is for
The colours a time-off policy takes wherever leave shows: the company calendar, the profile Time off calendar, Who's out, every policy marker.

## Where it lives
A policy picks one of the first eleven in its settings; a new policy takes the first colour no other policy uses. **Gray** is never offered: it marks leave whose type the viewer may not see ("Away").

| Colour | Fill | Edge and dot | Text |
|---|---|---|---|
| Berry | #FAD9EA | #D2559A | #6B1745 |
| Plum | #E6DDF8 | #8467CF | #3B2370 |
| Lilac | #F6DCF6 | #C46BC6 | #5E1F60 |
| Indigo | #E1E1FF | #6E6FE0 | #2A2D79 |
| Ocean | #D9E8FF | #5B8FE0 | #163E73 |
| Teal | #CFF1EC | #2FA898 | #0A4C47 |
| Olive | #E3EDC8 | #8AA53A | #3A4A10 |
| Mustard | #F7EDB0 | #C9A800 | #4F4300 |
| Bronze | #FCE7BF | #D99A2B | #5C3B06 |
| Orange | #FFE1CC | #F08A3E | #6E3208 |
| Cocoa | #F2E1D8 | #B07A5E | #4D2D21 |
| Gray (Away only) | #E9E9EE | #9C9CA3 | #45454A |

## Look
- **Approved** leave: pill in the fill, text in the text colour, radius full, 28 high on the boards.
- **Waiting for approval**: white, 1.5 px **dashed** edge in the edge colour, text colour (Clock 14 on the calendars).
- **Marker** ("dot on a tint"): a 16 px circle of the fill with an 8 px dot of the edge colour in the middle, no outline. Replaces the 16 × 6 PolicyMarker pill everywhere the policy colour shows (calendar card, balances, Upcoming, request, profile header status, policy picker, filter values). Pending in a legend: a 16 px dashed ring.
- Public holiday is not a leave colour: the person's day in accent 9 % on white (see the calendar spec).

## States
One sheet; nothing loads.

## Words
Colour names: Berry, Plum, Lilac, Indigo, Ocean, Teal, Olive, Mustard, Bronze, Orange, Cocoa; "Away". (The rest of `words.md` is the sheet's own notes.)

## Changes to SPEC
- **§ 4.7 / § 13.13 / DESIGN_SYSTEM § 7 policy colours**: for leave, these fills, edges and texts replace the tag palette's pale fills; Pending = dashed white (not a tinted, dotted bar).
- **Marker**: dot on a tint replaces the 16 × 6 pill.
- New tokens suggested: `--leave-{colour}-fill / -edge / -text` for the twelve rows above.

---

## Built
Built 2026-11-20 (the code side).

- **Tokens**: `--leave-{name}-fill | -edge | -text` for the twelve rows, in `styles/globals.css` (the package is
  never edited), with Tailwind names `bg-leave-*-fill|edge`, `text-leave-*-text`, `border-leave-*-edge`. Read through
  `lib/theme/leave.ts` (`LEAVE_CLASSES`, `leaveVars`). A policy still stores the tag name; leave never reads `--tag-*`.
- **Dark values are ours** (no dark sheet came): a deep fill, a light text at 9 : 1, an edge within 4° of your hue,
  3 : 1 on a dark card and on its fill, every two edges 6 apart for normal vision and 2.5 under the three
  colour-vision deficiencies — `test/leavePalette.test.ts`, which also checks the light values against the table above.
  Nine pairs of the light edges fall under that floor (listed in the test and in `DESIGN_SYSTEM.md` § 7) — for you to
  look at, not changed.
- **Marker**: `components/ui/PolicyMarker` is the dot on a tint (16 / 8); `size="sm"` 14 / 7 for a 28-high select,
  `pending` the 16 dashed ring. Every place it was the 16 × 6 pill now shows the dot.
- **Approved / pending**: the company calendar's bars, the profile Time off calendar and its legend, Who's out's lanes —
  approved the fill with the text colour, pending white with the 1.5 px dashed edge (the dotted tint is gone).
- **Picker**: `components/ui/PolicyColorPicker` — eleven 32 px markers in K01's order, the picked one a tick in the
  text colour and a ring of the edge; the first free colour follows the same order (frontend `nextPolicyColor`; the
  backend's `TagColor` order separately).
- **Not built here**: the Clock 14 on pending calendar bars and the holiday tint — they come with the calendar rebuild
  (`company-calendar`).
