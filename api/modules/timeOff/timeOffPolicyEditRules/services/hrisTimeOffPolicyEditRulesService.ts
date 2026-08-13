import { hrisApiTimeOffPolicyEditRulesClient } from "@/api/modules/timeOff/timeOffPolicyEditRules/clients";
import type {
  TimeOffPolicyEditRulesDTO,
  UpdateTimeOffPolicyEditRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyEditRulesService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyEditRulesDTO> {
    return hrisApiTimeOffPolicyEditRulesClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyEditRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyEditRulesClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyEditRulesService =
  new HrisTimeOffPolicyEditRulesService();
