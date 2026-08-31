import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import {
  PublicHolidayDayPart,
  PublicHolidayOrigin,
  PublicHolidayType,
} from "@/api/modules/publicHolidays/holidays/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe("HrisApiPublicHolidaysClient", () => {
  const dto = {
    id: "holiday-id",
    calendarId: "calendar-id",
    calendarYear: 2026,
    name: "New Year",
    holidayDate: "2026-01-01",
    endDate: "2026-01-01",
    observedDate: null,
    origin: PublicHolidayOrigin.Source,
    sourceEventId: "src-1",
    dayPart: PublicHolidayDayPart.FullDay,
    type: PublicHolidayType.Public,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holidays by calendar", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result = await hrisApiPublicHolidaysClient.list("calendar-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/holidays"
    );
    expect(result).toEqual([dto]);
  });

  it("appends the year to the list query", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    await hrisApiPublicHolidaysClient.list("calendar-id", 2026);

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/holidays?year=2026"
    );
  });

  it("replaces a whole year in one call", async () => {
    const request = { holidays: [] };

    jest.mocked(hrisApiClient.put).mockResolvedValue([dto]);

    const result = await hrisApiPublicHolidaysClient.replaceYear("calendar-id", 2026, request);

    expect(hrisApiClient.put).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/years/2026/holidays",
      request
    );
    expect(result).toEqual([dto]);
  });
});
