/**
 * The canvas's time axis and lanes: where a task is drawn, and what a place on the canvas means.
 *
 * <p><b>Piecewise, not linear</b> (research § B.3). Onboarding is dense around Day 1 and sparse after a
 * month, so a uniform axis from −14 to +90 makes the first week a sliver. The axis is a day per column
 * from 14 days before the start to 14 after, a week per column to day 90, and thirty days per column
 * beyond — stretched further either way when a template reaches past that. "By the start day" has its
 * own column just left of Day 1.
 *
 * <p>Pure functions only: the canvas, the drag, the keyboard and the tests all ask the same questions.
 */
import { laneIdOf, shortDay, type DraftItem, type Lane, type LaneId } from "./draft";

export const DAY_W = 128;
export const WEEK_W = 168;
export const MONTH_W = 184;
export const BEFORE_START_W = 144;
export const BLOCK_W = 116;
export const BLOCK_H = 54;
export const STACK_GAP = 8;
export const LANE_PAD = 12;

const DAYS_EACH_SIDE = 14;
const WEEKS_UNTIL = 90;

export type ColumnKind = "day" | "week" | "month" | "beforeStart";

export type Column = {
  id: string;
  kind: ColumnKind;
  /** The first and last offset the column holds, inclusive; null for "Before Start". */
  start: number | null;
  end: number | null;
  x: number;
  width: number;
  label: string;
  /** A second line for a week or month column: the day it starts on. */
  caption: string | null;
};

export type Axis = { columns: Column[]; width: number };

type Timing = Pick<DraftItem, "dueKind" | "offsetDays">;

/** The axis for these tasks: at least −14 … +90, and wider when a task lies outside. */
export const buildAxis = (items: Timing[]): Axis => {
  const offsets = items.filter((i) => i.dueKind === "OFFSET").map((i) => i.offsetDays ?? 0);
  const min = Math.min(-DAYS_EACH_SIDE, ...offsets);
  const max = Math.max(WEEKS_UNTIL, ...offsets);

  const spans: Omit<Column, "x">[] = [];
  // Weeks before the two weeks of days, earliest first.
  const weeksBefore = Math.ceil((-DAYS_EACH_SIDE - min) / 7);
  for (let k = weeksBefore; k >= 1; k--) {
    const start = -DAYS_EACH_SIDE - 7 * k;
    spans.push({ id: `w${start}`, kind: "week", start, end: start + 6, width: WEEK_W, label: shortDay(start), caption: `to ${shortDay(start + 6)}` });
  }
  for (let d = -DAYS_EACH_SIDE; d <= DAYS_EACH_SIDE; d++) {
    if (d === 0) {
      spans.push({ id: "before-start", kind: "beforeStart", start: null, end: null, width: BEFORE_START_W, label: "Before Start", caption: null });
    }
    spans.push({ id: `d${d}`, kind: "day", start: d, end: d, width: DAY_W, label: shortDay(d), caption: null });
  }
  let start = DAYS_EACH_SIDE + 1;
  while (start <= WEEKS_UNTIL || start <= max) {
    if (start <= WEEKS_UNTIL) {
      spans.push({
        id: `w${start}`, kind: "week", start, end: start + 6, width: WEEK_W,
        label: `Week ${Math.floor(start / 7) + 1}`, caption: shortDay(start),
      });
      start += 7;
    } else {
      spans.push({
        id: `m${start}`, kind: "month", start, end: start + 29, width: MONTH_W,
        label: `Month ${Math.floor(start / 30) + 1}`, caption: shortDay(start),
      });
      start += 30;
    }
  }

  let x = 0;
  const columns = spans.map((s) => {
    const c = { ...s, x };
    x += s.width;
    return c;
  });
  return { columns, width: x };
};

/** The column a task sits in. */
export const columnOf = (axis: Axis, timing: Timing): Column => {
  if (timing.dueKind === "BEFORE_START") return axis.columns.find((c) => c.kind === "beforeStart") as Column;
  const n = timing.offsetDays ?? 0;
  return axis.columns.find((c) => c.start !== null && c.end !== null && c.start <= n && n <= c.end)
    ?? axis.columns[axis.columns.length - 1];
};

/** The column under a point of the canvas, clamped to the ends. */
export const columnAtX = (axis: Axis, x: number): Column => {
  if (x < 0) return axis.columns[0];
  return axis.columns.find((c) => x >= c.x && x < c.x + c.width) ?? axis.columns[axis.columns.length - 1];
};

/** The column of Day 1 — the one accent line on the axis. */
export const dayOneColumn = (axis: Axis): Column => axis.columns.find((c) => c.id === "d0") as Column;

/**
 * What a task's timing becomes when it is put in a column. A week or month column snaps to its first day
 * — unless the task is already in that column, which keeps its exact day (fine-tuned in the panel).
 */
