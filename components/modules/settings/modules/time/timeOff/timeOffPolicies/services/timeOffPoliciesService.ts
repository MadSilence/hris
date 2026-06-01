import type { TimeOffPolicy } from "@/models/timeOff";

export class TimeOffPoliciesService {
  public async list(): Promise<TimeOffPolicy[]> {
    const res = await fetch("/api/time-off/policies", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load time off policies");
    }

    return res.json();
  }

  public async getById(id: string): Promise<TimeOffPolicy> {
    const res = await fetch(`/api/time-off/policies/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load time off policy");
    }

    return res.json();
  }
}

export const timeOffPoliciesService = new TimeOffPoliciesService();
