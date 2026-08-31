import type { PublicHoliday } from "@/models/publicHolidays/holiday";
import { partialMock } from "@/test/types";
import { hrisApiPublicHolidaysClient } from "@/api/modules/publicHolidays/holidays/clients";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

jest.mock("@/api/modules/publicHolidays/holidays/clients", () => ({
  hrisApiPublicHolidaysClient: {
    list: jest.fn(),
    replaceYear: jest.fn(),
  },
}));

describe("HrisPublicHolidaysService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates list to client", async () => {
    const response: never[] = [];

    jest.mocked(hrisApiPublicHolidaysClient.list).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.list("calendar-id");

    expect(hrisApiPublicHolidaysClient.list).toHaveBeenCalledWith("calendar-id", undefined);
    expect(result).toEqual(response);
  });

  it("passes the year through to the client", async () => {
    jest.mocked(hrisApiPublicHolidaysClient.list).mockResolvedValue([]);

    await hrisPublicHolidaysService.list("calendar-id", 2026);

    expect(hrisApiPublicHolidaysClient.list).toHaveBeenCalledWith("calendar-id", 2026);
  });

  it("delegates replaceYear to client", async () => {
    const response = [partialMock<PublicHoliday>({ id: "holiday-id" })];
    const request = { holidays: [] };

    jest.mocked(hrisApiPublicHolidaysClient.replaceYear).mockResolvedValue(response);

    const result = await hrisPublicHolidaysService.replaceYear("calendar-id", 2026, request);

    expect(hrisApiPublicHolidaysClient.replaceYear).toHaveBeenCalledWith(
      "calendar-id",
      2026,
      request
    );
    expect(result).toEqual(response);
  });
});
