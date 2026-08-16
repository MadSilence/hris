import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyTenureRuleDTO } from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";

export class TimeOffPolicyTenureRulesService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyTenureRuleDTO[]> {
    return internalApiClient.get<TimeOffPolicyTenureRuleDTO[]>(
      `/time-off/policies/${policyId}/tenure-rules`,
    );
  }
}

export const timeOffPolicyTenureRulesService =
  new TimeOffPolicyTenureRulesService();
