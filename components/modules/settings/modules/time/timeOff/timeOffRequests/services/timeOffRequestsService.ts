import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffRequest } from "@/models/timeOff";

export class TimeOffRequestsService {
  public async getById(id: string): Promise<TimeOffRequest> {
    return internalApiClient.get<TimeOffRequest>(`/time-off/requests/${id}`);
  }

  public async listByUserId(userId: string): Promise<TimeOffRequest[]> {
    return internalApiClient.get<TimeOffRequest[]>(`/users/${userId}/time-off-requests`);
  }
}

export const timeOffRequestsService = new TimeOffRequestsService();
