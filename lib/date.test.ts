import { renderHook } from "@testing-library/react";

import {
  dateToISO,
  displayLocale,
  formatDisplayDate,
  formatLongDate,
  formatAgo,
  formatDayThisWeek,
  formatShortDate,
  formatShortRange,
  formatTime,
  formatTimeOfDay,
  isoToDate,
  resetDisplayPreferences,
  setDisplayPreferences,
  useDateFormatter,
  weekStartsOnOf,
} from "@/lib/date";
import { withTestLocale } from "@/test/nextIntl";

/**
 * The one place a date becomes text.
 *
 * Two rules are worth pinning above all: a calendar date is never moved by a zone, and the order is the
 * company's, by its country — nobody chooses it and the browser has no say (DECISIONS.md § "The designers' Home
 * fixes, round 1").
 */
describe("formatDisplayDate", () => {
  afterEach(() => resetDisplayPreferences());

  it("writes the European order by default, whatever the browser does", () => {
    expect(formatDisplayDate("2026-03-12", { language: "en" })).toBe("12.03.2026");
    expect(formatDisplayDate("2026-03-12", { language: "en", style: "medium" })).toBe("12 Mar 2026");
    expect(formatDisplayDate("2026-03-12", { language: "en", style: "long" })).toBe("12 March 2026");
  });

  it("writes month first for a company in the US", () => {
    setDisplayPreferences({ dateStyle: "US" });

    expect(formatDisplayDate("2026-03-12", { language: "en" })).toBe("03/12/2026");
    expect(formatDisplayDate("2026-11-18", { language: "en", style: "medium" })).toBe("Nov 18, 2026");
    expect(formatDisplayDate("2026-11-18", { language: "en", style: "long" })).toBe("November 18, 2026");
  });

  it("takes the order the caller passes over the module's", () => {
    expect(formatDisplayDate("2026-11-18", { language: "en", style: "medium", dateStyle: "US" })).toBe("Nov 18, 2026");
  });

  it("is never month first in Russian, even for a US company", () => {
    setDisplayPreferences({ dateStyle: "US" });

    expect(formatDisplayDate("2026-03-12", { language: "ru" })).toBe("12.03.2026");
    expect(formatDisplayDate("2026-11-18", { language: "ru", style: "medium" })).toMatch(/^18 нояб/);
  });

  it("never moves a calendar date by a zone", () => {
    // Midnight UTC read in Auckland is already the next day, and in Honolulu the previous one. A
    // hire date is the same day for everybody, so neither may happen here.
    setDisplayPreferences({ timeZone: "Pacific/Auckland" });
    expect(formatDisplayDate("2026-03-12", { language: "en" })).toBe("12.03.2026");

    setDisplayPreferences({ timeZone: "Pacific/Honolulu" });
    expect(formatDisplayDate("2026-03-12", { language: "en" })).toBe("12.03.2026");
  });

  it("reads an instant in the chosen zone", () => {
    // 23:30 UTC is already the thirteenth in Warsaw and still the twelfth in New York. This is the
    // question `analysis/DATES_NUMBERS_TZ_ANALYSIS.md` § 4 asked, answered.
    const instant = "2026-03-12T23:30:00Z";

    setDisplayPreferences({ timeZone: "Europe/Warsaw" });
    expect(formatDisplayDate(instant, { language: "en" })).toBe("13.03.2026");

    setDisplayPreferences({ timeZone: "America/New_York" });
    expect(formatDisplayDate(instant, { language: "en" })).toBe("12.03.2026");
  });

  it("drops the year where the caller asks it to", () => {
    // Birthdays and anniversaries, where the attribute hides the year.
    expect(formatDisplayDate("2026-03-12", { hideYear: true, language: "en" })).toBe("12.03");
    expect(formatDisplayDate("2026-03-12", { hideYear: true, language: "en", dateStyle: "US" })).toBe("03/12");
  });

  it("leaves an explicit locale alone", () => {
    setDisplayPreferences({ dateStyle: "US" });

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

  it("writes a Russian month for any company — the order is the company's, the words the page's", () => {
    setDisplayPreferences({ dateStyle: "US" });

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
  const en = { today, language: "en" } as const;
  const us = { today, language: "en", dateStyle: "US" } as const;
  afterEach(() => resetDisplayPreferences());

  it("drops the year of the current year and keeps it otherwise", () => {
    expect(formatShortDate("2026-11-11", en)).toBe("11 Nov");
    expect(formatShortDate("2025-11-11", en)).toBe("11 Nov 2025");
    expect(formatShortDate("2026-11-11", us)).toBe("Nov 11");
    expect(formatShortDate("2025-11-11", us)).toBe("Nov 11, 2025");
  });

  it("puts a comma after the weekday of one date in both orders (widgets A5)", () => {
    expect(formatShortDate("2026-11-18", { ...en, weekday: true })).toBe("Wed, 18 Nov");
    expect(formatShortDate("2026-11-18", { ...us, weekday: true })).toBe("Wed, Nov 18");
  });

  it("drops any year with hideYear (widgets A7)", () => {
    expect(formatShortDate("2027-01-08", { ...en, hideYear: true })).toBe("8 Jan");
    expect(formatShortDate("2027-01-08", { ...us, hideYear: true })).toBe("Jan 8");
    expect(formatShortRange("2027-02-16", "2027-02-20", { ...en, hideYear: true })).toBe("16–20 Feb");
    expect(formatShortRange("2026-12-28", "2027-01-03", { ...en, hideYear: true })).toBe("28 Dec – 3 Jan");
  });

  it("writes a span inside a month once, in the company's order", () => {
    expect(formatShortRange("2026-11-25", "2026-11-27", en)).toBe("25–27 Nov");
    expect(formatShortRange("2026-11-25", "2026-11-27", us)).toBe("Nov 25–27");
    expect(formatShortRange("2026-11-25", "2026-11-27", { ...en, weekday: true })).toBe("Wed 25 – Fri 27 Nov");
    expect(formatShortRange("2026-11-25", "2026-11-27", { ...us, weekday: true })).toBe("Wed, Nov 25 – Fri, Nov 27");
  });

  it("follows the module's order when the caller passes none", () => {
    setDisplayPreferences({ dateStyle: "US" });
    expect(formatShortRange("2026-11-25", "2026-11-27", en)).toBe("Nov 25–27");
  });

  it("writes both ends across months, and the year on both across years", () => {
    expect(formatShortRange("2026-11-30", "2026-12-02", en)).toBe("30 Nov – 2 Dec");
    expect(formatShortRange("2026-11-30", "2026-12-02", us)).toBe("Nov 30 – Dec 2");
    expect(formatShortRange("2026-12-28", "2027-01-03", en)).toBe("28 Dec 2026 – 3 Jan 2027");
    expect(formatShortRange("2026-12-28", "2027-01-03", us)).toBe("Dec 28, 2026 – Jan 3, 2027");
  });

  it("reads a single day as one date", () => {
    expect(formatShortRange("2026-11-11", "2026-11-11", en)).toBe("11 Nov");
  });

  it("is day first in Russian for a US company", () => {
    expect(formatShortDate("2026-11-18", { today, language: "ru", dateStyle: "US" })).toMatch(/^18 нояб/);
  });
});

describe("the long style", () => {
  it("writes the full month, with the weekday where asked", () => {
    expect(formatLongDate("2026-11-18", { language: "en" })).toBe("18 November 2026");
    expect(formatLongDate("2026-11-18", { language: "en", dateStyle: "US" })).toBe("November 18, 2026");
    expect(formatLongDate("2026-11-18", { language: "en", weekday: true, hideYear: true })).toBe("Wednesday, 18 November");
    expect(formatLongDate("2026-11-18", { language: "en", weekday: true, hideYear: true, dateStyle: "US" }))
      .toBe("Wednesday, November 18");
  });
});

describe("the week start", () => {
  it("counts the company's first day as Date.getDay() does, Monday when unknown", () => {
    expect(weekStartsOnOf("SUNDAY")).toBe(0);
    expect(weekStartsOnOf("MONDAY")).toBe(1);
    expect(weekStartsOnOf("saturday")).toBe(6);
    expect(weekStartsOnOf(undefined)).toBe(1);
    expect(weekStartsOnOf("SOMEDAY")).toBe(1);
  });
});

describe("the company's clock (the owner, 2026-11-18)", () => {
  const morning = new Date(Date.UTC(2026, 10, 18, 9, 5));
  const evening = new Date(Date.UTC(2026, 10, 18, 21, 5));

  it("writes 12-hour times for a company in the US and 24-hour ones for everybody else", () => {
    expect(formatTime(morning, { language: "en", dateStyle: "US", timeZone: "UTC" })).toBe("9:05 AM");
    expect(formatTime(evening, { language: "en", dateStyle: "US", timeZone: "UTC" })).toBe("9:05 PM");
    expect(formatTime(morning, { language: "en", dateStyle: "EUROPEAN", timeZone: "UTC" })).toBe("09:05");
    expect(formatTime(evening, { language: "en", dateStyle: "EUROPEAN", timeZone: "UTC" })).toBe("21:05");
  });

  it("keeps the 24-hour clock on a Russian page, as it keeps the day first", () => {
    expect(formatTime(evening, { language: "ru", dateStyle: "US", timeZone: "UTC" })).toBe("21:05");
  });

  it("reads a wall-clock time of day the same way", () => {
    expect(formatTimeOfDay("17:30", { language: "en", dateStyle: "US" })).toBe("5:30 PM");
    expect(formatTimeOfDay("09:00", { language: "en", dateStyle: "EUROPEAN" })).toBe("09:00");
    expect(formatTimeOfDay("later", { language: "en", dateStyle: "US" })).toBe("later");
    expect(formatTimeOfDay(null)).toBe("");
  });
});

describe("a day inside this week (widgets A6)", () => {
  // Thursday 19 November 2026; the week starts on Monday 16.
  const today = new Date(2026, 10, 19);
  const en = { today, language: "en", weekStartsOn: 1 } as const;

  it("names a day of this week by its weekday alone, past or coming", () => {
    expect(formatDayThisWeek("2026-11-20", en)).toBe("Fri");
    expect(formatDayThisWeek("2026-11-16", en)).toBe("Mon");
    expect(formatDayThisWeek("2026-11-22", en)).toBe("Sun");
    expect(formatDayThisWeek("2026-11-21", { ...en, withDay: true })).toBe("Sat 21");
  });

  it("says today in the caller's word", () => {
    expect(formatDayThisWeek("2026-11-19", { ...en, todayLabel: "today" })).toBe("today");
    expect(formatDayThisWeek("2026-11-19", en)).toBe("Thu");
  });

  it("writes the short date outside the week, without a year where asked", () => {
    expect(formatDayThisWeek("2026-11-23", en)).toBe("23 Nov");
    expect(formatDayThisWeek("2027-01-04", { ...en, hideYear: true })).toBe("4 Jan");
  });

  it("follows the company's first day of the week", () => {
    // A Sunday-first week: Sunday 22 is already the next week.
    expect(formatDayThisWeek("2026-11-22", { ...en, weekStartsOn: 0 })).toBe("22 Nov");
    expect(formatDayThisWeek("2026-11-15", { ...en, weekStartsOn: 0 })).toBe("Sun");
  });
});

describe("relative time (widgets A8)", () => {
  const now = new Date("2026-11-19T12:00:00Z");
  const labels = { minutes: (n: number) => `${n}m ago`, hours: (n: number) => `${n}h ago`, yesterday: "Yesterday" };

  it("counts minutes and hours, never rounding up", () => {
    expect(formatAgo("2026-11-19T11:59:40Z", labels, { now })).toBe("1m ago");
    expect(formatAgo("2026-11-19T10:01:00Z", labels, { now })).toBe("1h ago");
    expect(formatAgo("2026-11-18T21:00:00Z", labels, { now })).toBe("15h ago");
  });

  it("reads a timestamp without a zone as UTC", () => {
    expect(formatAgo("2026-11-19T10:00:00", labels, { now })).toBe("2h ago");
  });

  it("says Yesterday, then the weekday, then the date", () => {
    const at = (iso: string) => formatAgo(new Date(iso), labels, { now, language: "en" });
    expect(at("2026-11-18T06:00:00")).toBe("Yesterday");
    expect(at("2026-11-16T12:00:00")).toBe("Mon");
    expect(at("2026-11-02T12:00:00")).toBe("2 Nov");
  });
});
