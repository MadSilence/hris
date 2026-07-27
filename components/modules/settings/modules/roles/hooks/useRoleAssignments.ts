import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import {
  AssignmentRuleDTO,
  RoleAssignmentApplyDTO,
  RoleAssignmentPreviewDTO,
  RoleAssignmentRequest,
  SpringPage,
} from "@/api/modules/roles/dto/RoleAssignmentDTO";
import {
  AssignmentJobStatusDTO,
  isTerminalJobStatus,
  RoleSegmentApplyRequest,
  RoleSegmentPreviewRequest,
  RoleSegmentPreviewResponse,
  SegmentApplyResponse,
} from "@/api/modules/roles/dto/RoleSegmentAssignmentDTO";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";

// Dry run: returns who would be added and who would be skipped, plus the summary counts.
export const useRoleAssignmentPreview = (roleId: string) => {
  const { internalApiClient } = useAppDataContext();

  return useMutation<RoleAssignmentPreviewDTO, Error, RoleAssignmentRequest>({
    mutationFn: (payload) =>
      internalApiClient.post<RoleAssignmentPreviewDTO>(
        `/roles/${roleId}/assignments/preview`,
        payload as unknown as Record<string, unknown>,
      ),
  });
};

// Applies the assignment. The engine only ADDS users — it never removes anyone.
export const useApplyRoleAssignment = (roleId: string) => {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();

  return useMutation<RoleAssignmentApplyDTO, Error, RoleAssignmentRequest>({
    mutationFn: (payload) =>
      internalApiClient.post<RoleAssignmentApplyDTO>(
        `/roles/${roleId}/assignments/apply`,
        payload as unknown as Record<string, unknown>,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesQueryKeys.roles() });
      await queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    },
  });
};

// Segment dry run for a role: total matched + who would be added / skipped, page by page.
// Read-only and repeatable — independent of apply.
export const useRoleSegmentPreview = (roleId: string) => {
  const { internalApiClient } = useAppDataContext();

  return useMutation<RoleSegmentPreviewResponse, Error, RoleSegmentPreviewRequest>({
    mutationFn: (payload) =>
      internalApiClient.post<RoleSegmentPreviewResponse>(
        `/roles/${roleId}/assignments/segment/preview`,
        payload as unknown as Record<string, unknown>,
      ),
  });
};

// Async segment apply: submits the job and returns its id (202). Only adds users; the
// audience is snapshotted at submit time. Poll status with useRoleAssignmentJob.
export const useApplyRoleSegment = (roleId: string) => {
  const { internalApiClient } = useAppDataContext();

  return useMutation<SegmentApplyResponse, Error, RoleSegmentApplyRequest>({
    mutationFn: (payload) =>
      internalApiClient.post<SegmentApplyResponse>(
        `/roles/${roleId}/assignments/segment/apply`,
        payload as unknown as Record<string, unknown>,
      ),
  });
};

// Polls a segment-apply job until it reaches a terminal state (COMPLETED / FAILED).
// Enabled only while a jobId is set; caller invalidates role/people caches on completion.
export const useRoleAssignmentJob = (roleId: string, jobId: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<AssignmentJobStatusDTO>({
    queryKey: rolesQueryKeys.roleAssignmentJob(roleId, jobId ?? ""),
    enabled: Boolean(jobId),
    queryFn: () =>
      internalApiClient.get<AssignmentJobStatusDTO>(
        `/roles/${roleId}/assignments/jobs/${jobId}`,
      ),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isTerminalJobStatus(status) ? false : 1500;
    },
  });
};

// Journal of applied operations. Rules cannot be created or edited directly.
export const useRoleAssignmentRules = (roleId: string, page = 0, size = 20) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<SpringPage<AssignmentRuleDTO>>({
    queryKey: rolesQueryKeys.roleAssignmentRules(roleId, page),
    queryFn: () =>
      internalApiClient.get<SpringPage<AssignmentRuleDTO>>(
        `/roles/${roleId}/assignments/rules?page=${page}&size=${size}&sort=createdAt,desc`,
      ),
  });
};
