---
status: ready
screen: sign-in-provider
owner: Ulia
updated: 2026-11-13
---

# Login — on the way to a provider and back (E1, E3)

## What it is for
The moment between pressing "Continue with Google / Microsoft" and the provider's page (and back), and the page shown when the round trip fails with nowhere to send the person back.

## Where it lives
`auth.<root>` (both ways). Usually seen for under a second. noddo's own look (no company is known there). Behaviour: Notion § 14.5. E2 is the provider's own page (always the account chooser, `prompt=select_account`). Common: `sign-in-root/spec.md` § "Common".

## Layout
- **E1** a clean white page, no pane (a Wine pane would only flash between a company-coloured login and Google): the noddo wordmark (whose "o" nods — the loader, SPEC § 9 / `NodRing`) and one line under it, centred: "Taking you to Google…" / "Taking you to Microsoft…" / on the way back "Logging you in…". No action.
- **E3** everyday base in noddo's Wine (brand pane) · grey circle · "We couldn’t finish logging you in" · "The link may be out of date, or something went wrong on our side." · "Go to login" (→ A1).

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | E1 is the loading state. | RE1-Desktop, RE1-Microsoft, RE1-Back, RE1-Phone |
| Empty / No results / No permission | — | — |
| Error | E3. | RE3-Desktop, RE3-Phone |
| Normal | E1. | RE1-* |
| Long content | — | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Go to login | E3 | `sign-in-root` A1. | no |

## Words
"Taking you to Google…" · "Taking you to Microsoft…" · "Logging you in…" · "We couldn’t finish logging you in" · "The link may be out of date, or something went wrong on our side." · "Go to login" · pane "Every yes, handled."

## Values
E1: wordmark 44 high, line 15/22 secondary, 20 px under it; centred in the viewport.

## Changes to SPEC
§ Common (grey circle instead of an illustration on E3).

## New components
None.

## Open questions
None.
