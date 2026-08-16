import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyBlackoutDTO } from "@/api/modules/timeOff/timeOffPolicyBlackouts/dto";

export class TimeOffPolicyBlackoutsService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyBlackoutDTO[]> {
    return internalApiClient.get<TimeOffPolicyBlackoutDTO[]>(
      `/time-off/policies/${policyId}/blackouts`,
    );
  }
}

export const timeOffPolicyBlackoutsService =
  new TimeOffPolicyBlackoutsService();
