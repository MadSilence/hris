import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
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

class HrisApiRoleAssignmentsClient {
  private readonly BASE_PATH: string = "/roles";

  public async preview(
    roleId: string,
    payload: RoleAssignmentRequest,
  ): Promise<RoleAssignmentPreviewDTO> {
    return hrisApiClient.post<RoleAssignmentPreviewDTO>(
      `${this.BASE_PATH}/${roleId}/assignments/preview`,
      payload as unknown as Record<string, unknown>,
    );
  }

  public async apply(
    roleId: string,
    payload: RoleAssignmentRequest,
  ): Promise<RoleAssignmentApplyDTO> {
    return hrisApiClient.post<RoleAssignmentApplyDTO>(
      `${this.BASE_PATH}/${roleId}/assignments/apply`,
      payload as unknown as Record<string, unknown>,
    );
  }

  public async segmentPreview(
    roleId: string,
    payload: RoleSegmentPreviewRequest,
  ): Promise<RoleSegmentPreviewResponse> {
    return hrisApiClient.post<RoleSegmentPreviewResponse>(
      `${this.BASE_PATH}/${roleId}/assignments/segment/preview`,
      payload as unknown as Record<string, unknown>,
    );
  }

  public async segmentApply(
    roleId: string,
    payload: RoleSegmentApplyRequest,
  ): Promise<SegmentApplyResponse> {
    return hrisApiClient.post<SegmentApplyResponse>(
      `${this.BASE_PATH}/${roleId}/assignments/segment/apply`,
      payload as unknown as Record<string, unknown>,
    );
  }

  public async jobStatus(roleId: string, jobId: string): Promise<AssignmentJobStatusDTO> {
    return hrisApiClient.get<AssignmentJobStatusDTO>(
      `${this.BASE_PATH}/${roleId}/assignments/jobs/${jobId}`,
    );
  }

  public async getRules(
    roleId: string,
    params: { page?: number; size?: number; sort?: string },
  ): Promise<SpringPage<AssignmentRuleDTO>> {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.size != null) search.set("size", String(params.size));
    if (params.sort) search.set("sort", params.sort);

    const query = search.toString();
    return hrisApiClient.get<SpringPage<AssignmentRuleDTO>>(
      `${this.BASE_PATH}/${roleId}/assignments/rules${query ? `?${query}` : ""}`,
    );
  }
}

export const hrisApiRoleAssignmentsClient = new HrisApiRoleAssignmentsClient();
