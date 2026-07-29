import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class TimeOffPolicyAssignmentsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAssignment[]> {
    return internalApiClient.get<TimeOffPolicyAssignment[]>(
      `/time-off/policies/${policyId}/assignments`,
    );
  }
}

export const timeOffPolicyAssignmentsService =
  new TimeOffPolicyAssignmentsService();
