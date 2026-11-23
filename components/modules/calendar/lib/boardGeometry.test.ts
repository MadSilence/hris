import {
  MIN_WEEK_DAY_W,
  MONTH_DAY_W,
  NAME_COL,
  ROW_H,
  dayWidthFor,
  daysBetween,
  extendRange,
  extensionNeeded,
  initialRange,
  pillTop,
  rangeISO,
  rowHeightFor,
} from "@/components/modules/calendar/lib/boardGeometry";

describe("the board's geometry", () => {
  it("keeps a month's days at 38 whatever the window, and fills the board with a week", () => {
    expect(dayWidthFor("month", 1440)).toBe(MONTH_DAY_W);
    expect(dayWidthFor("month", 1710)).toBe(MONTH_DAY_W);
    expect(dayWidthFor("week", NAME_COL + 7 * 177)).toBe(177);
    expect(dayWidthFor("week", 300)).toBe(MIN_WEEK_DAY_W);
  });

  it("opens with the anchor's week loaded and room on both sides", () => {
    const thursday = new Date(2026, 10, 19);
    const range = initialRange(thursday, 1);
    expect(daysBetween(range.start, new Date(2026, 10, 16))).toBeGreaterThan(30);
    expect(daysBetween(new Date(2026, 10, 16), new Date(range.start.getTime() + range.length * 86_400_000))).toBeGreaterThan(90);
  });

  it("grows at either end without moving the other", () => {
    const range = { start: new Date(2026, 10, 1), length: 30 };
    expect(rangeISO(extendRange(range, "forward", 10))).toEqual({ from: "2026-11-01", to: "2026-12-10" });
    expect(rangeISO(extendRange(range, "back", 10))).toEqual({ from: "2026-10-22", to: "2026-11-30" });
  });

  it("counts days across a change of clocks", () => {
    expect(daysBetween(new Date(2026, 2, 28), new Date(2026, 2, 30))).toBe(2);
  });

  it("asks for more days within a board's width of either end, and not in the middle", () => {
    expect(extensionNeeded(100, 1000, 6000)).toBe("back");
    expect(extensionNeeded(4500, 1000, 6000)).toBe("forward");
    expect(extensionNeeded(2500, 1000, 6000)).toBeNull();
    expect(extensionNeeded(0, 0, 6000)).toBeNull();
  });

  it("keeps a row at 52 for one lane and centres its pills", () => {
    expect(rowHeightFor(1)).toBe(ROW_H);
    expect(pillTop(ROW_H, 1, 0)).toBe(12);
    expect(rowHeightFor(2)).toBeGreaterThanOrEqual(2 * 28 + 4);
    expect(pillTop(rowHeightFor(2), 2, 1) - pillTop(rowHeightFor(2), 2, 0)).toBe(32);
  });
});
