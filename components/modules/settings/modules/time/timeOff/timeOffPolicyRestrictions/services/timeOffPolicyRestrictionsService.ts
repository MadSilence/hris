import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyRestrictionDTO } from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";

export class TimeOffPolicyRestrictionsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyRestrictionDTO[]> {
    return internalApiClient.get<TimeOffPolicyRestrictionDTO[]>(
      `/time-off/policies/${policyId}/restrictions`,
    );
  }
}

export const timeOffPolicyRestrictionsService =
  new TimeOffPolicyRestrictionsService();
