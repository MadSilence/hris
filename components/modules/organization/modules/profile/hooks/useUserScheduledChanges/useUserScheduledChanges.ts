"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

export const USER_SCHEDULED_CHANGES_QUERY_KEY = "USER_SCHEDULED_CHANGES";

export const userScheduledChangesQueryKey = (userId: string) => [USER_SCHEDULED_CHANGES_QUERY_KEY, userId];

/**
 * The person's pending changes the reader may act on. Java filters them, so a reader who may only
 * view the profile gets an empty list and nothing scheduled is drawn — the muted "→ new" is for editors.
 */
export const useUserScheduledChanges = (userId: string) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<ScheduledChange[]>({
    queryKey: userScheduledChangesQueryKey(userId),
    queryFn: () => internalApiClient.get<ScheduledChange[]>(`/users/${userId}/scheduled-changes`),
    enabled: Boolean(userId),
  });
};

export const useInvalidateUserScheduledChanges = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (userId: string) => queryClient.invalidateQueries({ queryKey: userScheduledChangesQueryKey(userId) }),
    [queryClient],
  );
};
