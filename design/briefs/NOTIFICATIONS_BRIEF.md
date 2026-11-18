# Brief: Notifications, the inbox and "Needs action"

**From the owner's side, 2026-11-18. Input for drawing, not a spec.** Everything in §§ 2, 5–7 is built and running, but
**none of it was drawn by you** — the inbox, the preferences table, the unsubscribe page and the emails were made by the
code side on the noddo package and its rules. The owner answered the open questions the same day (`(claude)/DECISIONS.md`
§ "Notifications and the inbox — the audit's answers"), and **most of the answers were built the same evening** — the
data and the behaviour, on the existing screens; new screens are yours. Where something decided is still not in the
code, this brief says **Decided — to be built**; where it was built today, **Built 2026-11-18**. Each screen is still drawn into `screens/<name>/spec.md` by `../HANDOFF.md`, and built only when its spec
says `status: ready`.

How to read it — as the other briefs:

- **What exists** — built; the screen can show it today.
- **Decided** — the owner's answers. Draw to them. *Decided — to be built* means the code does not do it yet; draw it as
  if it did.
- **States to draw** — every state the code can produce.
- **> Note for the designer** — a call left to you. Answer it in the screen's spec.

Every word quoted below is the product's current English text. Use it, or propose better words in the spec; the code
translates them (English and Russian today).

**The screens this brief asks for:**

| Screen | What | § |
|---|---|---|
| `inbox` | The inbox — redraw of what exists | 2 |
| `inbox-needs-action` | One list of what waits on a person, in the inbox, on Home and on a profile | 4 |
| `notification-preferences` | The preferences table and the daily email's hour | 6 |
| `notification-emails` | One email, the daily email, the unsubscribe page, *Emails sent* | 7 |
| `settings-notifications` | The company's read-only catalogue | 8 |

---

## 0 · The whole picture in one page

Something happens in the product — a leave request, a new manager, a document to sign, a review to write. The product
decides **who should hear about it**, writes **one line into each of their inboxes**, and, depending on the kind of
line, **emails** it at once, puts it in the **daily email**, or does not email it at all. § 5 lists every such case.

| Surface | Where | What it is |
|---|---|---|
| **Inbox** | `/inbox`, the *Inbox* item in the sidebar with a count | Every line a person was sent, newest first |
| **Needs action** | the inbox's filter, Home's *Waiting on you*, a profile's bar | What still waits on the reader — **one list from 2026-11-18** (§ 4) |
| **Notification preferences** | `/preferences` → *Notifications* | Which categories reach the person, in the app and by email; the hour of the daily email |
| **Emails** | the person's mailbox | One email per line, or one daily email with many lines |
| **Unsubscribe** | `/unsubscribe?token=…`, opened from an email | Turns a category's email off, with *Undo* |
| **Emails sent** | a person's profile → header menu, System Owner only | The person's last 20 emails, and lifting a blocked address |
| **Notifications (company)** | Settings → Automation → *Notifications* | A "Coming soon" stub today; a read-only catalogue to draw (§ 8) |

**What there is not, and will not be now:** a bell or a popover in the header (decided: not until the header is
redesigned), push to a phone, Slack or Teams (not decided yet), live updates (the count is checked every 45 seconds and
when the window comes back into focus), archive, snooze, tags, messages between people.

---

## 1 · The words the product uses

| Word | Means | Why a designer cares |
|---|---|---|
| **Notification** | One line in one person's inbox | The unit of everything here |
| **Type** | What kind of line it is — **72** of them (§ 5) | Each has its own title, text, icon and destination |
| **Category** | One of seven groups of types: *Approvals*, *Org changes*, *Policies*, *Documents*, *Tasks*, *System*, *Company news* | The chips in the inbox, the rows of the preferences table |
| **Unseen** | Arrived since the reader last looked at the inbox | **The sidebar count counts unseen.** Opening the inbox clears it |
| **Unread** | Not opened (clicked) yet | Bold row with an accent dot; the *Unread* filter; *Mark all as read* |
| **Actionable** | The line asks the reader to decide or do something | It carries buttons, or opens the place to do it; it belongs to *Needs action* |
| **Live status** | An actionable line does not store whether it was answered — it asks the source each time it is shown | When one of three approvers acts, the other two lines change on their own: *Approved*, *Cancelled*… Nothing goes stale |
| **Mandatory** | A type that cannot be turned off. **Everything that asks you to act is mandatory**, and so is security | A switch locked on |
| **Muting right** | Whether a person may turn a category off at all is a right in Roles & Access (`NOTIFICATION.<category>` *Manage*) | A switch can be locked because of the person's role, not the type: "Managed by your organization" |
| **Channel** | *In the app* or *By email* | The two columns of the preferences table. **An email is a copy of an inbox line**: a line turned off in the app is not emailed either |
| **Now / Daily / Never** | How a type is emailed: at once, in the one daily email, or not at all | § 5, § 7 |

