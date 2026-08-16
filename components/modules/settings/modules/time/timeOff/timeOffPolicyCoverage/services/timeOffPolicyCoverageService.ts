import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyCoverageDTO } from "@/api/modules/timeOff/timeOffPolicyCoverage/dto";

export class TimeOffPolicyCoverageService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyCoverageDTO> {
    return internalApiClient.get<TimeOffPolicyCoverageDTO>(
      `/time-off/policies/${policyId}/coverage`,
    );
  }
}

export const timeOffPolicyCoverageService =
  new TimeOffPolicyCoverageService();
