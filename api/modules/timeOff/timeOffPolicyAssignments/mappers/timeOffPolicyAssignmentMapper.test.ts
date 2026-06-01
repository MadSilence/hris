import { timeOffPolicyAssignmentMapper } from "@/api/modules/timeOff/timeOffPolicyAssignments/mappers";
import type { TimeOffPolicyAssignmentDTO } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

describe("TimeOffPolicyAssignmentMapper", () => {
  const dto: TimeOffPolicyAssignmentDTO = {
    id: "assignment-id",
    policyId: "policy-id",
    userId: "user-id",
    status: TimeOffPolicyAssignmentStatus.Active,
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    endedAt: null,
    endedBy: null,
    createdAt: "2026-01-01T10:00:00",
    updatedAt: "2026-01-01T10:00:00",
  };

  it("maps time off policy assignment dto to model", () => {
    expect(
      timeOffPolicyAssignmentMapper.mapTimeOffPolicyAssignmentDTO(dto)
    ).toEqual(dto);
  });

  it("maps time off policy assignment dto array to models", () => {
    expect(
      timeOffPolicyAssignmentMapper.mapTimeOffPolicyAssignmentDTOs([dto])
    ).toEqual([dto]);
  });
});