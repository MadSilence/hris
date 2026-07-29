import { internalApiClient } from "@/components/clients/apiClient";
import {
  publicHolidaysService
} from "@/components/modules/settings/modules/time/publicHolidays/services/publicHolidaysService/publicHolidaysService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("PublicHolidaysService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holidays", async () => {
    const response = [{ id: "holiday-id" }];
    mockGet.mockResolvedValue(response);

    const result = await publicHolidaysService.list("calendar-id");

    expect(mockGet).toHaveBeenCalledWith("/public-holiday/calendars/calendar-id/holidays");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(publicHolidaysService.list("calendar-id")).rejects.toThrow("boom");
  });
});
