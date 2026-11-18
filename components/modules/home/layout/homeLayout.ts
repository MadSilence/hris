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
export type ArrangeableWidget = {
  id: string;
  sizes: readonly HomeWidgetSize[];
  defaultSize: HomeWidgetSize;
  /** Cannot be removed (Waiting on you): shown even where an arrangement saved before had it hidden. */
  locked?: boolean;
};

/**
 * A widget on the page at the size it is drawn in, in the cell it stands in: `col` 1–4 and `row` from 1 of the
 * four-column grid. Empty cells are allowed (the designers' Home fixes, E15): each widget keeps the cell it was dropped
 * on and the grid is never re-packed — only a widget dropped onto another pushes that one down.
 */
export type PlacedWidget<W extends ArrangeableWidget> = { widget: W; size: HomeWidgetSize; col: number; row: number };

/** Home's grid is always four columns wide (Part 3); under 1000 px of content it draws three and packs in order. */
export const COLUMNS = 4;

/** One entry of a role's default home: a widget and the size it starts in. */
export type DefaultEntry = { id: string; size: HomeWidgetSize };

/**
 * The role a default home is chosen for (`home` spec, "Default layout"). Not a role of the access model: a reading of
 * what the person may do — HR runs processes or automations, a manager sees people beyond themselves.
 */
export type HomeRole = "EMPLOYEE" | "MANAGER" | "HR";

/**
 * The defaults, less My time, which the owner left out (DECISIONS.md § "The home redesign"). The drawn order relied on
 * it to fill the grid; without it it left a hole in the middle (walk of 2026-11-11), so the order is the drawn set
 * re-packed: each pair of rows full at four columns, the Small ones last — Next time off, then To sign beside it. A
 * default is packed with no holes ({@link pack}); only the person's own arrangement may have them.
 */
export const ROLE_DEFAULTS: Record<HomeRole, DefaultEntry[]> = {
  // Waiting on you is everybody's (WALK_QUESTIONS § 35 (a)): an approver is whoever a chain names, a manager without
  // the Manager role included, and "All caught up" is an answer too.
  EMPLOYEE: [
    { id: "waiting-on-you", size: "L" },
    { id: "my-time-off", size: "M" },
    { id: "celebrations", size: "M" },
    { id: "my-tasks", size: "L" },
    { id: "next-time-off", size: "S" },
    { id: "to-sign", size: "S" },
  ],
  MANAGER: [
    { id: "waiting-on-you", size: "L" },
    { id: "my-time-off", size: "M" },
    { id: "celebrations", size: "M" },
    { id: "whos-out", size: "L" },
    { id: "my-tasks", size: "L" },
    { id: "next-time-off", size: "S" },
    { id: "to-sign", size: "S" },
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
    { id: "to-sign", size: "S" },
  ],
};

/** The size a widget is drawn in: the one asked for when the widget has it, or else its own default. */
export const sizeOf = (widget: ArrangeableWidget, asked: HomeWidgetSize | null | undefined): HomeWidgetSize =>
  asked && widget.sizes.includes(asked) ? asked : widget.defaultSize;

type Footprint = { size: HomeWidgetSize; col: number; row: number };

const overlaps = (a: Footprint, b: Footprint) => {
  const ca = SIZE_CELLS[a.size];
  const cb = SIZE_CELLS[b.size];
  return a.col < b.col + cb.columns && b.col < a.col + ca.columns && a.row < b.row + cb.rows && b.row < a.row + ca.rows;
};

/** The column a widget may start in: a wide one never hangs off the right edge. */
const clampCol = (size: HomeWidgetSize, col: number) => Math.max(1, Math.min(Math.round(col), COLUMNS - SIZE_CELLS[size].columns + 1));

/** The first cell, top to bottom and left to right, where a widget of this size fits among `taken`. */
export const firstFree = (taken: Footprint[], size: HomeWidgetSize): { col: number; row: number } => {
  for (let row = 1; ; row++) {
    for (let col = 1; col <= COLUMNS - SIZE_CELLS[size].columns + 1; col++) {
      if (!taken.some((t) => overlaps(t, { size, col, row }))) return { col, row };
    }
  }
};

