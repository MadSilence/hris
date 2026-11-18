import { renderHook } from "@testing-library/react";

import {
  dateToISO,
  displayLocale,
  formatDisplayDate,
  formatLongDate,
  formatShortDate,
  formatShortRange,
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

  it("puts no comma after a European short weekday, and one after a US one", () => {
    expect(formatShortDate("2026-11-18", { ...en, weekday: true })).toBe("Wed 18 Nov");
    expect(formatShortDate("2026-11-18", { ...us, weekday: true })).toBe("Wed, Nov 18");
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
