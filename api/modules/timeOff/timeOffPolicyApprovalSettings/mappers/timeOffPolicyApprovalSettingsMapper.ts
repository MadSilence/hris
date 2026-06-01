import type {
  TimeOffPolicyApprovalSettingsDTO,
  TimeOffPolicyApproverDTO,
} from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import type {
  TimeOffPolicyApprovalSettings,
  TimeOffPolicyApprover,
} from "@/models/timeOff";

export class TimeOffPolicyApprovalSettingsMapper {
  public mapTimeOffPolicyApproverDTO(
    dto: TimeOffPolicyApproverDTO
  ): TimeOffPolicyApprover {
    return {
      id: dto.id,
      approverType: dto.approverType,
      approverUserId: dto.approverUserId,
      approvalOrder: dto.approvalOrder,
      required: dto.required,
    };
  }

  public mapTimeOffPolicyApprovalSettingsDTO(
    dto: TimeOffPolicyApprovalSettingsDTO
  ): TimeOffPolicyApprovalSettings {
    return {
      policyId: dto.policyId,
      allApprovalsRequired: dto.allApprovalsRequired,
      approvalOrderStrict: dto.approvalOrderStrict,
      allowSubstituteApprovers: dto.allowSubstituteApprovers,
      approvers: dto.approvers.map((approver) =>
        this.mapTimeOffPolicyApproverDTO(approver)
      ),
    };
  }
}

export const timeOffPolicyApprovalSettingsMapper =
  new TimeOffPolicyApprovalSettingsMapper();