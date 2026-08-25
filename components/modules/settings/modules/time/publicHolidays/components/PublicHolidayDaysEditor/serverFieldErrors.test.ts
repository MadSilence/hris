import { mapServerFieldErrors } from "./serverFieldErrors";
import type { DraftHoliday } from "./PublicHolidayDaysEditor";

const draft = (localId: string): DraftHoliday => ({
  localId,
  name: "Holiday",
  holidayDate: "2026-01-01",
  endDate: "",
});

describe("mapServerFieldErrors", () => {
  const holidays = [draft("a"), draft("b"), draft("c")];

  it("attaches the message to the row at that position in the payload", () => {
    const errors = mapServerFieldErrors(
      { "holidays[1]": "Overlaps “New Year Break” (2026-12-31 - 2027-01-01)." },
      holidays,
    );

    expect(errors.b?.holidayDate).toContain("New Year Break");
    expect(errors.a).toBeUndefined();
  });

  it("returns nothing when the backend sent no field errors", () => {
    expect(mapServerFieldErrors(undefined, holidays)).toEqual({});
  });

  it("ignores keys it does not recognise", () => {
    expect(mapServerFieldErrors({ name: "Name is required" }, holidays)).toEqual({});
  });

  it("ignores an index that is out of range", () => {
    expect(mapServerFieldErrors({ "holidays[9]": "Overlaps" }, holidays)).toEqual({});
  });
});
