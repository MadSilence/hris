import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyRequestRulesDTO,
  UpdateTimeOffPolicyRequestRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyRequestRulesClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyRequestRulesDTO> {
    return hrisApiClient.get<TimeOffPolicyRequestRulesDTO>(
      `${this.BASE_PATH}/${policyId}/request-rules`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyRequestRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyRequestRulesRequest>(
      `${this.BASE_PATH}/${policyId}/request-rules`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyRequestRulesClient =
  new HrisApiTimeOffPolicyRequestRulesClient();
