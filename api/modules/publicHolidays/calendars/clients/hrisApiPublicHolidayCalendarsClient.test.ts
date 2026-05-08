import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiPublicHolidayCalendarsClient } from "@/api/modules/publicHolidays/calendars/clients";
import { PublicHolidayCalendarSourceType, PublicHolidayCalendarStatus, } from "@/api/modules/publicHolidays/calendars/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("HrisApiPublicHolidayCalendarsClient", () => {
  const dto = {
    id: "calendar-id",
    name: "Poland 2026",
    year: 2026,
    status: PublicHolidayCalendarStatus.Active,
    sourceType: PublicHolidayCalendarSourceType.Manual,
    sourceExternalId: null,
    sourceCountryCode: "PL",
    sourceRegionCode: null,
    sourceLocale: "pl-PL",
    archivedAt: null,
    archivedBy: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates public holiday calendar", async () => {
    const response = { id: "calendar-id" };

    const request = {
      name: "Poland 2026",
      year: 2026,
      status: PublicHolidayCalendarStatus.Active,
      sourceType: PublicHolidayCalendarSourceType.Manual,
      sourceExternalId: null,
      sourceCountryCode: "PL",
      sourceRegionCode: null,
      sourceLocale: "pl-PL",
    };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.create(request);

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars",
      request
    );
    expect(result).toEqual(response);
  });

  it("lists public holiday calendars", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result = await hrisApiPublicHolidayCalendarsClient.list();

    expect(hrisApiClient.get).toHaveBeenCalledWith("/public-holiday-calendars");
    expect(result).toEqual([dto]);
  });

  it("gets public holiday calendar by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiPublicHolidayCalendarsClient.getById("calendar-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id"
    );
    expect(result).toEqual(dto);
  });

  it("updates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    const request = {
      name: "Poland updated",
      year: 2026,
      sourceType: PublicHolidayCalendarSourceType.Manual,
      sourceExternalId: null,
      sourceCountryCode: "PL",
      sourceRegionCode: null,
      sourceLocale: "pl-PL",
    };

    jest.mocked(hrisApiClient.patch).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.update(
      "calendar-id",
      request
    );

    expect(hrisApiClient.patch).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("renames public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.rename("calendar-id", {
      name: "New name",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/rename",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("activates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.activate("calendar-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/activate"
    );
    expect(result).toEqual(response);
  });

  it("deactivates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.deactivate("calendar-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/deactivate"
    );
    expect(result).toEqual(response);
  });

  it("archives public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidayCalendarsClient.archive("calendar-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/archive"
    );
    expect(result).toEqual(response);
  });

  it("deletes public holiday calendar", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(undefined);

    const result = await hrisApiPublicHolidayCalendarsClient.delete("calendar-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/delete"
    );
    expect(result).toBeUndefined();
  });
});