**Who is told — three rules for every type.** The person it happened to; **never the person who did it** (nobody is
told about their own act); never a draft (a person not yet invited cannot sign in).

---

## 2 · The inbox (`/inbox`)

### What exists

**The page.** Title *Inbox*, a line *{count} unread*, *Mark all as read*, and a gear that opens *Notification
preferences*. Below:

1. **Status filters** — *All*, *Unread*, *Starred*, *Needs action*, each with its count. The filter lives in the
   address (`?filter=`), so a link can open the inbox on one; an unknown value reads as *All*.
2. **Category chips** — built from the categories present in the list, shown only when there are two or more,
   *All categories* first. Not kept in the address.
3. **Search** — over the title, the text and the category name, as typed.
4. **The list**, grouped *Today*, *Yesterday*, *This week*, *Earlier*.

**A row:**

```
[icon 40×40]  Title (one line, truncated)  ● (unread)                [☆ star] [🗑 delete]
              Text — one or two sentences, with names, days, dates
              3h ago · [Category chip]
              [Approve] [Reject]   ← only actionable lines, only while open;
                                     replaced by an outcome when answered
```

- Unread rows have a tinted background and the accent dot; a click anywhere on the row marks it read and opens its
  destination (§ 5 says where each goes). A row with no destination is not clickable.
- **Star** keeps a line in *Starred*. **Delete** removes the line.
- **Time** is relative: *just now*, *{count} min ago*, *{count}h ago*, *{count}d ago*.
- **Opening the inbox marks everything seen** (the sidebar count goes to zero), and so does a refresh that brings
  something new while it is open. Rows stay unread until clicked.

**Buttons inside a row today:**

| Line | While open | When answered — the outcome replaces the buttons |
|---|---|---|
| Time off approval requested | *Approve* · *Reject* (reject asks for a *Reason*, required) | *Approved*, *Rejected*, *Cancelled*, or *You approved · waiting for the rest of the chain* |
| Cancellation requested | *Approve cancellation* · *Decline* | *Cancellation approved*, *Cancellation declined* |
| Holidays changed at the source | the list of changes, the leave they touch, *Apply changes* · *Dismiss* | *Applied*, *Dismissed*, *Replaced by a newer check of the source* |
| Your holiday edits differ from the source | *Keep ours* · *Take theirs* · a link to edit | *Your version was kept*, *The source's version was taken* |

Answering marks the row read. If the server refuses (somebody else answered first), the error shows on the row and the
list is read again, so the outcome appears.

**The sidebar item.** *Inbox* with a number badge (*99+* above 99; a dot when the sidebar is folded). The number is
**unseen**, not unread.

### Built 2026-11-18 (on the existing screen)

- **The list is paged** — it loads as one scrolls; the counts on the filters are the server's, not the loaded page's.
  A search loads the rest of the inbox first (it searches the words on the screen).
- **A read line is kept 12 months; a starred or an unread one until the person deletes it.** So *Earlier* reaches back
  a year at most for what was read.
- **Delete stays, with an *Undo* toast** — as every other row deletion in the product: the line goes at once and is
  deleted when the toast ends. No archive.
- **A task, a signature, a review step carries its state in the row** — while open, *Mark done* on a to-do or an
  acknowledgement and *Approve* · *Decline* on an automation's approval; once done, an outcome in place of the
  buttons: *Done*, *Signed*, *Declined*, *No longer needed*, *Given to somebody else*, *Closed*.

### Decided

- **No bell, no popover** — the sidebar item is the door.

### Words today

*You're all caught up* · *No notifications yet.* · *No unread notifications.* · *No starred notifications.* ·
*Nothing needs your action.* · *Nothing in this category.* · *No notifications match your search.*

### States to draw

- Loading (a skeleton — a blank "caught up" while loading was a bug once);
- empty for a new person; empty per filter (the five sentences above); no search results;
- the normal case — a mix of read and unread, actionable and not, several categories;
- a long list — a HR admin after a year has hundreds of rows; loading more as one scrolls;
- an actionable row in each state: open, answered by me, answered by somebody else, *waiting for the rest of the
  chain*, refused with an error;
- the holiday change row, which is large: up to several changes, a count of leave requests touched, people observing;
- a deleted row with *Undo*;
- a long title (60 characters) and a long text (three lines, names of 40 characters);
- a narrow window (phone width).

> Note for the designer: the row today has no "who" — the icon is the type's, not the person's avatar. Most lines are
> about a person (*Anna asked for time off*). An avatar where there is a person, the type icon where there is not, is
> a common choice; yours to make.

---

