import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import {
  replacePublicHolidayYearAction
} from "@/components/modules/settings/modules/time/publicHolidays/actions/replacePublicHolidayYearAction/replacePublicHolidayYearAction";

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    replaceYear: jest.fn(),
  },
}));

describe("replacePublicHolidayYearAction", () => {
  const holidays = [
    {
      id: null,
      name: "Labour Day",
      holidayDate: "2026-05-01",
      endDate: "2026-05-01",
      sourceEventId: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends the year together with the calendar's version the editor holds", async () => {
    jest.mocked(hrisPublicHolidaysService.replaceYear).mockResolvedValue([]);

    const result = await replacePublicHolidayYearAction({
      calendarId: "calendar-id",
      year: 2026,
      holidays,
      version: 7,
    });

    expect(hrisPublicHolidaysService.replaceYear).toHaveBeenCalledWith("calendar-id", 2026, {
      holidays,
      version: 7,
    });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: [] });
  });

  it("returns an error envelope when the year is refused", async () => {
    jest.mocked(hrisPublicHolidaysService.replaceYear).mockRejectedValue(new Error("Failed"));

    const result = await replacePublicHolidayYearAction({
      calendarId: "calendar-id",
      year: 2026,
      holidays,
      version: 6,
    });

    expect(result.status).toBe(ActionStatus.ERROR);
    expect(result.errorMessage).toBeTruthy();
  });
});
