import { formatMinutes } from "@/models/attendance";
import {
  minutesOfDay,
  monthBounds,
  monthPeriod,
  parseDuration,
  shiftMonth,
  spanMinutes,
} from "@/components/modules/attendance/lib/period";

describe("attendance period helpers", () => {
  it("shifts a month across a year boundary in both directions", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-09", 0)).toBe("2026-09");
  });

  it("knows how long a month is, February of a leap year included", () => {
    expect(monthBounds("2026-09")).toEqual({ from: "2026-09-01", to: "2026-09-30" });
    expect(monthBounds("2028-02")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });

  it("counts the current month's expected days to today, any other month to its end", () => {
    expect(monthPeriod("2026-09", "2026-09-10")).toEqual({ from: "2026-09-01", to: "2026-09-30", expectedUntil: "2026-09-10" });
    expect(monthPeriod("2026-08", "2026-09-10").expectedUntil).toBeNull();
  });

  it("spells a duration as hours and minutes", () => {
    expect(formatMinutes(450)).toBe("7:30");
    expect(formatMinutes(480)).toBe("8:00");
    expect(formatMinutes(5)).toBe("0:05");
    expect(formatMinutes(0)).toBe("0:00");
    expect(formatMinutes(100 * 60)).toBe("100:00");
  });

  it("measures a span of one day and refuses one that does not run forwards", () => {
    expect(minutesOfDay("09:30")).toBe(570);
    expect(minutesOfDay("9:30")).toBeNull();
    expect(minutesOfDay("24:00")).toBeNull();
    expect(spanMinutes("09:00", "17:30")).toBe(510);
    // Not a night shift — a typo. Crossing midnight needs a second date.
    expect(spanMinutes("17:00", "09:00")).toBeNull();
    expect(spanMinutes("09:00", "09:00")).toBeNull();
    expect(spanMinutes("09:00", "")).toBeNull();
  });

  it("reads a duration typed either way", () => {
    expect(parseDuration("7:30")).toBe(450);
    expect(parseDuration("7.5")).toBe(450);
    expect(parseDuration("7,5")).toBe(450);
    expect(parseDuration(" 8 ")).toBe(480);
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("7:75")).toBeNull();
    expect(parseDuration("eight")).toBeNull();
    expect(parseDuration("-1")).toBeNull();
  });
});
