import { timeOffPolicyApprovalSettingsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/services/timeOffPolicyApprovalSettingsService";

describe("TimeOffPolicyApprovalSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("gets approval settings by policy id", async () => {
    const response = { policyId: "policy-id", approvers: [] };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    const result =
      await timeOffPolicyApprovalSettingsService.getByPolicyId("policy-id");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/time-off/policies/policy-id/approval-settings",
      { method: "GET", credentials: "include", cache: "no-store" }
    );
    expect(result).toEqual(response);
  });

  it("throws error when getByPolicyId fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      timeOffPolicyApprovalSettingsService.getByPolicyId("policy-id")
    ).rejects.toThrow("Failed to load time off policy approval settings");
  });
});
