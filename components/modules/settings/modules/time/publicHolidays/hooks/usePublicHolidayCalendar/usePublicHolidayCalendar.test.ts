import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService";
import {
  usePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendar/usePublicHolidayCalendar";
import { getPublicHolidayCalendarQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService",
  () => ({
    publicHolidayCalendarsService: {
      getById: jest.fn(),
    },
  })
);

describe("usePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with calendar query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() =>
      usePublicHolidayCalendar({
        calendarId: "calendar-id",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayCalendarQueryKey("calendar-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(publicHolidayCalendarsService.getById).toHaveBeenCalledWith(
      "calendar-id"
    );
  });

  it("disables query when calendarId is empty", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayCalendar({
        calendarId: "",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayCalendarQueryKey(""),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });

  it("disables query when calendarId is undefined string", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidayCalendar({
        calendarId: "undefined",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidayCalendarQueryKey("undefined"),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });
});
