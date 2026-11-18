import {
  addAt,
  arrangeHome,
  defaultHome,
  moveTo,
  removeWidget,
  resizeWidget,
  sameHome,
  toPlacements,
  ROLE_DEFAULTS,
  type ArrangeableWidget,
} from "./homeLayout";

const w = (id: string, sizes: ArrangeableWidget["sizes"] = ["S", "M", "L"], defaultSize: ArrangeableWidget["defaultSize"] = "M") => ({
  id,
  sizes,
  defaultSize,
});

const WAITING = w("waiting-on-you", ["S", "M", "L"], "L");
const TIME_OFF = w("my-time-off");
const NEXT = w("next-time-off", ["S", "M"], "S");
const TASKS = w("my-tasks", ["S", "M", "L"], "L");
const WEEK = w("celebrations");
const PROCESSES = w("processes");
const ALL = [WAITING, TIME_OFF, NEXT, TASKS, WEEK, PROCESSES];

const shape = (placed: { widget: ArrangeableWidget; size: string }[]) => placed.map((p) => `${p.widget.id}:${p.size}`);
const cellsOf = (placed: { widget: ArrangeableWidget; size: string; col: number; row: number }[]) =>
  placed.map((p) => `${p.widget.id}:${p.size}@${p.col},${p.row}`);

