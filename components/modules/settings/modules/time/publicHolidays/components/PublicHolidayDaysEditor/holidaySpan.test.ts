import { holidaySpanDays, totalDraftDays } from "./holidaySpan";
import type { DraftHoliday } from "./PublicHolidayDaysEditor";

const draft = (holidayDate: string, endDate = ""): DraftHoliday => ({
  localId: holidayDate,
  name: "Holiday",
  holidayDate,
  endDate,
});

describe("holidaySpanDays", () => {
  it("counts both ends of a span", () => {
    expect(holidaySpanDays("2026-05-27", "2026-05-31")).toBe(5);
  });

  it("counts a single day as one", () => {
    expect(holidaySpanDays("2026-01-01", "2026-01-01")).toBe(1);
  });

  it("counts a span crossing the year boundary", () => {
    expect(holidaySpanDays("2026-12-31", "2027-01-01")).toBe(2);
  });

  it("falls back to one day for a backwards or unparsable range", () => {
    expect(holidaySpanDays("2026-08-10", "2026-08-01")).toBe(1);
    expect(holidaySpanDays("", "")).toBe(1);
  });
});

describe("totalDraftDays", () => {
  it("counts days off, not rows", () => {
    // A merged five-day span is one row; saying "1 day added" would be a lie.
    expect(totalDraftDays([draft("2026-05-27", "2026-05-31"), draft("2026-01-01")])).toBe(6);
  });

  it("skips a row that has no date yet", () => {
    expect(totalDraftDays([draft(""), draft("2026-01-01")])).toBe(1);
  });

  it("is zero for an empty editor", () => {
    expect(totalDraftDays([])).toBe(0);
  });
});
