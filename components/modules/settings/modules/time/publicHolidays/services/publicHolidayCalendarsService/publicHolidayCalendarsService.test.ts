import { internalApiClient } from "@/components/clients/apiClient";
import {
  publicHolidayCalendarsService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidayCalendarsService/publicHolidayCalendarsService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("PublicHolidayCalendarsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday calendars", async () => {
    const response = [{ id: "calendar-id" }];
    mockGet.mockResolvedValue(response);

    const result = await publicHolidayCalendarsService.list();

    expect(mockGet).toHaveBeenCalledWith("/public-holiday/calendars");
    expect(result).toEqual(response);
  });

  it("gets public holiday calendar by id", async () => {
    const response = { id: "calendar-id" };
    mockGet.mockResolvedValue(response);

    const result = await publicHolidayCalendarsService.getById("calendar-id");

    expect(mockGet).toHaveBeenCalledWith("/public-holiday/calendars/calendar-id");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(publicHolidayCalendarsService.list()).rejects.toThrow("boom");
  });
});
