import {
  publicHolidaysService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService/publicHolidaysService";

describe("PublicHolidaysService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("lists public holidays", async () => {
    const response = [{ id: "holiday-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await publicHolidaysService.list("calendar-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/public-holiday-calendars/calendar-id/holidays",
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
      publicHolidaysService.list("calendar-id")
    ).rejects.toThrow("Failed to load public holidays");
  });
});
