"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { CreateDelegationRequest, DelegationsDTO } from "@/api/modules/delegations/dto";
import { createDelegationAction, deleteDelegationAction } from "@/components/modules/delegations/actions";

export const DELEGATIONS_QK = ["MY_DELEGATIONS"] as const;

/** The reader's own approval delegations, and the ones made to them. */
export const useDelegations = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<DelegationsDTO>({
    queryKey: DELEGATIONS_QK,
    queryFn: () => internalApiClient.get<DelegationsDTO>("/me/delegations"),
  });
};

export const useInvalidateDelegations = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: DELEGATIONS_QK });
};

/** An ERROR envelope becomes a rejected mutation, which is what react-query needs. */
const unwrap = <T,>(result: ActionResult<T>, fallback: string): ActionResult<T> => {
  if (result.status === ActionStatus.ERROR) throw new Error(result.errorMessage || fallback);
  return result;
};

export const useCreateDelegation = () => {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: async (payload: CreateDelegationRequest) =>
      unwrap(await createDelegationAction(payload), "The delegation could not be saved."),
    onSuccess: () => void invalidate(),
  });
};

export const useDeleteDelegation = () => {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteDelegationAction(id), "The delegation could not be removed."),
    onSuccess: () => void invalidate(),
  });
};
