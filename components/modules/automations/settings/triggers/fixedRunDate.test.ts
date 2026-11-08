import { fixedRunDate } from "./fixedRunDate";

describe("fixedRunDate", () => {
  // Walk of 2026-11-07: a picked date with "14 days before" still read "Runs once: Mon, 1 Mar 2027" — the backend runs it
  // on 15 Feb.
  it("moves a picked date by the trigger's days, as the backend does", () => {
    expect(fixedRunDate({ date: "2027-03-01", days: 14, direction: "BEFORE" })).toBe("2027-02-15");
    expect(fixedRunDate({ date: "2027-03-01", days: 3, direction: "AFTER" })).toBe("2027-03-04");
    expect(fixedRunDate({ date: "2027-03-01", days: 14, direction: "ON" })).toBe("2027-03-01");
    expect(fixedRunDate({ date: null, days: 14, direction: "BEFORE" })).toBeNull();
  });
});
