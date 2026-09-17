import { partialMock } from "@/test/types";
﻿class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: ResponseInit
  ) {
    this.status = init?.status ?? 200;
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: ResponseInit) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

import { timeOffRequestsRoutes } from "@/api/modules/timeOff/timeOffRequests/routes";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";

jest.mock("@/api/modules/timeOff/timeOffRequests/services", () => ({
  hrisTimeOffRequestsService: {
    listByUserId: jest.fn(),
  },
}));

describe("TimeOffRequestsRoutes", () => {
  const requestDto = {
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

  it("lists time off requests by user id", async () => {
    jest
      .mocked(hrisTimeOffRequestsService.listByUserId)
      .mockResolvedValue(partialMock([requestDto]));

    // The route now reads year/status off the query string, so it needs a real URL.
    const res = await timeOffRequestsRoutes.listByUserId(
      { url: "http://localhost/api/users/user-id/time-off-requests" } as Request,
      "user-id"
    );
    const result = await res.json();

    expect(hrisTimeOffRequestsService.listByUserId).toHaveBeenCalledWith(
      "user-id",
      { year: null, status: null }
    );
    expect(result).toEqual([requestDto]);
  });
});