## 3 · (Reserved — the header)

No bell or popover until the header is redesigned (decided, D2). Nothing to draw here now.

---

## 4 · "Needs action" — one list

### What exists — three lists, and why that is wrong

Today three places answer "what waits on me", each from its own sources:

| Place | What it shows | Can act in place? |
|---|---|---|
| **Inbox → Needs action** | Only leave approvals and cancellations, holiday source changes, must-read pages | Leave and holidays yes; pages no |
| **Home → Waiting on you** (`screens/home-widgets`) | Leave approvals and cancellations, automation approvals (*Decide*); lifecycle tasks, documents to upload, documents to sign, reviews to write / nominate / approve, must-read pages (*Do*); failed automations, HR only (*Read*) | Approve with a 5-second *Undo*; *Mark done* on simple tasks; the rest opens its screen |
| **A person's profile → Waiting on you** bar | That person's leave requests waiting on me, and my reviews of them | Approve with *Undo* |

So *Home* says "5 waiting" and its *Review 5* button opens the inbox, which shows 2.

### Decided — built 2026-11-18 behind the screens; the list screen is yours

- **One list, one count.** The inbox's *Needs action*, Home's *Waiting on you* and the profile's bar read the same list;
  the profile bar is that list narrowed to one person. Home's count and the inbox's count are always the same number.
- **Act in place where one click is enough**: approve or reject leave, decide a cancellation, approve an automation,
  mark a simple task done, agree to a hub page. **Signing a document and writing a review always open their screen** —
  they need reading or writing.
- **Every item goes quiet by itself once done**, everywhere: the inbox line shows its outcome instead of its buttons,
  Home drops the card, and the email is not sent if it had not left yet. This now covers tasks, signatures and reviews
  too — until now only leave, holidays and hub pages did it.

