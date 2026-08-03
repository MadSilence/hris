"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { PeopleView, SharedView, ViewPayload } from "@/models/peopleView";
import {
  createViewAction,
  deleteViewAction,
  duplicateViewAction,
  shareViewAction,
  updateViewAction,
  type ViewActionResult,
} from "@/components/modules/organization/components/PeopleViews/actions/peopleViewActions";

export const PEOPLE_VIEWS_QK = ["PEOPLE_VIEWS"];

export const usePeopleViews = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PeopleView[]>({
    queryKey: PEOPLE_VIEWS_QK,
    queryFn: () => internalApiClient.get<PeopleView[]>("/people-views"),
    staleTime: 60 * 1000,
  });
};

export const useResolveSharedView = (token: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SharedView>({
    queryKey: ["PEOPLE_VIEW_SHARE", token],
    queryFn: () => internalApiClient.get<SharedView>(`/people-view-shares/${encodeURIComponent(token!)}`),
    enabled: !!token,
    staleTime: Infinity,
    retry: false,
  });
};

function unwrap<T>(result: ViewActionResult<T>): T {
  if (result.status !== ActionStatus.SUCCESS) {
    throw new Error(result.errorMessage ?? "Action failed");
  }
  return result.data as T;
}

export const usePeopleViewMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PEOPLE_VIEWS_QK });

  const create = useMutation({
    mutationFn: (vars: { name: string; payload: ViewPayload }) =>
      createViewAction(vars.name, vars.payload).then(unwrap),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; name: string; payload: ViewPayload }) =>
      updateViewAction(vars.id, vars.name, vars.payload).then(unwrap),
    onSuccess: invalidate,
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicateViewAction(id).then(unwrap),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteViewAction(id).then(unwrap),
    onSuccess: invalidate,
  });

  const share = useMutation({
    mutationFn: (payload: ViewPayload) => shareViewAction(payload).then(unwrap),
  });

  return { create, update, duplicate, remove, share };
};
