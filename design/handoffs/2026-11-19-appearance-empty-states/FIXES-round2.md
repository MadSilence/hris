# Design fixes — round 2 of 19 Nov (after the documents / profile / appearance / empty-states packages)

For Petya's Claude Code. Same rules as every package: build exactly as the boards; a number here wins over a picture; change nothing that isn't listed.

**How it was checked:** live on local-sandbox (and live-sandbox, noddo.so for the login pages) on 19 Nov evening, at 1440 × 932 (and 1710 × 1112 where it says so), as Ulia (System Owner). The sandbox ran your commit of 19 Nov 15:54 (automations, misc, company hub, Home widgets, login rounds). Pictures of what is live now: `now/`.

**Product-wide words:** toasts have no period; US English; an approved string is reused word for word; sentence case; dates "23 Jul 2021", no year in the current year. **A toast never shows a technical ID.**

## 0. Fix first

- RC7. [high · functional] **"Add a page" / "New page" fail when the hub has no sections.** Hub › Handbook empty "Add a page", Manage hub › Pages empty "New page", and the "New page" button in the Manage hub header all show the error toast "That section could not be found. Reload the list of pages." with a raw ID line under it, and nothing opens. Must be (Ulia 19 Nov): **when the hub has no sections yet, "Add a page" / "New page" first open the usual New section dialog; once the section is created, the new page opens right away inside it.** No new words. And a toast never shows a technical ID.
- RC1. [high · visual] **Automations step window runs off the screen** (C1). At 1440 × 932 the window is 340 × 851 from y 137, so it ends at y 988: the bottom is cut by the window edge, its bottom border and corners are missing, and the zoom control sits over it. Must be C1: the window ends **16 above the zoom control** (whole frame visible, radius 16 on all corners) and its body scrolls inside.

## 1. Differences, by screen

