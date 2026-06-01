import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class TimeOffPolicyAssignmentsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAssignment[]> {
    const res = await fetch(
      `/api/time-off/policies/${policyId}/assignments`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load time off policy assignments");
    }

    return res.json();
  }
}

export const timeOffPolicyAssignmentsService =
  new TimeOffPolicyAssignmentsService();
