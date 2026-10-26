"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type {
  PeopleView,
  PeopleViewShare,
  ShareGrantee,
  SharePermission,
  SharePreview,
  ViewPayload,
} from "@/models/peopleView";
import {
  createViewAction,
  deleteViewAction,
  duplicateViewAction,
  shareViewAction,
  unshareViewAction,
  updateViewAction,
  updateViewShareAction,
  type ViewActionResult,
} from "@/components/modules/organization/components/PeopleViews/actions/peopleViewActions";

export const PEOPLE_VIEWS_QK = ["PEOPLE_VIEWS"];
export const PEOPLE_VIEW_SHARES_QK = "PEOPLE_VIEW_SHARES";
export const PEOPLE_VIEW_SHARE_PREVIEW_QK = "PEOPLE_VIEW_SHARE_PREVIEW";

/** The caller's own views and the ones shared with them, each already stripped to their access. */
export const usePeopleViews = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PeopleView[]>({
    queryKey: PEOPLE_VIEWS_QK,
    queryFn: () => internalApiClient.get<PeopleView[]>("/people-views"),
    staleTime: 60 * 1000,
  });
};

/** Who a view is shared with. Its owner's question only. */
export const usePeopleViewShares = (viewId: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<PeopleViewShare[]>({
    queryKey: [PEOPLE_VIEW_SHARES_QK, viewId],
    queryFn: () => internalApiClient.get<PeopleViewShare[]>(`/people-views/${viewId}/shares`),
    enabled: !!viewId,
  });
};

/**
 * The warning before sharing: who of the people these grantees reach will not see which column.
 * Asked again whenever the pending grantees change; nothing is shared by asking.
 */
export const useSharePreview = (viewId: string | null, grantees: Pick<ShareGrantee, "granteeType" | "granteeId">[]) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<SharePreview>({
    queryKey: [PEOPLE_VIEW_SHARE_PREVIEW_QK, viewId, grantees],
    queryFn: () => internalApiClient.post<SharePreview>(`/people-views/${viewId}/shares/preview`, { grantees }),
    enabled: !!viewId && grantees.length > 0,
    placeholderData: keepPreviousData,
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
  const invalidateShares = (viewId: string) =>
    queryClient.invalidateQueries({ queryKey: [PEOPLE_VIEW_SHARES_QK, viewId] });

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
    mutationFn: (vars: { viewId: string; grantees: ShareGrantee[] }) =>
      shareViewAction(vars.viewId, vars.grantees).then(unwrap),
    onSuccess: (_data, vars) => invalidateShares(vars.viewId),
  });

  const updateShare = useMutation({
    mutationFn: (vars: { viewId: string; shareId: string; permission: SharePermission }) =>
      updateViewShareAction(vars.viewId, vars.shareId, vars.permission).then(unwrap),
    onSuccess: (_data, vars) => invalidateShares(vars.viewId),
  });

  const unshare = useMutation({
    mutationFn: (vars: { viewId: string; shareId: string }) =>
      unshareViewAction(vars.viewId, vars.shareId).then(unwrap),
    onSuccess: (_data, vars) => invalidateShares(vars.viewId),
  });

  return { create, update, duplicate, remove, share, updateShare, unshare };
};
