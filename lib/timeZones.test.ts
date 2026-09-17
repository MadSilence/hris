import { offsetOf, timeZoneChoices } from "@/lib/timeZones";

describe("timeZoneChoices", () => {
  it("writes a zone as the offset a person asked to see, with its city", () => {
    const warsaw = timeZoneChoices().find((c) => c.zone === "Europe/Warsaw");

    // The label carries the offset; the value stays a real zone so daylight saving keeps working.
    expect(warsaw?.label).toMatch(/^\(UTC[+-]\d{2}:\d{2}\) Warsaw$/);
    expect(warsaw?.zone).toBe("Europe/Warsaw");
  });

  it("is short enough to read", () => {
    // The whole point: `Intl.supportedValuesOf("timeZone")` answers with about four hundred.
    expect(timeZoneChoices().length).toBeLessThan(60);
  });

  it("runs west to east", () => {
    const offsets = timeZoneChoices().map((c) => c.offsetMinutes);

    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });

  it("never loses a zone the person already has", () => {
    // A setting that quietly drops the value it is showing is worse than one that offers too much.
    const kept = timeZoneChoices("Asia/Almaty");

    expect(kept.some((c) => c.zone === "Asia/Almaty")).toBe(true);
    expect(timeZoneChoices().some((c) => c.zone === "Asia/Almaty")).toBe(false);
  });

  it("does not list a zone twice when the stored one is already offered", () => {
    const listed = timeZoneChoices("Europe/Warsaw").filter((c) => c.zone === "Europe/Warsaw");

    expect(listed).toHaveLength(1);
  });

  it("finds a zone by city, by region and by offset", () => {
    const tokyo = timeZoneChoices().find((c) => c.zone === "Asia/Tokyo");
    const haystack = `${tokyo?.label} ${tokyo?.keywords}`.toLowerCase();

    for (const typed of ["tokyo", "asia", "+09", "0900"]) {
      expect(haystack).toContain(typed);
    }
  });
});

describe("offsetOf", () => {
  it("writes zero as +00:00 rather than the bare GMT Intl gives", () => {
    expect(offsetOf("UTC")).toEqual({ text: "+00:00", minutes: 0 });
  });

  it("keeps a half-hour offset", () => {
    expect(offsetOf("Asia/Kolkata")).toEqual({ text: "+05:30", minutes: 330 });
  });

  it("signs a western offset", () => {
    const newYork = offsetOf("America/New_York");

    expect(newYork.minutes).toBeLessThan(0);
    expect(newYork.text).toMatch(/^-0[45]:00$/);
  });

  it("answers UTC for a zone that does not exist rather than throwing", () => {
    expect(offsetOf("Nowhere/Invented")).toEqual({ text: "+00:00", minutes: 0 });
  });
});
