import { hrisApiTimeOffPolicyTenureRulesClient } from "@/api/modules/timeOff/timeOffPolicyTenureRules/clients";
import type {
  TimeOffPolicyTenureRuleDTO,
  UpdateTimeOffPolicyTenureRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyTenureRulesService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyTenureRuleDTO[]> {
    return hrisApiTimeOffPolicyTenureRulesClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyTenureRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyTenureRulesClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyTenureRulesService =
  new HrisTimeOffPolicyTenureRulesService();
