# Product rules from this round

UI rules Ulia set while designing Home. They apply beyond Home. They are proposals for the owner's notes (`rules/`, then `sync-rules.mjs`).

## Words
1. A number and its word never break apart: "3 days", "14.5 vacation days" (a non-breaking space).
2. "joins", never "joined", for a new joiner on their first day or before it.
3. "pending" for something waiting on the reader ("2 pending"), not "documents" or "need your signature".
4. The link to a whole list says "See all", or names the list: "All documents", "All processes", "My time off", "Calendar", "Inbox". Never "All automations"-style repeats of the title.
5. A type with no limit says "No limit". A balance shows what is left only: no "of N", no "used".
6. A birthday never shows a year.

## Buttons and actions
7. No "Open" button: a card or row opens on click.
8. No "Later" button: Skip is later.
9. Buttons inside cards and dialogs follow SPEC § 13.2 (radius 8). On Home, My profile, Edit home and the segmented controls are pills.
10. One primary per card at most. Approve keeps the nod ring.
11. Undo in a toast instead of a confirm for anything that can be undone (approve, task done, finish the day, add, remove, reset). Confirm only to drop unsaved work.

## Lists and cards
12. A widget never grows with its content: its list scrolls inside, with a fade at the bottom.
13. Counts next to a title are a counter pill, not a number in brackets.
14. Show only what waits: a signed document, a done task, an answered request leave the widget (they stay on their page).
15. A done task stays crossed out until the end of that day, then leaves.
16. Overdue shows "Overdue" and the day it was due. Overdue process steps are Pending amber, never red.
17. A pending leave is a dashed edge on white; an approved one is a solid soft fill.

## Visual
18. Tooltips are light, with no arrow (DESIGN_SYSTEM § 7). Every name cut with … shows its full text in one.
19. Days and dates in lists of what is coming are in the accent ("Thu 12").
20. Everything that is accent follows the company accent, decorations included (band, ring, dial, confetti).
21. Every Small widget has its big number at 44.
