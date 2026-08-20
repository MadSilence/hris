import { partialMock } from "@/test/types";
﻿import { hrisApiTimeOffRequestsClient } from "@/api/modules/timeOff/timeOffRequests/clients";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";

jest.mock("@/api/modules/timeOff/timeOffRequests/clients", () => ({
  hrisApiTimeOffRequestsClient: {
    create: jest.fn(),
    getById: jest.fn(),
    listByUserId: jest.fn(),
    cancel: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  },
}));

describe("HrisTimeOffRequestsService", () => {
  const request = {
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

  it("delegates create to client", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisApiTimeOffRequestsClient.create)
      .mockResolvedValue(response);

    const body = {
      assignmentId: "assignment-id",
      startDate: "2026-07-14",
      endDate: "2026-07-18",
      reason: "Summer vacation",
    };

    const result = await hrisTimeOffRequestsService.create(body);

    expect(hrisApiTimeOffRequestsClient.create).toHaveBeenCalledWith(body);
    expect(result).toEqual(response);
  });

  it("delegates getById to client", async () => {
    jest
      .mocked(hrisApiTimeOffRequestsClient.getById)
      .mockResolvedValue(partialMock(request));

    const result = await hrisTimeOffRequestsService.getById("request-id");

    expect(hrisApiTimeOffRequestsClient.getById).toHaveBeenCalledWith(
      "request-id"
    );
    expect(result).toEqual(request);
  });

  it("delegates listByUserId to client", async () => {
    jest
      .mocked(hrisApiTimeOffRequestsClient.listByUserId)
      .mockResolvedValue(partialMock([request]));

    const result = await hrisTimeOffRequestsService.listByUserId("user-id");

    expect(hrisApiTimeOffRequestsClient.listByUserId).toHaveBeenCalledWith(
      "user-id"
    );
    expect(result).toEqual([request]);
  });

  it("delegates cancel to client", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisApiTimeOffRequestsClient.cancel)
      .mockResolvedValue(response);

    const result = await hrisTimeOffRequestsService.cancel("request-id", {
      cancellationReason: "Plans changed",
    });

    expect(hrisApiTimeOffRequestsClient.cancel).toHaveBeenCalledWith(
      "request-id",
      { cancellationReason: "Plans changed" }
    );
    expect(result).toEqual(response);
  });

  it("delegates approve to client", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisApiTimeOffRequestsClient.approve)
      .mockResolvedValue(response);

    const result = await hrisTimeOffRequestsService.approve("request-id");

    expect(hrisApiTimeOffRequestsClient.approve).toHaveBeenCalledWith(
      "request-id"
    );
    expect(result).toEqual(response);
  });

  it("delegates reject to client", async () => {
    const response = { id: "request-id" };

    jest
      .mocked(hrisApiTimeOffRequestsClient.reject)
      .mockResolvedValue(response);

    const result = await hrisTimeOffRequestsService.reject("request-id", {
      rejectionReason: "Insufficient notice period",
    });

    expect(hrisApiTimeOffRequestsClient.reject).toHaveBeenCalledWith(
      "request-id",
      { rejectionReason: "Insufficient notice period" }
    );
    expect(result).toEqual(response);
  });
});