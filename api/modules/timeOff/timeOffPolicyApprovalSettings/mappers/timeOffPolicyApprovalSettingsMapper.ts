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
    };
  }

  public mapTimeOffPolicyApprovalSettingsDTO(
    dto: TimeOffPolicyApprovalSettingsDTO
  ): TimeOffPolicyApprovalSettings {
    return {
      policyId: dto.policyId,
      configured: dto.configured,
      approvalRequired: dto.approvalRequired,
      approvalMode: dto.approvalMode,
      requiredApprovalsCount: dto.requiredApprovalsCount,
      allowSubstituteApprovers: dto.allowSubstituteApprovers,
      approvers: dto.approvers.map((approver) =>
        this.mapTimeOffPolicyApproverDTO(approver)
      ),
    };
  }
}

export const timeOffPolicyApprovalSettingsMapper =
  new TimeOffPolicyApprovalSettingsMapper();