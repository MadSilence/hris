import { internalApiClient } from "@/components/clients/apiClient";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";
import type { TimeOffAssignmentImpactDTO } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";

export class TimeOffPolicyAssignmentsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAssignment[]> {
    return internalApiClient.get<TimeOffPolicyAssignment[]>(
      `/time-off/policies/${policyId}/assignments`,
    );
  }

  /**
   * What assigning this policy to these people would produce. A POST because the question is about
   * a list; it changes nothing.
   */
  public async impact(
    policyId: string,
    userIds: string[]
  ): Promise<TimeOffAssignmentImpactDTO> {
    return internalApiClient.post<TimeOffAssignmentImpactDTO>(
      `/time-off/policies/${policyId}/assignments/impact`,
      { userIds },
    );
  }
}

export const timeOffPolicyAssignmentsService =
  new TimeOffPolicyAssignmentsService();