/** The page in reading order: by row, then column — the order the narrow three-column grid packs them in. */
export const inReadingOrder = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[]): PlacedWidget<W>[] =>
  [...placed].sort((a, b) => a.row - b.row || a.col - b.col);

/** Widgets in an order, each in the first cell it fits — no holes; how a role's default and an old arrangement land. */
export const pack = <W extends ArrangeableWidget>(entries: { widget: W; size: HomeWidgetSize }[]): PlacedWidget<W>[] => {
  const out: PlacedWidget<W>[] = [];
  for (const entry of entries) out.push({ widget: entry.widget, size: entry.size, ...firstFree(out, entry.size) });
  return out;
};

/**
 * Keeps `fixed` where they are and pushes every other widget that overlaps something straight down, below it, as far
 * as it takes; a widget that overlaps nothing does not move. The others are settled top to bottom.
 */
const settle = <W extends ArrangeableWidget>(fixed: PlacedWidget<W>[], others: PlacedWidget<W>[]): PlacedWidget<W>[] => {
  const out = [...fixed];
  for (const other of inReadingOrder(others)) {
    const next = { ...other, col: clampCol(other.size, other.col) };
    for (let guard = 0; guard < 500; guard++) {
      const hit = out.filter((p) => overlaps(p, next));
      if (hit.length === 0) break;
      next.row = Math.max(...hit.map((p) => p.row + SIZE_CELLS[p.size].rows));
    }
    out.push(next);
  }
  return inReadingOrder(out);
};

/** A role's default home, trimmed to what the reader may see and packed with no holes; a widget whose module is off is skipped. */
export const defaultHome = <W extends ArrangeableWidget>(available: W[], role: HomeRole): PlacedWidget<W>[] => {
  const byId = new Map(available.map((w) => [w.id, w]));
  return pack(
    ROLE_DEFAULTS[role].flatMap((entry) => {
      const widget = byId.get(entry.id);
      return widget ? [{ widget, size: sizeOf(widget, entry.size) }] : [];
    }),
  );
};

type Unplaced<W extends ArrangeableWidget> = { widget: W; size: HomeWidgetSize };

/**
 * The reader's home: the widgets they may see, in the cells they put them in, at their sizes.
 *
 * `available` is the catalogue trimmed to what this reader may see. `stored` is their own arrangement — every widget
 * with a size and, since the fixes of 2026-11-18, a cell; a removed widget kept as `hidden` so it stays removed.
 * **Never arranged** (nothing stored) is the role's default. An arrangement saved before cells existed is packed in its
 * order, as it was drawn then. A widget the arrangement does not place — new since they arranged, one they have just
 * been given, or the locked one they had hidden — takes the first free cell. Two stored widgets that overlap (a size
 * that no longer exists) push the later one down.
 */
export const arrangeHome = <W extends ArrangeableWidget>(
  available: W[],
  stored: HomeWidgetPlacement[] | null | undefined,
  role: HomeRole,
): PlacedWidget<W>[] => {
  if (!stored || stored.length === 0) return defaultHome(available, role);

  const byId = new Map(available.map((w) => [w.id, w]));
  const named = new Set<string>();
  const withCells: PlacedWidget<W>[] = [];
  const without: Unplaced<W>[] = [];
  const inOrder: Unplaced<W>[] = [];
  for (const placement of stored) {
    if (named.has(placement.id)) continue;
    named.add(placement.id);
    const widget = byId.get(placement.id);
    if (!widget || (placement.hidden && !widget.locked)) continue;
    const size = sizeOf(widget, placement.size);
    inOrder.push({ widget, size });
    if (!placement.hidden && placement.col && placement.row) withCells.push({ widget, size, col: placement.col, row: placement.row });
    else without.push({ widget, size });
  }
  const fresh = available.filter((w) => !named.has(w.id)).map((widget) => ({ widget, size: widget.defaultSize }));

  if (withCells.length === 0) return pack([...inOrder, ...fresh]);

  let out = settle<W>([], withCells);
  for (const entry of [...without, ...fresh]) out = [...out, { ...entry, ...firstFree(out, entry.size) }];
  return inReadingOrder(out);
};

