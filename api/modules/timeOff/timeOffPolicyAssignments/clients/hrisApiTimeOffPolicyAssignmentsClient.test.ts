import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiTimeOffPolicyAssignmentsClient } from "@/api/modules/timeOff/timeOffPolicyAssignments/clients";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("HrisApiTimeOffPolicyAssignmentsClient", () => {
  const dto = {
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

  it("lists assignments by policy id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue([dto]);

    const result =
      await hrisApiTimeOffPolicyAssignmentsClient.listByPolicyId("policy-id");

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/assignments"
    );
    expect(result).toEqual([dto]);
  });

  it("creates assignment", async () => {
    const response = { id: "assignment-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const request = {
      userId: "user-id",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
    };

    const result = await hrisApiTimeOffPolicyAssignmentsClient.create(
      "policy-id",
      request
    );

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/assignments",
      request
    );
    expect(result).toEqual(response);
  });

  it("ends assignment", async () => {
    const response = { id: "assignment-id" };

    jest.mocked(hrisApiClient.post).mockResolvedValue(response);

    const result = await hrisApiTimeOffPolicyAssignmentsClient.end(
      "assignment-id",
      { effectiveTo: "2026-06-30" }
    );

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/time-off/policy-assignments/assignment-id/end",
      { effectiveTo: "2026-06-30" }
    );
    expect(result).toEqual(response);
  });
});