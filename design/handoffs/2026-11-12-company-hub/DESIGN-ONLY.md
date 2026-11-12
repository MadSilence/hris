# In the design, not in the code

Checked against `MadSilence/hris` main @ f9e6e3d (11 Nov). The code has no Company hub today: there are no posts, handbook pages, versions or agreements, and no sidebar item. So almost everything here is new. The table says what already exists to build on.

**Size** is a rough guess: S is UI only, M is UI plus API, L is a new model or engine work.

## 1. The module

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 1.1 | **Company hub** in the sidebar after Tasks, routes `/hub`, `/hub/news`, `/hub/handbook`, `/hub/to-agree`, `/hub/manage/*`. | No item. `messages/en/navigation.json` has no hub. | all | S |
| 1.2 | **Posts:** title (an emoji may lead it), rich text, cover image, author, audience, pinned (one at a time), show on Home, status (draft, scheduled with a time, published), type (announcement, policy update, event), saved per person. | None. | CH01, CH02, CM02, CM05 | L |
| 1.3 | **Handbook:** sections (name, icon, tag colour, order, audience) and pages (title, icon, colour, owner, section, order, audience, rich text body, read time). | None. `documents` exists but is files, not pages. | CP01, CP02, CM03, CM06 | L |
| 1.4 | **Versions of a page:** a draft that autosaves, published versions numbered 1, 2, 3…, and "What changed" per version. Readers see only the latest published one. | None. | CP02, CM06 | L |
| 1.5 | **Must read and agreements:** per page optional, with an agree-by date. An agreement records person, page, version and time. On each new version the editor chooses: ask everyone again, or a small fix that keeps agreements. Counts per page and the list of who has not agreed. | None. | CH03, CP02, CM01, CM08 | L |
| 1.6 | **Audience** of a post, page or section: Everyone / filters (new people who match join automatically) / chosen people and roles. | `components/audience/AudienceBuilder`, `PeoplePicker`, `useSegmentResolve`, `api/modules/segments`. Reuse them as they are. | CM05, CM06, CM07 | M |
| 1.7 | **Right to manage the hub**, with team leads limited to their team (Q-9). | Roles and rights exist. A new right is needed. | CM04 | M |

## 2. The reader's side

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 2.1 | **Hub home:** "Pages need your yes" call-out, ask box, celebrations strip, News + Handbook columns. | None. | CH01 | M |
| 2.2 | **Ask box** that searches pages and posts and asks noddo. | Home's `AiBox` stub (People / Do / Ask noddo). Same stub, other groups (Q-10). | CH01, CP01 | S–M |
| 2.3 | **Celebrations strip:** today's birthdays and anniversaries, this week's joiners. It honours the admin switch and the person's own birthday switch. | `app/api/home/celebrations` (Home's This week) and `BirthdayOnHomeSection`. Reuse them. The admin switch per kind is new. | CH01, CM04 | S |
| 2.4 | **All news:** For me / Everyone, type chips, search, by month, infinite load, save. | None. | CH02 | M |
| 2.5 | **Pages need your yes:** waiting / agreed, grouped by due date. | None. | CH03 | M |
| 2.6 | **A page with the agree bar** and What changed since you agreed. | None. | CP02 | M |
| 2.7 | **Saved** posts and pages per person, with a popover. | None. | CH01, CH02, CP02 | S |

## 3. The manager's side

| # | Design | Code today | Frames | Size |
|---|---|---|---|---|
| 3.1 | **Overview:** four stat tiles, latest posts, open must-read pages with Remind. | None. | CM01 | M |
| 3.2 | **Posts list** by status with a row menu. | None. | CM02 | S |
| 3.3 | **Pages tree** with drag and drop between sections. | None. | CM03 | M |
| 3.4 | **Settings:** who can post, reminder timing, tell the manager, onboarding task, celebrations, news on Home. | None. The onboarding task needs `lifecycle` / processes to create a task (`api/modules/lifecycle`). | CM04 | M |
| 3.5 | **New / edit post** dialog with schedule. | None. Scheduling needs a job, like automations' schedules. | CM05 | M |
| 3.6 | **Page editor:** a block editor with "/", properties, autosave, preview, publish dialog. | None. No block editor in the code. | CM06 | L |
| 3.7 | **What changed drafted by the system** on publish, editable, labelled "Drafted by AI — review before sending". | None (Q-11). | CM06 | M |
| 3.8 | **Who agreed:** numbers, filters, table, export, remind all or chosen people. Reminders go by email and to the inbox. | `notifications` exists for the inbox and email. | CM08 | M |
| 3.10 | **Required widgets on Home:** the company can make a widget required for everyone (Company news first). The person cannot remove it. | Home layout is per person only (`homeLayout`). Q-12. | CM04, CM05 | M |
| 3.9 | **Reminders and "missed it" messages** on a schedule. | Notifications and automations schedules exist. | CM04 | M |
