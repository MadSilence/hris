import { timeOffRequestMapper } from "@/api/modules/timeOff/timeOffRequests/mappers";
import type { TimeOffRequestDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";

describe("TimeOffRequestMapper", () => {
  const dto: TimeOffRequestDTO = {
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

  it("maps time off request dto to model", () => {
    expect(timeOffRequestMapper.mapTimeOffRequestDTO(dto)).toEqual(dto);
  });

  it("maps time off request dto array to models", () => {
    expect(timeOffRequestMapper.mapTimeOffRequestDTOs([dto])).toEqual([dto]);
  });
});