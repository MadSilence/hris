import { hrisApiTimeOffPolicyApprovalSettingsClient } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/clients";
import type { UpdateTimeOffPolicyApprovalSettingsRequest } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import type { TimeOffPolicyApprovalSettings } from "@/models/timeOff";

export class HrisTimeOffPolicyApprovalSettingsService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyApprovalSettings> {
    return hrisApiTimeOffPolicyApprovalSettingsClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyApprovalSettingsRequest
  ): Promise<TimeOffPolicyApprovalSettings> {
    return hrisApiTimeOffPolicyApprovalSettingsClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyApprovalSettingsService =
  new HrisTimeOffPolicyApprovalSettingsService();