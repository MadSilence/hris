"use client";

import { useQuery } from "@tanstack/react-query";
import type { PositionHistoryEntry } from "@/models/user/PositionHistoryEntry";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

export const USER_JOB_HISTORY_QUERY_KEY = "USER_JOB_HISTORY";

type Options = {
  /**
   * False when the reader may not see the position on this person. The server would refuse the
   * read anyway; not asking keeps a refusal out of a panel that is not drawn.
   */
  enabled: boolean;
  /**
   * The position the profile currently shows. Part of the key so the timeline refetches when the
   * position changes: the edit is saved by the profile's own action, which knows nothing about this
   * query, and the profile re-reads the person afterwards — a new `jobId` is the signal.
   */
  currentJobId?: string | null;
};

/** A person's position timeline, newest first. */
export const useUserJobHistory = (userId: string, { enabled, currentJobId }: Options) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<PositionHistoryEntry[]>({
    queryKey: [USER_JOB_HISTORY_QUERY_KEY, userId, currentJobId ?? null],
    queryFn: () => internalApiClient.get<PositionHistoryEntry[]>(`/users/${userId}/job-history`),
    enabled: enabled && Boolean(userId),
  });
};
