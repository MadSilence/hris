"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import { bulkEditAction } from "@/components/modules/organization/components/BulkEdit/actions/bulkEditAction";
import type { BulkEditRequest, BulkEditResult } from "@/models/bulkEdit";
import {
  isTerminalJobStatus,
  type AssignmentJobStatusDTO,
} from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

export const useBulkEdit = () => {
  const queryClient = useQueryClient();
  return useMutation<BulkEditResult, Error, BulkEditRequest>({
    mutationFn: async (req) => {
      const res = await bulkEditAction(req);
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        throw new Error(res.errorMessage ?? "Bulk edit failed");
      }
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    },
  });
};

export const useBulkEditJob = (jobId: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AssignmentJobStatusDTO>({
    queryKey: ["BULK_EDIT_JOB", jobId],
    enabled: !!jobId,
    queryFn: () => internalApiClient.get<AssignmentJobStatusDTO>(`/users/bulk-edit/jobs/${jobId}`),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s && isTerminalJobStatus(s) ? false : 1200;
    },
  });
};
