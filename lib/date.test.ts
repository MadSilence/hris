import { renderHook } from "@testing-library/react";

import {
  dateToISO,
  displayLocale,
  formatDisplayDate,
  formatShortDate,
  formatShortRange,
  isoToDate,
  resetDisplayPreferences,
  setDisplayPreferences,
  useDateFormatter,
} from "@/lib/date";
import { withTestLocale } from "@/test/nextIntl";

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

/**
 * The server's position: no `LocaleBridge` has run and no `<html lang>` says anything — on the server neither
 * exists, and the module variable is never set there because it is shared by every request. A date rendered
 * there learns its language only from the caller (the walk saw an English date in a Russian sentence).
 */
describe("formatDisplayDate with an explicit language", () => {
  beforeEach(() => {
    resetDisplayPreferences();
    document.documentElement.lang = "";
  });

  it("writes a Russian month with nothing else to go on", () => {
    expect(formatDisplayDate("2026-11-12", { language: "ru", style: "medium" })).toMatch(/нояб/);
  });

  it("writes a Russian month in a chosen format too — the order is the reader's, the words the page's", () => {
    setDisplayPreferences({ dateFormat: "DMY" });

    expect(formatDisplayDate("2026-11-12", { language: "ru", style: "medium" })).toMatch(/нояб/);
  });

  it("beats what the module was told", () => {
    setDisplayPreferences({ language: "en" });

    expect(formatDisplayDate("2026-11-12", { language: "ru", style: "medium" })).toMatch(/нояб/);
  });

  it("hands numbers the same language", () => {
    expect(new Intl.NumberFormat(displayLocale("ru")).format(1234.5)).toBe(new Intl.NumberFormat("ru").format(1234.5));
  });
});

/**
 * The hook every component formats with during render: bound to the page's language from `next-intl`, which the
 * server knows per request — so the server's HTML and the browser's first frame say the same month.
 */
describe("useDateFormatter", () => {
  afterEach(() => resetDisplayPreferences());

  it("formats in the page's language, not the module's", () => {
    // The module variable says English; the page is Russian. The page wins.
    setDisplayPreferences({ language: "en" });
    const { result } = withTestLocale("ru", () => renderHook(() => useDateFormatter()));

    expect(result.current("2026-11-12", { style: "medium" })).toMatch(/нояб/);
  });

  it("writes English by default, as every other test reads", () => {
    const { result } = renderHook(() => useDateFormatter());

    expect(result.current("2026-11-12", { style: "medium" })).toMatch(/Nov/);
  });

  it("hands back the same function on every render, so it is safe in a dependency list", () => {
    const { result, rerender } = renderHook(() => useDateFormatter());
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it("still lets the caller name another language", () => {
    const { result } = renderHook(() => useDateFormatter());

    expect(result.current("2026-11-12", { style: "medium", language: "ru" })).toMatch(/нояб/);
  });
});

describe("the short style (C1)", () => {
  const today = new Date(2026, 10, 5);
  afterEach(() => resetDisplayPreferences());

  it("drops the year of the current year and keeps it otherwise", () => {
    setDisplayPreferences({ dateFormat: "DMY" });
    expect(formatShortDate("2026-11-11", { today, language: "en" })).toBe("11 Nov");
    expect(formatShortDate("2025-11-11", { today, language: "en" })).toBe("11 Nov 2025");
    expect(formatShortDate("2026-11-11", { today, language: "en", weekday: true })).toBe("Wed, 11 Nov");
  });

  it("writes a span inside a month once, in the reader's order", () => {
    setDisplayPreferences({ dateFormat: "DMY" });
    expect(formatShortRange("2026-11-11", "2026-11-13", { today, language: "en", weekday: true })).toBe("Wed–Fri, 11–13 Nov");
    setDisplayPreferences({ dateFormat: "MDY" });
    expect(formatShortRange("2026-11-11", "2026-11-13", { today, language: "en", weekday: true })).toBe("Wed–Fri, Nov 11–13");
  });

  it("writes both ends across months, and the year on both across years", () => {
    setDisplayPreferences({ dateFormat: "DMY" });
    expect(formatShortRange("2026-11-30", "2026-12-02", { today, language: "en" })).toBe("30 Nov – 2 Dec");
    expect(formatShortRange("2026-12-28", "2027-01-03", { today, language: "en" })).toBe("28 Dec 2026 – 3 Jan 2027");
  });

  it("reads a single day as one date", () => {
    setDisplayPreferences({ dateFormat: "DMY" });
    expect(formatShortRange("2026-11-11", "2026-11-11", { today, language: "en" })).toBe("11 Nov");
  });
});
