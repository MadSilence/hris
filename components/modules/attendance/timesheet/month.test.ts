import { formatHours, parseHours, shiftMonth } from "@/components/modules/attendance/timesheet/month";

describe("timesheet month helpers", () => {
  it("shifts a month across a year boundary in both directions", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-09", 0)).toBe("2026-09");
  });

  it("shows hours without trailing zeros and a missing value as empty", () => {
    expect(formatHours(7.5)).toBe("7.5");
    expect(formatHours(8)).toBe("8");
    expect(formatHours(0.25)).toBe("0.25");
    expect(formatHours(null)).toBe("");
  });

  it("reads a comma as a decimal separator and refuses what is not a number", () => {
    expect(parseHours("7,5")).toBe(7.5);
    expect(parseHours(" 8 ")).toBe(8);
    expect(parseHours("")).toBeNull();
    expect(parseHours("eight")).toBeNull();
    expect(parseHours("-1")).toBeNull();
  });
});
