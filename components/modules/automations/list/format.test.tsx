import { renderHook } from "@testing-library/react";
import { useDisplayLocale } from "@/lib/date";
import { useWhen } from "./format";

const when = () => renderHook(() => useWhen()).result.current;
const locale = () => renderHook(() => useDisplayLocale()).result.current;
const hhmm = (date: Date) => new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit" }).format(date);

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

  it("leaves a bare date on its calendar day", () => {
    expect(when()("2026-11-04", true, new Date("2026-11-12T12:00:00"))).toContain("4");
  });
});
