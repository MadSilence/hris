import { internalApiClient } from "@/components/clients/apiClient";
import { timeOffPolicyApprovalSettingsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/services/timeOffPolicyApprovalSettingsService";

jest.mock("@/components/clients/apiClient", () => ({
  internalApiClient: { get: jest.fn() },
}));

const mockGet = internalApiClient.get as jest.Mock;

describe("TimeOffPolicyApprovalSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets approval settings by policy id", async () => {
    const response = { policyId: "policy-id", approvers: [] };
    mockGet.mockResolvedValue(response);

    const result = await timeOffPolicyApprovalSettingsService.getByPolicyId("policy-id");

    expect(mockGet).toHaveBeenCalledWith("/time-off/policies/policy-id/approval-settings");
    expect(result).toEqual(response);
  });

  it("propagates errors from the api client", async () => {
    mockGet.mockRejectedValue(new Error("boom"));

    await expect(
      timeOffPolicyApprovalSettingsService.getByPolicyId("policy-id")
    ).rejects.toThrow("boom");
  });
});
