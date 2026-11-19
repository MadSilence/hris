import { renderHook } from "@testing-library/react";
import { useDisplayLocale } from "@/lib/date";
import { useWhen } from "./format";

const when = () => renderHook(() => useWhen()).result.current;
const locale = () => renderHook(() => useDisplayLocale()).result.current;
// A company outside the US writes 24-hour times (owner, 2026-11-18); the tests run as one.
const hhmm = (date: Date) =>
  new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);

describe("useWhen", () => {
  // The backend's LocalDateTime is a UTC wall clock with no zone. Read as local time it put Activity's When an offset
  // away from the run window's "started" (walk of 2026-11-12). The check bites wherever jest's zone is not UTC.
  it("reads a moment without a zone as UTC, like the run window", () => {
    const now = new Date("2026-11-12T22:00:00Z");
    expect(when()("2026-11-12T20:26:00", true, now)).toContain(hhmm(new Date("2026-11-12T20:26:00Z")));
  });

  it("keeps a moment that names its zone", () => {
    const now = new Date("2026-11-12T22:00:00Z");
    expect(when()("2026-11-12T20:26:00+00:00", true, now)).toContain(hhmm(new Date("2026-11-12T20:26:00Z")));
  });

  it("adds the zone when asked, for a card's footer", () => {
    const now = new Date("2026-11-12T22:00:00Z");
    // The zone's short name is the time seam's (`lib/date.ts` formatTime): "CET" or "GMT+1", by the page's language.
    expect(when()("2026-11-12T20:26:00Z", false, now, true)).toMatch(/\d{1,2}:\d{2}( [AP]M)? \S+$/);
  });

  it("leaves a bare date on its calendar day", () => {
    expect(when()("2026-11-04", true, new Date("2026-11-12T12:00:00"))).toContain("4");
  });
});
