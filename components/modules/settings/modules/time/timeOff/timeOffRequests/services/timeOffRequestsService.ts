import type { TimeOffRequest } from "@/models/timeOff";

export class TimeOffRequestsService {
  public async getById(id: string): Promise<TimeOffRequest> {
    const res = await fetch(`/api/time-off/requests/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load time off request");
    }

    return res.json();
  }

  public async listByUserId(userId: string): Promise<TimeOffRequest[]> {
    const res = await fetch(`/api/users/${userId}/time-off-requests`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load time off requests");
    }

    return res.json();
  }
}

export const timeOffRequestsService = new TimeOffRequestsService();
