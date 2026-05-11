import { renderHook } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService";
import {
  useInvalidatePublicHolidaysQuery,
  usePublicHolidayCalendars,
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars/usePublicHolidayCalendars";
import {
  getPublicHolidayCalendarsQueryKey,
  PUBLIC_HOLIDAYS_QUERY_KEY,
} from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService",
  () => ({
    publicHolidayCalendarsService: {
      list: jest.fn(),
    },
  })
);

describe("usePublicHolidayCalendars", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with calendars query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() => usePublicHolidayCalendars());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayCalendarsQueryKey(),
      queryFn: expect.any(Function),
    });

    await capturedOpts.queryFn();

    expect(publicHolidayCalendarsService.list).toHaveBeenCalledWith();
  });
});

describe("useInvalidatePublicHolidaysQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("invalidates public holidays root query", () => {
    const invalidateQueries = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries,
    });

    const { result } = renderHook(() => useInvalidatePublicHolidaysQuery());

    result.current();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [PUBLIC_HOLIDAYS_QUERY_KEY],
    });
  });
});
