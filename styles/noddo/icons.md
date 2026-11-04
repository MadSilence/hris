# Icons

noddo uses **Hugeicons, Stroke Rounded, free set (MIT)** and nothing else, plus one custom icon (the nod).

```bash
npm i @hugeicons/react @hugeicons/core-free-icons
```

```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon } from '@hugeicons/core-free-icons';

<HugeiconsIcon icon={Calendar03Icon} size={20} strokeWidth={1.75} />
```

## Rules

- MUST use stroke width **1.75** at 20 and 24 px. At 16 px (dense tables, chips) stroke 2 is allowed for legibility.
- Sizes: **16** dense tables and chips · **20** default (buttons, navigation, menus) · **24** page headers and empty states. Pair 20 px icons with 14–15 px text.
- Icons inherit `currentColor` (text colour). Status icons take `--status-<name>-icon`. Only the nod icon uses the accent.
- Search the free Stroke Rounded set first. Draw a custom icon only for a brand idea (today: only the nod), on the 24 grid, round caps and joins, stroke 1.75.
- Never mix in another icon set (no Lucide, no Heroicons, no emoji as icons).
- Icon-only buttons MUST have an accessible name and a tooltip; hit area at least 24×24 (desktop) / 44×44 (touch).
- Package names below were checked against `@hugeicons/core-free-icons` 4.4.0 (all 95 exist). React import = PascalCase name + `Icon`.

## Core set (96 icons, 8 groups)

### Navigation

| Name | Import |
|---|---|
| `home-01` | `Home01Icon` |
| `dashboard-square-01` | `DashboardSquare01Icon` |
| `inbox` | `InboxIcon` |
| `search-01` | `Search01Icon` |
| `menu-01` | `Menu01Icon` |
| `settings-01` | `Settings01Icon` |
| `notification-01` | `Notification01Icon` |
| `help-circle` | `HelpCircleIcon` |
| `arrow-right-02` | `ArrowRight02Icon` |
| `arrow-down-01` | `ArrowDown01Icon` |
| `link-square-02` | `LinkSquare02Icon` |
| `more-horizontal` | `MoreHorizontalIcon` |

### People

| Name | Import |
|---|---|
| `user` | `UserIcon` |
| `user-group` | `UserGroupIcon` |
| `user-add-01` | `UserAdd01Icon` |
| `user-check-01` | `UserCheck01Icon` |
| `user-remove-01` | `UserRemove01Icon` |
| `hierarchy` | `HierarchyIcon` |
| `id-card` | `IdCardIcon` |
| `shield-user` | `ShieldUserIcon` |
| `contact-01` | `Contact01Icon` |
| `birthday-cake` | `BirthdayCakeIcon` |
| `medal-01` | `Medal01Icon` |
| `favourite` | `FavouriteIcon` |

### Time & leave

| Name | Import |
|---|---|
| `calendar-03` | `Calendar03Icon` |
| `calendar-check-in-01` | `CalendarCheckIn01Icon` |
| `calendar-add-01` | `CalendarAdd01Icon` |
| `clock-01` | `Clock01Icon` |
| `sun-03` | `Sun03Icon` |
| `thermometer` | `ThermometerIcon` |
| `baby-01` | `Baby01Icon` |
| `airplane-01` | `Airplane01Icon` |
| `hourglass` | `HourglassIcon` |
| `timer-02` | `Timer02Icon` |
| `repeat` | `RepeatIcon` |
| `flag-02` | `Flag02Icon` |

### Documents

| Name | Import |
|---|---|
| `file-01` | `File01Icon` |
| `file-text` | `FileTextIcon` |
| `file-verified` | `FileVerifiedIcon` |
| `file-add` | `FileAddIcon` |
| `folder-01` | `Folder01Icon` |
| `signature` | `SignatureIcon` |
| `pen-tool-01` | `PenTool01Icon` |
| `attachment-01` | `Attachment01Icon` |
| `upload-01` | `Upload01Icon` |
| `download-01` | `Download01Icon` |
| `archive-02` | `Archive02Icon` |
| `square-lock-02` | `SquareLock02Icon` |

### Process

