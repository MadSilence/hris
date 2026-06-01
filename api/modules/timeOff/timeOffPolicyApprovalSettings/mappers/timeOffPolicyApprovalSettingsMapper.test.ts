import { timeOffPolicyApprovalSettingsMapper } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/mappers";
import type {
  TimeOffPolicyApprovalSettingsDTO,
} from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import { TimeOffPolicyApproverType } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";

describe("TimeOffPolicyApprovalSettingsMapper", () => {
  const dto: TimeOffPolicyApprovalSettingsDTO = {
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
      {
        id: "approver-id-2",
        approverType: TimeOffPolicyApproverType.Manager,
        approverUserId: null,
        approvalOrder: 2,
        required: false,
      },
    ],
  };

  it("maps time off policy approval settings dto to model", () => {
    const result =
      timeOffPolicyApprovalSettingsMapper.mapTimeOffPolicyApprovalSettingsDTO(dto);

    expect(result).toEqual({
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
        {
          id: "approver-id-2",
          approverType: TimeOffPolicyApproverType.Manager,
          approverUserId: null,
          approvalOrder: 2,
          required: false,
        },
      ],
    });
  });

  it("maps time off policy approver dto to model", () => {
    const approverDto = dto.approvers[0];
    const result =
      timeOffPolicyApprovalSettingsMapper.mapTimeOffPolicyApproverDTO(approverDto);

    expect(result).toEqual({
      id: "approver-id",
      approverType: TimeOffPolicyApproverType.SpecificUser,
      approverUserId: "user-id",
      approvalOrder: 1,
      required: true,
    });
  });
});