import { backOn, monthsLayout, monthsOf, monthWeeks } from "./leaveDays";

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

describe("leaveDays", () => {
  it("lays November 2026 out from Monday in six rows, the neighbours' days included", () => {
    const weeks = monthWeeks(2026, 10, 1);
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0].iso).toBe("2026-10-26");
    expect(weeks[0][6]).toMatchObject({ iso: "2026-11-01", inMonth: true });
    expect(weeks[5][6].iso).toBe("2026-12-06");
  });

  it("is back on the next working day, past the weekend and a holiday (Q30: Fri 4 Dec → Mon 7 Dec)", () => {
    expect(backOn("2026-12-04", weekend)).toBe("2026-12-07");
    expect(backOn("2026-12-04", weekend, new Set(["2026-12-07"]))).toBe("2026-12-08");
  });

  it("draws one month when the range fits its grid, two when it runs on, many past that (Q30, Q30d, Q30f)", () => {
    expect(monthsLayout({ start: "2026-11-30", end: "2026-12-04" }, 1)).toBe("one");
    expect(monthsLayout({ start: "2026-12-28", end: "2027-01-05" }, 1)).toBe("two");
    expect(monthsLayout({ start: "2027-01-04", end: "2027-07-02" }, 1)).toBe("many");
    expect(monthsOf({ start: "2027-01-04", end: "2027-07-02" })).toHaveLength(7);
  });
});
