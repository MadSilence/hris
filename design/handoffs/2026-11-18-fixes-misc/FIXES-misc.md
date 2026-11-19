# Design fixes — Profile, welcome, Home leftovers, People, login emails (round 1)

For Petya's Claude Code. Same rules as the Home, Automations and Company hub packages. Collected by Ulia on 15–18 Nov from the live app (local-sandbox), checked against the approved design.

## How to use this package

- **This file** gives every fix with exact values: px, hex, font size / line height / weight, and the words.
- **`references/`** — open in Chrome at that window width and inspect:

  | File | What |
  |---|---|
  | `W0-welcome@1710/1470/1440` | First-run welcome W0, the board's export at these window sizes |
  | `FP-finish-profile@1710/1470/1440` | **New:** Finish your profile (P2) — the board's W3 without the stepper |
| `D2-folded-sidebar@1440` | The folded sidebar as drawn (automations editor) |
  | `LW06-week@1710/1470` | This week widget, every state |
  | `HF02-home-light@1710/1470` | Home, Light top |
  | `P01-profile-menu@1710/1470` | Profile menu |
  | `email/M16-Mail.html` + `.png` | Login code email (same export as `design/screens/sign-in-emails`) |

  `assets/` next to them holds the CSS the welcome files need. The welcome and Finish your profile files are drawn in the Mulberry preset; build them in the company's colour.
- **Precedence:** a number in this file wins over the HTML; the HTML wins over a vague sentence. Where a `design/screens/*/spec.md` disagrees, this file says which wins and `spec-updates` at the end says what to change in the spec.
- **Change nothing that isn't listed.**

