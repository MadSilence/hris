"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import {
  createReportAction,
  deleteReportAction,
  duplicateReportAction,
  publishReportAction,
  revokeReportPublicationAction,
  shareReportAction,
  unshareReportAction,
  updateReportAction,
  updateReportShareAction,
} from "@/components/modules/reports/actions";
import { reportQueryKeys } from "./reportQueryKeys";

/**
 * An ERROR envelope becomes a rejected mutation — what react-query needs. The message is already the
 * catalogue's, in the request's language; `code` is kept for a caller that branches on the reason.
 */
const unwrap = <T,>(result: ActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR) {
    const error = new Error(result.errorMessage ?? "The request failed.") as Error & { code?: string };
    error.code = result.code;
    throw error;
  }
  return result.data as T;
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof createReportAction>[0]) => unwrap(await createReportAction(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportQueryKeys.list }),
  });
};

/** A changed definition refreshes the report, its runs and the list. */
export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateReportAction>[0]) => unwrap(await updateReportAction(input)),
    onSuccess: (report) => {
      queryClient.setQueryData(reportQueryKeys.report(report.id), report);
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.savedRuns(report.id) });
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.list });
    },
  });
};

/** A deleted report's own queries are dropped, not refetched — they would only answer "not found". */
export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteReportAction(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: reportQueryKeys.report(id) });
      queryClient.removeQueries({ queryKey: reportQueryKeys.savedRuns(id) });
      queryClient.removeQueries({ queryKey: reportQueryKeys.shares(id) });
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.list });
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.publicationsRoot });
    },
  });
};

/** "Duplicate" or "Save a copy": the copy is the caller's, and the answer is the copy. */
export const useDuplicateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await duplicateReportAction(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportQueryKeys.list }),
  });
};

/** Sharing changes the share list, the report's `shared` mark and the recipients' lists. */
const useInvalidateShares = () => {
  const queryClient = useQueryClient();
  return (id: string) => {
    void queryClient.invalidateQueries({ queryKey: reportQueryKeys.shares(id) });
    void queryClient.invalidateQueries({ queryKey: reportQueryKeys.report(id) });
    void queryClient.invalidateQueries({ queryKey: reportQueryKeys.list });
  };
};

export const useShareReport = () => {
  const invalidate = useInvalidateShares();
  return useMutation({
    mutationFn: async (input: Parameters<typeof shareReportAction>[0]) => unwrap(await shareReportAction(input)),
    onSuccess: (_data, input) => invalidate(input.id),
  });
};

export const useUpdateReportShare = () => {
  const invalidate = useInvalidateShares();
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateReportShareAction>[0]) =>
      unwrap(await updateReportShareAction(input)),
    onSuccess: (_data, input) => invalidate(input.id),
  });
};

export const useUnshareReport = () => {
  const invalidate = useInvalidateShares();
  return useMutation({
    mutationFn: async (input: Parameters<typeof unshareReportAction>[0]) => unwrap(await unshareReportAction(input)),
    onSuccess: (_data, input) => invalidate(input.id),
  });
};

/** The answer carries the link's token, shown once — the caller keeps it for the screen that shows it. */
export const usePublishReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<typeof publishReportAction>[0]) => unwrap(await publishReportAction(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportQueryKeys.publicationsRoot }),
  });
};

export const useRevokeReportPublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicationId: string) => unwrap(await revokeReportPublicationAction(publicationId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportQueryKeys.publicationsRoot }),
  });
};
