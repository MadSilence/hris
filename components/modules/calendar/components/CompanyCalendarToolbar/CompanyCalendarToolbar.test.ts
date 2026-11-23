import { calendarChipsShown } from "./CompanyCalendarToolbar";

describe("calendarChipsShown (W3 — the toolbar keeps one line at 1440)", () => {
  it("shows one chip on a flat board with nobody picked", () => {
    expect(calendarChipsShown({ grouped: false, person: false })).toBe(1);
  });

  it("folds every condition into +N more once the Group pill is on", () => {
    expect(calendarChipsShown({ grouped: true, person: false })).toBe(0);
  });

  it("folds them once the person's chip takes the place", () => {
    expect(calendarChipsShown({ grouped: false, person: true })).toBe(0);
    expect(calendarChipsShown({ grouped: true, person: true })).toBe(0);
  });
});
