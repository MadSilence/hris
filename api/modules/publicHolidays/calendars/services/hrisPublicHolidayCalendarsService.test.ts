import { hrisApiPublicHolidayCalendarsClient } from "@/api/modules/publicHolidays/calendars/clients";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import { PublicHolidayCalendarSourceType, PublicHolidayCalendarStatus, } from "@/api/modules/publicHolidays/calendars/dto";

jest.mock("@/api/modules/publicHolidays/calendars/clients", () => ({
  hrisApiPublicHolidayCalendarsClient: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    rename: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    archive: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("HrisPublicHolidayCalendarsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates create to client", async () => {
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

    jest.mocked(hrisApiPublicHolidayCalendarsClient.create).mockResolvedValue(response);

    const result = await hrisPublicHolidayCalendarsService.create(request);

    expect(hrisApiPublicHolidayCalendarsClient.create).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });

  it("delegates list to client", async () => {
    const response: any[] = [];

    jest.mocked(hrisApiPublicHolidayCalendarsClient.list).mockResolvedValue(response);

    const result = await hrisPublicHolidayCalendarsService.list();

    expect(hrisApiPublicHolidayCalendarsClient.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("delegates getById to client", async () => {
    const response = { id: "calendar-id" } as any;

    jest.mocked(hrisApiPublicHolidayCalendarsClient.getById).mockResolvedValue(response);

    const result = await hrisPublicHolidayCalendarsService.getById("calendar-id");

    expect(hrisApiPublicHolidayCalendarsClient.getById).toHaveBeenCalledWith("calendar-id");
    expect(result).toEqual(response);
  });

  it("delegates update to client", async () => {
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

    jest.mocked(hrisApiPublicHolidayCalendarsClient.update).mockResolvedValue(response);

    const result = await hrisPublicHolidayCalendarsService.update("calendar-id", request);

    expect(hrisApiPublicHolidayCalendarsClient.update).toHaveBeenCalledWith(
      "calendar-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates rename to client", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiPublicHolidayCalendarsClient.rename).mockResolvedValue(response);

    const result = await hrisPublicHolidayCalendarsService.rename("calendar-id", {
      name: "New name",
    });

    expect(hrisApiPublicHolidayCalendarsClient.rename).toHaveBeenCalledWith(
      "calendar-id",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("delegates actions to client", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisApiPublicHolidayCalendarsClient.activate).mockResolvedValue(response);
    jest.mocked(hrisApiPublicHolidayCalendarsClient.deactivate).mockResolvedValue(response);
    jest.mocked(hrisApiPublicHolidayCalendarsClient.archive).mockResolvedValue(response);
    jest.mocked(hrisApiPublicHolidayCalendarsClient.delete).mockResolvedValue(undefined);

    await expect(hrisPublicHolidayCalendarsService.activate("calendar-id")).resolves.toEqual(response);
    await expect(hrisPublicHolidayCalendarsService.deactivate("calendar-id")).resolves.toEqual(response);
    await expect(hrisPublicHolidayCalendarsService.archive("calendar-id")).resolves.toEqual(response);
    await expect(hrisPublicHolidayCalendarsService.delete("calendar-id")).resolves.toBeUndefined();

    expect(hrisApiPublicHolidayCalendarsClient.activate).toHaveBeenCalledWith("calendar-id");
    expect(hrisApiPublicHolidayCalendarsClient.deactivate).toHaveBeenCalledWith("calendar-id");
    expect(hrisApiPublicHolidayCalendarsClient.archive).toHaveBeenCalledWith("calendar-id");
    expect(hrisApiPublicHolidayCalendarsClient.delete).toHaveBeenCalledWith("calendar-id");
  });
});
