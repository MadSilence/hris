import {
  calendarPersonHref,
  calendarUrlQuery,
  parseCalendarUrl,
  type CalendarUrlState,
} from "@/components/modules/calendar/lib/calendarUrlState";

const state: CalendarUrlState = {
  view: "my-team",
  filters: [{ field: "sys:office", op: "eq", value: "o1" }],
  grouping: "TEAM",
  scale: "week",
  from: "2026-11-12",
  person: null,
};

describe("a calendar state as an address", () => {
  it("comes back as it went", () => {
    expect(parseCalendarUrl(new URLSearchParams(calendarUrlQuery(state).slice(1)))).toEqual(state);
  });

  it("is a plain /calendar for a plain board", () => {
    expect(calendarUrlQuery({ view: null, filters: [], grouping: null, scale: "month", from: null, person: null })).toBe("");
  });

  it("drops what does not have the shape it should — a link is typed by hand as often as copied", () => {
    const parsed = parseCalendarUrl(
      new URLSearchParams({ f: '[{"field":"sys:team"},"x",{"field":"sys:office","op":"eq"}]', group: "planet", scale: "year", from: "12/11/2026", person: "<script>" }),
    );
    expect(parsed).toEqual({ view: null, filters: [{ field: "sys:office", op: "eq" }], grouping: null, scale: "month", from: null, person: null });
    expect(parseCalendarUrl(new URLSearchParams({ f: "{not json" })).filters).toEqual([]);
  });

  it("opens Home's Who's out on the calendar filtered to one person (F0.2)", () => {
    expect(calendarPersonHref("p-1")).toBe("/calendar?person=p-1");
  });
});