### Documents tab — additions to the documents package of 19 Nov (build them together with it, not as a separate fix)
- DT31. [addition · functional] **Stuck in Starred.** On a profile with files but none starred (Ulia's own, 1 file), picking Starred shows "This folder is empty / Drop files here or use Add." and the view switch disappears, so there is no way back to Not in a folder / All documents except leaving the tab. The view switch must stay whenever the person has any files, in every view; it hides only when there are no files at all (T12). Empty Starred gets its own empty state: board V2b (DT33).
- DT32. [medium · visual] **Empty folder / empty tab sits in a dashed grey frame, near the top.** Live (19 Nov, after Petya's round): an empty folder and the empty own tab show the EmptyState inside a dashed-border, grey-filled box (radius 16) that starts right under the toolbar, with the old words "This folder is empty / Drop files here or use Add.". Must be T13 (folder) / T12 (tab): no frame, no fill — the drop zone outline appears only while dragging files over (T07); the EmptyState centred in the free area; T13 / T12 words.

### First-run welcome
- W1. [medium · visual] **The nodding ring is cut at the top.** The ring strip is an svg 900×167 with `overflow: hidden`; the nod lifts a ring 2 px above its row, so the top of the accent ring is clipped (seen at 1710×1112). Same bug as the login/hub rings (Z1): `overflow: visible` on the svg (or 4 px more room on top). Rings themselves match the board: r 22, stroke 7 (44 px), 18 rings, two rows, the lower row cut by the bottom edge — the board W0-Desktop at 1440 has the same 900-wide strip.

### People list
- PE2. [high · visual] **People list columns** (Ulia 19 Nov, approved): all five columns are 207 wide, so Name (avatar + name + Sample chip) leaves ~70 for the name and even "Abena Asante" is cut ("Aben…"). Must be the Documents rule: **Name takes all the free width** and cuts with … only when it really doesn't fit; Email ~240; Status ~140; Created and Updated ~110.
- PE3. [low · content] People list dates "23.07.2021", "19.11.2026" → "23 Jul 2021", "19 Nov" (date rule: no year in the current year).

### Automations (round of 18 Nov — still open)
- RC2. [medium · visual] Step window fields (C4): label → control is **15** (label top 225, field top 258 = 33 from label top to field top). Must be label 18 + **8** = 26.
- RC3. [low · visual] Automations / Activity tabs (A3): padding-bottom 8 → **10** (tab 30 → 31 high).

### Login (round of 19 Nov — still open)
- RC4. [medium · visual] Company login (A2): Email label → field is **18** from label top to field top (no gap). Must be **26** (label 18, 8, field 44) — as already on "Log in to your company" (26 there).
- RC5. [question for Petya] "Log in to another one" on live-sandbox goes to `https://noddo.so/login?another=1` (R4). Is noddo.so this environment's root? If it is production, R4 is still open.

### Company hub (round of 19 Nov — still open)
- RC8. [medium · visual] News search box (A7): 280 × 36, text 14/20, padding-left 36. Must be A7: **240 × 32**, 13/20, icon 16, padding 0 10 (as Automations A5).

## 2. New rule: first-run and login screens grow on wide windows (Ulia, 19 Nov)

On a window wider than the one a screen is drawn at, its art and heading grow with the window; nothing gets smaller than drawn; growth stops at 1920.

| Screen | Drawn at | How it grows | Example |
|---|---|---|---|
| First-run welcome W0–W4 and Finish your profile (`/welcome`, `/profile/finish`) | 1440 | The ring strip is always **62.5 % of the window width** (900 at 1440, 1069 at 1710, **1200 max** at 1920); rings, line width and gaps scale with it (svg keeps viewBox `0 0 900 167`; `width: clamp(900px, 62.5vw, 1200px)`, height by ratio). The nodding ring is never cut (`overflow: visible`). The phone keeps its own strip as drawn. | W0g, 1710 × 1112 |
| Company login (the pane with the ring grid), "Log in to your company", the trial RB1–RB3 | 1280 | The colour panel is **600 × window ÷ 1280** wide (802 at 1710, 900 max at 1920); everything inside it — heading, line, ring grid / ring picture, logo — scales with the panel by the same factor; the panel margin stays 12. | RB1g, 1710 × 1112 |

## 3. Boards

| Board | File | What |
|---|---|---|
| V2b · Empty Starred | `screens/documents-tab/export/V2b-StarredNone.html` + `images/` | DT33. Empty Starred (approved by Ulia 19 Nov, board `screens/documents-tab/export/V2b-StarredNone.html`): view switch stays (Starred 0 picked); documents scene M centred in the free area; title "Nothing starred yet" 18/26 600; line "Star a file to find it here fast." 14/20 #45454A; no button. **Take only the content under the tab row from V2b** — the profile header and tabs on this board are the older drawing; they follow the profile fixes (P1–P8, T1) of the 19 Nov package. |
| W0g · Welcome rings grow | `screens/first-run-welcome/export/W0g-RingsGrow.html` (1710 × 1112) | W2. [medium · visual] **The ring strip grows with the window** (Ulia 19 Nov, board `screens/first-run-welcome/export/W0g-RingsGrow.html`). Rule: the strip is always **62.5 % of the window width** (900 at 1440), rings, line width and gaps scale with it (svg keeps its viewBox `0 0 900 167`, `width: clamp(900px, 62.5vw, 1200px)`, height by ratio). Never smaller than at 1440; stops growing at 1920 (1200 wide, rings 59). At 1710: strip 1069 × 198, rings 52. Applies to every desktop W screen with the strip (W0–W4). The phone keeps its own strip as drawn. With W1, the nod is never cut. |
| RB1g · Panel grows | `screens/sign-in-registration/export/RB1g-PanelGrows.html` (1710 × 1112) | W3. **Every first-run and login screen grows on wide windows** (Ulia 19 Nov: "растим на всех таких экранах"): the welcome W0–W4, Finish your profile, the company login (pane with the ring grid), "Log in to your company", the trial (RB1–RB3). Rule: the art and its heading scale with the window from the width they are drawn at (1280 for the login / trial pages, 1440 for the welcome), never smaller than drawn, and stop growing at 1920. Trial / login: the colour panel is 600 × window ÷ 1280 wide (802 at 1710), margin stays 12, heading, line and ring picture inside it scale with it — board `screens/sign-in-registration/export/RB1g-PanelGrows.html`. Welcome: W2. |

Every element of the three boards is measured in `measurements/` (with tokens and Hugeicons names) and rendered at 2× in `renders-2x/`.

## 4. Landed — no action (re-checked live, for your records)
Home widgets — This week M (Inter Tight 19/23 500, Later rows, weekday "Mon"), avatars with initials (600, tag tint), Who's out switch hugs (149), Light top greeting (Inter Tight 52/56 500, −0.02em, Ink; date 500 accent) and My profile pill (#EAEAEC, 500 Ink). Misc — trial banner words (B1), Edit home hint (E1), folded sidebar (S1: 64, #F7F7F8, mark 32, icons 40 × 32), Sample chip never cut (PE1), "powered by" once (C2). Login — field errors (A1), "Email me a login code" hidden while Email has an error (C9), back arrow on the code step (C11), code boxes 60 × 56 #DADADF (C12), words C13–C15, ".noddo.so" add-on (R1), "Forgot company address?" (R2), unknown company stays on A1 (R3), `/signup` is the trial (B1), "Log in" 13/18 500 (B4), ring illustration 500 × 440 (B5). Automations — list header, button, search, chips, card, Draft pill, ⋯ menu (A1–A11), Activity chips and empty state centred (H1–H4), editor header, tool block, "+", zoom, save status (B1, B2, B4–B7), step window frame and header (C1 frame, C2, C3), "Add a condition" link (C11). Company hub — titles (A2), column headings (A8), Pinned pill (A11), ghost header buttons (A13), pinned cover and title (B3, B5), dates (B7), celebration text (B12), empty Handbook (S1–S5).

News page (back link A4, title, pinned cover Inter Tight 52/52, title 24/30, "This month" 12/16 500, row date 12/16 400 before the save button), Manage hub overview (stat tiles #F7F7F8, numbers Inter Tight 36/36 500, meta "Everyone", tabs #6B6B70), Manage hub › Pages empty state words (CM03), New automation dialog (960, Draft with AI always accent, "Or start from a template" 15/22 600, chips, cards 296 radius 16 gap 10), tool windows Add a step / Who it runs for / Run history / Versions / noddo AI (joined, radius 0 16 16 16, 1 px #EAEAEC, shadow-3, empty states centred), Test run window (right, pressed button #F3F3F5, title + "Nothing is sent or changed.", avatar in Try it on, grey prompt box, Run test full width 298, no icon).

## 5. Not tested this time (need a password, a second person or data): 2FA setup (login P1–P3), backup code (D7), login emails (E1, E2, misc M1–M3), Finish your profile (misc P1–P3: Ulia's profile has nothing to finish, the page sends her home), Home widgets in S and L sizes and with requests / tasks / time off (the sandbox has none for Ulia), the rest of the automations windows (triggers, Run history, Versions, Test run, New automation, Name), and the hub's News, Pages need your yes, Handbook and Manage hub pages.
