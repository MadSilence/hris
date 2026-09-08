import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicy } from "@/models/timeOff";
import type { TimeOffPolicyEditImpactDTO } from "@/api/modules/timeOff/timeOffPolicies/dto";

export class TimeOffPoliciesService {
  public async list(): Promise<TimeOffPolicy[]> {
    return internalApiClient.get<TimeOffPolicy[]>("/time-off/policies");
  }

  public async getById(id: string): Promise<TimeOffPolicy> {
    return internalApiClient.get<TimeOffPolicy>(`/time-off/policies/${id}`);
  }

  /** What is already standing under the rules an edit would change. */
  public async editImpact(id: string): Promise<TimeOffPolicyEditImpactDTO> {
    return internalApiClient.get<TimeOffPolicyEditImpactDTO>(
      `/time-off/policies/${id}/edit-impact`
    );
  }
}

export const timeOffPoliciesService = new TimeOffPoliciesService();