describe("home's arrangement", () => {
  it("shows a widget that cannot be removed even where an older arrangement saved it hidden", () => {
    const locked = { ...WAITING, locked: true };
    const placed = arrangeHome([locked, TASKS], [{ id: "my-tasks", hidden: false, size: "L" }, { id: "waiting-on-you", hidden: true }], "EMPLOYEE");
    expect(shape(placed)).toEqual(["my-tasks:L", "waiting-on-you:L"]);
  });

  it("is the role's default until the person arranges it, trimmed to what they may see", () => {
    // Waiting on you leads everybody's home (WALK_QUESTIONS § 35 (a)).
    expect(shape(arrangeHome(ALL, [], "EMPLOYEE"))).toEqual(
      ["waiting-on-you:L", "my-time-off:M", "celebrations:M", "my-tasks:L", "next-time-off:S"]);
    expect(shape(arrangeHome([TIME_OFF, TASKS], null, "HR"))).toEqual(["my-time-off:M", "my-tasks:L"]);
  });

  it("keeps the person's order across every widget and each one's size", () => {
    const placed = arrangeHome(ALL, [
      { id: "my-tasks", hidden: false, size: "M" },
      { id: "waiting-on-you", hidden: false, size: "S" },
      { id: "my-time-off", hidden: true },
      { id: "next-time-off", hidden: true },
      { id: "celebrations", hidden: true },
      { id: "processes", hidden: true },
    ], "HR");
    expect(shape(placed)).toEqual(["my-tasks:M", "waiting-on-you:S"]);
  });

  it("draws a size the widget does not have at its default, and a new widget at the end", () => {
    const placed = arrangeHome(ALL, [{ id: "next-time-off", hidden: false, size: "L" }], "EMPLOYEE");
    expect(shape(placed)[0]).toBe("next-time-off:S");
    expect(shape(placed).slice(1)).toEqual(["waiting-on-you:L", "my-time-off:M", "my-tasks:L", "celebrations:M", "processes:M"]);
  });

  it("saves what is on the page with its cell, what was removed, and what the reader cannot see right now", () => {
    const placed = [{ widget: TASKS, size: "L" as const, col: 3, row: 2 }];
    const saved = toPlacements(placed, [TASKS, WEEK], [{ id: "automations", hidden: false, size: "M" }]);
    expect(saved).toEqual([
      { id: "my-tasks", hidden: false, size: "L", col: 3, row: 2 },
      { id: "celebrations", hidden: true, size: null },
      { id: "automations", hidden: false, size: "M" },
    ]);
    // An empty home saved stays empty: every widget comes back hidden, not as "never arranged".
    expect(arrangeHome([TASKS, WEEK], toPlacements([], [TASKS, WEEK], []), "EMPLOYEE")).toEqual([]);
  });

  it("keeps each widget in the cell it was saved in, empty cells included (E15)", () => {
    const placed = arrangeHome([TASKS, WEEK], [
      { id: "my-tasks", hidden: false, size: "L", col: 3, row: 3 },
      { id: "celebrations", hidden: false, size: "S", col: 1, row: 1 },
    ], "EMPLOYEE");
    expect(cellsOf(placed)).toEqual(["celebrations:S@1,1", "my-tasks:L@3,3"]);
  });

  it("puts a widget the arrangement does not place in the first free cell", () => {
    const placed = arrangeHome([TASKS, WEEK], [{ id: "my-tasks", hidden: false, size: "L", col: 1, row: 1 }], "EMPLOYEE");
    expect(cellsOf(placed)).toEqual(["my-tasks:L@1,1", "celebrations:M@3,1"]);
  });

  it("moves a widget to a cell and pushes the one it lands on down; its old cells stay empty", () => {
    let placed = arrangeHome([TASKS, WEEK, PROCESSES], [
      { id: "my-tasks", hidden: false, size: "L", col: 1, row: 1 },
      { id: "celebrations", hidden: false, size: "M", col: 3, row: 1 },
      { id: "processes", hidden: false, size: "M", col: 4, row: 1 },
    ], "HR");
    placed = moveTo(placed, "processes", 3, 1);
    expect(cellsOf(placed)).toEqual(["my-tasks:L@1,1", "processes:M@3,1", "celebrations:M@3,3"]);
    // A wide one never hangs off the right edge.
    placed = moveTo(placed, "my-tasks", 4, 5);
    expect(cellsOf(placed)).toContain("my-tasks:L@3,5");
  });

  it("adds at a cell or in the first free one, resizes in place and removes without moving the rest (E17)", () => {
    let placed = defaultHome(ALL, "EMPLOYEE");
    const before = cellsOf(placed);
    placed = addAt(placed, PROCESSES, "S");
    expect(cellsOf(placed)).toContain("processes:S@4,3");
    placed = removeWidget(placed, "processes");
    expect(cellsOf(placed)).toEqual(before);
    placed = addAt(placed, PROCESSES, "L", { col: 1, row: 1 });
    expect(cellsOf(placed)[0]).toBe("processes:L@1,1");
    expect(cellsOf(placed)).toContain("waiting-on-you:L@1,3");
    placed = resizeWidget(placed, "next-time-off", "L");
    expect(shape(placed)).toContain("next-time-off:S");
    placed = removeWidget(placed, "processes");
    // Removing it leaves its cells empty: Waiting on you stays where it was pushed.
    expect(sameHome(placed, defaultHome(ALL, "EMPLOYEE"))).toBe(false);
    expect(cellsOf(placed)).toContain("waiting-on-you:L@1,3");
  });

  it("packs every role's default without a hole in the middle at four columns (walk of 2026-11-11)", () => {
    // A tiny dense-flow grid: each widget takes the first place it fits, row by row. A hole "in the middle" is a free
    // cell above the row the last widget starts in; what trails beside the last widgets is the end of the page.
    const holesBeforeLast = (entries: { id: string; size: "S" | "M" | "L" }[]) => {
      const taken: boolean[][] = [];
      const free = (r: number, c: number) => !(taken[r]?.[c]);
      const cells = { S: [1, 1], M: [1, 2], L: [2, 2] } as const;
      let lastRow = 0;
      for (const e of entries) {
        const [cols, rows] = cells[e.size];
        place: for (let r = 0; ; r++) {
          for (let c = 0; c + cols <= 4; c++) {
            let ok = true;
            for (let dr = 0; dr < rows; dr++) for (let dc = 0; dc < cols; dc++) if (!free(r + dr, c + dc)) ok = false;
            if (!ok) continue;
            for (let dr = 0; dr < rows; dr++) for (let dc = 0; dc < cols; dc++) (taken[r + dr] ??= [])[c + dc] = true;
            lastRow = Math.max(lastRow, r);
            break place;
          }
        }
      }
      let holes = 0;
      for (let r = 0; r < lastRow; r++) for (let c = 0; c < 4; c++) if (free(r, c)) holes++;
      return holes;
    };
    expect(holesBeforeLast(ROLE_DEFAULTS.HR)).toBe(0);
    expect(holesBeforeLast(ROLE_DEFAULTS.MANAGER)).toBe(0);
    expect(holesBeforeLast(ROLE_DEFAULTS.EMPLOYEE)).toBe(0);
  });
});