**What is in the code now:** the one list exists (`GET /me/actions`, with its count). Home's *Waiting on you* and the
profile's bar read it, and Home gained a card for a document to sign that was sent from a profile (no task stood for it,
so Home never showed it). **The inbox's *Needs action* filter still lists inbox lines** — that is the screen to draw,
`inbox-needs-action`. Two things are still open: agreeing to a hub page in place (the hub's own rule says "read the
page first"; the owner decides) and one *Undo* behaviour for the whole list (draw it once, here).
- Because everything that asks you to act is mandatory, every item in this list is one the person cannot turn off.

**What goes into the list** — what each item can show, and when it leaves:

| Kind | Shows | In place | Opens | Leaves the list when |
|---|---|---|---|---|
| Leave request to approve | requester, days, dates, leave type, on behalf of | Approve · Reject (reason) | the request | approved / rejected / cancelled, or the chain moved past me |
| Leave cancellation to decide | requester, dates, the reason | Approve cancellation · Decline | the person's leave | decided |
| Automation approval | what is being approved, which automation, since when | Approve · Decline | `/tasks` | decided, or escalated to somebody else |
| Lifecycle task — a to-do, acknowledge | task, whose onboarding / offboarding, due date | Mark done | `/tasks` | done or cancelled |
| Lifecycle task — fill fields, questionnaire | task, whose process, due | — | `/tasks` | done |
| Document to upload (a request) | what document, by when, who asked | — (upload opens its place) | `/tasks` | uploaded |
| Document to sign | document, sender, expires | — | the signing screen | signed / declined / expired / cancelled |
| Review to write / nominate peers / approve peers / approve a review | kind of review, of whom, cycle, due | — | the review | submitted / approved |
| Must-read page | page, version, agree by | Agree | the page | agreed |
| Holiday source changed | calendar, changes | Apply · Dismiss (or Keep ours · Take theirs) | stays in the inbox | applied / dismissed |
| Failed automation run (HR) | automation, when, why | — | the run | retried or dismissed |

### States to draw

- nothing waiting (*Nothing needs your action.*); one item; thirty items of six kinds;
- an item answered here (with the 5-second *Undo*); answered elsewhere while the list was open; refused (somebody
  else was first);
- an approver of a long chain (*You approved · waiting for the rest of the chain*);
- items overdue and due today;
- a delegate seeing their delegator's approvals (shown to both; the first to act decides);
- the same list on Home (the widget) and on a profile (the bar) — how much of a row survives in each.

> Note for the designer: grouping. Home groups by *Decide / Do / Read*; the inbox groups by date. Pick one for the
> list, or say why both.

---

## 5 · Every notification — what happened, who is told, can they turn it off

**72 types**, every one listed below, grouped by area and in the order things happen. Some types are sent on several
occasions; each occasion is its own row. Where nobody is told, § 5.11 says so.

**How to read the columns**

- **Notification** — the line's title in the inbox (its text is in `messages/en/notifications.json`, `presenter.*`).
- **Who gets it** — after the three rules of § 1: never the person who did it, never a draft.
- **In the app — can they turn it off?**
  - **No** — mandatory: always delivered.
  - **Yes** — anyone may turn it off (with the seeded roles; the categories *Org changes*, *Policies*, *Documents*,
    *Company news*).
  - **Owner** — only a System Owner may turn it off (with the seeded roles; the categories *Approvals*, *System*). For a
    default employee it is always on. Who may mute a category can be changed in Roles & Access.
- **Email** — *Now*, *Daily* (the one daily email) or *Never*, and whether it can be turned off on its own:
  - **fixed** — it goes whenever the inbox line is there (it asks to act, or is about security);
  - **can turn off** — by the same person who may turn the app line off.
  - Turning a category off in the app stops its emails too: an email is never sent for a line the inbox does not hold.
- **Acts / Opens** — buttons in the row; where a click goes.

### 5.1 Time off — leave requests (category *Approvals*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A person asks for time off (or somebody asks on their behalf) | **Time off approval requested** | The approvers of the first step. In a strict order — only the first; "all at once" — all of them. Plus each approver's active delegate. If the chain finds nobody — the people who may decide on this person's leave | No | Now · fixed | Approve · Reject / the request |
| An approver signs, and the strict order moves to the next step | **Time off approval requested** | The next step's approvers and their delegates; the one who signed gets nothing new | No | Now · fixed | Approve · Reject / the request |
| The last approval needed is given | **Time off approved** | The requester | Owner | Now · can turn off | — / own leave |
| An approver rejects the request | **Time off rejected** (with the reason) | The requester | Owner | Now · can turn off | — / own leave |
| The requester (or somebody) withdraws a request still waiting | **Time off cancelled** | Every approver involved, minus whoever withdrew it | Owner | Daily · can turn off | — / the person's leave |
| The requester asks to cancel an approved request | **Cancellation requested** (with the reason) | Every approver in the chain and their delegates; with no chain — the people who may decide on this person's leave | No | Now · fixed | Approve cancellation · Decline / the person's leave |
| An approver approves the cancellation | **Cancellation approved** | The requester | Owner | Now · can turn off | — / own leave |
| | **Time off cancelled** | The other approvers, minus the one who approved it | Owner | Daily · can turn off | — / the person's leave |
| An approver declines the cancellation | **Cancellation declined** | The requester | Owner | Now · can turn off | — / own leave |
| Somebody else ends an approved absence unasked — an administrator, a termination's settlement | **Time off cancelled** | The requester | Owner | Now · can turn off | — / own leave |
| | **Time off cancelled** | The approvers involved, minus whoever ended it | Owner | Daily · can turn off | — / the person's leave |
| A person delegates their approvals to somebody for a period | **Approvals delegated to you** | The delegate | Owner | Now · can turn off | — / `/preferences` |

### 5.2 Time off — entitlement (category *Policies*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A leave policy is given to a person — by hand, or by a rule (a future-dated one when it starts) | **Leave policy assigned** (the policy, from which date) | The person | Yes | Daily · can turn off | — / own leave |
| A person's leave policy ends — by hand or by a rule | **Leave policy ended** | The person | Yes | Daily · can turn off | — / own leave |
| Somebody adjusts a person's balance by hand | **Balance adjusted** (by how much, why) | The person | Yes | Daily · can turn off | — / own leave |
| A holiday or a work schedule changes and a request's days are re-counted | **Time off re-priced** | The requester | Yes | Daily · can turn off | — / own leave |
| Carried-over days will burn in 30 days (*built 2026-11-18*) | **Carried-over days expire soon** | The person | Yes | Daily · can turn off | — / own leave |

### 5.3 Public holidays (category *Policies*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| The outside source of a holiday calendar changed (a day added, removed, moved, renamed) | **Holidays changed at the source** | Everyone who may manage holiday calendars | No | Daily · fixed | Apply changes · Dismiss / the calendar |
| The source changed a day the company had edited by hand | **Your holiday edits differ from the source** | The same | No | Daily · fixed | Keep ours · Take theirs / the calendar |

### 5.4 Where a person sits (category *Org changes*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A role is given to a person — by hand or by a rule | **Role assigned** | The person | Yes | Daily · can turn off | — / their profile |
| | **Role holders changed** (*System*; one line per change, counting a batch) | Every System Owner but the actor and the person. Not for the company's default role | Owner | Now · fixed | — / the role |
| A role is taken from a person | **Role removed** | The person | Yes | Daily · can turn off | — / their profile |
| | **Role holders changed** (*System*) | As above | Owner | Now · fixed | — / the role |
| A person's manager is set, changed or removed | **Manager changed** | The person | Yes | Daily · can turn off | — / their profile |
| A manager is terminated and their reports move up | **Manager changed** | Each report moved | Yes | Daily · can turn off | — / their profile |
| A person is added to a department or a team — by hand or by a rule | **Added to a Department** / **Added to a Team** | The person | Yes | Daily · can turn off | — / their profile |
| A person is taken out of a department or a team | **Removed from a Department** / **Removed from a Team** | The person | Yes | Daily · can turn off | — / their profile |
| A person's position (job) changes | **Position changed** | The person | Yes | Daily · can turn off | — / their profile |
| A person is created with a first day still ahead; and on the morning of that day (*built 2026-11-18*) | **Somebody joins your team** / **Somebody starts today** | The person's manager | Yes | Daily · can turn off | — / the person |
| A termination is recorded; and on the morning of the last working day (*built 2026-11-18*) | **Somebody leaves your team** / **A last day today** | The person's manager | Yes | Daily · can turn off | — / the person |

### 5.5 Access and security (category *System*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A role's permissions or field access are changed | **Role access changed** | Every System Owner but the actor | Owner | Now · fixed | — / the role |
| A person's account is locked after failed sign-ins | **Account locked** | The person's manager, and everyone who may block this person. *The person themselves gets an email, not an inbox line* | No | Now · fixed | — / the person |
| MFA is reset for somebody; the company's MFA rule changes; the SSO connection is changed; a SCIM token is issued; the identity provider's group-to-role mapping changes; SCIM was refused blocking somebody | **Login security changed** | Every System Owner | No | Now · fixed | — / the person or Settings → Login and SSO |
| A scheduled invitation could not be sent | **Invitation not sent** | Whoever scheduled it | No | Now · fixed | — / the person |

### 5.6 Documents and signing (category *Documents*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| Somebody else uploads a document to a person's file, visible to the person | **Document added** | The file's owner | Yes | Daily · can turn off | — / their documents |
| A document's last valid day is near (the category's reminder) | **Document expires soon** | The owner (if the document is visible to them) and the document's keepers | Yes | Now · fixed | — / the person's documents |
| A document's last valid day has passed | **Document expired** | The same | Yes | Now · fixed | — / the person's documents |
| Somebody asks a person to upload a document | **Document requested** | The person asked (or the one chosen to upload it) | No¹ | Now · fixed | — / `/tasks` |
| The requested document is uploaded | **Document uploaded** | Whoever asked for it, unless they uploaded it themselves | Yes | Now · can turn off | — / the person's documents |
| A document is sent for signature; it becomes a signer's turn; a signer is reminded | **Signature requested** | Each signer asked now (the sender too, if they sign) | No¹ | Now · fixed | — / the signing screen |
| Everybody has signed | **Signed by everyone** | The sender, and the person the document is about (if visible to them) | Yes | Daily · can turn off | — / documents |
| A signer declines | **Signature declined** | The sender | Yes | Now · fixed | — / documents |
| Nobody signed by the deadline | **Not signed in time** | The sender | Yes | Now · fixed | — / documents |
| The sender cancels the signing | **Signing cancelled** | The signers already asked | Yes | Now · can turn off | — / documents |
| A report or a saved People view is shared with a person, or with their team, department or role (*built 2026-11-18*) | **Shared with you** | Each person the share reached, not whoever shared it | Yes | Daily · can turn off | — / People for a view; nothing yet for a report (no screen) |

