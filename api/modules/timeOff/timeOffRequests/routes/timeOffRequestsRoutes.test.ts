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
    create: jest.fn(),
    getById: jest.fn(),
    listByUserId: jest.fn(),
    cancel: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
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

  it("creates time off request", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisTimeOffRequestsService.create)
      .mockResolvedValue(response);

    const body = {
      assignmentId: "assignment-id",
      startDate: "2026-07-14",
      endDate: "2026-07-18",
      reason: "Summer vacation",
    };

    const req = { json: async () => body } as Request;

    const res = await timeOffRequestsRoutes.create(req);
    const result = await res.json();

    expect(hrisTimeOffRequestsService.create).toHaveBeenCalledWith(body);
    expect(result).toEqual(response);
  });

  it("gets time off request by id", async () => {
    jest
      .mocked(hrisTimeOffRequestsService.getById)
      .mockResolvedValue(partialMock(requestDto));

    const res = await timeOffRequestsRoutes.getById(
      {} as Request,
      "request-id"
    );
    const result = await res.json();

    expect(hrisTimeOffRequestsService.getById).toHaveBeenCalledWith(
      "request-id"
    );
    expect(result).toEqual(requestDto);
  });

  it("lists time off requests by user id", async () => {
    jest
      .mocked(hrisTimeOffRequestsService.listByUserId)
      .mockResolvedValue(partialMock([requestDto]));

    const res = await timeOffRequestsRoutes.listByUserId(
      {} as Request,
      "user-id"
    );
    const result = await res.json();

    expect(hrisTimeOffRequestsService.listByUserId).toHaveBeenCalledWith(
      "user-id"
    );
    expect(result).toEqual([requestDto]);
  });

  it("cancels time off request", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisTimeOffRequestsService.cancel)
      .mockResolvedValue(response);

    const req = {
      json: async () => ({ cancellationReason: "Plans changed" }),
    } as Request;

    const res = await timeOffRequestsRoutes.cancel(req, "request-id");
    const result = await res.json();

    expect(hrisTimeOffRequestsService.cancel).toHaveBeenCalledWith(
      "request-id",
      { cancellationReason: "Plans changed" }
    );
    expect(result).toEqual(response);
  });

  it("approves time off request", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisTimeOffRequestsService.approve)
      .mockResolvedValue(response);

    const res = await timeOffRequestsRoutes.approve({} as Request, "request-id");
    const result = await res.json();

    expect(hrisTimeOffRequestsService.approve).toHaveBeenCalledWith(
      "request-id"
    );
    expect(result).toEqual(response);
  });

  it("rejects time off request", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisTimeOffRequestsService.reject)
      .mockResolvedValue(response);

    const req = {
      json: async () => ({ rejectionReason: "Insufficient notice period" }),
    } as Request;

    const res = await timeOffRequestsRoutes.reject(req, "request-id");
    const result = await res.json();

    expect(hrisTimeOffRequestsService.reject).toHaveBeenCalledWith(
      "request-id",
      { rejectionReason: "Insufficient notice period" }
    );
    expect(result).toEqual(response);
  });
});