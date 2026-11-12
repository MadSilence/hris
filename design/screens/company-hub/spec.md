---
status: built
screen: company-hub
owner: Ulia
updated: 2026-11-12
---

# Company hub

## What it is for
Everyone opens the hub to see what is going on at the company and to find how things work. The page starts with what is waiting on the reader: the pages they still have to agree to. Then it has one box for asking questions about policies, offices and benefits, and a strip of today's birthdays, work anniversaries and new joiners. Below that are two columns: **News** on the left and the **Handbook** on the right. People leave having read the news, found a page, or opened the list of pages that need their yes.

This flow has three screens:

- **CH01 Hub home**;
- **CH02 All news**;
- **CH03 Pages need your yes**.

A single handbook page and the whole handbook are in `company-hub-page`. Everything a manager does is in `company-hub-manage`.

## Where it lives
- **Sidebar:** **Company hub**, a new item after Tasks. It uses the `megaphone` glyph from the Hugeicons stroke set (SPEC § 9). The sidebar order becomes: Search, Home, Inbox, Tasks, **Company hub**, Organization, Calendar, Attendance, Processes, Reviews, Reports, Automations, then Settings. Reports is a separate handoff.
- **Routes:**
  - `/hub` (CH01);
  - `/hub/news` (CH02);
  - `/hub/news/{id}` for one post;
  - `/hub/to-agree` (CH03).
- **Who sees it:** every signed-in person.
  - Each post and each page has its own audience ("Who sees it", `company-hub-manage`). A reader sees only the posts and pages whose audience includes them.
  - A reader is never told that hidden content exists: no counts, no "+n".
- **Manage hub:** a quiet ghost button in the top line of CH01 opens Manage hub (`/hub/manage`). It is shown only to people with the right to manage the hub (Q-9).
  - It is not drawn on CH01, because that frame shows an employee's view. It sits to the right of "Saved · 4": `settings-02` icon + "Manage hub", a ghost button, 36 high (SPEC § 13.2).

## Layout

### CH01 Hub home
Sidebar 240 (SPEC § 13.6), then the page, white, padding 32 48 (see Changes to SPEC). The content is full width. Top to bottom:

1. **Title line.**
   - The title "Company hub" (32/40 600 Inter Tight, see Changes to SPEC).
   - After it, 16 apart, the **"Pages need your yes" button** (**new**, `AgreeCallout`). It is a pill 36 high on `accent-muted` with `accent-text`. Inside:
     - a 24 px accent counter with the number;
     - the label "Pages need your yes";
     - the `arrow-right-02` icon 16.
   - After the button, 16 apart, a hint: "Nearest by {date}" (12/16, tertiary).
   - The button and the hint are shown **only when at least one page waits** for the reader. With nothing waiting, the title stands alone.
   - On the right: **Saved · {n}**, a ghost button with the `bookmark-02` icon. It opens the saved list (see Actions). With nothing saved, it still shows "Saved" with no number.
   - Then **Manage hub**, only for managers (see Where it lives).
2. **Ask box**, 28 under the title line: the full content width, 56 high.
   - It is `AiBox` from Home (`components/modules/home`), in its hub variant:
     - the noddo spark icon;
     - the placeholder "Ask about policies, offices, benefits — or search news";
     - the send button 40 × 40, primary fill, radius 12, `arrow-up` icon. It is the same as Home's.
   - Radius 18, a 1 px `#EAEAEC` border, level 0 (Home's AiBox values, DESIGN_SYSTEM § 7, Home's exceptions).
