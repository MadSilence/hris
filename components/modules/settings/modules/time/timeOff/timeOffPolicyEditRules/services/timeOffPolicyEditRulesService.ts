import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyEditRulesDTO } from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";

export class TimeOffPolicyEditRulesService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyEditRulesDTO> {
    return internalApiClient.get<TimeOffPolicyEditRulesDTO>(
      `/time-off/policies/${policyId}/edit-rules`,
    );
  }
}

export const timeOffPolicyEditRulesService =
  new TimeOffPolicyEditRulesService();