/**
 * What is saved: the widgets on the page with their sizes and cells; every other widget the reader may see as
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
    ...inReadingOrder(placed).map((entry) => ({ id: entry.widget.id, hidden: false, size: entry.size, col: entry.col, row: entry.row })),
    ...available.filter((w) => !shown.has(w.id)).map((w) => ({ id: w.id, hidden: true, size: null })),
    ...(stored ?? []).filter((placement) => !availableIds.has(placement.id)),
  ];
};

/** Puts the widget `id` in the cell (`col`, `row`); whatever it now covers is pushed down. Its old cells stay empty. */
export const moveTo = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[], id: string, col: number, row: number): PlacedWidget<W>[] => {
  const moving = placed.find((entry) => entry.widget.id === id);
  if (!moving) return placed;
  const moved = { ...moving, col: clampCol(moving.size, col), row: Math.max(1, Math.round(row)) };
  return settle([moved], placed.filter((entry) => entry.widget.id !== id));
};

/**
 * Adds a widget in the cell `at` (a drop) — pushing down what is there — or, without one ("+"), in the first free cell
 * it fits. A widget already on the page is moved instead.
 */
export const addAt = <W extends ArrangeableWidget>(
  placed: PlacedWidget<W>[],
  widget: W,
  size: HomeWidgetSize,
  at?: { col: number; row: number },
): PlacedWidget<W>[] => {
  const without = placed.filter((entry) => entry.widget.id !== widget.id);
  const sized = sizeOf(widget, size);
  if (!at) return inReadingOrder([...without, { widget, size: sized, ...firstFree(without, sized) }]);
  return settle([{ widget, size: sized, col: clampCol(sized, at.col), row: Math.max(1, Math.round(at.row)) }], without);
};

/** Takes a widget off the page; its cells stay empty and nothing else moves (E17). */
export const removeWidget = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[], id: string): PlacedWidget<W>[] =>
  placed.filter((entry) => entry.widget.id !== id);

/** A new size in the same cell — moved left if it would hang off the edge; whatever it now covers is pushed down. */
export const resizeWidget = <W extends ArrangeableWidget>(
  placed: PlacedWidget<W>[],
  id: string,
  size: HomeWidgetSize,
): PlacedWidget<W>[] => {
  const entry = placed.find((p) => p.widget.id === id);
  if (!entry) return placed;
  const sized = sizeOf(entry.widget, size);
  return settle([{ ...entry, size: sized, col: clampCol(sized, entry.col) }], placed.filter((p) => p.widget.id !== id));
};

/** Two arrangements are the same page: the same widgets at the same sizes in the same cells. */
export const sameHome = <W extends ArrangeableWidget>(a: PlacedWidget<W>[], b: PlacedWidget<W>[]) => {
  const key = (list: PlacedWidget<W>[]) => inReadingOrder(list).map((p) => `${p.widget.id}:${p.size}:${p.col}:${p.row}`).join("|");
  return a.length === b.length && key(a) === key(b);
};

/** How many rows of the grid the page takes. */
export const rowsUsed = <W extends ArrangeableWidget>(placed: PlacedWidget<W>[]) =>
  placed.reduce((max, p) => Math.max(max, p.row + SIZE_CELLS[p.size].rows - 1), 0);

/** The grid's footprint of a size: Small 1 × 1, Medium 1 × 2, Large 2 × 2. */
export const SIZE_CELLS: Record<HomeWidgetSize, { columns: 1 | 2; rows: 1 | 2 }> = {
  S: { columns: 1, rows: 1 },
  M: { columns: 1, rows: 2 },
  L: { columns: 2, rows: 2 },
};
