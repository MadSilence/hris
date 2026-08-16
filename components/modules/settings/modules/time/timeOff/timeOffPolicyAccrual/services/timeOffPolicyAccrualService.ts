import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyAccrualDTO } from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";

export class TimeOffPolicyAccrualService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAccrualDTO> {
    return internalApiClient.get<TimeOffPolicyAccrualDTO>(
      `/time-off/policies/${policyId}/accrual`,
    );
  }
}

export const timeOffPolicyAccrualService =
  new TimeOffPolicyAccrualService();
