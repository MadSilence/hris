import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyEditRulesDTO,
  UpdateTimeOffPolicyEditRulesRequest,
} from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyEditRulesClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyEditRulesDTO> {
    return hrisApiClient.get<TimeOffPolicyEditRulesDTO>(
      `${this.BASE_PATH}/${policyId}/edit-rules`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyEditRulesRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyEditRulesRequest>(
      `${this.BASE_PATH}/${policyId}/edit-rules`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyEditRulesClient =
  new HrisApiTimeOffPolicyEditRulesClient();
