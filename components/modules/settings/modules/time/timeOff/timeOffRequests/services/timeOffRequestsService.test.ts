import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

describe("TimeOffRequestsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("gets time off request by id", async () => {
    const response = { id: "request-id" };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await timeOffRequestsService.getById("request-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/requests/request-id",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when getById fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      timeOffRequestsService.getById("request-id")
    ).rejects.toThrow("Failed to load time off request");
  });

  it("lists time off requests by user id", async () => {
    const response = [{ id: "request-id" }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result = await timeOffRequestsService.listByUserId("user-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/users/user-id/time-off-requests",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when listByUserId fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      timeOffRequestsService.listByUserId("user-id")
    ).rejects.toThrow("Failed to load time off requests");
  });
});
