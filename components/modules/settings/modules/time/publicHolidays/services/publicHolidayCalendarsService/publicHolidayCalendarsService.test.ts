import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService/publicHolidayCalendarsService";

describe("PublicHolidayCalendarsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("lists public holiday calendars", async () => {
    const response = [{ id: "calendar-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidayCalendarsService.list();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-calendars",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    expect(result).toEqual(response);
  });

  it("throws error when list fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      publicHolidayCalendarsService.list()
    ).rejects.toThrow("Failed to load public holiday calendars");
  });

  it("gets public holiday calendar by id", async () => {
    const response = { id: "calendar-id" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidayCalendarsService.getById(
      "calendar-id"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-calendars/calendar-id",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    expect(result).toEqual(response);
  });

  it("throws error when getById fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      publicHolidayCalendarsService.getById("calendar-id")
    ).rejects.toThrow("Failed to load public holiday calendar");
  });
});
