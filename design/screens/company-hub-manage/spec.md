---
status: built
screen: company-hub-manage
owner: Ulia
updated: 2026-11-12
---

# Manage hub

## What it is for
The people who run the hub (HR, and team leads for their own team) write news, keep the handbook, and make sure everyone agrees to the pages that must be read. Managing is kept apart from reading. Employees never see these screens, and the hub itself stays clean.

| Frame | What it is |
|---|---|
| CM01 Overview | What needs attention now |
| CM02 Posts | Every post, by status |
| CM03 Pages | The handbook as a tree |
| CM04 Settings | Who can post, reminders, celebrations, news on Home |
| CM05 New post | A dialog |
| CM06 Page editor | Editing one page |
| CM07 Who sees it | The audience dialog |
| CM08 Who agreed | One must-read page, person by person |

People leave having published a post, changed a page, or reminded the people who have not agreed yet.

## Where it lives
- **Routes:**

  | Route | Screen |
  |---|---|
  | `/hub/manage` | CM01 |
  | `/hub/manage/posts` | CM02 |
  | `/hub/manage/pages` | CM03 |
  | `/hub/manage/settings` | CM04 |
  | `/hub/manage/pages/{id}/edit` | CM06 |
  | `/hub/manage/pages/{id}/agreed` | CM08 |

  CM05 and CM07 are dialogs.
- **Who sees it:** only people with the right to manage the hub (Q-9). The entry is the **Manage hub** button on the hub (`company-hub`, Where it lives). The sidebar item stays **Company hub** and stays active on these screens.
- **What a team lead sees** (recommended in Q-9):
  - only Overview, Posts and Pages, without Settings;
  - only their own team's posts and pages;
  - in "Who sees it", only their own team.
- **Anyone else:** a direct link opens `ErrorPage` 403.

## Layout

### The frame of every tab (CM01–CM04)
Page padding 32 48.

1. **Back link** "Company hub" (`arrow-left-01`, link 13/18).
2. **Title row**, 12 under the back link: "Manage hub" (32/40 600, as `company-hub` Changes to SPEC 1). The buttons on the right **follow the tab** (Ulia, round 7):

   | Tab | Buttons |
   |---|---|
   | Overview | **New post** and **New page**, both secondary, equal, with `megaphone` / `file-add` icons |
   | Posts | **New post**, primary |
   | Pages | **New page**, primary |
   | Settings | none |

3. **Tabs** (SPEC § 13.6, 2 px accent underline), 28 under the title row: Overview, Posts, Pages, Settings.

### CM01 Overview
1. **Four stat tiles** in a row, gap 20, 116 high (**new**, `StatTile`). Each tile is Mist `#F7F7F8`, radius 20, padding 16 20 14. Each holds:
   - the label (12/16, tertiary) at the top;
   - the number (36/36 500 Inter Tight, see Changes to SPEC);
   - one hint line under the number (12/16).

   Ulia asked for compact tiles, number above the text.

   | Tile | Number | Hint |
   |---|---|---|
   | Posts this month | count | "{n} more than in {last month}" / "{n} fewer than in {last month}" / "The same as in {last month}" |
   | Drafts | count | "{n} post scheduled for {d Mon}" (the nearest scheduled one), or "Nothing scheduled" |
   | Must-read pages open | pages whose deadline has not passed and not everyone agreed | "{agreed} of {needed} agreed" across them |
   | Missed the deadline | "{n} people" | the page name; when people missed several pages: "{n} pages" |

   - **Missed the deadline** is the only tile in a status tint: Pending soft amber background (`#FFF3DF`) and amber text (`#7A4800`). Other people's overdue items are Pending amber, never red (`STATUS_AND_BADGES.md` § 5).
   - With no one overdue, the tile reads "0 people" / "Everyone is on time" in plain gray.
   - Each tile is clickable:
     - Posts → CM02;
     - Drafts → CM02 on Drafts;
     - Must-read → CM03;
     - Missed → CM08 of that page, or CM03 filtered to must-read when several pages are involved.
