import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicy } from "@/models/timeOff";

export class TimeOffPoliciesService {
  public async list(): Promise<TimeOffPolicy[]> {
    return internalApiClient.get<TimeOffPolicy[]>("/time-off/policies");
  }

  public async getById(id: string): Promise<TimeOffPolicy> {
    return internalApiClient.get<TimeOffPolicy>(`/time-off/policies/${id}`);
  }
}

export const timeOffPoliciesService = new TimeOffPoliciesService();
