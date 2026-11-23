# Documents — build it exactly as drawn

For Petya, from Ulia. 19 Nov 2026.

The Documents feature in the sandbox does not look like the boards: plain rectangles where the boards have folders with a tab, missing icons, wrong sizes, old dialogs. This package has everything needed to make every Documents screen **identical** to the boards: the picture, the HTML, every number, every word and every icon. Nothing here needs guessing.

**Goal: a screenshot of the product at 1440×932 sits on top of the board PNG with no visible difference** except the sample data (names, dates, counts).

## What's inside

| Folder | What | Use it for |
|---|---|---|
| `FIXES-documents.md` | Every difference found live (19 Nov), each with the exact target value and the board reference. Section 0 = broken behaviour (fix first). | The to-do list |
| `screens/<screen>/` | The boards as exported: `export/*.html` (open in a browser: the real board, live CSS), `images/*.png` (1440×932), `spec.md` (behaviour, states, actions), `words.md` (every string) | The source of truth for each screen |
| `renders-2x/` | Every board state rendered at 2× (2880×1864) | Zoom in on details |
| `measurements/<screen>/<state>.md` (+ `.json`) | **Every element** on every board state: position, size, font (family size/line-height weight), colour **and the token it comes from**, background, border, radius, padding, gap, shadow, pseudo-elements (e.g. the folder tab `::before`), and the exact Hugeicons name of every icon | Exact values. No eyeballing |
| `components/` | 80 components cropped at 2× (`index.html` = gallery) + for each: the final computed values of the component and its children, and the board CSS rules that draw it | Build each component once, exactly |
| `icons/` | All 69 icons used on the boards, named by their Hugeicons import (matched path-for-path, `@hugeicons/core-free-icons` 4.4.0) | Use exactly these icons in these places |
| `compare/` | Board vs now, side by side (12 screens captured live at 1440×932), plus the real emails and the phone page from Ulia’s inbox/phone (`now-*`) — `index.html` shows them all | See the gap |
| `../../tools/overlay.html` | Open in a browser, load a board PNG and your screenshot: opacity slider + difference mode | Check your work |
| `illustrations/` | The empty/error-state illustrations the boards use (`svg` with `(icon: custom)` in measurements is one of these) | Empty, no-results, error states |
| `tokens.css`, `tokens.json` | The design tokens the boards use | Map values to tokens |

`screens/*/export/assets/docs.css` is the board CSS (same file for all Documents screens). It is layered (v2 … v17 — later blocks override earlier ones), so read values from `measurements/` and `components/`, which are the **final computed** values. The colour tokens are written next to every colour.

## How to work

1. Fix section 0 of `FIXES-documents.md` first (broken flows: the code check, the phone link, requests that can't be fulfilled, the Back button, tables that don't fit 1440).
2. Then screen by screen, in this order: Documents tab (`documents-tab`) → company-wide list (`documents-section`) → expiry (`documents-expiry`) → requests (`documents-requests`) → send for signature (`documents-send-for-signature`) → signing (`documents-signing`, `documents-signing-emails`) → process sign task (`process-sign-task`).
3. For each screen: open `screens/<screen>/export/<state>.html` next to the product. Build the components from `components/` (start with the shared ones: folder tile, view switch, file-type tile, filter chip, table row, dialogs, toast, empty/error/loading states). Take every number from `measurements/`.
4. Use the icons from `icons/` by name. If the code currently uses a different icon in that place, swap it.
5. Every word from `words.md`, sentence case.
6. When a screen is done, check every state with `../../tools/overlay.html` at 1440×932 (sidebar open, light theme, 100% zoom). Then also check at 1470×956 (MacBook Air 13) — the layout must hold.

## Rules that apply everywhere here

- The boards win over the current code. If something in the code is not on the boards, it goes.
- Never disabled buttons (product rule). Loading = the button shows progress, stays the same size.
- Dates: "19 Nov 2026"; no year in the current year where the board shows none ("sign by 17 Dec"). Never "19.11.2026".
- Toasts: no full stop at the end.
- Pickers: the field itself is the search — no second search box inside a menu.
- First names in sentences ("What should Reza upload"), full names in lists.

## When is it done

Ulia's checker re-tests every screen live after your round, the same way (exact values). It's done when that check finds nothing. Anything found goes back as the next, shorter list.

## Decided on 19 Nov — nothing waits on Ulia

All former open questions are answered, and seven new screens were drawn and approved: D09b, D09c, D14, D14b, D14c (documents-section), G04b (documents-signing), P01e (process-sign-task). They are in `screens/` like every other board — HTML, PNG, `spec.md` § "Added 19 Nov 2026", `words.md`, full measurements, and their components in `components/`. Section 2 of `FIXES-documents.md` lists them and every decision.
