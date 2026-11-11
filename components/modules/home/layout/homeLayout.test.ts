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

describe("home's arrangement", () => {
  it("is the role's default until the person arranges it, trimmed to what they may see", () => {
    expect(shape(arrangeHome(ALL, [], "EMPLOYEE"))).toEqual(["my-tasks:L", "my-time-off:M", "celebrations:M", "next-time-off:S"]);
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

  it("saves what is on the page, what was removed, and what the reader cannot see right now", () => {
    const placed = [{ widget: TASKS, size: "L" as const }];
    const saved = toPlacements(placed, [TASKS, WEEK], [{ id: "automations", hidden: false, size: "M" }]);
    expect(saved).toEqual([
      { id: "my-tasks", hidden: false, size: "L" },
      { id: "celebrations", hidden: true, size: null },
      { id: "automations", hidden: false, size: "M" },
    ]);
    // An empty home saved stays empty: every widget comes back hidden, not as "never arranged".
    expect(arrangeHome([TASKS, WEEK], toPlacements([], [TASKS, WEEK], []), "EMPLOYEE")).toEqual([]);
  });

  it("adds, moves, resizes and removes", () => {
    let placed = defaultHome(ALL, "EMPLOYEE");
    placed = addAt(placed, PROCESSES, "L");
    expect(shape(placed).at(-1)).toBe("processes:L");
    placed = moveTo(placed, "processes", 0);
    expect(shape(placed)[0]).toBe("processes:L");
    placed = resizeWidget(placed, "next-time-off", "L");
    expect(shape(placed)).toContain("next-time-off:S");
    placed = resizeWidget(placed, "processes", "S");
    expect(shape(placed)[0]).toBe("processes:S");
    placed = removeWidget(placed, "processes");
    expect(sameHome(placed, defaultHome(ALL, "EMPLOYEE"))).toBe(true);
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
