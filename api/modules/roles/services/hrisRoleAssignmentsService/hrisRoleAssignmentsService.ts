import { hrisApiRoleAssignmentsClient } from "@/api/modules/roles/clients/hrisApiRoleAssignmentsClient";
import {
  AssignmentRuleDTO,
  RoleAssignmentApplyDTO,
  RoleAssignmentPreviewDTO,
  RoleAssignmentRequest,
  SpringPage,
} from "@/api/modules/roles/dto/RoleAssignmentDTO";
import {
  AssignmentJobStatusDTO,
  RoleSegmentApplyRequest,
  RoleSegmentPreviewRequest,
  RoleSegmentPreviewResponse,
  SegmentApplyResponse,
} from "@/api/modules/roles/dto/RoleSegmentAssignmentDTO";

export class HrisRoleAssignmentsService {
  public async preview(
    roleId: string,
    payload: RoleAssignmentRequest,
  ): Promise<RoleAssignmentPreviewDTO> {
    return hrisApiRoleAssignmentsClient.preview(roleId, payload);
  }

  public async apply(
    roleId: string,
    payload: RoleAssignmentRequest,
  ): Promise<RoleAssignmentApplyDTO> {
    return hrisApiRoleAssignmentsClient.apply(roleId, payload);
  }

  public async segmentPreview(
    roleId: string,
    payload: RoleSegmentPreviewRequest,
  ): Promise<RoleSegmentPreviewResponse> {
    return hrisApiRoleAssignmentsClient.segmentPreview(roleId, payload);
  }

  public async segmentApply(
    roleId: string,
    payload: RoleSegmentApplyRequest,
  ): Promise<SegmentApplyResponse> {
    return hrisApiRoleAssignmentsClient.segmentApply(roleId, payload);
  }

  public async jobStatus(roleId: string, jobId: string): Promise<AssignmentJobStatusDTO> {
    return hrisApiRoleAssignmentsClient.jobStatus(roleId, jobId);
  }

  public async getRules(
    roleId: string,
    params: { page?: number; size?: number; sort?: string },
  ): Promise<SpringPage<AssignmentRuleDTO>> {
    return hrisApiRoleAssignmentsClient.getRules(roleId, params);
  }
}

export const hrisRoleAssignmentsService = new HrisRoleAssignmentsService();