3. **Celebrations strip**, 40 under the ask box (**new**, `CelebrationStrip`).
   - One row of tiles, each 72 high. Three fit at 1440. More tiles scroll sideways, with a fade on the right edge and no scroll bar.
   - Each tile is a soft tint from the tag palette (SPEC § 4.7, by kind: Berry birthday, Ocean anniversary, Teal welcome), radius 20, padding 16 20.
   - The kinds, in this order:
     - **Birthday:**
       - the avatar 40 with a small cake badge;
       - "Happy birthday, {first name}";
       - under it, "Today · {team}".
       - One tile per person.
     - **Work anniversary:**
       - the hero number of years (36/40 500 Inter Tight);
       - "years with {first name}" (or "year with" for 1);
       - "Today · {team}";
       - the avatar on the right.
     - **Welcome:**
       - stacked avatars, up to 3, then "+n";
       - "Welcome to the team";
       - names: up to three first names, then "and {n} more".
       - One tile for everyone who joins this week.
   - The strip shows today's birthdays and anniversaries and this week's joiners. With none of them, the strip is not shown at all and the columns move up.
   - If the admin turns celebrations off (Manage hub → Settings), the strip is gone for everyone. A person who hid their own birthday in their preferences (`BirthdayOnHomeSection`, Q-7) never appears in it.
4. **Two columns**, 48 under the strip: News 7fr and Handbook 5fr, gap 56. The two headings sit on one line at the same height (Ulia, round 7).
   - **News** (left):
     - **Heading row:**
       - "News" (section title 18/26, SPEC § 5; here 22/28, see Changes to SPEC);
       - on the right, the segmented control **For me / Everyone** (`SegmentedControl`, 32);
       - the link **All news**.
     - **The pinned post**, when there is one:
       - a cover tile 200 × 180, radius 20.
         - With the post's cover image: the image, cropped to fill.
         - Without one: a soft tag tint (SPEC § 4.7), with the post's key date as a hero number (48/48 500, accent text) and a one-line caption.
       - To the right of the cover:
         - a gray "Pinned" pill with the `pin` icon (status shape, SPEC § 13.4, neutral);
         - the title, 22/28 600, up to 3 lines;
         - the first two lines of text (14/20, secondary);
         - an author row: avatar 22, name, job title (tertiary), and the date on the right.
     - **The other posts as rows**, 80 high, separated by hairlines:
       - a 48 icon tile, radius 12, Mist, holding the post type icon:
         - `megaphone` for an announcement;
         - `file-01` for a policy update;
         - `calendar-03` for an event;
         - or a thumbnail of the cover when the post has one;
       - the title (15/22 600, one line, ellipsis + tooltip);
       - under it, "{author} · {audience or type}" (12/16, tertiary);
       - the date on the right (13/18, tertiary).
       - Up to 3 rows under the pinned one, or 4 when nothing is pinned.
   - **Handbook** (right):
     - **Heading row:** "Handbook", and on the right the link **Open handbook**.
     - **Section grid:** 2 columns × 3 rows, gap 12. Each card is 56 high, radius 14 (built as 16, see Values), Mist `#F7F7F8`, padding 12. Each card holds:
       - a 32 icon tile in the section's tag colour (SPEC § 4.7, chosen by the editor);
       - the section name (14/20 500);
       - "{n} pages" under the name;
       - when pages in the section wait for the reader: an accent dot 8 on the icon tile's corner, and "· {n} to agree" in `accent-text` after the page count.
     - The six sections shown are the ones with pages that wait, then the rest in the editor's order.
     - **"{n} more sections"**: a link with `arrow-right-01`, shown only when there are more than six. It opens the handbook (CP01).
     - **Recently updated**, under a hairline, 24 apart:
       - a 12/16 label;
       - then up to 3 rows. Each row holds:
         - the `file-01` icon 16;
         - the page title as a link (underlined, primary text);
         - "{section} · {date}" on the right (12/16, tertiary).
       - There is no "See all" here (Ulia, round 6).

### CH02 All news
Page padding 32 48. The content is 920 wide, left-aligned.

1. **Back link** "Company hub" with `arrow-left-01` (link button, 13/18).
2. **Title row:**
   - "News" (32/40 600);
   - on the right, a search field 240 × 32 (SPEC § 13.3, "Search news").
