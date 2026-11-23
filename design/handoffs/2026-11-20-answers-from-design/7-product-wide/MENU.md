# Single-choice menu — one design everywhere (Ulia, 20 Nov 2026) — fix RC12

Applies to every menu where a person picks ONE option from a list:
- Automations "Starts when" and "All automations";
- sort menus;
- Group by;
- period pickers shown as menus.

Action menus (⋯ with Edit / Duplicate / Delete) keep the action menu.

## Look — the calendar's Group by menu (N07-GroupMenu)
- **Menu.** White, radius 10, 1 px #EAEAEC, shadow-2.
- **On top.** A label naming the choice ("Group by", "Starts when", "Sort by") in text-tertiary, then a full-width hairline #EAEAEC.
- **Options.** One per row, Ink.
- **The picked option.** Text in the accent, with a check on the RIGHT in the accent. No check column on the left, no icons.

## Exact values
N07 was shipped and measured in the calendar package of 19 Nov (`noddo-for-petya-2026-11-19-calendar.zip`):
- `1-calendar/screens/company-calendar/export/N07-GroupMenu.html`;
- `1-calendar/measurements/company-calendar/N07-GroupMenu.md`.

Build every single-choice menu from that frame.