¹ Since 2026-11-18 these two go quiet when done and therefore cannot be turned off — until then a default employee
could turn off a request to sign by turning off *Documents*.

### 5.7 Lifecycle processes — preboarding, onboarding, offboarding (category *Tasks*, and *System*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A process starts | **A task for you** / **Tasks for you** (with how many) | Each assignee with an open task, once per process, minus whoever started it | No | Now · fixed | — / `/tasks` |
| A waiting task opens (its condition is met) | **A task for you** | The task's assignee | No | Now · fixed | — / `/tasks` |
| A task is added to a running process, or given to somebody else | **A task for you** | The new assignee | No | Now · fixed | — / `/tasks` |
| A task's date comes and it is still open | **A task is due** | The assignee | No | Now · fixed | — / `/tasks` |
| Three days after the date, still open | **A task is overdue** | The process manager | No | Now · fixed | — / the process |
| Somebody comments on a task | **A new comment** | The assignee and the process manager, not the author | No | Daily · fixed | — / `/tasks` or the process |
| A scheduled step of a process fails (e.g. sending the invitation) · *System* | **A preboarding / onboarding / offboarding step failed** | The process manager | No | Now · fixed | — / the process |
| An onboarding or offboarding is completed — not cancelled; a preboarding hands over and tells nobody (*built 2026-11-18*) | **Onboarding finished** / **Offboarding finished** · *Org changes* | The process manager and the person's manager, not whoever closed it | Yes | Daily · can turn off | — / the process |

