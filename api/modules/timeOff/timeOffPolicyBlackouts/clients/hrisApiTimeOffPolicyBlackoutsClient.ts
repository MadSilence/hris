import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyBlackoutDTO,
  UpdateTimeOffPolicyBlackoutsRequest,
} from "@/api/modules/timeOff/timeOffPolicyBlackouts/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyBlackoutsClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyBlackoutDTO[]> {
    return hrisApiClient.get<TimeOffPolicyBlackoutDTO[]>(
      `${this.BASE_PATH}/${policyId}/blackouts`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyBlackoutsRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyBlackoutsRequest>(
      `${this.BASE_PATH}/${policyId}/blackouts`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyBlackoutsClient =
  new HrisApiTimeOffPolicyBlackoutsClient();
