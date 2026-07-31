import { hrisApiAssignmentsClient, type AssignedUsersParams } from "@/api/modules/assignments/clients/hrisApiAssignmentsClient";
import type { AssignedUsersPage } from "@/models/assignedUser";
import type {
  AssignmentApplyDTO,
  AssignmentPreviewDTO,
  AssignmentRequest,
  AssignmentRuleDTO,
  SpringPage,
} from "@/api/modules/assignments/dto/AssignmentDTO";
import type {
  AssignmentJobStatusDTO,
  SegmentApplyRequest,
  SegmentApplyResponse,
  SegmentPreviewRequest,
  SegmentPreviewResponse,
} from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

export class HrisApiAssignmentsService {
  public async preview(
    basePath: string,
    id: string,
    body: AssignmentRequest,
  ): Promise<AssignmentPreviewDTO> {
    return hrisApiAssignmentsClient.preview(basePath, id, body);
  }

  public async apply(
    basePath: string,
    id: string,
    body: AssignmentRequest,
  ): Promise<AssignmentApplyDTO> {
    return hrisApiAssignmentsClient.apply(basePath, id, body);
  }

  public async segmentPreview(
    basePath: string,
    id: string,
    body: SegmentPreviewRequest,
  ): Promise<SegmentPreviewResponse> {
    return hrisApiAssignmentsClient.segmentPreview(basePath, id, body);
  }

  public async segmentApply(
    basePath: string,
    id: string,
    body: SegmentApplyRequest,
  ): Promise<SegmentApplyResponse> {
    return hrisApiAssignmentsClient.segmentApply(basePath, id, body);
  }

  public async jobStatus(
    basePath: string,
    id: string,
    jobId: string,
  ): Promise<AssignmentJobStatusDTO> {
    return hrisApiAssignmentsClient.jobStatus(basePath, id, jobId);
  }

  public async getRules(
    basePath: string,
    id: string,
    page = 0,
    size = 20,
  ): Promise<SpringPage<AssignmentRuleDTO>> {
    return hrisApiAssignmentsClient.getRules(basePath, id, page, size);
  }

  public async listUsers(
    basePath: string,
    id: string,
    params: AssignedUsersParams,
  ): Promise<AssignedUsersPage> {
    return hrisApiAssignmentsClient.listUsers(basePath, id, params);
  }

  public async unassignUser(basePath: string, id: string, userId: string): Promise<void> {
    return hrisApiAssignmentsClient.unassignUser(basePath, id, userId);
  }
}

export const hrisApiAssignmentsService = new HrisApiAssignmentsService();
