import { hrisApiTimeOffPolicyRequestRulesClient } from "@/api/modules/timeOff/timeOffPolicyRequestRules/clients";
import type {
  TimeOffPolicyRequestRulesDTO,
  UpdateTimeOffPolicyRequestRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyRequestRulesService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyRequestRulesDTO> {
    return hrisApiTimeOffPolicyRequestRulesClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyRequestRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyRequestRulesClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyRequestRulesService =
  new HrisTimeOffPolicyRequestRulesService();