3. **Controls row**, 24 under the title row:
   - the segmented control **For me / Everyone**;
   - a vertical hairline;
   - the type filter chips (`FilterChip`, SPEC § 13.4): **All types**, Announcements, Policy updates, Events. One is picked at a time, and All types is picked by default.
4. **The pinned post** (as on CH01, wider: cover 240 × 200), with a save icon button on the right of its author row.
5. **Posts by month:**
   - a month heading (15/22 600, "This month", then "October", "September"…; the year is added when it is not this year: "December 2025");
   - under it, rows as on CH01. Each row also has:
     - a save icon button (`bookmark-02`; filled `bookmark-check-02` when saved), shown on row hover and always when saved;
     - a cover thumbnail in the 48 tile when the post has one, otherwise the type icon.
   - An emoji the author typed at the start of a title shows as part of the title ("🎉 Winter party tickets are open", see Changes to SPEC).
6. **Loading more:** 20 posts per load. More load when the reader nears the end (a `NodRing` in the list while they load, SPEC § 12).

### One post (`/hub/news/{id}`)
Not a separate frame. It is the reading layout of CP02 (`company-hub-page`), without the agree bar and without the version line. It has:
- the cover image full width, radius 20, when there is one;
- the title;
- the author row and the date;
- the text, 720 max;
- a save button by the title.

### CH03 Pages need your yes
Page padding 32 48. The content is 920 wide.

1. **Back link** "Company hub".
2. **Title row:**
   - "Pages need your yes" (32/40 600);
   - under it, the line "Read each page and agree to its current version. HR sees when you agreed." (14/20, secondary);
   - on the right, the segmented control **Waiting · {n} / Agreed · {n}**.
3. **Groups.** Each group heading is 15/22 600 + "{n} pages" (12/16, tertiary).
   - **This week:** due in the next 7 days, plus everything overdue.
   - **Later:** everything else.
   - An empty group is not shown.
4. **Rows**, 84 high, hairlines between them. Each row holds:
   - a 44 icon tile, radius 12, in the section's tag colour, with the page's icon;
   - the title (15/22 600);
   - under the title: "{section} · version {n} · {what}", where {what} is:
     - "new" for a page the reader never agreed to;
     - "{n} things changed since you agreed" (or "1 thing changed") for a newer version of a page they agreed to;
     - "you agreed to version {n} in {month}" when the page is overdue;
   - on the right, the due date ("By 20 Nov"), and for an overdue page the **Overdue** label and "Was {date}" (see Values);
   - the **Read** button (secondary, 32).
5. **"Show {n} more"**: a link under a group with more than 5 rows.

**Agreed tab:** the same rows, newest first, with "Agreed {date}" on the right instead of the due date, and no button. The row opens the page. A page whose newer version waits again is in Waiting, not here.

