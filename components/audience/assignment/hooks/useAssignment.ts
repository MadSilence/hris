import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assignmentApplyAction,
  assignmentJobStatusAction,
  assignmentPreviewAction,
  assignmentRulesAction,
  assignmentSegmentApplyAction,
  assignmentSegmentPreviewAction,
  type AssignmentActionResult,
} from "@/components/audience/assignment/actions/assignmentActions";
import type {
  AssignmentApplyDTO,
  AssignmentPreviewDTO,
  AssignmentRequest,
  AssignmentRuleDTO,
  SpringPage,
} from "@/api/modules/assignments/dto/AssignmentDTO";
import {
  isTerminalJobStatus,
  type AssignmentJobStatusDTO,
  type SegmentApplyRequest,
  type SegmentApplyResponse,
  type SegmentPreviewRequest,
  type SegmentPreviewResponse,
} from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

const assignmentKeys = {
  job: (basePath: string, id: string, jobId: string) =>
    ["assignment", basePath, id, "job", jobId] as const,
  rules: (basePath: string, id: string, page: number) =>
    ["assignment", basePath, id, "rules", page] as const,
};

const unwrap = <T>(result: AssignmentActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR || result.data === undefined) {
    throw new Error(result.errorMessage ?? "Assignment request failed");
  }
  return result.data;
};

export const useAssignmentPreview = (basePath: string, id: string) =>
  useMutation<AssignmentPreviewDTO, Error, AssignmentRequest>({
    mutationFn: async (payload) => unwrap(await assignmentPreviewAction(basePath, id, payload)),
  });

export const useApplyAssignment = (
  basePath: string,
  id: string,
  invalidateKeys: QueryKey[] = [],
) => {
  const queryClient = useQueryClient();
  return useMutation<AssignmentApplyDTO, Error, AssignmentRequest>({
    mutationFn: async (payload) => unwrap(await assignmentApplyAction(basePath, id, payload)),
    onSuccess: async () => {
      for (const key of invalidateKeys) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
      await queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    },
  });
};

export const useSegmentPreview = (basePath: string, id: string) =>
  useMutation<SegmentPreviewResponse, Error, SegmentPreviewRequest>({
    mutationFn: async (payload) => unwrap(await assignmentSegmentPreviewAction(basePath, id, payload)),
  });

export const useApplySegment = (basePath: string, id: string) =>
  useMutation<SegmentApplyResponse, Error, SegmentApplyRequest>({
    mutationFn: async (payload) => unwrap(await assignmentSegmentApplyAction(basePath, id, payload)),
  });

export const useAssignmentJob = (basePath: string, id: string, jobId: string | null) =>
  useQuery<AssignmentJobStatusDTO>({
    queryKey: assignmentKeys.job(basePath, id, jobId ?? ""),
    enabled: Boolean(jobId),
    queryFn: async () => unwrap(await assignmentJobStatusAction(basePath, id, jobId as string)),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isTerminalJobStatus(status) ? false : 1500;
    },
  });

export const useAssignmentRules = (basePath: string, id: string, page = 0, size = 20) =>
  useQuery<SpringPage<AssignmentRuleDTO>>({
    queryKey: assignmentKeys.rules(basePath, id, page),
    queryFn: async () => unwrap(await assignmentRulesAction(basePath, id, page, size)),
  });
