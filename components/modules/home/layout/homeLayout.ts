import type { HomeWidgetPlacement, HomeWidgetSize } from "@/models/home";

/** The Widgets panel's categories in Edit home (`home-edit` spec), in the order its chips stand. */
export const HOME_CATEGORIES = ["FOR_ME", "MY_TEAM", "COMPANY"] as const;
export type HomeCategory = (typeof HOME_CATEGORIES)[number];

/** Each category's chip and heading, a key of the `home` catalogue. */
export const HOME_CATEGORY_LABEL_KEYS = {
  FOR_ME: "edit.categories.FOR_ME",
  MY_TEAM: "edit.categories.MY_TEAM",
  COMPANY: "edit.categories.COMPANY",
} as const satisfies Record<HomeCategory, string>;

/** What the arrangement needs to know about a widget: its id and the sizes it comes in. */
export type ArrangeableWidget = { id: string; sizes: readonly HomeWidgetSize[]; defaultSize: HomeWidgetSize };

/** A widget on the page at the size it is drawn in. */
export type PlacedWidget<W extends ArrangeableWidget> = { widget: W; size: HomeWidgetSize };

/** One entry of a role's default home: a widget and the size it starts in. */
export type DefaultEntry = { id: string; size: HomeWidgetSize };

/**
 * The role a default home is chosen for (`home` spec, "Default layout"). Not a role of the access model: a reading of
 * what the person may do — HR runs processes or automations, a manager sees people beyond themselves.
 */
export type HomeRole = "EMPLOYEE" | "MANAGER" | "HR";

/**
 * The defaults, less My time and To sign, which the owner left out (DECISIONS.md § "The home redesign"). The drawn
 * order relied on those two to fill the grid; without them it left a hole in the middle (walk of 2026-11-11), so the
 * order is the drawn set re-packed: each pair of rows full at four columns, the Small one last.
 */
export const ROLE_DEFAULTS: Record<HomeRole, DefaultEntry[]> = {
  EMPLOYEE: [
    { id: "my-tasks", size: "L" },
    { id: "my-time-off", size: "M" },
    { id: "celebrations", size: "M" },
    { id: "next-time-off", size: "S" },
  ],
  MANAGER: [
    { id: "waiting-on-you", size: "L" },
    { id: "my-time-off", size: "M" },
    { id: "celebrations", size: "M" },
    { id: "whos-out", size: "L" },
    { id: "my-tasks", size: "L" },
    { id: "next-time-off", size: "S" },
  ],
  HR: [
    { id: "waiting-on-you", size: "L" },
    { id: "my-time-off", size: "M" },
    { id: "celebrations", size: "M" },
    { id: "whos-out", size: "L" },
    { id: "processes", size: "M" },
    { id: "automations", size: "M" },
    { id: "my-tasks", size: "L" },
    { id: "next-time-off", size: "S" },
  ],
};

/** The size a widget is drawn in: the one asked for when the widget has it, or else its own default. */
export const sizeOf = (widget: ArrangeableWidget, asked: HomeWidgetSize | null | undefined): HomeWidgetSize =>
  asked && widget.sizes.includes(asked) ? asked : widget.defaultSize;

/** A role's default home, trimmed to what the reader may see; a widget whose module is off is skipped. */
export const defaultHome = <W extends ArrangeableWidget>(available: W[], role: HomeRole): PlacedWidget<W>[] => {
  const byId = new Map(available.map((w) => [w.id, w]));
  return ROLE_DEFAULTS[role].flatMap((entry) => {
    const widget = byId.get(entry.id);
    return widget ? [{ widget, size: sizeOf(widget, entry.size) }] : [];
  });
};

/**
 * The reader's home in order: the widgets they may see, as they arranged them, at their sizes.
 *
 * `available` is the catalogue trimmed to what this reader may see. `stored` is their own arrangement — one order
 * across every widget, each at a size, and a removed widget kept as `hidden` so it stays removed. **Never arranged**
 * (nothing stored) is the role's default. A widget the arrangement does not name at all — new since they arranged, or
 * one they have just been given — joins at the end at its default size.
 */