## States
| State | What the reader sees | Image |
|---|---|---|
| Loading | The title line and the ask box draw at once. Each block loads on its own: celebrations, News, Handbook and the "Pages need your yes" button. Under 300 ms a block shows nothing. From 0.3 to 2 s it shows a `NodRing` inside the block. Past 2 s it shows a `Skeleton` in the block's shape: three tiles; a cover and 3 rows; six section cards and 3 rows (SPEC § 12). CH02 and CH03 show skeleton rows. | not drawn |
| Empty (nothing yet) | **CH01, no posts and no pages** (a new company): `EmptyState` across both columns, **company-hub** scene (M). Title "Your company hub is empty". Text "News and handbook pages will show up here." For a manager it adds the action "Write the first post" (primary) and "Add a page" (secondary). An employee gets no action. **News column only empty:** an S **announcements** scene, "No news yet". **Handbook column only empty:** an S **policies** scene, "No handbook pages yet". **CH03 Waiting empty:** the **all-caught-up** scene, "You've agreed to everything" / "New pages to agree to will show up here." Its Agreed tab, when empty: "Nothing agreed yet". **Saved list empty:** "Nothing saved yet" / "Save a post or page to find it here." | not drawn |
| No results | **Ask box:** typing finds nothing → "Nothing found for “{text}”", then "Ask noddo" as the only row (as on Home). **CH02 search or type filter:** `ListEmptyState` `filtered`, **no-match-s** scene, "No news matches this" + "Clear filters". **For me with nothing for me:** "Nothing just for you yet" + the link "See everything". | not drawn |
| Error (could not load) | One block that fails shows `ErrorState` inside its own column: **something-broke** S, "Couldn't load the news" (or "the handbook", or "celebrations") + "Try again". The rest of the page works. If the whole page fails, `ErrorPage` 500. | not drawn |
| No permission | Everyone has the hub. Posts and pages outside the reader's audience are simply not listed. A direct link to one opens `ErrorPage` 403: "This page is private" / "Ask an admin for access." [Go to Company hub]. | not drawn |
| Normal | CH01, CH02, CH03 | CH01-hub-home.png, CH02-all-news.png, CH03-pages-need-your-yes.png |
| Long content | **Titles:** a post title on a row is cut with … plus a tooltip. The pinned title wraps up to 3 lines, then is cut. A page title in CH03 wraps to 2 lines. **Names:** a section name in the handbook grid is cut, and a long name in a celebration tile is cut with a tooltip. **Many celebrations:** the strip scrolls. **Many waiting pages:** the button counter shows the number up to 99, then "99+". **Long German labels:** "Pages need your yes" grows and the hint moves under the title. | not drawn |
| Nothing waits | The "Pages need your yes" button and its hint are not shown. | — |
| No celebrations today | The strip is not shown, and the columns move up by its height. | — |
| Celebrations turned off | As above, for everyone. | — |

## Actions
| Action | Where | What happens | Confirms? |
|---|---|---|---|
| Open "Pages need your yes" | title line button | Opens CH03 on Waiting. | no |
| Open Saved | Saved · {n} | Opens a popover 360 wide (SPEC § 13.7, radius 10, level 2) listing saved posts and pages, newest first. Each row shows its icon tile, title and "{section or News} · {date}". A row opens the item. The popover has no "See all". Its empty state is in States. | no |
| Ask / search | ask box | Typing opens results under the box, in three groups: **Pages** (handbook pages by title and text), **News** (posts), **Ask noddo** ("Ask noddo: “{text}”"). Enter runs the highlighted row. With nothing highlighted, Enter or Send sends to noddo. Until the assistant exists, the box behaves like Home's AiBox stub (Q-10). | no |
| Open a celebration | tile | Opens the person's profile. | no |
| Switch For me / Everyone | News, CH02 | Filters the list in place. The choice is kept for the person. "For me" is defined in Q-13. | no |
| Open a post | pinned post, row | Opens `/hub/news/{id}`. | no |
| Save / unsave a post | CH02 row, post page | Toggles at once. Undo toast: "Saved" / "Removed from saved" (rule 11, Home PRODUCT-RULES). | no |
| Open a handbook section | section card | Opens the handbook (CP01), scrolled to that section. | no |
| Open handbook / {n} more sections | links | Opens CP01. | no |
| Open a recently updated page | link | Opens the page (CP02). | no |
| Read | CH03 row | Opens the page (CP02) with the agree bar. | no |
| Pick a type | CH02 chips | Filters in place. | no |
| Manage hub | top line (managers only) | Opens `/hub/manage` (Overview). | no |

