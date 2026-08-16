import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyAccrualDTO,
  UpdateTimeOffPolicyAccrualRequest,
} from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyAccrualClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyAccrualDTO> {
    return hrisApiClient.get<TimeOffPolicyAccrualDTO>(
      `${this.BASE_PATH}/${policyId}/accrual`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyAccrualRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyAccrualRequest>(
      `${this.BASE_PATH}/${policyId}/accrual`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyAccrualClient =
  new HrisApiTimeOffPolicyAccrualClient();
