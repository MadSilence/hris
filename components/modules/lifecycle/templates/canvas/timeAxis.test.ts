import {
  BEFORE_START_W,
  BLOCK_H,
  BLOCK_W,
  boundsForOffsets,
  boundsForTasks,
  buildAxis,
  columnAtX,
  columnOf,
  DAY_W,
  dropTarget,
  laneAtY,
  layoutTemplate,
  LANE_PAD,
  shiftDays,
  STACK_GAP,
  timingForColumn,
  WEEK_W,
} from "./timeAxis";
import { deriveLanes, type DraftItem } from "./draft";

const item = (over: Partial<DraftItem>): DraftItem => ({
  key: over.key ?? "k",
  kind: "CHECKLIST",
  title: "Task",
  description: "",
  dueKind: "OFFSET",
  offsetDays: 0,
  assigneeKind: "TARGET",
  assigneeUserId: null,
  assigneeName: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: null,
  waitsFor: [],
  ...over,
});

describe("the piecewise time axis", () => {
  const axis = buildAxis([]);

  it("is a day per column around the start, Before Start just left of Day 1, then weeks to day 90", () => {
    const ids = axis.columns.map((c) => c.id);
    expect(ids[0]).toBe("d-14");
    expect(ids.indexOf("before-start")).toBe(ids.indexOf("d0") - 1);
    expect(ids.indexOf("d-1")).toBe(ids.indexOf("before-start") - 1);
    expect(axis.columns.find((c) => c.id === "d0")?.label).toBe("Day 1");
    expect(axis.columns.find((c) => c.id === "d14")?.label).toBe("+14");
    const weeks = axis.columns.filter((c) => c.kind === "week");
    expect(weeks[0]).toMatchObject({ start: 15, end: 21, label: "Week 3" });
    expect(weeks[weeks.length - 1].end).toBeGreaterThanOrEqual(90);
    expect(axis.columns.some((c) => c.kind === "month")).toBe(false);
    expect(axis.width).toBe(29 * DAY_W + BEFORE_START_W + weeks.length * WEEK_W);
  });

  it("widens for a template that reaches past either end", () => {
    const wide = buildAxis([item({ offsetDays: -30 }), item({ offsetDays: 150 })]);
    expect(wide.columns[0]).toMatchObject({ kind: "week", start: -35, end: -29 });
    expect(columnOf(wide, { dueKind: "OFFSET", offsetDays: -30 }).kind).toBe("week");
    const month = columnOf(wide, { dueKind: "OFFSET", offsetDays: 150 });
    expect(month.kind).toBe("month");
    expect(month.start).toBeLessThanOrEqual(150);
    expect(month.end).toBeGreaterThanOrEqual(150);
  });

  it("maps an offset to x and the x back to the same offset", () => {
    for (const offset of [-14, -1, 0, 3, 14]) {
      const col = columnOf(axis, { dueKind: "OFFSET", offsetDays: offset });
      expect(columnAtX(axis, col.x + 1).start).toBe(offset);
      expect(columnAtX(axis, col.x + col.width - 1).start).toBe(offset);
    }
    const day1 = columnOf(axis, { dueKind: "OFFSET", offsetDays: 1 });
    const day0 = columnOf(axis, { dueKind: "OFFSET", offsetDays: 0 });
    expect(day1.x - day0.x).toBe(DAY_W);
  });

  it("puts 'by the start day' in its own column, and clamps a point outside the axis to its ends", () => {
    expect(columnOf(axis, { dueKind: "BEFORE_START", offsetDays: null }).id).toBe("before-start");
    expect(columnAtX(axis, -500).id).toBe("d-14");
    expect(columnAtX(axis, axis.width + 500).id).toBe(axis.columns[axis.columns.length - 1].id);
  });

  it("snaps a drop into a week column to its first day, but keeps a task's own day inside its own week", () => {
    const week3 = axis.columns.find((c) => c.id === "w15")!;
    expect(timingForColumn(week3)).toEqual({ dueKind: "OFFSET", offsetDays: 15 });
    expect(timingForColumn(week3, { dueKind: "OFFSET", offsetDays: 18 })).toEqual({ dueKind: "OFFSET", offsetDays: 18 });
    expect(timingForColumn(week3, { dueKind: "OFFSET", offsetDays: 3 })).toEqual({ dueKind: "OFFSET", offsetDays: 15 });
    const before = axis.columns.find((c) => c.id === "before-start")!;
    expect(timingForColumn(before, { dueKind: "OFFSET", offsetDays: 2 })).toEqual({ dueKind: "BEFORE_START", offsetDays: null });
  });

  it("moves a day at a time, and out of Before Start to the day either side", () => {
    expect(shiftDays({ dueKind: "OFFSET", offsetDays: 2 }, 1)).toEqual({ dueKind: "OFFSET", offsetDays: 3 });
    expect(shiftDays({ dueKind: "OFFSET", offsetDays: 2 }, -7)).toEqual({ dueKind: "OFFSET", offsetDays: -5 });
    expect(shiftDays({ dueKind: "BEFORE_START", offsetDays: null }, 1)).toEqual({ dueKind: "OFFSET", offsetDays: 0 });
    expect(shiftDays({ dueKind: "BEFORE_START", offsetDays: null }, -1)).toEqual({ dueKind: "OFFSET", offsetDays: -1 });
  });
});

