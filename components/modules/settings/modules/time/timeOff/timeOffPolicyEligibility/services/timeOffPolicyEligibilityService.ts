import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyEligibilityDTO } from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";

export class TimeOffPolicyEligibilityService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyEligibilityDTO> {
    return internalApiClient.get<TimeOffPolicyEligibilityDTO>(
      `/time-off/policies/${policyId}/eligibility`,
    );
  }
}

export const timeOffPolicyEligibilityService =
  new TimeOffPolicyEligibilityService();
