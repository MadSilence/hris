# Empty states, product-wide — every fix, with the exact target

For Petya's Claude Code. Checked live on 19 Nov 2026 at 1440×932 against `empty-state-illustrations-spec.md` (the 78 places — which scene, which size), SPEC § 10 and § 12, and `rules/TABLES_AND_LISTS.md` § 3.

How to use this folder:
- `reference/` — the correct EmptyState, NoResults and ErrorState as drawn and measured (the Documents boards D09, D10, D12): `export/*.html` (open in Chrome at 1440×932), `images/*.png` (1× and 2×), `measurements/*.md` (every element: position, size, font, colour + token). Every empty state in the product is built like these: illustration 200×125 (M) or 96 (S) → 14 → title 18/26 600 Ink → 6 → line 14/20 400 #45454A → 20 → actions, **centred in the free area under the toolbar**.
- `illustrations/` — the scene files (styles/noddo/assets/illustrations), to copy as they are.
- `now/` — how it looks live today.
- `empty-state-illustrations-spec.md` — the place-by-place table (scene, size).

## Empty states, product-wide — checked live 19 Nov (claude/empty-state-illustrations-spec.md: the 78 places; SPEC § 10 and § 12; rules/TABLES_AND_LISTS.md § 3)
How: every list page and settings page opened at 1440×932; where the sandbox has data, the list's API answer was emptied in the browser (only on this tab) to show its empty state; searches with "zzqqx"; the scene in each place identified path-for-path against `styles/noddo/assets/illustrations`.

**The scenes are right everywhere checked** (35 places): coming-soon on every placeholder (settings Approvals, Notifications, Integrations, API, Support; profile Public profile, Salary, Tasks, Notes), reviews-and-one-on-ones (Reviews, profile Reviews), welcome (Preboarding templates), attendance (Work schedule "Choose a person", Attendance overview), attendance-s S (profile Attendance log), documents (profile Documents, Document categories), forms (profile Forms), people (People list), tasks (My tasks), automations (Processes, Automations), all-caught-up (Inbox), legal-entity, team-and-org (Departments, Teams), job-families, policies (Roles; the 403 page), templates, history (Logs), time-off-m (Leave types), calendar (Public holidays, Calendar), no-results-s S (every search), 404 balls 480 ✓. Sizes M 200 / S 96 ✓; the ring takes the accent ✓.

What's wrong:
- ES1. [high · visual] **Not centred.** Rule (TABLES_AND_LISTS § 3, Ulia 18 Nov): empty, no-results and error states sit in the vertical centre of the free area under the page's toolbar. Live they sit right under it: coming-soon pages (illustration top y 201 at 1440×932, the free area runs to 932), Reviews (y 337), Roles (374), Templates (317), Document categories (289), Logs (350), Automations (301), Preboarding templates (357), Legal entities (409); Calendar goes the other way — the empty state is pushed to the bottom (y 696, text at the window's edge). One shared fix in `EmptyState`/`ListEmptyState`/`NoResults`: fill the free area and centre in it.
- ES2. [medium · content] **Titles rendered as small text or with a period.** Inbox: "No notifications yet." is a bare grey 14/20 #6B6B70 line with a period (rule: never a bare line of grey text; titles never end with a period — Ulia 19 Nov). Must be the EmptyState: all-caught-up M, title "Nothing to check" 18/26 600 Ink (no period) + "We’ll tell you when something needs your yes." (ES3). Same for Inbox search "No notifications match your search." (grey line, no title, no Clear search). Calendar: title 14/20 → 18/26 600. People search / Processes search: title "No results" 14/20 → the NoResults title 18/26 600.
- ES3. [medium · content] **Too many words** (SPEC § 12: at most 2 sentences of up to 8 words, each on its own line) and not in the voice guide: coming-soon ("This part of settings is planned and has not been built. Nothing here changes how the product works today."), Reviews, Preboarding templates, Work schedule, profile Forms, profile Reviews, My tasks, Processes, Legal entities, Job families, Roles, Document categories, Templates, Logs, Leave types, Public holidays, Attendance overview, People. Words approved by Ulia 19 Nov (written to the voice guide § 4 / § 6.4 — inviting, one line, a recommendation where we can give one; titles stay as they are except the Inbox; lines end with a period, titles don't):
  | Place | Title | Line |
  |---|---|---|
  | Every "coming soon" (settings and profile tabs) | {X} is not available yet | We’re building it — nothing to set up yet. |
  | Reviews | No review cycles yet | Most teams start with a 3-month probation review. |
  | Preboarding templates | No preboarding templates yet | Send joiners their paperwork before day one. |
  | Work schedule | Choose a person | Pick someone to see their weekly hours. |
  | Profile › Forms | No forms yet | Answers from questionnaires land here. |
  | Profile › Reviews | No reviews | Reviews show up here once they’re shared. |
  | My tasks | Nothing to do | You’re all caught up. |
  | Processes | No processes yet | Onboard your next joiner from their profile. |
  | Inbox | Nothing to check | We’ll tell you when something needs your yes. |
  | Legal entities | No legal entities yet | Add the company your people are employed by. |
  | Job families | No job families yet | Group roles into families to build career paths. |
  | Roles | No roles yet | Most teams start with an admin and a manager role. |
  | Document categories | No categories yet | Most teams start with Contract, ID and Certificate. |
  | Templates | No templates to apply | Start from one — it takes about five minutes. |
  | Logs | Nothing recorded yet | Every change people make will show up here. |
  | Leave types | No leave types yet | Most teams start with Vacation and Sick day. |
  | Public holidays | No public holiday calendars yet | Pick a template and the holidays are added for you. |
  | Attendance overview | Nobody in this period | Pick another period to see who worked. |
  | People (nobody yet) | No people yet | Add your first teammate — it takes a minute. |
  Each line is one line under the title, 14/20 400 #45454A (SPEC § 12). Searches and filters use ES5's words.
- ES4. [medium · ux] People list: one text for "nobody yet" and "a filter found nobody" ("Try changing filters or come back later."). Spec #18: empty = people M; filtered = no-match-s + "Clear all" (move it onto `ListEmptyState`).
- ES5. [low · content] Searches say different things: People / Processes "No results" / "Try a different search." + Clear search; Automations "No automations match these filters" for a plain search; Inbox a grey line. One NoResults everywhere with the approved Documents words, word for word: "Nothing called “{query}”" / "Try a different word." (T15); a filter that left nothing: "No {things} match" / "Try fewer filters." + "Clear all" (D10).
- ES6. [low · ux] Roles empty has no "Add role" action (every other settings list has its Add button in the empty state).
- ES7. [low · content] Apostrophes: "We can't find this page" (404) and "We'll draft the steps." (Automations) use straight ' → curly ’. 404 actions stay **"Go to home" (primary) + "Go back" (secondary)** as built — Ulia 19 Nov; SPEC § 12's [Search] is replaced (Changes to SPEC § 12). The animation is right: 480 wide, five balls fall, bounce, roll apart, play once (3.6 s, freeze), strokes as the package file ✓. Not tested: the still drawing under prefers-reduced-motion.

Not reached (need data the sandbox doesn't have, or a person/cycle to create): profile Trash and Balance history, Position history, automation runs / versions for a person, My reviews tabs, review cycle Participants / Reviewers / results / calibration / nomination, Review forms and the form editor, template task list, Assignment history, SSO groups, every "Show archived" view.