export const arrangeHome = <W extends ArrangeableWidget>(
  available: W[],
  stored: HomeWidgetPlacement[] | null | undefined,
  role: HomeRole,
): PlacedWidget<W>[] => {
  if (!stored || stored.length === 0) return defaultHome(available, role);

  const byId = new Map(available.map((w) => [w.id, w]));
  const named = new Set<string>();
  const out: PlacedWidget<W>[] = [];
  for (const placement of stored) {
    if (named.has(placement.id)) continue;
    named.add(placement.id);
    const widget = byId.get(placement.id);
    if (!widget || placement.hidden) continue;
    out.push({ widget, size: sizeOf(widget, placement.size) });
  }
  for (const widget of available) {
    if (!named.has(widget.id)) out.push({ widget, size: widget.defaultSize });
  }
  return out;
};

/**
 * What is saved: the widgets on the page in their order and sizes; every other widget the reader may see as
 * `hidden`, so a removed one stays removed and an empty home stays empty; and behind them whatever the reader had
 * arranged for widgets they cannot see at the moment, so losing a right for a week does not lose the place.
 */
export const toPlacements = <W extends ArrangeableWidget>(
  placed: PlacedWidget<W>[],
  available: W[],
  stored: HomeWidgetPlacement[] | null | undefined,
): HomeWidgetPlacement[] => {
  const shown = new Set(placed.map((entry) => entry.widget.id));
  const availableIds = new Set(available.map((w) => w.id));
  return [
    ...placed.map((entry) => ({ id: entry.widget.id, hidden: false, size: entry.size })),
    ...available.filter((w) => !shown.has(w.id)).map((w) => ({ id: w.id, hidden: true, size: null })),
    ...(stored ?? []).filter((placement) => !availableIds.has(placement.id)),
  ];
};

/** Moves the widget `id` so it stands at `index` of the list as it will be after the move. */
export const moveTo = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[], id: string, index: number): PlacedWidget<W>[] => {
  const from = placed.findIndex((entry) => entry.widget.id === id);
  if (from < 0) return placed;
  const next = [...placed];
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(index, next.length)), 0, moved);
  return next;
};

/** Adds a widget at `index` (the end when absent); a widget already on the page is moved there instead. */
export const addAt = <W extends ArrangeableWidget>(
  placed: PlacedWidget<W>[],
  widget: W,
  size: HomeWidgetSize,
  index?: number,
): PlacedWidget<W>[] => {
  const without = placed.filter((entry) => entry.widget.id !== widget.id);
  const at = index === undefined ? without.length : Math.max(0, Math.min(index, without.length));
  return [...without.slice(0, at), { widget, size: sizeOf(widget, size) }, ...without.slice(at)];
};

export const removeWidget = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[], id: string): PlacedWidget<W>[] =>
  placed.filter((entry) => entry.widget.id !== id);

export const resizeWidget = <W extends ArrangeableWidget>(
  placed: PlacedWidget<W>[],
  id: string,
  size: HomeWidgetSize,
): PlacedWidget<W>[] => placed.map((entry) => (entry.widget.id === id ? { ...entry, size: sizeOf(entry.widget, size) } : entry));

/** Two arrangements are the same page: the same widgets in the same order at the same sizes. */
export const sameHome = <W extends ArrangeableWidget>(a: PlacedWidget<W>[], b: PlacedWidget<W>[]) =>
  a.length === b.length && a.every((entry, i) => entry.widget.id === b[i].widget.id && entry.size === b[i].size);

/** The grid's footprint of a size: Small 1 × 1, Medium 1 × 2, Large 2 × 2. */
export const SIZE_CELLS: Record<HomeWidgetSize, { columns: 1 | 2; rows: 1 | 2 }> = {
  S: { columns: 1, rows: 1 },
  M: { columns: 1, rows: 2 },
  L: { columns: 2, rows: 2 },
};
