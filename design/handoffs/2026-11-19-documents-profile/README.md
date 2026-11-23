# noddo — design package for Petya · 19 Nov 2026

From Ulia. One package, two parts. Everything here is final.

**The rule for this package:** build it so that a screenshot of the product at 1440×932 (sidebar open, light theme, 100% zoom) lies on top of the board picture with no visible difference except the sample data. Every number is written down — take numbers from `measurements/` and `components/`, never from eyeballing the PNGs. If a picture and a measurement ever disagree, the measurement wins; if the spec and the export disagree, the spec wins.

| Folder | What | Start with |
|---|---|---|
| `1-documents/` | The whole Documents feature: every fix found live on 19 Nov + six new screens approved today (D09b, D09c, D14, D14b, G04b, P01e). Boards as HTML + PNG, 2× renders, every element measured with its token, 90 components, 69 icons by Hugeicons name, illustrations (new: `requests.svg`), board-vs-now pictures. | `1-documents/README.md`, then `FIXES-documents.md` § 0 |
| `2-profile/` | Person profile header, ⋯ menu, tabs, "Waiting on you" bar, Attendance, three small things outside login — and one new screen: **Manage account** (`screens/manage-account/`: HTML, 2× pictures of all four dialogs, spec, full measurements). | `2-profile/FIXES-profile.md` |
| `tools/overlay.html` | Load a board PNG and your screenshot: opacity slider and difference mode. | — |

Not in this package: time off and the calendar (they come separately).

Rules everywhere:
- Every string follows the noddo voice & tone guide. Toasts have no period at the end. US English ("canceled"). A string approved once is used word for word everywhere it applies.
- Never disabled buttons. Pickers: the field itself is the search. Dates "19 Nov 2026"; no year in the current year where the board shows none.
- Icons: Hugeicons (`@hugeicons/core-free-icons`), by the names in `1-documents/icons/` and in the measurements.

When you're done, Ulia's checker re-tests every screen live the same way (exact values, 1440×932 and 1470×956). Anything it finds comes back as a shorter list.
