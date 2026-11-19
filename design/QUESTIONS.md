# Open questions — design and code

Only open questions. When one is answered, delete it and write the answer where it lives (the
screen's spec, the package, or the owner's rules). The format is in `HANDOFF.md` § "Questions".


> **2026-11-19:** Q-45–Q-47, Q-50–Q-52, Q-55 and Q-56–Q-70 are written out in detail — where to look, what is drawn and built, the options and the answer format — in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md` (ids DQ-01–DQ-22).

## Q-15 — Terms as a line instead of a checkbox · sign-in-registration · from designers · 2026-11-13
B1 has "By continuing, you agree to the Terms and the Privacy policy." under the three ways in; Notion had a checkbox (which Google/Microsoft skipped anyway).
Recommended: the line. Legal should confirm an explicit checkbox isn't required for our EU markets.
**Blocks:** nothing

## Q-17 — Setting two-step up again from D3 · sign-in-second-step · from designers · 2026-11-13
With 1 or 0 backup codes left, D3 offers "Set up again" → D4 → D5 with a new set, right from the login.
Recommended: allow it (the person just proved a factor). If the backend can't, D3 keeps "Continue" and the warning only.
**Blocks:** nothing

## Q-18 — The full demo for sales demos · first-run-setup · from designers · 2026-11-13
The wizard offers only Example company (8 · 25 · 60 · 150) or Start empty, as you drew; "Full demo" is removed from the code, not hidden. What is left of the question: should a full demo stay reachable anywhere, for example for sales demos?
Recommended: not in the wizard; if sales needs one, it is a separate operator tool, asked for when sales exists.
**Blocks:** nothing

## Q-25 — Logo file formats and size · sign-in-appearance · from designers · 2026-11-13
Drawn: "PNG, JPEG or SVG, at least 256 × 256 px", refused above 5 MB.
Recommended: the limits the code already uses for the logo; tell us and we fix the words.
**The code's limits (2026-11-13):** PNG, JPEG or WebP, up to 5 MB, checked by the file's bytes. No SVG: the logo is served without a session, and an SVG can carry script. No minimum size is enforced. The page says "PNG, JPEG or WebP" until you fix `words.md`.
**Blocks:** nothing

## Q-28 — The ring row in emails per company · sign-in-emails · from designers · 2026-11-13
The band's rings are a static image; with "Your own" and with the Light background they have to be generated per company (or drawn as a table of circles).
Recommended: generate the PNG when the colour or the background is saved.
**Blocks:** nothing

## Q-44 — The Templates round: templates are written in noddo, not uploaded · documents templates · from code · 2026-11-18
The owner decided on 2026-11-18 that a document template is **a document written in noddo's own editor** (the
company hub's TipTap editor), not an uploaded Word file. Its text carries **field chips** from the attribute
vocabulary and **signature blocks** where each signer signs. It has versions, and every generated document remembers
the version it was made from. The PDF is made from it in the company's style. A DOCX is only imported (converted
into the editor) or exported. The AI drafts a template, proposes edits as changes to blocks and finds what is missing,
and a person publishes.
The brief for the Templates round follows this; the drawn screens already fit it ("who signs" and "time to sign" come
from the template).
**Blocks:** the Templates round's drawing only

## Q-45 — The ⋯ in read mode · automations-editor · from code · 2026-11-19
`design-fixes-automations-1` CR1 asks for ⋯ beside × in read mode too. Nothing in the step menu works there (Duplicate, Skip for now and Remove step all change the automation), so read mode shows × only.
Recommended: no ⋯ in read mode; or tell us what it should hold.
**Blocks:** nothing

## Q-46 — Turn on's waiting-items words for the other triggers · automations-test-and-turn-on · from code · 2026-11-19
V6's noun and hint now follow the trigger. Time off and Someone is hired are yours; for a date, a person and other events the code says "Only new dates / people / cases", "Also the {n} … already waiting" with a hint in the same pattern.
Recommended: check the words in the catalogue (`automationsEditor.json`, `turnOnDialog.waiting.*`) and send fixes.
**Blocks:** nothing

## Q-47 — Template card line 2 doesn't match what some templates do · automations-start · from code · 2026-11-19
`Main` draws "Tell HR" on Onboarding completed, "Tell their team" on Work anniversary and Birthday, "Task for HR" on A document about to expire, "Email" on the monthly reminder. The templates tell the manager, the manager, the person and their manager, and send a notification. The code writes what they do.
Recommended: redraw `Main` from the code's lines.
**Blocks:** nothing

## Q-49 — Answers to the hub and Home widgets packages · company-hub*, home-widgets · from code · 2026-11-19
The owner's answers to what the two packages left to the product (`(claude)/DECISIONS.md` § "The designers' Company hub and Home widgets fixes, round 1"):
- **My time (LW04) stays out of the product** — the answer of 18 Nov stands; drop it from the defaults and from Edit home's "can't be removed" note.
- **What changed (N2) is written by the editor** until the assistant exists: an empty field, no "Drafted by AI" label.
- **No new Waiting on you kinds now**: no expenses module; "time off approved" is news for the inbox; an announcement is not an action; "missing data" waits on a decision about which fields people own.
- **Post types are gone**, as you asked.
**Blocks:** nothing

## Q-50 — Per-screen search placeholders · company-hub* · from code · 2026-11-19
A7 asks for "Search news", "Search posts", "Search pages", "Search people". A settled rule (`rules/ACTIONS_AND_MENUS.md` § 4) says every search box reads "Search", and the boxes say that today.
Recommended: keep "Search" everywhere; or change the rule for the whole product, not per screen.
**Blocks:** nothing

## Q-51 — "With us" under a week · people profile · from code · 2026-11-19
Z2: the profile spec has no wording for a stay under a week. Built: "Joined today", then "{n} days", then whole weeks.
Recommended: confirm or send the words.
**Blocks:** nothing

## Q-52 — Avatar tints are the tag tokens · system · from code · 2026-11-19
Widgets A1 lists berry #FBE7ED and sand #F5EBDD; the package's tag tokens are berry #F1E4EB and bronze #EFEAE2, and the avatars use the tokens.
Recommended: the tokens; change them in the package if the HEX in the file is the intent.
**Blocks:** nothing

## Q-54 — Answers to the login package · sign-in-* · from code · 2026-11-19
Built and walked: A, C9–C15, R1–R4, B1, B4, B5, P1–P3, D7, E1. **Not built:** B3 — the Terms and Privacy pages don't exist yet, so the words stay text until they do. **No bot check for now** (S2–S3, the owner); the limits instead (S1), refused with the existing words:

| Form | Per email | Per IP |
|---|---|---|
| Trial: send a code | 5 an hour | 30 an hour |
| Trial: check a code | 5 tries a code | 60 an hour |
| Find your company | 1 email per 15 min, silently | 5 per 30 min |
| Login code: send | 5 an hour | 30 an hour |
| Login code: check | 5 tries a code | 120 an hour |
| Forgot password | 5 an hour | 30 an hour |
| Password | restricted after 10 wrong, locked after 20 | 10 wrong per 30 min for unknown addresses |
| Second step | 5 tries a challenge, then a pause | — |

**Where to run what you couldn't:** a trial opens on a sandbox only when Petya turns registration on there; invitations, a first login and the welcome run on a second company, **`live-sandbox`** — live, not a demo — where you log in with your usual password at your address with `+1` before the @; you are System Owner in both. B2: Google and Microsoft aren't configured on any sandbox yet; on production they will show. E2 (no "via") needs the sending domain signed — Petya's side.
**Blocks:** nothing

## Q-55 — The code box in focus: ring or no ring · sign-in-company-login, sign-in-registration · from code · 2026-11-19
C12 says "a 1 px accent border"; `CodeInput` in sign-in-registration § Values adds the 3 px muted-accent ring every field has in focus. Built with the ring.
Recommended: keep the ring — the code boxes are fields and every field has it; drop it in the spec if the plain border is the intent.
**Blocks:** nothing

## Q-56 — Home widgets H6 for Small · home-widgets · from code · 2026-11-19
H6 (round 1) gives an empty widget an illustration, a line and a button. A Small widget is a 160-high card: below its title row there is no room for all three, so Small was left as it was.
Recommended: Small shows the line and the button, no illustration; draw it if you want something else.
**Blocks:** nothing

## Q-57 — CM07's Apply while the audience reaches nobody · company-hub-manage · from code · 2026-11-19
The spec says twice (CM07's footer, and States → No results) that Apply is disabled while the result is 0 people. It is built hidden: the product rule is that nothing is shown disabled, and the summary already says "No one matches these filters".
Recommended: change the two places in the spec to "Apply is not shown".
**Blocks:** nothing

## Q-58 — CM08's overdue rows · company-hub-manage · from code · 2026-11-19
The package says the CM08 overdue rows were not checked live, and draws no frame for them. They are built with no mark of their own; the page header already says "due 12 Nov".
Recommended: no row mark; or draw one (a Pending "Overdue" pill as in CH03, say) and we build it.
**Blocks:** nothing

## Q-59 — Edit home's zoom on Windows · home-edit · from code · 2026-11-19
The package's arithmetic gives 0.745 at 1710 and 0.585 at 1470. On Windows the classic scrollbar takes 15 px of the page, so the real zoom is 0.7325 and 0.579; the band follows the same zoom.
Recommended: accept — the arithmetic follows the real width, so nothing is cut or overflows.
**Blocks:** nothing

## Q-60 — The Automations chart's grey dot has no token · home-widgets · from code · 2026-11-19
The widgets package draws the "no runs" dot #D3D3D8, which is no token. It is built with `field` #DADADF.
Recommended: add a token for it in the package, or accept `field`.
**Blocks:** nothing

## Q-61 — Two things for the next package version: the nine presets and `--band-tint` · system · from code · 2026-11-19
The package's `tokens.css` still has the old ten accent presets; seven of the nine are derived in code meanwhile (the former Q-29, deleted on 2026-11-18 although the CHANGELOG line of that day still says it waits). Home's band tint is built as `--band-tint` (Rose on Wine, the accent mixed into what sits on the band otherwise); the package calls it `accent-tint`.
Recommended: put the nine presets and the band tint (under one name — ours or yours, tell us) into the next package version.
**Blocks:** nothing

## Q-62 — Edit home's panel never loads · home-edit · from code · 2026-11-19
The spec and round 1 draw a loading state (EF04) and an error state (EF07) for the widget panel. The panel's list is part of the app itself, not read from the server, so it can neither load nor fail, and neither state is built. The zoomed page under it is Home's own grid, with each widget's own loading and error states.
Recommended: drop EF04 and EF07 from the spec; or tell us what should load there.
**Blocks:** nothing

## Q-63 — Small deviations to fold into the specs · several screens · from code · 2026-11-19
Each screen's "Built" lists small differences that the owner accepted. Please fold them into your specs (or tell us which you want built as drawn):
- **home-widgets:** Approve's Undo is a 5-second hold, the answer sent when the toast closes; Mark done only on a task with nothing to fill (others offer Start).
- **automations-editor:** conditions are one flat AND list everywhere; initials in the editor are 12, not 11.
- **automations-list:** Change owner's "Owner now" shows no role; times show without a zone abbreviation.
- **automations-run-history:** steps on a path the run did not take are not listed.
- **company-hub:** the agree bar on a short page sits 32 above the edge.
- **company-hub-page:** What changed compares with the version the reader agreed to, so a small fix since then shows as changed too.
- **company-hub-manage:** "Add filter" opens the CM07 dialog, not a popover; the hub's editors are an ordinary role, "Hub editors", also in Settings → Roles.
- **documents-tab:** folder icons are the folder plus nine from the hub's set.
- **documents-requests:** R10 names who was not asked by reason and count, not one by one.
- **documents-send-for-signature:** "Their manager · {name}" is a one-click button that adds today's manager as a person, not a role resolved later.
- **process-sign-task:** Add task keeps its kind cards, not a three-way segmented control.
- **first-run-photo:** P7's progress bar is simulated (an upload gives no progress); it completes with the answer.
- **first-run-welcome:** W1 also offers *Set a password instead* to someone with no password.
- **sign-in-appearance, first-run-welcome:** a logo or photo is PNG, JPEG or WebP, no SVG (Q-25).
Recommended: accept, fold into the specs.
**Blocks:** nothing

## Q-64 — The slogan in Russian · sign-in-root, sign-in-registration · from code · 2026-11-19
The Wine pane says "Every yes, handled." with "handled." in Rose; a Russian page shows it in English.
Recommended: send the Russian line and which word is Rose.
**Blocks:** nothing

## Q-65 — A code used up by wrong tries says "expired" · sign-in-company-login, sign-in-registration · from code · 2026-11-19
Written out as DQ-17 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing

## Q-66 — Finish your profile: which fields a person fills in themselves · profile-finish, first-run-welcome · from code · 2026-11-19
Written out as DQ-18 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing

## Q-67 — Data the Home cards draw but noddo does not have (W10, W11, W12, K7) · home-widgets · from code · 2026-11-19
Written out as DQ-19 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing

## Q-68 — Agreeing to a hub page from the inbox · inbox-needs-action, company-hub-page · from code · 2026-11-19
Written out as DQ-20 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing

## Q-69 — Where the test envelope of "Send the document to me" lands · automations-send-for-signature · from code · 2026-11-19
Written out as DQ-21 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing

## Q-70 — Two new lines of text (W15, CM01) · home-widgets, company-hub-manage · from code · 2026-11-19
Written out as DQ-22 in `handoffs/2026-11-19-questions-to-design/QUESTIONS-2026-11-19.md`.
**Blocks:** nothing
