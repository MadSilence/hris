# Paste into design/QUESTIONS.md

Q-1, Q-2 and Q-7 are open in `QUESTIONS.md`, and Q-3 to Q-6 were answered, so these start at Q-9 (Q-8, whether a new version asks everyone again, Ulia settled before the handoff: the editor chooses when publishing). Each one has a recommended answer that the specs already follow. None blocks.

## Q-9 — Who can manage the hub · company-hub, company-hub-manage · from designers · 2026-11-12
Recommended: a new right, **Manage company hub**. In Settings → "Who can post and edit pages", people and roles get it.
- HR has it by default.
- A team lead who is given it can post and edit only for their own team: the Settings tab is hidden, and "Who sees it" is limited to that team.
- Everyone else reads.

**Blocks:** nothing

## Q-10 — What the hub's ask box answers from · company-hub, company-hub-page · from designers · 2026-11-12
Recommended: until the assistant exists, the box works like Home's `AiBox` stub.
- **Pages** and **News** come from search over what the person may see.
- **Ask noddo** says the assistant is on its way.

When the assistant arrives, it answers only from handbook pages and posts the person may see, with links to them.

**Blocks:** nothing

## Q-11 — How "What changed" is made · company-hub-page, company-hub-manage · from designers · 2026-11-12
Ulia: the points are made automatically, not written by hand.
Recommended:
- On Publish, the system drafts up to 5 points from the difference between the last published version and the draft.
- The publish dialog shows them with "Drafted by AI — review before sending" (SPEC § 1). The editor can change, add or remove points.
- Readers see the published points without the label.
- Without the assistant, the dialog starts with an empty list for the editor to fill. With no points at all, readers see no What changed block.

**Blocks:** nothing

## Q-12 — A widget required for everyone on Home · company-hub-manage, home, home-edit · from designers · 2026-11-12
Ulia: the **Company news** widget is drawn in the next Home round. When someone turns on "Show on Home" and the company has not made that widget required, the app offers to add it to everyone's Home as required (`company-hub-manage` → CM05).
Today a Home layout is per person (`homeLayout`), and nothing can be required.
Recommended:
- a company-level list of required widget ids;
- a required widget is added to everyone's layout at its default size and cannot be removed in Edit home (no remove button; the tooltip says "Your company added this widget");
- store `showOnHome` on posts from the start.
**Blocks:** nothing (the toggle stays hidden until the widget is built)

## Q-13 — What "For me" means in News · company-hub · from designers · 2026-11-12
Recommended:
- **For me** = posts whose audience was narrowed (not Everyone) and includes the reader: their office, team, department or legal entity, or chosen by name.
- **Everyone** = every post the reader can see, including those.
- The reader's last choice is kept.

**Blocks:** nothing
