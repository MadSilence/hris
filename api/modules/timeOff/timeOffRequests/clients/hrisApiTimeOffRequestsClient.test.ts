import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiTimeOffRequestsClient } from "@/api/modules/timeOff/timeOffRequests/clients";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("HrisApiTimeOffRequestsClient", () => {
  const dto = {
    id: "request-id",
    userId: "user-id",
    policyId: "policy-id",
    assignmentId: "assignment-id",
    balanceId: "balance-id",
    status: TimeOffRequestStatus.Pending,
    startDate: "2026-07-14",
    endDate: "2026-07-18",
    requestedAmount: 5,
    reason: "Summer vacation",
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    createdAt: "2026-06-01T10:00:00",
    updatedAt: "2026-06-01T10:00:00",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates time off request", async () => {
    const response = { id: "request-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const request = {
      assignmentId: "assignment-id",
      startDate: "2026-07-14",
      endDate: "2026-07-18",
      reason: "Summer vacation",
    };

    const result = await hrisApiTimeOffRequestsClient.create(request);

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/requests",
      request
    );
    expect(result).toEqual(response);
  });

  it("gets time off request by id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result = await hrisApiTimeOffRequestsClient.getById("request-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/time-off/requests/request-id"
    );
    expect(result).toEqual(dto);
  });

  it("lists time off requests by user id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result =
      await hrisApiTimeOffRequestsClient.listByUserId("user-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/users/user-id/time-off-requests"
    );
    expect(result).toEqual([dto]);
  });

  it("cancels time off request", async () => {
    const response = { id: "request-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffRequestsClient.cancel("request-id", {
      cancellationReason: "Plans changed",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/requests/request-id/cancel",
      { cancellationReason: "Plans changed" }
    );
    expect(result).toEqual(response);
  });

  it("approves time off request", async () => {
    const response = { id: "request-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffRequestsClient.approve("request-id");

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/requests/request-id/approve"
    );
    expect(result).toEqual(response);
  });

  it("rejects time off request", async () => {
    const response = { id: "request-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffRequestsClient.reject("request-id", {
      rejectionReason: "Insufficient notice period",
    });

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/requests/request-id/reject",
      { rejectionReason: "Insufficient notice period" }
    );
    expect(result).toEqual(response);
  });
});