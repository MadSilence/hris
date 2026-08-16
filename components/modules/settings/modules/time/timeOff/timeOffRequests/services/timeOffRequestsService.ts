import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffRequest, TimeOffRequestDuration } from "@/models/timeOff";

export class TimeOffRequestsService {
  public async previewDuration(
    assignmentId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffRequestDuration> {
    const qs = new URLSearchParams({ assignmentId, startDate, endDate }).toString();
    return internalApiClient.get<TimeOffRequestDuration>(`/time-off/requests/duration?${qs}`);
  }

  public async getById(id: string): Promise<TimeOffRequest> {
    return internalApiClient.get<TimeOffRequest>(`/time-off/requests/${id}`);
  }

  public async listByUserId(userId: string): Promise<TimeOffRequest[]> {
    return internalApiClient.get<TimeOffRequest[]>(`/users/${userId}/time-off-requests`);
  }
}

export const timeOffRequestsService = new TimeOffRequestsService();