export const timingForColumn = (column: Column, current?: Timing): Timing => {
  if (column.kind === "beforeStart") return { dueKind: "BEFORE_START", offsetDays: null };
  if (current && current.dueKind === "OFFSET" && current.offsetDays !== null
    && column.start !== null && column.end !== null
    && current.offsetDays >= column.start && current.offsetDays <= column.end) {
    return { dueKind: "OFFSET", offsetDays: current.offsetDays };
  }
  return { dueKind: "OFFSET", offsetDays: column.start ?? 0 };
};

/** A day earlier or later — the arrow keys. "Before Start" moves to the day either side of it. */
export const shiftDays = (timing: Timing, days: number): Timing => {
  if (timing.dueKind === "BEFORE_START") return { dueKind: "OFFSET", offsetDays: days < 0 ? -1 : 0 };
  return { dueKind: "OFFSET", offsetDays: (timing.offsetDays ?? 0) + days };
};

// ── lanes and blocks ─────────────────────────────────────────────────────────────────────────

export type LaneBox = Lane & { top: number; height: number };

export type Layout = {
  axis: Axis;
  lanes: LaneBox[];
  height: number;
  /** Each task's top-left corner on the canvas. */
  positions: Map<string, { x: number; y: number }>;
};

/**
 * Where every block goes. Several tasks in one cell stack downwards and the lane grows to hold them —
 * blocks never overlap (research § B.3, "Lanes").
 */
export const layoutTemplate = (items: DraftItem[], lanes: Lane[], axis: Axis = buildAxis(items)): Layout => {
  const cells = new Map<string, DraftItem[]>();
  items.forEach((item) => {
    const cell = `${laneIdOf(item)}|${columnOf(axis, item).id}`;
    cells.set(cell, [...(cells.get(cell) ?? []), item]);
  });
  cells.forEach((list) => list.sort((a, b) => (a.offsetDays ?? -1) - (b.offsetDays ?? -1)));

  const stackOf = (laneId: LaneId) => Math.max(1, ...[...cells.entries()]
    .filter(([cell]) => cell.startsWith(`${laneId}|`)).map(([, list]) => list.length));

  let top = 0;
  const boxes: LaneBox[] = lanes.map((lane) => {
    const n = stackOf(lane.id);
    const height = LANE_PAD * 2 + n * BLOCK_H + (n - 1) * STACK_GAP;
    const box = { ...lane, top, height };
    top += height;
    return box;
  });

  const positions = new Map<string, { x: number; y: number }>();
  cells.forEach((list, cell) => {
    const [laneId] = cell.split("|");
    const lane = boxes.find((l) => l.id === laneId);
    if (!lane) return;
    list.forEach((item, index) => {
      const column = columnOf(axis, item);
      positions.set(item.key, {
        x: column.x + (column.width - BLOCK_W) / 2,
        y: lane.top + LANE_PAD + index * (BLOCK_H + STACK_GAP),
      });
    });
  });
  return { axis, lanes: boxes, height: top, positions };
};

/** The lane under a point of the canvas, clamped to the first and last. */
export const laneAtY = (lanes: LaneBox[], y: number): LaneBox => {
  if (y < 0) return lanes[0];
  return lanes.find((l) => y >= l.top && y < l.top + l.height) ?? lanes[lanes.length - 1];
};

/** Where a block dropped at its top-left corner lands: the column and lane under its middle. */
export const dropTarget = (layout: Layout, position: { x: number; y: number }) => ({
  column: columnAtX(layout.axis, position.x + BLOCK_W / 2),
  lane: laneAtY(layout.lanes, position.y + BLOCK_H / 2),
});

/** The canvas rectangle a zoom preset shows: the columns holding these offsets, every lane. */
export const boundsForOffsets = (layout: Layout, from: number, to: number) => {
  const cols = layout.axis.columns.filter((c) =>
    c.kind === "beforeStart" ? from < 0 && to >= 0 : c.end !== null && c.start !== null && c.end >= from && c.start <= to);
  const first = cols[0] ?? layout.axis.columns[0];
  const last = cols[cols.length - 1] ?? layout.axis.columns[layout.axis.columns.length - 1];
  return { x: first.x, y: 0, width: last.x + last.width - first.x, height: Math.max(layout.height, BLOCK_H) };
};

/**
 * The rectangle *Fit* shows: the columns the tasks sit in, every lane. It used to be the whole axis, which is
 * at least −14 … +90 days, so two tasks a few days apart were fitted at the minimum zoom with an unreadable
 * ruler (walk of 2026-10-30) — and the whole axis is what *90 Days* already shows. No tasks: the whole axis.
 */
export const boundsForTasks = (layout: Layout) => {
  const xs = [...layout.positions.values()].map((p) => p.x);
  if (xs.length === 0) return { x: 0, y: 0, width: layout.axis.width, height: Math.max(layout.height, BLOCK_H) };
  const left = columnAtX(layout.axis, Math.min(...xs));
  const right = columnAtX(layout.axis, Math.max(...xs));
  return { x: left.x, y: 0, width: right.x + right.width - left.x, height: Math.max(layout.height, BLOCK_H) };
};