## Words
| Where | Text |
|---|---|
| Sidebar | Company hub |
| Title | Company hub |
| Agree button | Pages need your yes |
| Agree hint | Nearest by {d Mon} |
| Saved | Saved · {n}; with none: Saved |
| Saved popover | Saved; empty: Nothing saved yet / Save a post or page to find it here. |
| Manage | Manage hub |
| Ask placeholder | Ask about policies, offices, benefits — or search news |
| Ask groups | Pages; News; Ask noddo |
| Ask row | Ask noddo: “{text}” |
| Ask no results | Nothing found for “{text}” |
| Send (accessible name) | Ask |
| Birthday tile | Happy birthday, {first name} / Today · {team} |
| Anniversary tile | {n} / years with {first name} (1: year with {first name}) / Today · {team} |
| Welcome tile | Welcome to the team / {name}, {name}, {name} joined (more than 3: {name}, {name} and {n} more joined) |
| News heading | News |
| Segmented | For me; Everyone |
| Link | All news |
| Pinned pill | Pinned |
| Row meta | {author} · {team, office or "Everyone"}; for a policy post: {author} · Policy update; for an event: {author} · Event on {d Mon} |
| Date | {d Mon}; not this year: {d Mon yyyy} |
| Handbook heading | Handbook |
| Link | Open handbook |
| Section card | {Section} / {n} pages (1 page) · {n} to agree |
| More sections | {n} more sections |
| Recently updated | Recently updated / {page} / {section} · {d Mon} |
| CH02 title | News |
| CH02 search | Search news |
| CH02 types | All types; Announcements; Policy updates; Events |
| CH02 months | This month; {Month}; {Month yyyy} |
| Save (accessible name) | Save; when saved: Saved |
| Photo (accessible name) | Photo from the post |
| CH03 title | Pages need your yes |
| CH03 lead | Read each page and agree to its current version. HR sees when you agreed. |
| CH03 segmented | Waiting · {n}; Agreed · {n} |
| CH03 groups | This week · {n} pages; Later · {n} pages (1 page) |
| CH03 row meta | {section} · version {n} · new; {section} · version {n} · {n} things changed since you agreed (1: 1 thing changed); {section} · version {n} · you agreed to version {n} in {Month} |
| CH03 due | By {d Mon}; overdue: Overdue + Was {d Mon} |
| CH03 Agreed row | Agreed {d Mon} |
| CH03 button | Read |
| CH03 more | Show {n} more |
| Back link | Company hub |
| Empty hub | Your company hub is empty / News and handbook pages will show up here. / Write the first post / Add a page |
| Empty news | No news yet |
| Empty handbook | No handbook pages yet |
| Nothing to agree | You've agreed to everything / New pages to agree to will show up here. |
| Agreed empty | Nothing agreed yet |
| No match | No news matches this / Clear filters |
| For me empty | Nothing just for you yet / See everything |
| Block error | Couldn't load the news; Couldn't load the handbook; Couldn't load celebrations / Try again |
| Toasts | Saved / Removed from saved / Undo |

Every string in the frames, including example data, is in `words.md`.

