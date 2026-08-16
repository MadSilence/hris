import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyTenureRuleDTO,
  UpdateTimeOffPolicyTenureRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyTenureRulesClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyTenureRuleDTO[]> {
    return hrisApiClient.get<TimeOffPolicyTenureRuleDTO[]>(
      `${this.BASE_PATH}/${policyId}/tenure-rules`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyTenureRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyTenureRulesRequest>(
      `${this.BASE_PATH}/${policyId}/tenure-rules`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyTenureRulesClient =
  new HrisApiTimeOffPolicyTenureRulesClient();
