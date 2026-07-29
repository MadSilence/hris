import { internalApiClient } from "@/components/clients/apiClient";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("TimeOffRequestsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets time off request by id", async () => {
    const response = { id: "request-id" };
    mockGet.mockResolvedValue(response);

    const result = await timeOffRequestsService.getById("request-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/requests/request-id");
    expect(result).toEqual(response);
  });

  it("lists time off requests by user id", async () => {
    const response = [{ id: "request-id" }];
    mockGet.mockResolvedValue(response);

    const result = await timeOffRequestsService.listByUserId("user-id");

    expect(mockGet).toHaveBeenCalledWith("/users/user-id/time-off-requests");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(timeOffRequestsService.getById("request-id")).rejects.toThrow("boom");
  });
});