## Values
- **Page padding** 32 48 (SPEC § 6 says 32; the hub keeps Home's calmer side padding, see Changes to SPEC). Gaps:
  - title line → ask box 28 (built as 32, SPEC § 6 scale);
  - ask box → strip 40;
  - strip → columns 48;
  - column gap 56 (built as 64, see Changes to SPEC).
- **Icon tiles:**
  - CH01 rows: 48, radius 12 (Home's `rounded-tint`);
  - CH03 rows: 44;
  - section cards: 32, radius 10.
  - The tile colour is the section's tag colour (SPEC § 4.7). The icon inside is 20, stroke 1.75 (SPEC § 9).
- **Radii:** the frames use 14 on the section cards and row tiles, which is not a SPEC radius. Build 14 as **16** (card, SPEC § 8) on section cards, and as **12** (`rounded-tint`, Home) on icon tiles. The cover and celebration tiles use 20 (panel, SPEC § 8).
- **Counter** in the agree button: SPEC § 13.4 counter, accent fill.
- **Overdue** (CH03) is the reader's own miss, so it is red text, "Overdue" and the day it was due (`STATUS_AND_BADGES.md` § 5). The frame draws it as a declined pill. Build it as `StatusBadge` tone `declined`, "Overdue", with "Was {date}" beside it.
- **Dates and numbers** are tabular (SPEC § 5).
- **Tooltips** are light (DESIGN_SYSTEM § 7).
- **Accent:** everything accent follows the company accent: the counter, the dots, the send button, links and the hero date on a cover (DESIGN_SYSTEM § 3).

## Changes to SPEC
1. **Page title 32/40 600** on the hub's pages (SPEC § 5 page title is 24/32). The hub is a place people visit, like Home, and 24 looked lost next to the big covers. The same title size is used in `company-hub-page` and `company-hub-manage`.
2. **Page padding 48 left and right** (SPEC § 6 says 32), as on Home.
3. **"Pages need your yes" is a pill-shaped button** on `accent-muted` (SPEC § 8: no pill buttons in the product). It is a call-out more than a button. The pill-shaped controls on Home set the precedent (DESIGN_SYSTEM § 7, Home's exceptions).
4. **Hero numbers** on a celebration tile (36/40) and on a cover without an image (48/48), from Home's `text-hero-*` tokens. SPEC § 5's big number is 32/40.
5. **Tag palette tints as decoration:** celebration tiles, cover tiles without an image, and icon tiles take the soft tag colour (SPEC § 4.7 has tags for user-chosen colours). For sections and pages the colour is chosen by the editor, so it is a tag use and its name is shown. For celebration tiles the colour is fixed by kind and is decoration only, with the words carrying the meaning.
6. **News heading at 22/28** (SPEC § 5 section title 18/26), to sit with the 32 page title. The Handbook heading matches it.
7. **Column gap 56** is not in the § 6 scale. Build it as 64.
8. **Emoji in a post title:** an author may start a title with an emoji, and it is shown as typed. SPEC § 1 says no emoji in sensitive moments only, so this is a new rule: emoji are allowed only in a post's title, typed by its author, never in the product's own words and never as icons (Ulia, round 6). Everywhere else, posts and pages carry Hugeicons icons.

## New components
- **`AgreeCallout`**: the pill button with a counter, label, arrow and the hint beside it. States: shown with a count, hidden. Hover `accent-muted` → a darker step (`accent-ring` border); focus per SPEC § 13.1. It could later be used on Home's "This week".
- **`CelebrationStrip`** and **`CelebrationTile`**: three kinds (birthday, anniversary, welcome). States: normal, many (scrolls), none (hidden), loading skeleton. Data: today's birthdays and anniversaries and this week's joiners, the same as Home's This week (`app/api/home/celebrations`).
- **`NewsRow`**: icon or thumbnail tile, title, meta, date, optional save button. Also used in Manage hub → Posts (with a status pill instead of the save button).
- **`PinnedPost`**: cover (image or tint with a date), Pinned pill, title, excerpt, author row.
- **`HandbookSectionCard`**: icon tile, name, page count, agree dot and count.
- **`AiBox`**, hub variant: the existing Home `AiBox` with its own placeholder and groups (Pages / News / Ask noddo). No new component.
- Reused as they are: `SegmentedControl`, `FilterChip`, `EmptyState`, `ErrorState`, `Skeleton`, `NodRing`, `StatusBadge`, the light tooltip.

## Open questions
Q-9 (who manages the hub), Q-10 (what the ask box answers from) and Q-13 ("For me") are in `QUESTIONS-to-add.md`. None blocks: each has a recommended default that the design follows.

---

## Built
*Filled by the code side when the screen is built.*

- **Where to see it:** `/hub`, `/hub/news`, `/hub/news/{id}`, `/hub/to-agree` — `components/modules/hub/reader/` (`HubHomeContainer`, `NewsContainer`). Built 2026-11-12; walked by the assistant the same day with the window hidden — **not yet looked at by a person**.
- **Differs from the design:**
  - On `/hub` the pinned post stays on top under *For me* while *All news* hides it — open, `WALK_QUESTIONS.md` § 34 in `(claude)/development_plan/`.
  - "Ask noddo" in the ask box finds pages and posts only; there is no assistant yet, so no answer row.
  - The *Company news* widget on Home (Q-12) is not built; its settings toggle is hidden.
- **Images of the real screen:** not added — the walk's window was hidden.
