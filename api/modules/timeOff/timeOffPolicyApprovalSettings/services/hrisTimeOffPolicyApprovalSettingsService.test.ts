import { hrisApiTimeOffPolicyApprovalSettingsClient } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/clients";
import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicyApprovalSettings/clients", () => ({
  hrisApiTimeOffPolicyApprovalSettingsClient: {
    getByPolicyId: jest.fn(),
    update: jest.fn(),
  },
}));

describe("HrisTimeOffPolicyApprovalSettingsService", () => {
  const settings = {
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

  it("delegates getByPolicyId to client", async () => {
    jest
      .mocked(hrisApiTimeOffPolicyApprovalSettingsClient.getByPolicyId)
      .mockResolvedValue(settings as any);

    const result =
      await hrisTimeOffPolicyApprovalSettingsService.getByPolicyId("policy-id");

    expect(
      hrisApiTimeOffPolicyApprovalSettingsClient.getByPolicyId
    ).toHaveBeenCalledWith("policy-id");
    expect(result).toEqual(settings);
  });

  it("delegates update to client", async () => {
    jest
      .mocked(hrisApiTimeOffPolicyApprovalSettingsClient.update)
      .mockResolvedValue(settings as any);

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

    const result = await hrisTimeOffPolicyApprovalSettingsService.update(
      "policy-id",
      request
    );

    expect(
      hrisApiTimeOffPolicyApprovalSettingsClient.update
    ).toHaveBeenCalledWith("policy-id", request);
    expect(result).toEqual(settings);
  });
});