### 5.8 Automations (categories *Tasks* and *System*, all mandatory)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| An automation's "Send a notification" step runs (or its test is sent) · *System* | **the automation's own title and text** | The people the step names | No | Now · fixed | — / the person or their documents |
| An automation's "Create a task" or "Request approval" step runs; an approval is escalated to somebody | **A task for you** | The task's or approval's assignee | No | Now · fixed | — / `/tasks` |
| An approval is still waiting and the automation reminds | **An approval is waiting for you** | The approver | No | Now · fixed | — / `/tasks` |
| An automation is paused (e.g. its author lost the right) · *System* | **Automation paused** | The author; the automation admins too when the author cannot act | No | Now · fixed | — / the automation |
| An automation's run fails · *System* | **Automation failed** | The same | No | Daily · fixed | — / the run |
| A "Wait until" step gives up · *System* | **Automation stopped waiting** | The people the step names | No | Daily · fixed | — / the run |

### 5.9 Performance reviews (category *Tasks*, all mandatory)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| HR launches a review cycle | **Reviews to write** | Every reviewer in it | No | Now · fixed | — / `/reviews/me` |
| A review is assigned or reassigned to a person | **A review for you** | The reviewer | No | Now · fixed | — / the review |
| Two days before a review's due date, still open | **Review due soon** | The reviewer | No | Now · fixed | — / the review |
| The due date comes, still open | **Review due today** | The reviewer | No | Now · fixed | — / the review |
| HR nudges a reviewer | **Your review is waiting** | The reviewer | No | Now · fixed | — / the review |
| The due date has passed, still open | **Review overdue** | The cycle's owner | No | Daily · fixed | — / the cycle |
| A peer declines to write a review | **Peer review declined** | The cycle's owner | No | Now · fixed | — / the cycle |
| A person submits their self review (not for anonymous kinds) | **Self review in** | Their manager | No | Daily · fixed | — / `/reviews/me` |
| A manager submits a review that needs approval; the approver changes | **A review to approve** | The approver | No | Now · fixed | — / the packet |
| The approver approves it | **Your review was approved** | The manager | No | Daily · fixed | — / the packet |
| The approver sends it back | **Your review was sent back** | The manager | No | Now · fixed | — / the review |
| The review is shared with the person reviewed | **Your review is ready** | The person reviewed | No | Now · fixed | — / the packet |
| A shared review is changed | **Your review was updated** | The person reviewed | No | Now · fixed | — / the packet |
| The person acknowledges their review | **Review acknowledged** | The manager | No | Daily · fixed | — / the packet |
| Peers are nominated and need approval; the approver changes | **Peers to approve** | The approver of the peer list | No | Now · fixed | — / the nomination |
| The peer list is approved | **Your peers were approved** | The person reviewed | No | Daily · fixed | — / the nomination |

### 5.10 Company hub (categories *Tasks* and *Company news*)

