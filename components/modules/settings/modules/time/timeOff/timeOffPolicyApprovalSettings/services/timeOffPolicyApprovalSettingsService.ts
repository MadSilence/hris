import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyApprovalSettings } from "@/models/timeOff";

export class TimeOffPolicyApprovalSettingsService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyApprovalSettings> {
    return internalApiClient.get<TimeOffPolicyApprovalSettings>(
      `/time-off/policies/${policyId}/approval-settings`,
    );
  }
}

export const timeOffPolicyApprovalSettingsService =
  new TimeOffPolicyApprovalSettingsService();