2. **Two columns**, 40 under the tiles, gap 56 (built as 64):
   - **Posts** (left, 7fr):
     - the heading "Posts" (22/28) and the link "All posts";
     - then the 3 newest posts as `NewsRow` (`company-hub`). Each row has an icon or cover thumbnail tile 48, a title, and a meta line: "{audience} · {status words}". The status words are "pinned" for a pinned post, "goes out {d Mon}" for a scheduled one, and "Only you can see it" for a draft.
     - The status pill is on the right: Published (approved tone), Scheduled (scheduled tone), Draft (draft tone, dashed) (`StatusBadge`, STATUS_AND_BADGES).
     - There is no read counter anywhere (Ulia, round 7).
   - **Must-read pages** (right, 5fr):
     - the heading and the link "All pages";
     - then up to 3 open must-read pages, the nearest deadline first, plus any that are past their deadline with people missing.
     - Each row has:
       - the title (15/22 600);
       - "{n} of {m} agreed" on the right of the title (12/16);
       - a progress bar under them (6 high, accent, Mist track);
       - under the bar, "Due {d Mon}", or "Deadline was {d Mon}" in Pending amber text;
       - on the right of the row, **Remind {n}** (secondary, 32). It is shown only when n > 0.
     - The row opens CM08.

### CM02 Posts
1. **Controls row**, 32 under the tabs:
   - the segmented control **All · {n} / Published · {n} / Scheduled · {n} / Drafts · {n}**;
   - on the right, the search field 240 "Search posts".
2. **Rows**, 960 max wide, 88 high, hairlines between them. Each row has:
   - a 56 tile, radius 14 (built as 16): the cover thumbnail, or the type icon on its tag tint;
   - the title (15/22 600) and "{author} · {audience}" with "· pinned" when pinned;
   - the status pill: Published, Scheduled with its date and time ("1 Dec, 9:00", calendar icon), or Draft;
   - the date: when published, created, or "Today";
   - the row menu (`more-horizontal` icon button, SPEC § 13.5).
3. **Row menu:**
   - Edit;
   - Pin to the top / Unpin;
   - Duplicate;
   - for a published post: Unpublish;
   - for a scheduled one: Publish now and Cancel schedule;
   - a divider, then **Delete** (red text, last).