| What happened | Notification | Who gets it | App: turn off? | Email | Acts / Opens |
|---|---|---|---|---|---|
| A must-read page is published, a new version asks again, or a person joins its audience · *Tasks* | **A page needs your yes** | Everyone in the page's audience who has not agreed | No | Now · fixed | Agree³ / the page |
| The *Agree by* date is near (the hub's setting, days before) · *Tasks* | **Agree soon** | Those who have not agreed | No | Now · fixed | Agree³ / the page |
| An editor presses *Remind* · *Tasks* | **A reminder to agree** | Those who have not agreed | No | Now · fixed | Agree³ / the page |
| The *Agree by* date passed (if the hub asks to tell managers) · *Company news* | **A must-read deadline was missed** | The managers of those who missed it | Yes | Daily · can turn off | — / *Manage hub* |
| A news post is published with *Notify people* ticked · *Company news* | **Company news** ("{author} posted "{title}".") | The post's audience, minus the author | Yes | **Never** | — / the post |

³ Decided as *Agree* in place, but the hub's own rule says the page is read first — the owner decides which wins;
today the line opens the page.

### 5.11 What happens and tells nobody

On purpose — **do not draw a line for these**:

- **Time off:** accruals and renewals of a balance; a request edited; anything about policies themselves (created,
  renamed, archived…); a delegation changed or removed.
- **A person's own security:** password, email address, MFA switched on or off, a new device — these are **emails
  only**, never an inbox line (decided, C2: if the account was taken, the inbox is read by whoever took it).
- **People:** a person created, edited, their attributes changed, archived, deleted; a status changed.
- **Things moved in bulk where the journal records only a count:** a department or team archived with its members
  moved, a position archived with its holders cleared, a role deleted with its holders, what a termination ends.
- **Documents:** downloaded, renamed, moved, deleted, restored, starred; folders, categories, templates.
- **Processes:** a template edited; a process cancelled, archived, deleted; a task completed or cancelled; a questionnaire submitted; a file uploaded to a task.
- **Automations:** created, edited, published, turned on or off, archived; a step skipped; an approval decided; a run
  cancelled or retried.
- **Reviews:** forms; a cycle created, edited, closed; calibration.
- **Hub:** a page or section edited or published (other than must-read); a post edited, scheduled, unpublished; a page
  agreed (nobody is told when somebody agrees).
- **Whole areas:** attendance, attributes, the job catalogue, org structure editing, import and export, company
  settings and appearance, calendar feeds, reports (other than "shared with you"), a share's permission changed.

---

## 6 · Notification preferences (`/preferences` → *Notifications*)

### What exists

A table, one row per category that has at least one type the person can receive:

| Category | In the app | By email |
|---|---|---|
| Approvals | switch | switch |
| Org changes | switch | switch |
| … | | |

- **In the app** is locked on when every type in the category is mandatory (*Tasks*), or when the person's role may
  not mute it: *Always on — required notifications can't be turned off.* / *Managed by your organization — you can't
  opt out of this category.*
- **By email** is locked when everything the category emails asks you to act or is about your account (*Always emailed
  — it asks you to act or is about your account.*); shows *Not emailed* when the category sends no email; follows the
  app column — with the app off, the email is off too (*Turn the app on to get emails too.*).
- Below the table: **Daily email** — *Updates that don't need you right away come together in one email a day, on
  working days.* — *At {hour}*, a choice of 7, 8, 9, 10 and 17 (default 8, the person's own time zone).
- A switch on a category turns off **only its types that may be turned off** (§ 5's "Yes" / "Owner"); mandatory types in
  the same category keep coming. E.g. once *Signature requested* is mandatory (decided, § 5.6 ¹), turning *Documents*
  off will still leave it.

**Who may mute what, with the seeded roles:** a default employee may mute *Org changes*, *Policies*, *Documents* and
*Company news*; *Approvals* and *System* only the System Owner; *Tasks* nobody (decided: no muting right for *Tasks*
until it has a type that may be muted).

### States to draw

- a default employee (most rows locked "Managed by your organization");
- a System Owner (everything they may mute is a switch);
- a category off in the app, its email greyed;
- a category with mandatory and optional types — what "off" means for it;
- a person with no email address;
- a long category list on a narrow window.

> Note for the designer: a lock's reason is a hint today; whether it is a tooltip, a line under the row, or an icon is
> yours. Leave room for a third channel column (Slack or Teams — not decided, do not draw it).

---

## 7 · Emails

### What exists

- **One email per line** for *Now* types: subject (e.g. *Anna Smith asked for time off*), the inbox line's own words
  (an email says exactly what the inbox line says — decided, EM7), one button **Open in noddo** that opens the line
  (marks it read and goes where the row goes), *Or paste this link in your browser:*, the footer *Sent by noddo on
  behalf of {company}.* · *You get this because you have an account at {company}.*
- **The daily email** for *Daily* types: subject *{n} updates from {company}*, *Here is what happened since your last
  email — {n} updates.*, the lines grouped by category, at most 30 (*…and {n} more in your inbox.*), button *Open your
  inbox*. A daily email with one line is sent as that line's own email.
- **No acting from an email** — the button opens the item (decided, EM6).
- **Unsubscribe** — an email that can be turned off carries a one-click unsubscribe (in the mail client's own menu) and
  a link to the unsubscribe page; an email that cannot carries a link to the preferences instead.
- An email is **not sent** if the line was deleted, the item was already done (*Answered before sending* — **decided:
  for tasks, signatures and reviews too**), or the person left. More than 20 emails in an hour to one person — the ones
  that only inform move to the daily email.
- The email is in the recipient's language. The layout is the one the sign-in and signing emails use
  (`screens/sign-in-emails`, `screens/documents-signing-emails`).

**The unsubscribe page** (`/unsubscribe`, on the company's address, no sign-in): opening it switches the email off at
once — *You won't get these emails* · *{categories} emails are off. Your inbox still shows everything.* · *Undo* ·
*Email settings*. *Undo* → *These emails are back on.* If nothing could be switched off: *Nothing changed: these emails
ask you to act or are about your account, so they always go.* A dead link: *This link no longer works* · *Log in and
change what you get by email in your notification settings.*

**Emails sent** (a person's profile, System Owner): the address, whether it is blocked and why (bounced, complained,
blocked by hand), *Lift*, and the last 20 emails — subject, kind, status, when. Bodies are not stored. Kept 180 days.

### States to draw

- one *Now* email of each class — something to do (leave to approve), news (approved), security (role access
  changed) — with and without the unsubscribe line;
- the daily email with 1, 5 and 30+ lines across categories;
- the unsubscribe page: done, undone, nothing to switch off, dead link — on a phone first, it is opened from mail;
- *Emails sent*: no emails, a blocked address, a long list.

> Note for the designer: the daily email has never been drawn — it was laid out by the code side from the one email
> layout. It is the email most people will get most often.

---

## 8 · Notifications for the company (Settings → Automation → *Notifications*)

### What exists

A *Coming soon* page. Behind it, everything in § 5 is a catalogue in code.

### Decided

- **A read-only catalogue** — every type: what triggers it, who gets it, category, mandatory or not, how it is emailed
  — **with a preview of the inbox line and the email** as the recipient sees them.
- **No company-level switches** (EM9): a company cannot turn a category's email off for everyone, nor force on what a
  person may mute. Who may mute a category is already a right in Roles & Access — the page links there.

### States to draw

- the catalogue grouped by area (§ 5's grouping) or by category — your call;
- one type opened: what happens, who gets it, the inbox line and the email previewed;
- search by a word; a reader without access (the page is under `SETTINGS.GENERAL`).

---

## 9 · Who may do what

| What | Who |
|---|---|
| See an inbox | only its owner; nobody — not a System Owner — sees another person's inbox or whether they read a line |
| Answer a line's buttons | the server checks the same right as the screen it comes from (approving leave, managing holiday calendars) |
| Mute a category | the holder of `NOTIFICATION.<category>` *Manage* (Roles & Access); default employee: Org changes, Policies, Documents, Company news |
| See *Emails sent* and lift a blocked address | `PEOPLE.PROFILE` *Manage* over the person (System Owner by default) |
| The company catalogue | `SETTINGS.GENERAL` |

---

## 10 · Not now — do not draw

- A bell or a popover in the header (decided: not until the header is redesigned);
- snooze, do-not-disturb, tags or folders, archive, grouping several lines into one in the inbox;
- messages or mentions between people;
- push to a phone (there is no mobile app);
- Slack and Teams — not decided yet; leave room for a third channel column, do not draw it;
- acting from an email (EM6);
- company-level email settings (EM9).

---

## 11 · Questions for you — answer in the spec

The owner's questions for this area are all answered (`(claude)/DECISIONS.md` § "Notifications and the inbox — the
audit's answers"). Yours:

1. The inbox row: avatar or type icon; where the buttons sit; how an outcome looks next to the buttons it replaced.
2. *Needs action*: grouped by date, by *Decide / Do / Read*, or by due date — and how much of a row survives on Home
   and on a profile.
3. The preferences table: how a lock explains itself; what "off" means for a category with mandatory types in it;
   where the daily email's hour lives.
4. The daily email: its layout, and what a line looks like in it.
5. The company catalogue: grouped by area or by category; the preview of the line and the email.
6. The new lines of § 5 (*Carried-over days expire soon*, *Somebody joins / leaves your team*, *Shared with you*,
   *Onboarding / offboarding finished*, *Document uploaded*): their titles and icons — the words today are the code
   side's.
7. Home's new card for a document to sign (*A document waits for your signature* · *Sign by {date}* · *Sign*), laid out
   like the *A page needs your yes* card: redraw it if it should differ.

Your open point from the documents round — "should signers be told when signing is cancelled?" — is answered: yes,
built (*Signing cancelled*, § 5.6).

---

## Where it lives in the code — for the spec's "Built" section

| What | Where |
|---|---|
| Inbox | `components/modules/notifications/components/NotificationsInbox.tsx`, `app/(app)/inbox/` |
| A line's words, icon and destination | `components/modules/notifications/components/notificationPresenter.tsx`, `messages/<lang>/notifications.json` |
| Buttons in a row | `NotificationActions.tsx`, `PublicHolidayDriftActions.tsx` |
| Needs action filter | `components/modules/notifications/utils/inboxFilters.ts` |
| Waiting on you (Home) | `components/modules/home/widgets/WaitingOnYouWidget.tsx`, `waitingOnYouDeck.ts` |
| Waiting on you (profile) | `components/modules/organization/modules/profile/components/WaitingOnYou/` |
| Preferences | `components/modules/notifications/components/NotificationPreferences.tsx` |
| Unsubscribe page, Emails sent | `components/modules/email/components/` |
| The types, and how each is emailed | `hris-api/…/features/notifications/catalog/types/`, `…/notifications/email/NotificationEmailPolicies.java` |
| Email words | `hris-api/src/main/resources/i18n/emails*.properties` |
| How the subsystem works; the work decided | `(claude)/technical_documentation/NOTIFICATIONS.md`; `(claude)/development_plan/NOTIFICATIONS_PLAN.md` |
