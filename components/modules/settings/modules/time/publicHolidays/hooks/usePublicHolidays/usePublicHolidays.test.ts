import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { publicHolidaysService } from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService";
import { usePublicHolidays } from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidays/usePublicHolidays";
import { getPublicHolidaysQueryKey } from "@/components/modules/settings/modules/time/publicHolidays/utils/publicHolidaysQueryKeys";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService",
  () => ({
    publicHolidaysService: {
      list: jest.fn(),
    },
  })
);

describe("usePublicHolidays", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls useQuery with holidays query config", async () => {
    let capturedOpts: any;

    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {};
    });

    renderHook(() =>
      usePublicHolidays({
        calendarId: "calendar-id",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidaysQueryKey("calendar-id"),
      queryFn: expect.any(Function),
      enabled: true,
    });

    await capturedOpts.queryFn();

    expect(publicHolidaysService.list).toHaveBeenCalledWith("calendar-id");
  });

  it("disables query when calendarId is empty", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidays({
        calendarId: "",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidaysQueryKey(""),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });

  it("disables query when calendarId is undefined string", () => {
    (useQuery as jest.Mock).mockReturnValue({});

    renderHook(() =>
      usePublicHolidays({
        calendarId: "undefined",
      })
    );

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: getPublicHolidaysQueryKey("undefined"),
      queryFn: expect.any(Function),
      enabled: false,
    });
  });
});
