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
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapTimeOffPolicyApprovalSettingsDTO(
    dto: TimeOffPolicyApprovalSettingsDTO
  ): TimeOffPolicyApprovalSettings {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      approvers: dto.approvers.map((approver) =>
        this.mapTimeOffPolicyApproverDTO(approver)
      ),
    };
  }
}

export const timeOffPolicyApprovalSettingsMapper =
  new TimeOffPolicyApprovalSettingsMapper();