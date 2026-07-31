import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
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
import type { AssignedUsersPage } from "@/models/assignedUser";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";

export type AssignedUsersParams = { q?: string | null; cursor?: string | null; limit?: number };

class HrisApiAssignmentsClient {
  private assignmentsBase(basePath: string, id: string): string {
    return `${basePath}/${id}/assignments`;
  }

  public async listUsers(
    basePath: string,
    id: string,
    params: AssignedUsersParams,
  ): Promise<AssignedUsersPage> {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit != null) search.set("limit", String(params.limit));
    const query = search.toString();

    const response = await hrisApiClient.get<AssignedUsersPage>(
      `${basePath}/${id}/users${query ? `?${query}` : ""}`,
    );

    return {
      ...response,
      items: response.items.map((item) => ({
        ...item,
        avatarUrl: resolveBackendAssetUrl(item.avatarUrl),
      })),
    };
  }

  public async preview(
    basePath: string,
    id: string,
    body: AssignmentRequest,
  ): Promise<AssignmentPreviewDTO> {
    return hrisApiClient.post<AssignmentPreviewDTO>(
      `${this.assignmentsBase(basePath, id)}/preview`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async apply(
    basePath: string,
    id: string,
    body: AssignmentRequest,
  ): Promise<AssignmentApplyDTO> {
    return hrisApiClient.post<AssignmentApplyDTO>(
      `${this.assignmentsBase(basePath, id)}/apply`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async segmentPreview(
    basePath: string,
    id: string,
    body: SegmentPreviewRequest,
  ): Promise<SegmentPreviewResponse> {
    return hrisApiClient.post<SegmentPreviewResponse>(
      `${this.assignmentsBase(basePath, id)}/segment/preview`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async segmentApply(
    basePath: string,
    id: string,
    body: SegmentApplyRequest,
  ): Promise<SegmentApplyResponse> {
    return hrisApiClient.post<SegmentApplyResponse>(
      `${this.assignmentsBase(basePath, id)}/segment/apply`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async jobStatus(
    basePath: string,
    id: string,
    jobId: string,
  ): Promise<AssignmentJobStatusDTO> {
    return hrisApiClient.get<AssignmentJobStatusDTO>(
      `${this.assignmentsBase(basePath, id)}/jobs/${jobId}`,
    );
  }

  public async getRules(
    basePath: string,
    id: string,
    page = 0,
    size = 20,
  ): Promise<SpringPage<AssignmentRuleDTO>> {
    return hrisApiClient.get<SpringPage<AssignmentRuleDTO>>(
      `${this.assignmentsBase(basePath, id)}/rules?page=${page}&size=${size}&sort=createdAt,desc`,
    );
  }

  public async unassignUser(basePath: string, id: string, userId: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.assignmentsBase(basePath, id)}/users/${userId}`);
  }
}

export const hrisApiAssignmentsClient = new HrisApiAssignmentsClient();
