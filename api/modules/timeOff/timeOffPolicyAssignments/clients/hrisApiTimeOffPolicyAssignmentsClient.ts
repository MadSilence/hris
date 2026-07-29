import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyAssignmentDTO,
  CreateTimeOffPolicyAssignmentRequest,
  EndTimeOffPolicyAssignmentRequest,
} from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import { timeOffPolicyAssignmentMapper } from "@/api/modules/timeOff/timeOffPolicyAssignments/mappers";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

export class HrisApiTimeOffPolicyAssignmentsClient {
  private readonly POLICIES_PATH = "/time-off/policies";
  private readonly ASSIGNMENTS_PATH = "/time-off/policy-assignments";

  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyAssignment[]> {
    const dtos = await hrisApiClient.get<TimeOffPolicyAssignmentDTO[]>(
      `${this.POLICIES_PATH}/${policyId}/assignments`
    );

    return timeOffPolicyAssignmentMapper.mapTimeOffPolicyAssignmentDTOs(dtos);
  }

  public async create(
    policyId: string,
    body: CreateTimeOffPolicyAssignmentRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      `${this.POLICIES_PATH}/${policyId}/assignments`,
      body as unknown as Record<string, unknown>
    );
  }

  public async end(
    assignmentId: string,
    body: EndTimeOffPolicyAssignmentRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.ASSIGNMENTS_PATH}/${assignmentId}/end`,
      body as unknown as Record<string, unknown>
    );
  }
}

export const hrisApiTimeOffPolicyAssignmentsClient =
  new HrisApiTimeOffPolicyAssignmentsClient();