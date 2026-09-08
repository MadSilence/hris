import { hrisApiTimeOffPolicyAssignmentsClient } from "@/api/modules/timeOff/timeOffPolicyAssignments/clients";
import type {
  CreateTimeOffPolicyAssignmentRequest,
  EndTimeOffPolicyAssignmentRequest,
  TimeOffAssignmentImpactDTO,
} from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class HrisTimeOffPolicyAssignmentsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAssignment[]> {
    return hrisApiTimeOffPolicyAssignmentsClient.listByPolicyId(policyId);
  }

  public async create(
    policyId: string,
    body: CreateTimeOffPolicyAssignmentRequest
  ): Promise<CreateResponse> {
    return hrisApiTimeOffPolicyAssignmentsClient.create(policyId, body);
  }

  public async impact(
    policyId: string,
    userIds: string[]
  ): Promise<TimeOffAssignmentImpactDTO> {
    return hrisApiTimeOffPolicyAssignmentsClient.impact(policyId, userIds);
  }

  public async end(
    assignmentId: string,
    body: EndTimeOffPolicyAssignmentRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyAssignmentsClient.end(assignmentId, body);
  }
}

export const hrisTimeOffPolicyAssignmentsService =
  new HrisTimeOffPolicyAssignmentsService();