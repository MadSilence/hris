# Open questions for the designers — after the fix rounds of 18–19 Nov

From the code side (Petya's Claude Code), 19 Nov 2026. For Ulia and her Claude.

## Scope

**What this is.** Everything the fix rounds left that needs your eye:
- `design-fixes-round-1`;
- `-automations-1` and `-misc-1`;
- `-company-hub-1` and `-home-widgets-1`;
- `-login-1`;
- the documents round of 17 Nov.

Each item says where to look, what you drew, what is built, and why. Every item has an id `DQ-nn`; the ones that also live in `QUESTIONS.md` give that number too.

**How to check an item against the design:**

| What | Where |
|---|---|
| A screen's spec, and its "Built" sections (what differs) | `design/screens/<name>/spec.md` |
| The fix packages you sent, with their row ids (CR1, H6, CM07…) | `design/handoffs/2026-11-1*-fixes-*/` |
| The words on screen | `messages/en/<area>.json`; a key is given as `file › path` |
| The live build | the commits `hris bd7b36df` and `hris-api 9558310`, both pushed on 19 Nov. A sandbox built from them shows everything below. |

**Answer in the format at the end**, one block per id. An item you skip, we read as "no opinion yet", and nothing changes.

---

## A. Decisions we need from you

### DQ-01 · The ⋯ in a step window in read mode · `automations-editor` · QUESTIONS Q-45
- **Drawn.** `2026-11-18-fixes-automations/FIXES-automations.md` row **CR1**: the step window in read mode has "Step N" + step type, then **⋯ and ×**.
- **Built.** × only in read mode. Edit mode has both.
- **Why.** Read mode is an automation you are looking at, not editing. Everything the step's ⋯ menu holds changes the automation: Duplicate, Skip for now, Remove step. A menu whose every item is refused is what our rule "nothing shown disabled" forbids.
- **Options.**
  - **a.** No ⋯ in read mode. *(recommended)*
  - **b.** A ⋯ with read-only items. Name them. None exists today.

### DQ-02 · Turn on: the waiting-items words for the triggers you did not draw · `automations-test-and-turn-on` · Q-46
- **Drawn.** V6 for *Time off requested* and *Someone is hired* only.
- **Built.** The dialog picks one of five word sets by the trigger. Keys are in `automationsEditor.json › turnOnDialog.waiting.<set>.{onlyNew, also, hint}`. Yours are the first two rows:

| Set | Used by | onlyNew | also | hint |
|---|---|---|---|---|
| requests | Time off requested | Only new requests | Also the # requests already waiting | Sent before today and not yet decided. They start right away. |
| hires | Someone is hired | Only new hires | Also the # people already hired | Hired before today, first day still ahead. They start right away. |
| dates | A date comes (birthday, anniversary, a date field) | Only dates still to come | Also the # people whose date has already come | Their date came before today. They start right away. |
| people | Someone starts to match | Only people who start to match | Also the # people who already match | They match Who it runs for today. They start right away. |
| cases | Any other event | Only new cases | Also the # cases already waiting | They already match what starts it. They start right away. |

- **Asked.** Confirm the last three rows, or send replacement words (English; we translate).

### DQ-03 · The template cards' second line · `automations-start` · Q-47
- **Drawn.** Frame `Main`: line 2 says what a template does.
- **Built.** Line 2 says what the template actually does (`automationsList.json › templates.does`):

| Template | Your frame | What it does (built) |
|---|---|---|
| Onboarding completed | Tell HR | Tell their manager |
| Work anniversary | Tell their team | Tell their manager |
| Birthday | Tell their team | Tell their manager |
| A document about to expire | Task for HR | Tell them and their manager |
| Monthly details check | Email | Remind everyone to check their details |
| Termination (`termination-hr`) | — | Tell HR ← **will change**: the product never says "HR", and the owner is rewording it |

- **Options.**
  - **a.** Redraw `Main` from the built lines. *(recommended)*
  - **b.** Send other words. They must describe what the template does, and never "HR".

### DQ-04 · Search placeholders per screen · `company-hub`, `company-hub-manage` · Q-50
- **Drawn.** `2026-11-19-fixes-company-hub/FIXES-company-hub.md` row **A7**: "Search news", "Search posts", "Search pages", "Search people".
- **Built.** "Search" everywhere, by the settled rule `rules/ACTIONS_AND_MENUS.md` § 4 (every search box reads "Search"; the screen already says what is being searched).
- **Options.**
  - **a.** Keep "Search". *(recommended)*
  - **b.** Change the rule for the whole product: then every search box in noddo gets "Search {things}", and we do it everywhere at once.

### DQ-05 · "With us" under a week · people profile header · Q-51
- **Drawn.** Hub package row **Z2** asks for "With us" for someone hired today. The profile spec has no words for a stay shorter than a week.
- **Built.** `organization.json › …tenure`: "Joined today" → "# days" → "# weeks" → "# months" → "# years" → "{years} y {months} m".
- **Asked.** Confirm, or send the words for day 0 and for 1–6 days.

### DQ-06 · Avatar tints · system · Q-52
- **Drawn.** `2026-11-19-fixes-home-widgets/FIXES-home-widgets.md` row **A1** lists berry **#FBE7ED** and sand **#F5EBDD** among the initials tints.
- **Built.** The tints are your tag tokens: berry **#F1E4EB**, bronze **#EFEAE2**, plus ocean, indigo, teal, plum. There is no "sand" token.
- **Options.**
  - **a.** The tokens as they are. *(recommended)*
  - **b.** The HEX in A1 is the intent: change the tokens in the package, and we take the new version.

### DQ-07 · The code box in focus: ring or no ring · `sign-in-company-login`, `sign-in-registration` · Q-55
- **Drawn.** `2026-11-19-fixes-login/FIXES-login.md` row **C12**: "the box in focus has a 1 px accent border".
- **Built.** The 1 px accent border **plus** the 3 px muted-accent ring. That is how `CodeInput` is specified in `sign-in-registration/spec.md` § Values, and how every field looks in focus.
- **Options.**
  - **a.** Keep the ring: the boxes are fields. *(recommended)*
  - **b.** No ring on code boxes only. Fix the registration spec to match.

### DQ-08 · Small widgets with nothing to show (H6) · `home-widgets` · Q-56
- **Drawn.** Your Home round 1 package, row **H6**, gives every empty widget the illustration, a line and a button.
- **Built.** Medium and Large have this. Small is a card **160 high**, and it has no room for illustration + line + button. Today Small shows the line and the button.
- **Source.** `home-widgets/spec.md` "Built" says "asked back", but the question was never filed. This is it.
- **Options.**
  - **a.** Small = line + button, no illustration. *(recommended)*
  - **b.** Draw Small's empty state.

### DQ-09 · CM07 Apply with an empty audience · `company-hub-manage` · Q-57
- **Spec.** The spec contradicts itself:
  - its body (§ CM07 point 4 and the States table, "No results") says **Apply is disabled** while the filters match 0 people;
  - its "Built" says **Apply is not shown**.
- **Built.** Hidden. The summary says "No one matches these filters". Our rule is that nothing is shown disabled.
- **Asked.** Change the two places in the spec body to "not shown" *(recommended)*, or tell us what you want instead.

### DQ-10 · CM08: a person's row once the agree-by date has passed · `company-hub-manage` · Q-58
- **Drawn.** CM08 (who agreed to a must-read page) has no frame for the overdue case.
- **Built.** The header says "due 12 Nov". The rows of people who have not agreed carry **no mark of their own**. CH03 (Overdue pill + "Was 12 Nov") and CM01 (the amber *Missed the deadline* tile) do show overdue, as drawn.
- **Options.**
  - **a.** No row mark; the header is enough. *(recommended)*
  - **b.** Draw the overdue row.

### DQ-11 · Edit home's zoom on Windows · `home-edit` · Q-59
- **Drawn.** Your Home round 1 package gives the edit-mode page zoom as **0.745 at 1710** and **0.585 at 1470**. The spec's older numbers are 56 % at 1440 and 44 % at 1280.
- **Built.** The zoom is computed from the real width left beside the 480 panel. On Windows the classic scrollbar takes **15 px** of the main area, which a Mac does not, so the result is **0.7325 at 1710** and **0.579 at 1470**. Without that scrollbar (a Mac with overlay scrollbars) the same arithmetic should land on your numbers — not measured on a Mac.
- **Options.**
  - **a.** Accept: the zoom follows the real width. *(recommended)*
  - **b.** You want fixed numbers whatever the scrollbar: say so.

### DQ-12 · The grey dot in the Automations chart · `home-widgets` · Q-60
- **Drawn.** A run that did nothing is a dot **#D3D3D8**.
- **Built.** **#DADADF** (`border-field`), because #D3D3D8 is not a token.
- **Options.**
  - **a.** Accept `border-field`. *(recommended)*
  - **b.** Add a token for #D3D3D8 in the package, and we switch to it.

### DQ-13 · Two things for your next package version · system · Q-61
- **The nine accent presets.** The owner settled nine (Q-24). The package still ships ten, so seven of the nine are derived in code. Put the nine in `tokens.json`. The old Q-29 was deleted from `QUESTIONS.md` by mistake while `CHANGELOG.md` still points to it, so this item replaces it.
- **`--band-tint`.** The band's tint is Rose on Wine, and on any other accent the accent mixed into what sits on the band. Your package names it `accent-tint`. Add it to the next version under either name: tell us which, and we rename.
- **Asked.** Confirm both go into the next version, or tell us otherwise.

### DQ-14 · Edit home's panel while it loads or fails · `home-edit` · Q-62
- **Drawn.** The widget panel (480, right) has no loading or error state.
- **Drawn.** Your Edit home package draws the panel loading (EF04) and failing (EF07).
- **Built.** Neither: the panel's list of widgets ships with the app (`components/modules/home/widgets/catalogue.ts`) and is never fetched, so the panel cannot be loading or fail. The one thing that can fail is **Save**: a toast "Couldn’t save your home" with **Retry** (`home.json › edit.toasts.saveFailed`). Each widget on the zoomed page keeps its own loading and error state, as on Home.
- **Options.**
  - **a.** Drop EF04 and EF07 from the spec; accept the Save toast. *(recommended)*
  - **b.** Draw the failed Save differently.

### DQ-15 · The slogan in Russian · `sign-in-root`, `sign-in-registration` · Q-64
- **Drawn.** The Wine pane carries "Every yes, handled." (Inter Tight 600 24/30), with "handled." in Rose.
- **Built.** A Russian page shows the English slogan: there is no Russian text, and the Rose word has to be chosen.
- **Asked.** Send the Russian line and say which word is Rose.

### DQ-16 · Small differences in the specs' "Built" — accept, or flag · Q-63
Each line is built and walked. It differs from your spec only as described. Accept each, and fold it into your spec, or flag the ones to change. Answer per line: `ACCEPT` / `CHANGE: …`.

**home-widgets**
- 16.1. Approve's Undo is a 5-second hold before the answer is sent, not an undo after sending.
- 16.2. *Mark done* is offered only on a task with nothing to fill in. A task with a form opens it.
- 16.3. The 18–19 Nov rounds drew three things the data does not exist for, so they are not shown:
  - a task's due **time**;
  - a review's **question count**;
  - a document's **pages and minutes to read**.

  The review card's cycle name is being decided by the owner.
- 16.4. To sign (Large) shows no "From HR": a task's signature has no sender, and the product never says "HR".

**home-edit**
- 16.5. "My time" is out of the product (the owner, Q-49). Drop it from the role defaults and from the "can't be removed" note.

**automations-editor / -list / -run-history / -steps / -triggers**
- 16.6. Conditions are one flat AND list everywhere, the trigger's "Only when" included. No Or, no groups.
- 16.7. Initials in the editor's avatars are 12, not 11.
- 16.8. Change owner's "Owner now" shows no role: a person reference carries none.
- 16.9. Times show no time-zone abbreviation.
- 16.10. Run history does not list steps on a path that was not taken.
- 16.11. A people row in a step shows the office, without the job.
- 16.12. A time-off policy reads "{n} days" or "No limit".
- 16.13. Month → "A weekday" adds a which-week select.

**company-hub / -page / -manage**
- 16.14. "Add filter" (L7) opens the CM07 dialog, not a popover.
- 16.15. Hub editors are an ordinary role, "Hub editors", given like any role.
- 16.16. The agree bar sits 32 above the window's edge, not 24, because of the app shell's padding.
- 16.17. "What changed" compares with the version this reader agreed to, not with the previous version.

**documents-***
- 16.18. Folder icons are the folder plus nine icons from the hub's set.
- 16.19. R10 summarises who was not asked by reason and count, not one by one.
- 16.20. "Their manager" in Send for signature adds today's manager as a person, not a role that follows a change of manager.

**process-sign-task**
- 16.21. The kinds are cards, not a SegmentedControl.
- 16.22. The timing is the cell you clicked.

**first-run-*, sign-in-appearance**
- 16.23. The photo upload's progress bar (P7) is simulated, not real progress.
- 16.24. "Set a password instead" was added by us, in the welcome.
- 16.25. Logo formats are PNG, JPEG or WebP; no SVG (Q-25). Fix `words.md`.

**sign-in-***
- 16.26. No white page on the way to Google or Microsoft (E1): the button shows a busy label instead.
- 16.27. The email footer carries no company postal address.
- 16.28. Terms and Privacy on the trial are plain text until the pages exist. The owner writes the texts.

### DQ-17 · A code used up by wrong tries says "expired" · `sign-in-company-login` C10, `sign-in-registration` B2 · Q-65
- **Today.** A login code or a trial code takes five wrong tries. The fifth answers "Too many attempts. Try again later." (`errors.json › AUTH00031`). From then on, that code answers **"This code has expired. Send a new one."** (`AUTH00023`), with the *Send a new one* link. The code never ran out of time; the wrong tries used it up.
- **Your rule** (login package C14): never say "expired" for a code that did not expire.
- **Asked.** Words of its own for this case. The *Send a new one* link stays.
- **Proposed.** "Too many wrong codes. Send a new one."

### DQ-18 · Finish your profile: which fields does a person fill in themselves · `profile-finish`, `first-run-welcome` W3 · Q-66
- **Drawn.** `2026-11-18-fixes-misc` P2–P3: `/profile/finish` and its menu item ask for every blank field of the person's own profile that their role lets them edit. Your frame shows Preferred name, Date of birth and Languages.
- **Built.** The page as drawn. But with the roles noddo ships, an Employee may **view** their own fields and edit **none**. So the page, its menu item and the welcome's W3 step show nothing to anybody. A company that grants such fields itself sees them.
- **Asked.** Which fields a person should fill in about themselves by default; the owner gives the Employee role edit rights on exactly that list.
- **Proposed.** Preferred name, date of birth, languages, phone, emergency contact.

### DQ-19 · Data the Home cards draw but noddo does not have · `home-widgets` W10, W11, W12, K7 · Q-67

| Row | Drawn | Built | To show it we would need |
|---|---|---|---|
| W11 review card | Line 1 the **cycle's name**, a "{n} questions" chip | Line 1 the task's title "Write your self review", no chip | the cycle name and question count on the review task (small backend work) |
| W10, K7 a task | A due **time** | The due date only | tasks to have a time, not a date (a model change) |
| W12 a document to sign | "{n} pages · {m} min" | Nothing | page count stored when the PDF is made; reading time estimated |

- **Asked.** For each row, whether the card needs it. A yes means we build it; a no means the spec drops it.
- **Recommended.** W11 yes (cheap and useful); W10/K7 no (a task is due on a day); W12 not now.

### DQ-20 · Agreeing to a hub page from the inbox · `inbox-needs-action`, `company-hub-page` · Q-68
- **Conflict.** The notifications brief (`briefs/NOTIFICATIONS_BRIEF.md` § 4) lets the inbox row for a must-read page carry *Agree*, so a person can agree without leaving the inbox. Your hub rule (`company-hub-page`, U3) is that a person agrees **after reading**, from the agree bar at the end of the page.
- **Built.** The inbox row opens the page; there is no Agree in the row.
- **Options.**
  - **a.** The row only opens the page. *(recommended: an agreement nobody read is worth little)*
  - **b.** Agree in the row too. Draw it.

### DQ-21 · Where the test envelope of "Send the document to me" lands · `automations-send-for-signature` · Q-69
- **Built.** Test run → *Send the document to me*:
  - the envelope goes to the tester only;
  - it is **filed in the tester's own Documents**, not on the person the case is about;
  - it shows in the test strip;
  - *Delete test items* cancels it and deletes the file and the notification.

  The earlier spec said nothing would be filed.
- **Options.**
  - **a.** As built. *(recommended: the tester can open and sign it like a real one)*
  - **b.** Nothing filed: the envelope lives only in the test strip.

### DQ-22 · Two new lines of text · `home-widgets` W15, `company-hub-manage` CM01 · Q-70
1. **W15, a must-read page someone has never agreed to.**
   - Today the card always says "{page} · was updated". That is wrong for a page the person never agreed to (the API says `what: NEW`).
   - The owner decided on two lines: "was updated" stays for an update to a page they agreed to before; a first-time line for a new page.
   - **Proposed:** "to read and agree".
2. **CM01 with no must-read page open but some past the deadline.**
   - Today the tile reads "Must-read pages open · 0 · No must-read pages", next to the amber *Missed the deadline* tile that lists one. "No must-read pages" is the empty hub's line.
   - **Proposed:** "{n} past the deadline".
- **Asked.** Confirm or replace each line.

---

## B. For your information — no answer needed

- **Q-49, the owner's answers to the hub and widgets packages.** My time stays out. What changed is written by the editor until the assistant exists (no "Drafted by AI"). No new Waiting on you kinds now. Post types are gone.
- **Q-54, the login package.** What is built. The rate limits per form, which replace a bot check for now. Where to run what you could not: the second company **`live-sandbox`**, live and not a demo, at your address with `+1` before the @, your usual password, System Owner in both companies.
- **"HR" leaves automations too** (the owner, 19 Nov). The list's line becomes "Routine people work that runs by itself.". The termination template becomes "Tell a role about a termination" (it tells every person of the role chosen), with the card line "Tell the people you choose". The assistant's example ends "…and tell the people team". Use these lines when you redraw `Main` (DQ-03).
- **One more login limit** (add it to Q-54's table). 50 wrong passwords to existing accounts from one IP in an hour, and that IP is refused every password login for 30 minutes, a correct one included, with "Too many failed attempts. Try again later." A code by email and Google / Microsoft still work. No new screen: it is the C9 alert you already drew.
- **Every email the sandbox sends goes to Petya and you**, whoever it is addressed to, until the end of the MVP. The subject starts with `[to: <the real recipient>]`. So an invitation, a reset link or a digest for any test person lands in your inbox. **Your seed address is now `ula@noddo.so`**, and `ula+1@noddo.so` in `live-sandbox`; your password is unchanged. It takes effect when Petya rebuilds the sandbox.
- **Q-53 is closed.** Your sandbox showed old bugs because it ran the last commit; everything is committed now.

## C. Waiting on you — no question, but the work behind it is blocked

Give us a status or a date for each in your answers.

1. **Templates** — `design/briefs/DOCUMENTS_TEMPLATES_BRIEF.md`. **The most urgent.** Without the template editor screen, a company can only make a template through the API. Three things depend on it:
   - Send for signature;
   - the Sign task;
   - "Open the template" from the automation step.
2. **Notifications** — `design/briefs/NOTIFICATIONS_BRIEF.md`.
   - Its § 11 holds seven questions for you:
     1. the row's anatomy;
     2. how Needs action groups;
     3. how a lock explains itself;
     4. the daily email's layout;
     5. the catalogue;
     6. titles and icons of the new lines;
     7. Home's sign card.
   - Screens it asks for: `inbox-needs-action`, `inbox`, `notification-preferences`, `notification-emails` (including the daily email, never drawn), and `settings-notifications`.
   - `inbox-needs-action` also decides **one Undo for the whole product**: today Home holds an answer for 5 seconds, and other screens show an Undo toast after the fact.

---

## How to answer

One block per item. Keep the ids and the field names exactly; leave a field empty when it does not apply.

```markdown
### DQ-01
Decision: a            <!-- the option letter; or ACCEPT (= the recommended one) / CHANGE / DRAW / LATER -->
Values:                <!-- exact numbers, HEX or token names, words in English (Russian only for DQ-15) -->
Frames:                <!-- path of a new or changed frame in your package, e.g. handoffs/2026-11-2x-…/references/CM08.html -->
Spec edited:           <!-- which spec.md and section you changed, if you changed it -->
Note:
```

- **For DQ-16**, one line per number instead of a block: `16.4 ACCEPT` or `16.9 CHANGE: show "CET" after the time`.
- **For part C:** `Templates: <status / date>` and `Notifications: <status / date>, § 11 answers in <file>`.
- **New frames** come as usual: a `design-fixes-*.zip` with HTML references (no screenshots needed), where a number in the file beats the HTML.
- **Words** always in English; we write the Russian.