4. A row opens the post in the editor (CM05 with the post's content, titled "Edit post").
5. There is no composer on this page (Ulia, round 7): writing is only through **New post**.

### CM03 Pages
1. **Line**, 32 under the tabs:
   - "{n} sections · {n} pages · drag to reorder or move into another section" (12/16, tertiary);
   - on the right, the search field "Search pages".
2. **Tree table** (**new**, `PageTree`), 1000 max wide. Built on SPEC § 13.5 rows. The columns are:
   - **Page**;
   - **Owner** (avatar 22 + first name);
   - **Must read**:
     - a page that is must read: "{n} of {m} agreed" + a 6 high bar;
     - a page that is not: "—";
     - a section row: "{n} must-read";
   - **Updated** ({d Mon}).
3. **Section rows**, 44 high:
   - the `arrow-down-01` / `arrow-right-01` chevron (collapsed by default, except a section with must-read pages that are open);
   - a 24 icon tile in the section colour, radius 6 (frame: 7);
   - the name (14/20 600);
   - "{n} pages";
   - on the right:
     - **+** (icon button "Add a page to this section");
     - the section menu: Rename, Change icon and colour, Who sees this section, and after a divider **Delete section** (red).
   - **+** sits only on section rows (Ulia, round 7).
4. **Page rows**, 44 high, indented 48:
   - the drag handle (`drag-drop-vertical`), shown on hover;
   - the page icon 16;
   - the title;
   - the columns above;
   - the row menu: Edit, Who agreed (only for a must-read page), Move to…, Duplicate, Unpublish, and after a divider **Delete** (red).
   - A section shows its first 3 pages and then "{n} more pages", which opens the rest.
5. **Drag and drop:**
   - a page moves within a section or into another one;
   - a section moves among sections;
   - the dragged row is level 4 (SPEC § 7);
   - the place it will land is a 2 px accent line;
   - a section it will join is highlighted `accent-subtle`.
6. **New section**: a ghost button with **+** under the tree.

### CM04 Settings
One column, 720 max wide. The blocks are separated by hairlines and 32 apart. Each block has a heading (22/28) and rows. Every change saves at once ("Changes save automatically." at the end, 12/16). A failed save shows an error toast with Retry.

1. **Who can post and edit pages:**
   - a people-and-roles field (`PeoplePicker` with roles, from automations);
   - the hint "Team leads can post only to their own team. Everyone else reads."
2. **Must-read pages:**

   | Setting | Hint | Control |
   |---|---|---|
   | Remind people before the deadline | By email and in the inbox | select: 1 day / 3 days / 1 week before / Don't remind |
   | Tell the manager when someone misses it | The day after the deadline | toggle |
   | New hires get must-read pages in onboarding | As a task in their first week | toggle |

3. **Celebrations:**
   - a toggle on the heading row: off hides the whole strip for everyone;
   - three checkboxes (SPEC § 13.12): Birthdays, Work anniversaries, New joiners. They are disabled when the toggle is off;
   - the hint "People can still hide their own birthday in their preferences."
4. **News:** Show the latest news on Home / In the Company news widget (toggle). The **Company news** widget is drawn in the next Home round (Ulia, 12 Nov). Until it is built, this block is not shown. Turning it on works like Show on Home in CM05 (the dialog below).

### CM05 New post (dialog)
A dialog 800 wide (SPEC § 6, § 13.7: radius 20, level 3, white). Header 20 24 16: "New post" (18/26) and close. Body padding 0 24, fields 18 apart:

1. **Cover:**
   - a 96 high drop area, radius 16, a 1.5 px dashed `#DADADF` border;
   - the image icon + "Add a cover image (optional)";
   - with an image: the image fills it at 200 high, with Replace and Remove on hover.
2. **Title:** a field 44 high, 16 px text.
   - An emoji typed at the start stays (`company-hub` Changes to SPEC 8).
   - It is required: an empty title shows "Add a title" under the field (`FieldError`) on Publish, Schedule or Save draft.
3. **Text:** a rich text box, 120 high, that grows to 360 and then scrolls.
   - A toolbar of ghost icon buttons 32: Bold, Heading, List, Link, then "Link a handbook page" (ghost with an icon), which opens a page picker.
4. **Who sees it**, on the left:
   - filter chips of the audience (`FilterChip` selected, with ×) + "Add filter" (dashed);
   - the hint "{n} people · {who joins later}";
   - with no filter: "Everyone at {company} · {n} people".
   - "Add filter" opens the same builder as CM07 in a popover.
5. **Pin to the top** and **Show on Home** toggles, on the right, 280 wide.
   - Pinning a post unpins the one pinned before. The hint under the toggle says so when one is pinned: "Unpins “{title}”".
   - **Show on Home** (Ulia, 12 Nov): when the company has not made the **Company news** widget required for everyone, turning the toggle on opens a confirm dialog 400 (`AddRequiredWidgetDialog`, **new**, not drawn):
     - "Add Company news to everyone's Home?";
     - "Posts you show on Home appear in this widget. Everyone gets it, and it stays on their Home.";
     - [Not now] (secondary) [Add for everyone] (primary).
     - **Add for everyone** makes the widget required for everyone and keeps the toggle on. **Not now** turns the toggle back off.
     - When the widget is already required, the toggle simply turns on.
     - Until the widget is built (next Home round), the toggle is not shown (Q-12).
6. **Footer**, a hairline above, 16 24:
   - on the left, **Save draft** (ghost);
   - on the right, **Schedule** (secondary, `clock-01`) and **Publish** (primary).
   - **Schedule** opens a popover with a date and time field and "Schedule for {d Mon}, {HH:mm}" as its button.
7. **Edit post:** the same dialog, titled "Edit post". For a published post the footer is Cancel / **Save changes**.

### CM06 Page editor
A full page in the app frame, padding 24 48 32. The column is 760 (built as 720, as CP02).

1. **Editor bar:**
   - on the left, the back link "Pages" and "/ {section}";
   - on the right:
     - "Saved {HH:mm}" (12/16, tertiary; while saving, "Saving…");
     - the gray pill "Unpublished changes" with `pencil-edit-02`. It is shown only when the draft differs from the published version;
     - **Preview** (secondary);
     - **Publish version {n}** (primary). For a page never published: **Publish**.
2. **Icon and title:**
   - the 52 icon tile is a button "Change icon". It opens a popover with the icon set and the eight tag colours (SPEC § 4.7);
   - the title is edited in place (36/44).
3. **Properties** (**new**, `PropertyList`, Notion-like): rows 36 high, label column 150 (12/16, tertiary).

   | Property | Control |
   |---|---|
   | Section | a picker: the section colour square + name + chevron |
   | Owner | a person picker; the owner is the person readers see, and gets the questions |
   | Who sees it | a field-look button 32: people icon + the audience summary ("Everyone at Acme", "Vilnius, Warsaw · Acme UAB", "118 people") + chevron. It opens CM07 |
   | Must read | a toggle + "People read it and agree to it" |

   - **Must read is optional per page** (Ulia, round 7).
   - When Must read is on, a Mist block (radius 14 → build 16, padding 14 16) appears under it, indented to the value column. It holds one row: **Agree by** + a date field 180.
   - Under it, always, the hint "Turn it off for pages that are only for reference, like guides or office info."
4. **A hairline**, 24 above and below.
5. **Body:** a block editor.
   - Each block has a drag handle on hover, 32 to the left of the text.
   - An empty line shows "Type / for headings, lists, images and links to other pages" in tertiary.
   - "/" opens a menu: Heading, Text, Bulleted list, Numbered list, Image, Table, Link to a page, Divider.
6. **Autosave:** the draft saves on every pause (1 s). Readers see only the published version.

**Publish** (not drawn, written here) opens a dialog 560 (`PublishPageDialog`, **new**):
- the title "Publish version {n}?";
- for a page with an earlier version, a **"What changed"** list: points the system drafted from the difference between the versions, each editable, with "Add a point" and a remove × per point. Above the list is the label "Drafted by AI — review before sending" (SPEC § 1);
- for a must-read page that people already agreed to, a choice (two radio rows, SPEC § 13.12). **Asking again is not required: the editor decides each time** (Ulia, 12 Nov):
  - **Ask everyone to agree again** (picked by default), hint "For a change in the rules. People see what changed and agree to version {n}." With it, an **Agree by** date field (default: 14 days from today);
  - **Small fix, keep agreements**, hint "For typos and wording. Nobody is asked again." With it, the What changed list is hidden, the version number stays the same ("Version 3 · updated {d Mon yyyy}" for readers), and the button reads **Publish fix**;
- the footer: Cancel / **Publish version {n}** (or **Publish fix**).

The list is what readers see in CP02's What changed block. A first version has no list and no choice.

### CM07 Who sees this page (dialog)
A dialog 640 (SPEC § 13.7). Header 20 24 4: "Who sees this page" (in CM05 the same dialog says "Who sees this post") and close.

1. **Segmented control** with three choices:
   - **Everyone**: no more fields. Under it: "Everyone at {company} · {n} people".
   - **Filter people**:
     - "People who match all of these" (label);
     - then rows of `ConditionBuilder` / `AudienceBuilder` (the same builder as People and automations): a field select 160 (Office, Legal entity, Department, Team, Job, Employment type, Hire date…), "is", a value field with tags, and remove;
     - then "Add filter" (ghost sm with +);
     - new people who match join automatically.
   - **Choose people**: only the person-and-role picker, no filters.
2. **Also add (optional)** (with Filter people): a `PeoplePicker` with roles. It holds person chips and role chips ("Role: Team lead"), with the placeholder "Search people or roles".
3. **Summary block**, Mist, radius 12, padding 12 14:
   - stacked avatars (3);
   - **"{n} people"**;
   - " · new people who match join automatically" (with filters only);
   - on the right, the link "See who". It opens a popover list of the people, 360 wide, with search.
4. **Footer**, a hairline above: Cancel (secondary) / **Apply** (primary). Apply is disabled while the result is 0 people, and the summary then says "No one matches these filters".

Changing the audience of a published must-read page does not need a new version. People who join the audience get the page to agree to with the same deadline, or 7 days from now if the deadline has passed.

### CM08 Who agreed
Page padding 32 48.

1. **Breadcrumb** "Manage hub / Pages / {page}".
2. **Title row:**
   - "Who agreed" (32/40 600);
   - under it, "{page} · version {n} · due {d Mon}";
   - on the right, **Edit page** (secondary) and **Remind {n} people** (primary, `sent` icon).
3. **Numbers**, 40 under the title row:
   - **{agreed}** as a hero (52/52 500) + "of {needed} agreed", with a 6 high bar 360 under it;
   - **{not yet}** (36/40) + "not yet · {n} agreed to version {n−1}";
   - **{new hires}** (36/40) + "new hires · get it as an onboarding task". This is shown only when the onboarding setting is on and some exist.
4. **Controls row:**
   - segmented **Not yet · {n} / Agreed · {n}**;
   - a hairline;
   - filter chips Department, Office, Legal entity;
   - on the right, search "Search people" and the Export icon button (CSV).
5. **Table** (SPEC § 13.5) with the columns:
   - Name (avatar 22 + full name);
   - Department;
   - Office;
   - Last agreed: "Version {n} · {d Mon}" or "—";
   - Reminded: "{d Mon}" or "—".

   The Agreed tab replaces the last two columns with **Agreed** ({d Mon yyyy, HH:mm}).
6. **Pagination** "1–50 of {n}" (SPEC § 13.5).

**Row selection** (not drawn): checkboxes let the manager remind only some. The Mist selection bar (DESIGN_SYSTEM § 7) then shows "Remind {n} people".

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The title, tabs and buttons draw at once. **CM01:** the tiles and columns show `Skeleton`s past 2 s. **CM02, CM03, CM08:** skeleton rows. **CM06:** the editor bar draws, the column shows `NodRing`, then a skeleton. Publishing shows "Publishing…" on the button with `NodRing` (SPEC § 12). | not drawn |
| Empty (nothing yet) | **CM01, a new hub:** the tiles show 0 and the hints "No posts yet", "No drafts", "No must-read pages", "Everyone is on time". The columns show S scenes: Posts "No posts yet" + New post, Must-read "No must-read pages" / "Turn on Must read on a page to see who agreed.". **CM02:** `EmptyState` **announcements**, "No posts yet" / "Write the first one for your team." + New post. An empty filter tab says "No drafts" / "No scheduled posts" / "Nothing published yet". **CM03:** **policies** scene, "No pages yet" / "Start with a section, then add pages." + New section + New page. **CM08 Not yet empty:** **all-approved** scene, "Everyone has agreed". | not drawn |
| No results | **CM02 / CM03 / CM08 search:** `ListEmptyState` `filtered`, no-match-s, "Nothing matches “{text}”" + "Clear search". **CM07 with 0 people:** "No one matches these filters" in the summary, and Apply is disabled. | not drawn |
| Error (could not load) | A tab that fails shows `ErrorState` something-broke, "Couldn't load posts" / "pages" / "settings" + Try again. **A failed save in CM04:** an error toast "Couldn't save. Try again." + Retry, and the control returns to what it was. **A failed publish:** the dialog stays open with `InlineAlert` declined "Couldn't publish. Your draft is saved." + Try again. **Autosave failed in CM06:** "Not saved" in the bar, in red text with an alert icon, and it retries every 10 s; "Saved {time}" returns when it works. | not drawn |
| No permission | Someone without the right: the Manage hub button is not shown, and a direct link opens `ErrorPage` 403 "This page is private" / "Ask an admin for access." [Go to Company hub]. **A team lead:** no Settings tab, only their team's content, and the audience is limited to their team (Q-9). | not drawn |
| Normal | CM01–CM08 | CM01-overview.png … CM08-who-agreed.png |
| Long content | **Titles:** a post or page title on a row is cut with … and a tooltip. **Many sections:** the tree scrolls, and drag scrolls the page near the edges. **CM07 with many filters:** the body scrolls inside the dialog, while the header and footer stay. A filter value with many tags shows 3 and "+n". **CM08 with long names:** cut with a tooltip (Katarzyna Wiśniewska-Kowalczyk in the frame fits at 1440). **Remind with a big number:** "Remind 1,240 people". | not drawn |
| Reminder sent | A toast "Reminded {n} people" (+ Undo for 5 s, before anything is sent). The Reminded column fills with today. Remind is disabled for 24 h for those people, with the tooltip "Reminded today". | not drawn |
| Unsaved changes on close | **CM05 with typed text, closed:** a confirm "Discard this post?" / "What you wrote will be lost." [Keep editing] [Discard] (drop unsaved work, rule 11, Home PRODUCT-RULES). **CM07 with changes, closed:** the same "Discard changes?". **CM06** autosaves, so it never asks. | not drawn |
| Delete | A confirm per `ACTIONS_AND_MENUS.md` § 7 (see Actions). | not drawn |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| New post | Overview, Posts | Opens CM05. | no |
| New page | Overview, Pages, section + | Creates a draft page (in that section when started from +), and opens CM06 with the title focused. | no |
| Remind {n} | CM01 row, CM08 | Sends the reminder by email and in the inbox to those who have not agreed. Undo toast for 5 s, then it sends. | no (Undo) |
| Open a tile / row | CM01 | See Layout. | no |
| Filter by status | CM02 | In place. | no |
| Edit post | CM02 row or menu | Opens CM05 as "Edit post". | no |
| Pin / Unpin | CM02 menu | Immediate, with an Undo toast. Pinning unpins the previous post. | no |
| Duplicate | CM02, CM03 menus | Confirm (ACTIONS_AND_MENUS § 7): "Duplicate “{title}”?" / "The copy is a draft." [Cancel] [Duplicate]. Then the copy opens. | yes |
| Unpublish | CM02, CM03 menus | Takes it off the hub for readers, and it becomes a draft. Undo toast. Must-read agreements are kept. | no (Undo) |
| Publish now / Cancel schedule | CM02 menu | Immediate. Cancel schedule makes it a draft. Undo toast. | no |
| Delete post / page | menus | Confirm 400: "Delete “{title}”?" / "Readers lose it, and links to it stop working." [Cancel] [Delete post] / [Delete page] (red fill, no accent). For a must-read page the second line adds: "The record of who agreed is kept." | yes |
| Delete section | CM03 section menu | Confirm: "Delete “{section}” and its {n} pages?" / "Readers lose these pages." [Cancel] [Delete section]. An empty section asks too. | yes |
| Rename section | menu | Edits in place, Enter saves. | no |
| Drag a page or section | CM03 | Moves it, saved at once, with an Undo toast "Moved to {section}". | no |
| New section | CM03 | Adds a row with the name field focused ("New section"), with the next free tag colour. | no |
| Change a setting | CM04 | Saves at once. | no |
| Save draft | CM05 | Saves, closes, and toasts "Draft saved". | no |
| Schedule | CM05 | Opens the date and time popover. Confirming it schedules, closes and toasts "Scheduled for {d Mon}, {HH:mm}". | no |
| Publish post | CM05 | Publishes, closes, toasts "Published" + View. The post shows on the hub for its audience. With Show on Home, it also shows in the Company news widget on Home. | no |
| Who sees it | CM06, CM05 | Opens CM07. Apply sets the audience. | no |
| Must read on / off | CM06 | Sets it on the draft. It takes effect on publish. Turning it off on a published page keeps the record of who agreed. | no |
| Publish version | CM06 | Opens the publish dialog (see CM06). Publishing makes it the version readers see. For a must-read page, the editor chooses: ask everyone to agree again, or publish a small fix that keeps agreements. | dialog (review, not a confirm) |
| Preview | CM06 | Opens the page as a reader would see it (CP02), in a new tab, with a Mist banner "Preview — not published". | no |
| Edit page | CM08 | Opens CM06. | no |
| Export | CM08 | Downloads a CSV of the current tab and filters. | no |
| Close a dialog | CM05, CM07 | Closes. With unsaved changes, it confirms (States). | only with unsaved changes |

## Words
| Where | Text |
|---|---|
| Back link | Company hub |
| Title | Manage hub |
| Tabs | Overview; Posts; Pages; Settings |
| Buttons | New post; New page |
| Tiles | Posts this month / {n} more than in {Month}; {n} fewer than in {Month}; The same as in {Month}. — Drafts / {n} post scheduled for {d Mon} (2+: {n} posts scheduled, the nearest {d Mon}); Nothing scheduled. — Must-read pages open / {n} of {m} agreed. — Missed the deadline / {n} people (1 person) / {page}; {n} pages; zero: Everyone is on time |
| Columns | Posts / All posts; Must-read pages / All pages |
| Post meta | {audience} · pinned; {audience} · goes out {d Mon}; Only you can see it |
| Status pills | Published; Scheduled; {d Mon}, {HH:mm}; Draft |
| Must-read row | {n} of {m} agreed; Due {d Mon}; Deadline was {d Mon}; Remind {n} |
| CM02 segmented | All · {n}; Published · {n}; Scheduled · {n}; Drafts · {n} |
| CM02 search | Search posts |
| CM02 meta | {author} · {audience}; · pinned; {author} · only you can see it |
| CM02 dates | {d Mon}; Today |
| Post menu | Edit; Pin to the top; Unpin; Duplicate; Unpublish; Publish now; Cancel schedule; Delete |
| CM03 line | {n} sections · {n} pages · drag to reorder or move into another section |
| CM03 search | Search pages |
| CM03 columns | Page; Owner; Must read; Updated |
| CM03 section | {Section} / {n} pages / {n} must-read |
| CM03 page | {n} of {m} agreed; — |
| CM03 more | {n} more pages |
| CM03 accessible names | Add a page to this section; Section options; More; Drag to move |
| Section menu | Rename; Change icon and colour; Who sees this section; Delete section |
| Page menu | Edit; Who agreed; Move to…; Duplicate; Unpublish; Delete |
| CM03 button | New section |
| CM04 headings | Who can post and edit pages; Must-read pages; Celebrations; News |
| CM04 rows | Add a person or a role; Team leads can post only to their own team. Everyone else reads. / Remind people before the deadline / By email and in the inbox / 1 day before; 3 days before; 1 week before; Don't remind / Tell the manager when someone misses it / The day after the deadline / New hires get must-read pages in onboarding / As a task in their first week / Birthdays; Work anniversaries; New joiners / People can still hide their own birthday in their preferences. / Show the latest news on Home / In the Company news widget / Changes save automatically. |
| CM04 accessible names | Show celebrations; Tell the manager; New hires; Show news on Home |
| CM05 | New post; Edit post / Add a cover image (optional); Replace; Remove / Title / Text / Bold; Heading; List; Link (accessible names) / Link a handbook page / Who sees it / Everyone at {company} · {n} people; {n} people · {who joins later, e.g. new hires in Vilnius see it too} / Add filter / Pin to the top / Unpins “{title}” / Show on Home / Save draft / Schedule / Publish / Cancel / Save changes |
| CM05 schedule | Date; Time; Schedule for {d Mon}, {HH:mm} |
| CM05 errors | Add a title |
| CM06 bar | Pages / {section}; Saved {HH:mm}; Saving…; Not saved; Unpublished changes; Preview; Publish version {n}; Publish |
| CM06 properties | Change icon (accessible name); Section; Owner; Who sees it; Must read; People read it and agree to it; Agree by; Turn it off for pages that are only for reference, like guides or office info. |
| CM06 body | Type / for headings, lists, images and links to other pages; slash menu: Heading; Text; Bulleted list; Numbered list; Image; Table; Link to a page; Divider |
| Publish dialog | Publish version {n}? / What changed / Drafted by AI — review before sending / Add a point / Ask everyone to agree again / For a change in the rules. People see what changed and agree to version {n}. / Agree by / Small fix, keep agreements / For typos and wording. Nobody is asked again. / Cancel / Publish version {n}; Publish fix; Publishing… |
| Preview banner | Preview — not published |
| CM07 | Who sees this page; Who sees this post / Everyone; Filter people; Choose people / People who match all of these / is / Remove filter (accessible name) / Add filter / Also add (optional) / Search people or roles / Role: {role} / {n} people · new people who match join automatically / Everyone at {company} · {n} people / See who / No one matches these filters / Cancel / Apply |
| CM08 | Who agreed / {page} · version {n} · due {d Mon} / Edit page / Remind {n} people / of {m} agreed / not yet · {n} agreed to version {n} / new hires · get it as an onboarding task / Not yet · {n}; Agreed · {n} / Department; Office; Legal entity / Search people / Export (accessible name) / Name; Department; Office; Last agreed; Reminded; Agreed / Version {n} · {d Mon} / 1–50 of {n} |
| Add widget dialog | Add Company news to everyone's Home? / Posts you show on Home appear in this widget. Everyone gets it, and it stays on their Home. / Not now / Add for everyone |
| Toasts | Reminded {n} people; Draft saved; Scheduled for {d Mon}, {HH:mm}; Published / View; Moved to {section}; Couldn't save. Try again. / Retry; Undo |
| Confirms | Duplicate “{title}”? / The copy is a draft. / Duplicate — Delete “{title}”? / Readers lose it, and links to it stop working. / The record of who agreed is kept. / Delete post; Delete page — Delete “{section}” and its {n} pages? / Readers lose these pages. / Delete section — Discard this post? / What you wrote will be lost. / Keep editing; Discard — Discard changes? |
| Empty | No posts yet / Write the first one for your team. — No drafts; No scheduled posts; Nothing published yet — No pages yet / Start with a section, then add pages. — No must-read pages / Turn on Must read on a page to see who agreed. — Everyone has agreed |
| No results | Nothing matches “{text}” / Clear search |
| Errors | Couldn't load posts; Couldn't load pages; Couldn't load settings / Try again — Couldn't publish. Your draft is saved. |

## Values
- **Page padding** 32 48 (`company-hub` Changes to SPEC 2). CM06 and CM07's page: 24 48 32.
- **Tabs** 28 under the title row; content 32 under the tabs.
- **Stat tiles:** radius 20; padding 16 20 14 (build 16 20 16); number 36/36 (Changes to SPEC); gap 20.
- **Radii** 14 and 7 in the frames are not SPEC radii. Build:
  - row tiles and the Must-read block as **16**;
  - the 24 section tile in CM03 as **6**.
- **Progress bars:** 6 high, pill, accent on Mist.
- **Missed the deadline / Deadline was:** Pending soft `#FFF3DF` and text `#7A4800` (SPEC § 4.5; STATUS_AND_BADGES § 5).
- **Dialogs** (SPEC § 6, § 13.7):
  - CM05: 800;
  - CM07: 640 (between form 560 and complex 800, see Changes to SPEC);
  - the publish dialog: 560;
  - confirms: 400.
- **Property rows** 36, label column 150.
- **The Must-read block** is indented to the value column.
- **CM06/CP02 column:** 760 drawn → **720** (SPEC § 6).

## Changes to SPEC
1. **Stat number 36/36** on the tiles (SPEC § 5 big number 32/40). It uses Home's `text-hero-s` family. Alternative: SPEC's 32/40.
2. **Stat tiles on Mist, radius 20, no border** (SPEC § 13.9 card 16 with border), as `company-hub-page` Changes 3.
3. **Dialog 640** for the audience dialog. SPEC § 6 lists 400 / 560 / 800, and 640 is the wide side panel. 560 was too tight for a filter row (field select + value tags + remove), and 800 left it empty. Alternative: 800.
4. **A section's colour picker** offers the eight tag colours (SPEC § 4.7). Policy colours have twelve (DESIGN_SYSTEM § 7), but handbook sections stay on the package's eight.

## New components
- **`StatTile`**: label, number, hint, and an optional tint (Pending only). It is clickable. States: normal, zero, loading.
- **`PageTree`**: a tree table of sections and pages, with drag and drop, per-section +, menus and "{n} more". States: collapsed, expanded, dragging, drop target, empty. It could later serve documents.
- **`PostEditorDialog`** (CM05): New / Edit. The rich text box with its toolbar is shared with comments if they come later.
- **`PageEditor`** (CM06): the editor bar, `PropertyList`, a block editor with "/". The Must read property with Agree by.
- **`PublishPageDialog`**: the What changed points (drafted, editable), the AI label, and for a must-read page the choice: ask everyone again (with Agree by) or a small fix that keeps agreements.
- **`AddRequiredWidgetDialog`**: a confirm that makes a Home widget required for everyone. Company news is its first use (Q-12).
- **`AudienceDialog`** (CM07): Everyone / Filter people / Choose people. It is built from the existing `AudienceBuilder` (`components/audience`), `PeoplePicker` with roles, and `useSegmentResolve` for the live count.
- **`AgreementTable`** (CM08): numbers, tabs, filters, table, Remind with selection.
- Reused: `SegmentedControl`, `FilterChip`, `StatusBadge`, `TagChip`, toggles, checkboxes, `ConfirmActionModal`, the Mist `SelectionBar`, `EmptyState`, `ListEmptyState`, `ErrorState`, `Skeleton`, `NodRing`, toasts.

## Open questions
Q-9 (who manages the hub), Q-11 (What changed drafted by AI) and Q-12 (news on Home) are in `QUESTIONS-to-add.md`. None blocks: each has a recommended default that the spec follows.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/hub/manage`, `/hub/manage/posts`, `/hub/manage/pages`, `/hub/manage/pages/{id}/edit`, `/hub/manage/pages/{id}/agreed`, `/hub/manage/settings` — `components/modules/hub/manage/`. Built 2026-11-12; walked by the assistant the same day with the window hidden — **not yet looked at by a person**.
- **Differs from the design:**
  - The editors chosen in Settings are the holders of an ordinary role, "Hub editors", also visible in Settings → Roles; a role with MANAGE set there is listed read-only.
  - *Remind* counts only people not reminded in the last 24 hours, and is disabled when there is nobody.
  - Publishing a must-read page asks for *Agree by* in the publish dialog when the page has none.
- **Images of the real screen:** not added — the walk's window was hidden.