| Name | Import |
|---|---|
| nod (custom) | `assets/icons/noddo_icon_nod.svg` (see below) |
| `checkmark-circle-02` | `CheckmarkCircle02Icon` |
| `cancel-circle` | `CancelCircleIcon` |
| `loading-03` | `Loading03Icon` |
| `workflow-square-03` | `WorkflowSquare03Icon` |
| `layout-01` | `Layout01Icon` |
| `check-list` | `CheckListIcon` |
| `target-02` | `Target02Icon` |
| `git-branch` | `GitBranchIcon` |
| `flash` | `FlashIcon` |
| `ai-magic` | `AiMagicIcon` |
| `filter-horizontal` | `FilterHorizontalIcon` |

### Pay & benefits

| Name | Import |
|---|---|
| `wallet-01` | `Wallet01Icon` |
| `money-03` | `Money03Icon` |
| `invoice-01` | `Invoice01Icon` |
| `coins-01` | `Coins01Icon` |
| `percent-circle` | `PercentCircleIcon` |
| `chart-column` | `ChartColumnIcon` |
| `chart-line-data-01` | `ChartLineData01Icon` |
| `pie-chart` | `PieChartIcon` |
| `bank` | `BankIcon` |
| `credit-card` | `CreditCardIcon` |
| `gift` | `GiftIcon` |
| `laptop` | `LaptopIcon` |

### Communication

| Name | Import |
|---|---|
| `message-01` | `Message01Icon` |
| `chatting-01` | `Chatting01Icon` |
| `mail-01` | `Mail01Icon` |
| `sent` | `SentIcon` |
| `call` | `CallIcon` |
| `video-01` | `Video01Icon` |
| `megaphone-01` | `Megaphone01Icon` |
| `at` | `AtIcon` |
| `message-add-01` | `MessageAdd01Icon` |
| `comment-01` | `Comment01Icon` |
| `star` | `StarIcon` |
| `globe-02` | `Globe02Icon` |

### Actions

| Name | Import |
|---|---|
| `add-01` | `Add01Icon` |
| `remove-01` | `Remove01Icon` |
| `tick-02` | `Tick02Icon` |
| `cancel-01` | `Cancel01Icon` |
| `pencil-edit-02` | `PencilEdit02Icon` |
| `delete-02` | `Delete02Icon` |
| `copy-01` | `Copy01Icon` |
| `view` | `ViewIcon` |
| `share-01` | `Share01Icon` |
| `refresh-01` | `Refresh01Icon` |
| `sorting-01` | `Sorting01Icon` |
| `drag-drop-vertical` | `DragDropVerticalIcon` |

### Status icon mapping

| Status | Icon |
|---|---|
| Approved / Done | `checkmark-circle-02` |
| Pending | `hourglass` |
| In progress | `loading-03` (static, never spinning) |
| Scheduled | `calendar-03` |
| Declined / Error | `cancel-circle` |
| Draft | `pencil-edit-02` |
| Inactive | `remove-01` |
| Archived / Cancelled | `archive-02` |
| Info | `help-circle` (or `alert-circle` for inline field errors) |

## Custom nod icon

Used for "Approve" in menus, navigation and empty slots where the Approve concept needs an icon. The ring takes the accent; the line is gray.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Nod">
<title>Nod</title>
<!-- Custom noddo icon on the Hugeicons 24 grid. Baseline in gray, ring in the workspace accent: set color: the accent token on the svg. -->
<path d="M4 9.5H20" style="stroke: var(--border-strong, #C9C9CE)"/>
<circle cx="12" cy="13" r="5.5" stroke="currentColor"/>
</svg>
```

## Approve ring

The Approve button always shows this ring before its label, in every size and channel (app, email as PNG, Slack, Teams). In the app render it as a 14 px circle with a 2.5 px border (16 px / 3 px on 44 px buttons) in `--approve-ring`, 1 px below centre — see `examples/components.html`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18" width="16" height="18" fill="none" aria-hidden="true">
<!-- The nod ring that precedes the Approve label (app, email, Slack, Teams). Ring sits 1px below centre. Colour: the approve-ring token via currentColor. -->
<circle cx="8" cy="10" r="5" stroke="currentColor" stroke-width="2.6"/>
</svg>
```