"Now" is what the live app does (Ulia's screenshots, 15 Nov, and the live check on 18 Nov). "Must be" is the target.

| Name | Value |
|---|---|
| Ink | #0B0B0C |
| text-secondary | #45454A |
| text-tertiary | #6B6B70 |
| border-divider | #EAEAEC |
| accent (Wine) | #6E1630 |
| accent-subtle | #F6F1F3 |
| accent-muted | #E9DCE0 |
| Rose | #F2B8C6 |

---

## P. Profile menu → "Finish your profile" (Ulia, 18 Nov)

| # | Where | Now | Must be |
|---|---|---|---|
| P1 | Profile menu → **Finish your profile** | Opens the first-run welcome **W0 "Hi, Ulia! Glad you're here"** | **W0–W4 run only once, at a person's very first login** (spec `first-run-welcome`: "once per person, skipping counts as done"). They are never reachable again, from any menu or link. **Finish your profile** opens the new page P2. |
| P2 | **New page: Finish your profile** (`references/FP-finish-profile@…`, approved by Ulia 18 Nov) | — | Route `/profile/finish`. The welcome's look and layout, reused from W3 (`first-run-welcome` W3): white page, the company logo tile 44 + name on top, back arrow top-left (goes back where the person came from), one centred column 400, the two ring rows at the bottom exactly as on the welcome (W2). **No stepper.**<ul><li>Title **"Finish your profile"**, line **"Fill in what’s missing. All of it can wait."** (W3 styles: `.ttl` / `.lead`).</li><li>Then **every blank field of the person's own profile that their role lets them edit** — the same field components and order as W3 (and as My profile), each with its label and hint. A long list scrolls the page; the rings follow W2.</li><li>**Save** (primary, full column width) saves what was filled and goes back. **Not now** (text button in `accent-text`, centred under Save) goes back without saving.</li><li>Errors: field validation as W3 ("Enter a real date."). A failed save: toast "Couldn’t save. Try again." + Retry, the fields keep what was typed.</li></ul> |
| P3 | Menu item **Finish your profile** | Always shown; opens W0 | Shown **only while the person has at least one blank field they may edit**; when there is nothing to finish, the item is not in the menu (Ulia, 18 Nov). It stays where it is in the menu (as live) and opens P2. |

Words: Finish your profile · Fill in what’s missing. All of it can wait. · Save · Not now · Couldn’t save. Try again. · Retry.

## W. First-run welcome (W0–W4)

Reference `W0-welcome@1710/1470/1440`; values from `design/screens/first-run-welcome` (export `W0-Desktop.html`, CSS `assets/auth-w.css`, rules `.wz …`).

| # | Where | Now | Must be |
|---|---|---|---|
| W1 | W0 layout and type | Text left-aligned in a narrow column; "Glad you’re here" breaks into 3 lines ("Glad / you’re / here"); greeting much smaller; logo tile without the company name | **One centred column, centred text** (`.wz .intro` — `align-items:center; text-align:center`). Greeting **Inter Tight 600 112/104, letter-spacing −0.05em**, line 1 Ink, line 2 in the accent; the column is **not** limited to 400 for W0, so "Glad you’re here" stays on **one line** at 1440, 1470 and 1710. Line "A few quick settings, and you’re ready to go." **17/26** #45454A, 28 under the greeting. "Let’s go" primary **48 high, padding 0 32**, 32 under the line. On top: logo tile **44** (white, 1 px #EAEAEC, shadow-1, radius control) + company name **Inter Tight 600 22/28** Ink, gap 12, 48 from the top. |
| W2 | Ring rows at the bottom (every W screen and P2) | Small rings (about 24 per row, much smaller than drawn) across the whole width; when the page is pulled up (scroll or the trackpad bounce) the lower row stays **cut**, because the ring element itself is clipped | **Exactly as the board** (`W0-Desktop`, CSS `.wz .rings{margin-bottom:-36px}`): **9 rings per row, r 22, stroke 7, 106 apart** (SVG 900 × 167, centred); resting `accent-muted`, the three hot ones in the accent, nodding on the 24 s loop. In the normal view the **lower row is cut in half by the bottom edge of the window** (the reference files show this). The cut comes **only from the window's edge**: the rings are drawn whole and nothing clips them (no `overflow:hidden` on the ring wrapper or the page container; only `overflow-x:hidden` on the body). So when the page is pulled up, the lower row comes into view **whole**, never as half rings. Phone: 7 per row, r 12, stroke 5, margin-bottom −24, same rule. |
| W3 | Font | "Something with the font went wrong" — the greeting doesn't look like the design | Greeting is **Inter Tight** 600 (not Inter, not a fallback); check the font file is loaded on `/welcome` (it is a page outside the app frame). |

## T. Home — This week widget

Reference `LW06-week@1710` (all states, S / M / L).

| # | Where | Now | Must be |
|---|---|---|---|
| T1 | Today's sentence ("Michael: 3 years at the company today") | About 20/26, runs to 3 lines | **Inter Tight 500**: S **16/20**, M **19/23**, L as drawn; **at most 2 lines** (`-webkit-line-clamp:2`), then …; avatar **36** (S) / **44** (M) with a 2 px white ring, 10 to the text. Words unchanged ("{Name}: {n} years at the company today"). |
| T2 | Confetti, top right | Different shapes and places: a grey triangle, a small ring cut by the card's edge, dots and a stick in other spots | Exactly this SVG, `position:absolute; right:-8px; top:-4px; width:160px; height:88px`, only when someone celebrates today:<br>`<svg viewBox="0 0 200 110"><circle cx="150" cy="30" r="11" fill="none" stroke="{accent}" stroke-width="5"/><circle cx="186" cy="74" r="4.5" fill="none" stroke="#0B0B0C" stroke-width="3"/><circle cx="108" cy="16" r="4" fill="{accent 2}"/><rect x="170" y="8" width="12" height="4.5" rx="2.25" fill="{accent 2}" transform="rotate(-30 176 10)"/><path d="M160 92l5 8h-10z" fill="{accent light}"/></svg>`<br>Wine: accent #6E1630, accent 2 #8E1F5C, accent light #F2B8C6 (the triangle is a light tint of the accent, never grey). Other presets: the same roles. |
| T3 | Dates in the list | "Tue, Nov 17" | "17 Nov" — already H3 in the Home package; still open live. |

## S. Sidebar — collapse / expand

| # | Where | Now | Must be |
|---|---|---|---|
| S1 | The collapse button (`sidebar` icon 20) | Expanded: top right of the logo row (correct). **Collapsed: the button jumps to the bottom of the sidebar** | **As the folded sidebar on the board** (`references/D2-folded-sidebar@1440`, automations editor D2 / J4): 64 wide, `#F7F7F8`, 1 px #EAEAEC on the right, padding 20 0; on top the 32 company mark (radius 8), 16 under it the icons (40 × 32, radius 8, icon 20 #45454A, gap 4); at the bottom only Settings and the avatar. **There is no expand button at the bottom.** Hovering the folded sidebar opens the full sidebar over the page (J4). |

## B. Trial banner (top of every page)

| # | Where | Now | Must be |
|---|---|---|---|
| B1 | "This is a demo company with sample people. 14 days left in the trial. **Ask your account owner to go live.**" | The last sentence is shown | **Remove "Ask your account owner to go live."** The banner reads "This is a demo company with sample people. {n} days left in the trial." (+ the Go live button for those who can go live, as now). |

## E. Edit home — panel hint

| # | Where | Now | Must be |
|---|---|---|---|
| E1 | "Pick a size, then drag the widget onto your home or click +" (approved by Ulia 18 Nov) | A typed "+" at the end of the sentence | **"Pick a size, then drag a widget onto your home."** — no "+" in the text (the + button on each row explains itself). Style as E9 of the Home package (12/20 400 #6B6B70). |

## L. Home — Light top

Reference `HF02-home-light@1710/1470`.

| # | Where | Now | Must be |
|---|---|---|---|
| L1 | Date and greeting on the Light top | The greeting is tiny (about 14 px, "Good afternoon, Ulia"); the date sits right on it | The same as the Color top, only the colours change: date **14/20 500 accent #6E1630**, then **10**, greeting **Inter Tight 52/56 500, letter-spacing −0.02em, Ink**. |
| L2 | Light top in general | — | Re-check the whole Light top against HF02 after L1 (My profile pill: white, 1 px #EAEAEC, Ink text; ring #E9DCE0). |

## PE. People list — "Sample" chip

| # | Where | Now | Must be |
|---|---|---|---|
| PE1 | Name cell with the Sample chip (Ulia, 18 Nov; SPEC Long content: cut with … and a tooltip) | With a long name ("Alexander Rodriguez") the chip is pushed out and **cut by the Email column** | The Sample chip is **always shown whole**: chip `flex:none`, 8 after the name. **The name in front of it always truncates** with … when the two don't fit (`min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`), with the full name in a tooltip. The cell keeps 12 padding on the right. |

## M. Login emails (all of `sign-in-emails`, M1–M18)

Reference `email/M16-Mail.html` (open it and compare element by element in Gmail web and Apple Mail).

| # | Where | Now | Must be |
|---|---|---|---|
| M1 | **Sender** | Gmail shows "Local Sandbox via n…" / "Local Sandbox via noddo" | Ulia, 18 Nov (approved) — **the sender is always "noddo"**: `From: noddo <no-reply@noddo.so>` for every email, company ones included (replaces Q-21's per-company sender). Sign it with noddo.so's DKIM and SPF so Gmail drops "via". The subject stays as in the spec table — it says what happened ("785207 is your Local Sandbox login code"); the company is in it and in the email itself. |
| M2 | Type in the email | Everything looks heavier and wider than drawn (heading, company name, the code) — mail apps don't load web fonts, so the text falls back | Every font has a fallback stack that keeps the drawn weight: headings `'Inter Tight','Inter',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif` **600**, letter-spacing −0.02em, 44/46; company name in the band **18/24 600** white; body `'Inter',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif` 16/26 400 #45454A; the code `'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace` **600 36/44**, letter-spacing .16em, one string shown as 3 + 3. Never 700/bold anywhere (Gmail turns 600 into bold when the font is missing: set `font-weight:600` explicitly, not `<b>`). |
| M3 | The code box | — | Accent-subtle fill, 1 px accent at 18 %, radius 14, centred, as M16-Mail. |

## C. Login — code step and the login page

| # | Where | Now | Must be |
|---|---|---|---|
| C1 | "Check your email" — expired code | "This code has expired. **Resend** a new one." ("Resend" is the link) | **"This code has expired. Send a new one."** — "Send a new one" is the link (accent-text, underline on hover). Same in registration (B2) and every place with this error. |
| C2 | Login page (desktop) | "powered by noddo" **twice**: at the foot of the coloured pane and again at the foot of the white side | **Once on desktop: only at the foot of the pane** (spec `sign-in-root` § Common). The white side has no "powered by". On the phone it is the other way round: only at the foot of the white part. |
| C3 | Ring grid on the pane | Cut on the nod | See Z1 in the Company hub package (4 px of room on every side). |

---

## spec-updates

- `first-run-welcome/spec.md` — add to Where it lives: "The lower ring row is cut only by the window's edge; nothing clips the rings, so pulling the page up shows them whole." 
- `first-run-welcome/spec.md` — add: "The welcome runs once, at the first login; it is never linked from the app."
- New screen `profile-finish` (P2) — approved by Ulia on 18 Nov; built from the board's W3.
- `sign-in-company-login/words.md`, `sign-in-registration/spec.md`: "This code has expired. Resend a new one." → "This code has expired. Send a new one."
- `sign-in-emails/spec.md` — Sender: "noddo <no-reply@noddo.so>" for every email (Ulia, 18 Nov); close Q-21.
- `home-edit` words: "Pick a size, then drag the widget onto your home or click +" → "Pick a size, then drag a widget onto your home."
- Trial banner words: drop "Ask your account owner to go live."
