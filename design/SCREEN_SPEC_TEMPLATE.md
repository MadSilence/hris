---
status: draft          # draft | ready | building | built | reviewed — see HANDOFF.md
screen: <name>         # the same as the folder name, e.g. time-off-request
owner: <designer>
updated: <YYYY-MM-DD>
---

# <Screen or flow name>

## What it is for
One paragraph: who opens it, why, and what they leave having done.

## Where it lives
The route or the place it opens from (a page, a dialog from a button, a tab of a profile), and who
can see it.

## Layout
The parts top to bottom, each with the component it uses (`rules/DESIGN_SYSTEM.md` § 5). A part
with no existing component is marked **new** and explained under "New components".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | | |
| Empty (nothing yet) | | |
| No results (a filter or search found nothing) | | |
| Error (could not load) | | |
| No permission | | |
| Normal | | |
| Long content (long names, many rows, no photo) | | |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| | | | |

## Words
Every string on the screen, in English, sentence case. Counts written as both forms
("1 day" / "3 days"). Placeholders, empty-state text, button labels, errors the screen shows itself.

| Where | Text |
|---|---|
| | |

## Values
Only what is not obvious from the component: a width, a gap, a size — each with its SPEC section.

## Changes to SPEC
Anything this screen needs that SPEC does not have or says differently. Each one is either taken
into the next package version or answered in `QUESTIONS.md` before the screen is `ready`.

## New components
For each: what it is, its states, its sizes, where else it would be used.

## Open questions
Links to the `QUESTIONS.md` entries this screen waits on.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:**
- **Differs from the design:** what, and why.
- **Images of the real screen:**
