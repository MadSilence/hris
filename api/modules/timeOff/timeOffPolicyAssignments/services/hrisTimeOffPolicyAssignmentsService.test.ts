import { hrisApiTimeOffPolicyAssignmentsClient } from "@/api/modules/timeOff/timeOffPolicyAssignments/clients";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicyAssignments/clients", () => ({
  hrisApiTimeOffPolicyAssignmentsClient: {
    listByPolicyId: jest.fn(),
    create: jest.fn(),
    end: jest.fn(),
  },
}));

describe("HrisTimeOffPolicyAssignmentsService", () => {
  const assignment = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates listByPolicyId to client", async () => {
    jest
      .mocked(hrisApiTimeOffPolicyAssignmentsClient.listByPolicyId)
      .mockResolvedValue([assignment] as any);

    const result =
      await hrisTimeOffPolicyAssignmentsService.listByPolicyId("policy-id");

    expect(
      hrisApiTimeOffPolicyAssignmentsClient.listByPolicyId
    ).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual([assignment]);
  });

  it("delegates create to client", async () => {
    const response = { id: "assignment-id" };

    jest
      .mocked(hrisApiTimeOffPolicyAssignmentsClient.create)
      .mockResolvedValue(response);

    const request = {
      userId: "user-id",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
    };

    const result = await hrisTimeOffPolicyAssignmentsService.create(
      "policy-id",
      request
    );

    expect(hrisApiTimeOffPolicyAssignmentsClient.create).toHaveBeenCalledWith(
      "policy-id",
      request
    );
    expect(result).toEqual(response);
  });

  it("delegates end to client", async () => {
    const response = { id: "assignment-id" };

    jest
      .mocked(hrisApiTimeOffPolicyAssignmentsClient.end)
      .mockResolvedValue(response);

    const result = await hrisTimeOffPolicyAssignmentsService.end(
      "assignment-id",
      { effectiveTo: "2026-06-30" }
    );

    expect(hrisApiTimeOffPolicyAssignmentsClient.end).toHaveBeenCalledWith(
      "assignment-id",
      { effectiveTo: "2026-06-30" }
    );
    expect(result).toEqual(response);
  });
});