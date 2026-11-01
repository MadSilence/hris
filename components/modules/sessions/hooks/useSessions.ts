"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { SessionDTO } from "@/api/modules/sessions/dto";
import {
  endAllSessionsOfUserAction,
  endMyOtherSessionsAction,
  endMySessionAction,
} from "@/components/modules/sessions/actions";

export const MY_SESSIONS_QK = ["MY_SESSIONS"] as const;

/** The reader's own signed-in browsers. */
export const useMySessions = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SessionDTO[]>({
    queryKey: MY_SESSIONS_QK,
    queryFn: () => internalApiClient.get<SessionDTO[]>("/auth/sessions"),
  });
};

export const useInvalidateMySessions = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MY_SESSIONS_QK });
};

/** An ERROR envelope becomes a rejected mutation, which is what react-query needs. */
const unwrap = <T,>(result: ActionResult<T>, fallback: string): ActionResult<T> => {
  if (result.status === ActionStatus.ERROR) throw Object.assign(new Error(result.errorMessage || fallback), { result });
  return result;
};

export const useEndMySession = () => {
  const invalidate = useInvalidateMySessions();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await endMySessionAction(id), "The session could not be ended."),
    onSuccess: () => void invalidate(),
  });
};

export const useEndMyOtherSessions = () => {
  const invalidate = useInvalidateMySessions();
  return useMutation({
    mutationFn: async () => unwrap(await endMyOtherSessionsAction(), "The sessions could not be ended."),
    onSuccess: () => void invalidate(),
  });
};

/** An administrator's "End all sessions" on a person. */
export const useEndAllSessionsOfUser = () =>
  useMutation({
    mutationFn: async (userId: string) =>
      unwrap(await endAllSessionsOfUserAction(userId), "The sessions could not be ended."),
  });
