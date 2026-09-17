import {
  dateToISO,
  formatDisplayDate,
  isoToDate,
  resetDisplayPreferences,
  setDisplayPreferences,
} from "@/lib/date";

/**
 * The one place a date becomes text.
 *
 * Two rules are worth pinning above all: a calendar date is never moved by a zone, and an explicit
 * preference beats the browser's. The first is the reason `2026-03-12` does not read as the
 * eleventh to anybody west of Greenwich; the second is the whole point of the setting.
 */
describe("formatDisplayDate", () => {
  afterEach(() => resetDisplayPreferences());

  it("follows the browser until somebody chooses", () => {
    // Whatever the runner's locale is, this is the behaviour every date had before the setting.
    const browser = new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(isoToDate("2026-03-12"));

    expect(formatDisplayDate("2026-03-12")).toBe(browser);
  });

  it.each([
    ["DMY", "12.03.2026"],
    ["MDY", "03/12/2026"],
    ["YMD", "2026-03-12"],
  ] as const)("writes a calendar date as %s", (format, expected) => {
    setDisplayPreferences({ dateFormat: format });

    expect(formatDisplayDate("2026-03-12")).toBe(expected);
  });

  it("never moves a calendar date by a zone", () => {
    // Midnight UTC read in Auckland is already the next day, and in Honolulu the previous one. A
    // hire date is the same day for everybody, so neither may happen here.
    setDisplayPreferences({ dateFormat: "YMD", timeZone: "Pacific/Auckland" });
    expect(formatDisplayDate("2026-03-12")).toBe("2026-03-12");

    setDisplayPreferences({ dateFormat: "YMD", timeZone: "Pacific/Honolulu" });
    expect(formatDisplayDate("2026-03-12")).toBe("2026-03-12");
  });

  it("reads an instant in the chosen zone", () => {
    // 23:30 UTC is already the thirteenth in Warsaw and still the twelfth in New York. This is the
    // question `analysis/DATES_NUMBERS_TZ_ANALYSIS.md` § 4 asked, answered.
    const instant = "2026-03-12T23:30:00Z";

    setDisplayPreferences({ dateFormat: "YMD", timeZone: "Europe/Warsaw" });
    expect(formatDisplayDate(instant)).toBe("2026-03-13");

    setDisplayPreferences({ dateFormat: "YMD", timeZone: "America/New_York" });
    expect(formatDisplayDate(instant)).toBe("2026-03-12");
  });

  it("drops the year where the caller asks it to", () => {
    setDisplayPreferences({ dateFormat: "DMY" });

    // Birthdays and anniversaries, where the attribute hides the year.
    expect(formatDisplayDate("2026-03-12", { hideYear: true })).toBe("12.03");
  });

  it("leaves an explicit locale alone", () => {
    setDisplayPreferences({ dateFormat: "MDY" });

    // The escape hatch for a screen that has a reason. It must win, or it is not one.
    expect(formatDisplayDate("2026-03-12", { locale: "en-GB" })).toBe("12/03/2026");
  });

  it("answers nothing for nothing, and echoes what it cannot parse", () => {
    expect(formatDisplayDate(null)).toBe("");
    expect(formatDisplayDate("")).toBe("");
    expect(formatDisplayDate("not a date")).toBe("not a date");
  });

  it("round-trips a Date through the ISO helpers in local components", () => {
    // Never through toISOString(): that converts to UTC and loses a day west of Greenwich.
    expect(dateToISO(new Date(2026, 2, 12))).toBe("2026-03-12");
    expect(isoToDate("2026-03-12").getDate()).toBe(12);
  });
});
