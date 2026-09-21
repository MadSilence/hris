import { renderHook } from "@testing-library/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { CapturedReactQueryOptions } from "@/test/types";
import type { FilterDTO } from "@/models/user/fields";
import { companyCalendarService } from "@/components/modules/calendar/services/companyCalendarService";
import {
  COMPANY_CALENDAR_GROUPS_QUERY_KEY,
  COMPANY_CALENDAR_PEOPLE_QUERY_KEY,
  groupKeySegment,
  useCompanyCalendarGroups,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar/useCompanyCalendar";

jest.mock("@tanstack/react-query", () => ({
  keepPreviousData: "keepPreviousData",
  useInfiniteQuery: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock("@/components/modules/calendar/services/companyCalendarService", () => ({
  companyCalendarService: {
    people: jest.fn(),
    groups: jest.fn(),
    marks: jest.fn(),
  },
}));

type CapturedOptions = CapturedReactQueryOptions & { enabled?: boolean; placeholderData?: unknown };

const capture = (hook: jest.Mock) => {
  let captured!: CapturedOptions;
  hook.mockImplementation((opts: CapturedOptions) => {
    captured = opts;
    return {};
  });
  return () => captured;
};

const STATUS_FILTER = [{ field: "sys:status", op: "eq", value: "ACTIVE" }] as FilterDTO[];

describe("groupKeySegment", () => {
  it("tells the flat roster, a named group and the no-value group apart", () => {
    const keys = new Set([
      groupKeySegment(null),
      groupKeySegment({ by: "TEAM", id: "t1" }),
      groupKeySegment({ by: "TEAM", id: null }),
      groupKeySegment({ by: "OFFICE", id: null }),
    ]);
    expect(keys.size).toBe(4);
  });
});

describe("useCompanyCalendarPeople", () => {
  it("keeps the flat roster loading by default, with its previous rows held through a fetch", () => {
    const options = capture(useInfiniteQuery as jest.Mock);
    renderHook(() => useCompanyCalendarPeople({ q: "an", filters: [] }));

    expect(options().queryKey).toEqual([COMPANY_CALENDAR_PEOPLE_QUERY_KEY, "an", "[]", "flat"]);
    expect(options().enabled).toBe(true);
    expect(options().placeholderData).toBe("keepPreviousData");
  });

  it("keys one group's rows by the group, and never borrows another key's rows", async () => {
    const options = capture(useInfiniteQuery as jest.Mock);
    renderHook(() =>
      useCompanyCalendarPeople({ q: "", filters: [], group: { by: "DEPARTMENT", id: null }, enabled: false }),
    );

    expect(options().queryKey).toEqual([COMPANY_CALENDAR_PEOPLE_QUERY_KEY, "", "[]", "DEPARTMENT:none"]);
    expect(options().enabled).toBe(false);
    expect(options().placeholderData).toBeUndefined();

    await options().queryFn({ pageParam: "c1" });
    expect(companyCalendarService.people).toHaveBeenCalledWith({
      cursor: "c1",
      q: "",
      filters: [],
      group: { by: "DEPARTMENT", id: null },
      limit: 25,
    });
  });
});

describe("useCompanyCalendarGroups", () => {
  it("is off while the board is flat", () => {
    const options = capture(useQuery as jest.Mock);
    renderHook(() => useCompanyCalendarGroups({ q: "", filters: [], groupBy: null }));
    expect(options().enabled).toBe(false);
  });

  it("asks for the headers with the rows' search and filters, and not the window", async () => {
    const options = capture(useQuery as jest.Mock);
    renderHook(() => useCompanyCalendarGroups({ q: "an", filters: STATUS_FILTER, groupBy: "TEAM" }));

    expect(options().enabled).toBe(true);
    expect(options().queryKey).toEqual([
      COMPANY_CALENDAR_GROUPS_QUERY_KEY,
      "an",
      JSON.stringify(STATUS_FILTER),
      "TEAM",
    ]);

    await options().queryFn();
    expect(companyCalendarService.groups).toHaveBeenCalledWith({
      q: "an",
      filters: STATUS_FILTER,
      groupBy: "TEAM",
    });
  });
});
