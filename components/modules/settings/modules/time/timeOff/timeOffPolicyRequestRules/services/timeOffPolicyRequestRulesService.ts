import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyRequestRulesDTO } from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";

export class TimeOffPolicyRequestRulesService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyRequestRulesDTO> {
    return internalApiClient.get<TimeOffPolicyRequestRulesDTO>(
      `/time-off/policies/${policyId}/request-rules`,
    );
  }
}

export const timeOffPolicyRequestRulesService =
  new TimeOffPolicyRequestRulesService();