describe("lanes and blocks", () => {
  const items = [
    item({ key: "a", offsetDays: 0 }),
    item({ key: "b", offsetDays: 0 }),
    item({ key: "c", offsetDays: 2, assigneeKind: "ONBOARDING_MANAGER" }),
    item({ key: "d", offsetDays: 1, assigneeKind: "SPECIFIC_USER", assigneeUserId: "u1", assigneeName: "Linus" }),
  ];
  const lanes = deriveLanes(items);
  const layout = layoutTemplate(items, lanes);

  it("stacks tasks that share a cell and grows the lane to hold them, never overlapping", () => {
    const a = layout.positions.get("a")!;
    const b = layout.positions.get("b")!;
    expect(a.x).toBe(b.x);
    expect(b.y - a.y).toBe(BLOCK_H + STACK_GAP);
    expect(layout.lanes[0].height).toBe(LANE_PAD * 2 + 2 * BLOCK_H + STACK_GAP);
    expect(layout.lanes[1].height).toBe(LANE_PAD * 2 + BLOCK_H);
    expect(layout.lanes[1].top).toBe(layout.lanes[0].height);
  });

  it("derives y from the lane: one lane per assignee, in a fixed order", () => {
    expect(lanes.map((l) => l.id)).toEqual(["TARGET", "ONBOARDING_MANAGER", "USER:u1"]);
    expect(layout.positions.get("c")!.y).toBe(layout.lanes[1].top + LANE_PAD);
    expect(layout.positions.get("d")!.y).toBe(layout.lanes[2].top + LANE_PAD);
    expect(laneAtY(layout.lanes, layout.lanes[2].top + 5).id).toBe("USER:u1");
    expect(laneAtY(layout.lanes, -10).id).toBe("TARGET");
    expect(laneAtY(layout.lanes, 99999).id).toBe("USER:u1");
  });

  it("turns a dropped block's corner back into a day and a lane", () => {
    const target = columnOf(layout.axis, { dueKind: "OFFSET", offsetDays: 5 });
    const drop = dropTarget(layout, { x: target.x + 4, y: layout.lanes[1].top + 2 });
    expect(drop.column.start).toBe(5);
    expect(drop.lane.id).toBe("ONBOARDING_MANAGER");
    // The block's middle decides, so a block hanging a little into the next column lands where most of it is.
    const nearEdge = dropTarget(layout, { x: target.x + target.width - BLOCK_W / 2 - 1, y: 0 });
    expect(nearEdge.column.start).toBe(5);
  });

  it("frames a zoom preset on the columns holding its days", () => {
    const week = boundsForOffsets(layout, -3, 7);
    const from = columnOf(layout.axis, { dueKind: "OFFSET", offsetDays: -3 });
    const to = columnOf(layout.axis, { dueKind: "OFFSET", offsetDays: 7 });
    expect(week.x).toBe(from.x);
    expect(week.x + week.width).toBe(to.x + to.width);
    expect(week.height).toBe(layout.height);
  });

  // Fit used to frame the whole axis — at least 104 days — so a short template opened at the minimum zoom.
  it("fits the columns the tasks sit in, not the whole axis", () => {
    const fit = boundsForTasks(layout);
    const xs = [...layout.positions.values()].map((p) => p.x);
    expect(fit.x).toBe(columnAtX(layout.axis, Math.min(...xs)).x);
    const right = columnAtX(layout.axis, Math.max(...xs));
    expect(fit.x + fit.width).toBe(right.x + right.width);
    expect(fit.width).toBeLessThan(layout.axis.width);
    expect(fit.height).toBe(layout.height);
  });
});
