# Not drawn

## In the code today, not in the design

Home is built as drawn. These parts of today's home are not in the design, so they go.

| What | Code | What happens to it |
|---|---|---|
| Upcoming holidays widget | `upcoming-holidays` | Goes. A public holiday is shown in **Next time off** when it comes first ("days to Christmas"). |
| Quick actions widget | `quick-actions` | Goes. Request time off is in Time off and in the AI box chip. My time replaces Log hours. |
| Company time widget | `company-time` | Goes. |
| Group headings (Personal, Company, HR, Utilities) on the page | `HomeContainer` | Go. The page is one grid. The panel's categories are For me, My team, Company. |
| Customize list | `CustomizeHome` | Replaced by Edit home (`home-edit`). |
| "· 3 unread" next to the date | `Greeting` | Goes. Inbox is linked from Waiting on you. |
| "Choose a birthday field" / "Open roles" lines in Celebrations | `CelebrationsWidget` | Go. This week shows only what is drawn. |

Settings → General → Home (the birthday field) is not part of this round and stays as it is.

## States written in the specs but not drawn

| Screen | State | Where it is written |
|---|---|---|
| home | Empty home (every widget removed and saved) | `home/spec.md` → States |
| home | AI box typing: the results panel (People / Do / Ask noddo) and no results | `home/spec.md` → Actions, Words |
| home-edit | Empty page in edit mode ("Drag widgets here") | `home-edit/spec.md` → States |
| home-edit | Save failed (toast + Retry) | `home-edit/spec.md` → States |
| home-widgets | My time on a break and before the day starts, in S and L (M is drawn) | `home-widgets/spec.md` § 4 |
| all | Dark mode, mobile | Not in this round. |
