import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("HrisApiPublicHolidaysClient", () => {
  const dto = {
    id: "holiday-id",
    calendarId: "calendar-id",
    calendarYear: 2026,
    name: "New Year",
    holidayDate: "2026-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates public holiday", async () => {
    const response = { id: "holiday-id" };
    const request = {
      name: "New Year",
      holidayDate: "2026-01-01",
    };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidaysClient.create("calendar-id", request);

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/holidays",
      request
    );
    expect(result).toEqual(response);
  });

  it("lists public holidays by calendar", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result = await hrisApiPublicHolidaysClient.list("calendar-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/public-holiday-calendars/calendar-id/holidays"
    );
    expect(result).toEqual([dto]);
  });

  it("gets public holiday by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiPublicHolidaysClient.getById("holiday-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith("/public-holidays/holiday-id");
    expect(result).toEqual(dto);
  });

  it("updates public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };
    const request = {
      name: "Updated holiday",
      holidayDate: "2026-01-02",
    };

    jest.mocked(hrisApiClient.patch).mockResolvedValue(response);

    const result = await hrisApiPublicHolidaysClient.update("holiday-id", request);

    expect(hrisApiClient.patch).toHaveBeenCalledWith(
      "/public-holidays/holiday-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("renames public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiPublicHolidaysClient.rename("holiday-id", {
      name: "New name",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holidays/holiday-id/rename",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("deletes public holiday", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(undefined);

    const result = await hrisApiPublicHolidaysClient.delete("holiday-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/public-holidays/holiday-id/delete"
    );
    expect(result).toBeUndefined();
  });
});
