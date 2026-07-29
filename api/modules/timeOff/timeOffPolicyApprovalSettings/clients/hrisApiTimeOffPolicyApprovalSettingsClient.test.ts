import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiTimeOffPolicyApprovalSettingsClient } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/clients";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe("HrisApiTimeOffPolicyApprovalSettingsClient", () => {
  const dto = {
    policyId: "policy-id",
    allApprovalsRequired: true,
    approvalOrderStrict: false,
    allowSubstituteApprovers: false,
    approvers: [
      {
        id: "approver-id",
        approverType: TimeOffPolicyApproverType.SpecificUser,
        approverUserId: "user-id",
        approvalOrder: 1,
        required: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets approval settings by policy id", async () => {
    jest.mocked(hrisApiClient.get).mockResolvedValue(dto);

    const result =
      await hrisApiTimeOffPolicyApprovalSettingsClient.getByPolicyId(
        "policy-id"
      );

    expect(hrisApiClient.get).toHaveBeenCalledWith(
      "/time-off/policies/policy-id/approval-settings"
    );
    expect(result).toEqual(dto);
  });

  it("updates approval settings", async () => {
    jest.mocked(hrisApiClient.put).mockResolvedValue(dto);

    const request = {
      allApprovalsRequired: true,
      approvalOrderStrict: false,
      allowSubstituteApprovers: false,
      approvers: [
        {
          approverType: TimeOffPolicyApproverType.SpecificUser,
          approverUserId: "user-id",
          approvalOrder: 1,
          required: true,
        },
      ],
    };

    const result =
      await hrisApiTimeOffPolicyApprovalSettingsClient.update(
        "policy-id",
        request
      );

    expect(hrisApiClient.put).toHaveBeenCalledWith(
      "/time-off/policies/policy-id/approval-settings",
      request
    );
    expect(result).toEqual(dto);
  });
});