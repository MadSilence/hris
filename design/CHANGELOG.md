# What changed in the code — for the designers

Newest first. One line per change a designer should know about: a new shared component, a changed
rule in `rules/`, a deviation from SPEC (it is also in `rules/DESIGN_SYSTEM.md` § 7), a new package
version taken in.

- **2026-11-13** — **Appearance built** (`screens/sign-in-appearance`, `built`). The presets are the nine (Q-24);
  the package still has the old ten, so seven of the nine are derived in code meanwhile (Q-29). **A light accent writes
  Graphite, not Ink**, on its fill, product-wide. **A red workspace** (Cherry, Tangerine, a close "Your own") turns the
  confirm dialog's destructive button into a red outline — `data-accent-tone="red"` beside the accent, the rule in
  `styles/globals.css` (Q-30 says how "close" is measured). The company **background** (Your color · Light) paints the
  login pane and sets Home's default top. New components to carry into the package: the **ring swatches** with the nod,
  the **colour picker** (square, hue bar, Color code), the **logo drop zone**, the **preview stage**.
- **2026-11-11** — **Home built from the handoff** (`screens/home`, `home-edit`, `home-widgets`, all `built`; what
  differs is each spec's "Built"). The owner left out **My time** and **To sign**, made the AI box a stub and the
  birthday a person's own choice (`QUESTIONS.md` Q-7). Deviations from SPEC follow each spec's "Changes to SPEC" and
  are tokens in `styles/globals.css`, for Home only: `rounded-widget` 28, `rounded-ai-box` 18, `rounded-tint` 12,
  `shadow-widget`, `shadow-deck`, `text-home-greeting`, `text-widget-title`, `text-deck-line`, `text-hero-s/m/l/xl/xxl`,
  the band and its ring. New components to carry into the package: **`WidgetCard`**, **`WidgetGrid`**,
  **`HomeHeader`** (band, greeting, My profile), **`AiBox`**, **`DecisionCard`** and its deck, **`EditHome`** with
  the widget catalogue row. The settings page Settings → General → Home is gone. Q-3 to Q-6 are answered as you
  recommended: sizes in the same layout list, the header beside it, the skip order per person on the server, one
  read for the automations week.
- **2026-11-06** — **Automations built from the handoff** (`screens/automations-*`, all eight `built`). New shared
  components to carry into the package: **`SegmentedControl`** (`components/ui/SegmentedControl` — built from the
  frames: 32 high, radius 8, the picked segment white on Mist at level 1; `QUESTIONS.md` Q-1), the canvas
  **`StepCard`**, **`CanvasToolBlock`** with its joined tool window, **`WhoSeesWhat`**, **`ReadRows`**, the
  **`ConditionBuilder`**, the **`PeoplePicker` with roles**, **`TokenTextField`**, **`AutomationCard`**,
  **`AiPromptField`**, **`TestRunResult`**, **`RunRow`**. Deviations from SPEC follow each spec's "Changes to SPEC";
  what was built differently is each spec's "Built". The app shell gained a canvas mode: the sidebar folds to 64 px
  and opens over the page on hover (`components/layout/AppFrame`).
- **2026-11-06** — **Settings → Automation → Workflows is gone**: it was only a "coming soon" page, and
  Automations already is what the word means. Seven "coming soon" pages remain, not eight
  (`screens/empty-state-illustrations/spec.md`, row 66).
- **2026-11-06** — `empty-state-illustrations` built. Package change, approved by Ulia: SPEC § 10 gains the
  rule **"no sharp corners in illustrations"**, sixteen new scenes and seven S cuts, the redrawn automations
  and the six rounded scenes (all-caught-up, policies, goals-and-growth, announcements, signing, surveys),
  and the 404 page's own drawing, the one illustration that moves (§ 10, § 12). The package's SVGs now live
  in the repo, in `styles/noddo/assets/illustrations/`, and `components/illustrations/scenes.tsx` is
  generated from them (`npm run illustrations`): a new drawing is a new file there and one command. Carry
  the same files into the package itself. `ListEmptyState` gained `filtered` — a filter that left nothing
  shows no-match-s — and its archived view now always shows the archive box.
- **2026-11-05** — This folder started. The current deviations from SPEC — light tooltip, the range
  band, the Mist selection bar, white dialogs, accent for every positive action, no wordmark in the
  sidebar, twelve policy colours and the policy marker, the decision bar — are in
  `rules/DESIGN_SYSTEM.md` § 7, for the next package version.
