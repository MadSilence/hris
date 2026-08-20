import type { UpdateResponse } from "@/api/models/misc";
import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";
import { updateTimeOffPolicyApprovalSettingsAction } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/actions/updateTimeOffPolicyApprovalSettingsAction/updateTimeOffPolicyApprovalSettingsAction";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

jest.mock("@/api/modules/timeOff/timeOffPolicyApprovalSettings/services", () => ({
  hrisTimeOffPolicyApprovalSettingsService: { update: jest.fn() },
}));

describe("updateTimeOffPolicyApprovalSettingsAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const submission = {
    policyId: "policy-id",
    allApprovalsRequired: true,
    approvalOrderStrict: false,
    allowSubstituteApprovers: false,
    approvers: [{ approverType: TimeOffPolicyApproverType.SpecificUser, approverUserId: "user-id", approvalOrder: 1, required: true }],
  };

  it("updates approval settings", async () => {
    // update resolves an UpdateResponse — the old mock returned a settings-shaped object.
    const response: UpdateResponse = { id: "policy-id" };
    jest.mocked(hrisTimeOffPolicyApprovalSettingsService.update).mockResolvedValue(response);

    const result = await updateTimeOffPolicyApprovalSettingsAction(submission);

    const { policyId, ...body } = submission;
    expect(hrisTimeOffPolicyApprovalSettingsService.update).toHaveBeenCalledWith(policyId, body);
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: response });
  });

  it("returns error status when update fails", async () => {
    jest.mocked(hrisTimeOffPolicyApprovalSettingsService.update).mockRejectedValue(new Error("Failed"));

    const result = await updateTimeOffPolicyApprovalSettingsAction(submission);

    expect(result.status).toBe(ActionStatus.ERROR);
  });
});
