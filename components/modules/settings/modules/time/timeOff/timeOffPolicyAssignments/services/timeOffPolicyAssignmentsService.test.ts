import { internalApiClient } from "@/components/clients/apiClient";
import { timeOffPolicyAssignmentsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("TimeOffPolicyAssignmentsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists assignments by policy id", async () => {
    const response = [{ id: "assignment-id" }];
    mockGet.mockResolvedValue(response);

    const result = await timeOffPolicyAssignmentsService.listByPolicyId("policy-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/policies/policy-id/assignments");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(
      timeOffPolicyAssignmentsService.listByPolicyId("policy-id")
    ).rejects.toThrow("boom");
  });
});
