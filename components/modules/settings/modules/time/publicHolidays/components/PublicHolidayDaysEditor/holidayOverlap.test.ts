import { findDraftOverlaps } from "./holidayOverlap";
import type { DraftHoliday } from "./PublicHolidayDaysEditor";

const draft = (
  localId: string,
  name: string,
  holidayDate: string,
  endDate = "",
): DraftHoliday => ({ localId, name, holidayDate, endDate });

describe("findDraftOverlaps", () => {
  it("finds a span swallowing a single day that starts elsewhere", () => {
    const errors = findDraftOverlaps([
      draft("a", "Summer closure", "2026-08-10", "2026-08-14"),
      draft("b", "Company day", "2026-08-12"),
    ]);

    expect(Object.keys(errors)).toEqual(["b"]);
    expect(errors.b).toContain("Summer closure");
  });

  it("finds two days on the same date", () => {
    const errors = findDraftOverlaps([
      draft("a", "Labour Day", "2026-05-01"),
      draft("b", "May Day", "2026-05-01"),
    ]);

    expect(errors).toHaveProperty("b");
  });

  it("treats touching spans as fine", () => {
    const errors = findDraftOverlaps([
      draft("a", "Summer closure", "2026-08-10", "2026-08-14"),
      draft("b", "Company day", "2026-08-15"),
    ]);

    expect(errors).toEqual({});
  });

  it("treats an empty end date as the same day", () => {
    const errors = findDraftOverlaps([
      draft("a", "New Year", "2026-01-01"),
      draft("b", "Second day", "2026-01-02"),
    ]);

    expect(errors).toEqual({});
  });

  it("reports every day a long span covers, not just the first", () => {
    const errors = findDraftOverlaps([
      draft("a", "Summer closure", "2026-08-10", "2026-08-20"),
      draft("b", "Day one", "2026-08-12"),
      draft("c", "Day two", "2026-08-18"),
    ]);

    expect(Object.keys(errors).sort()).toEqual(["b", "c"]);
  });

  it("does not depend on the order rows were added in", () => {
    const errors = findDraftOverlaps([
      draft("b", "Company day", "2026-08-12"),
      draft("a", "Summer closure", "2026-08-10", "2026-08-14"),
    ]);

    expect(Object.keys(errors)).toEqual(["b"]);
  });

  it("ignores rows without a date, which have their own error", () => {
    const errors = findDraftOverlaps([draft("a", "", ""), draft("b", "New Year", "2026-01-01")]);

    expect(errors).toEqual({});
  });

  it("ignores a backwards end date, which has its own error", () => {
    const errors = findDraftOverlaps([
      draft("a", "Broken", "2026-08-10", "2026-08-01"),
      draft("b", "Company day", "2026-08-05"),
    ]);

    expect(errors).toEqual({});
  });
});
