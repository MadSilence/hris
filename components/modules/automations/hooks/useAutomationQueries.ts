"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type {
  AssignableType,
  AssignmentHistoryItem,
  AssignmentProvenance,
  AutomationCatalog,
  AutomationPreview,
  AutomationPreviewRequest,
  AutomationRule,
  AutomationRuleSummary,
  AutomationRun,
  AutomationRunStatus,
  AutomationVersion,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  Page,
  ReturnToRuleRequest,
} from "@/models/automations";
import {
  createLiveRuleAction,
  previewAutomationAction,
  previewLiveRuleAction,
  returnToRuleAction,
} from "@/components/modules/automations/actions/automationActions";
import { assignmentProvenanceQueryKeys, automationQueryKeys } from "./automationQueryKeys";

/** An ERROR envelope becomes a rejected promise — what react-query needs. The text is already the dictionary's. */
export const unwrapAction = <T,>(result: ActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR) {
    throw new Error(result.errorMessage ?? "The request failed.");
  }
  return result.data as T;
};

export const useAutomations = (includeArchived: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationRuleSummary[]>({
    queryKey: automationQueryKeys.list(includeArchived),
    queryFn: () => internalApiClient.get<AutomationRuleSummary[]>(`/automations${includeArchived ? "?includeArchived=true" : ""}`),
  });
};

/** The builder's vocabulary. Needs MANAGE — a reader who may only view the rule does not ask for it. */
export const useAutomationCatalog = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationCatalog>({
    queryKey: automationQueryKeys.catalog,
    queryFn: () => internalApiClient.get<AutomationCatalog>("/automations/catalog"),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useAutomation = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationRule>({
    queryKey: automationQueryKeys.rule(id ?? ""),
    queryFn: () => internalApiClient.get<AutomationRule>(`/automations/${id}`),
    enabled: Boolean(id),
  });
};

export const useAutomationVersions = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationVersion[]>({
    queryKey: automationQueryKeys.versions(id ?? ""),
    queryFn: () => internalApiClient.get<AutomationVersion[]>(`/automations/${id}/versions`),
    enabled: Boolean(id),
  });
};

export const useAutomationRuns = (id: string, status: AutomationRunStatus | null, page = 0, size = 50) => {
  const { internalApiClient } = useAppDataContext();
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) q.set("status", status);
  return useQuery<Page<AutomationRun>>({
    queryKey: automationQueryKeys.runs(id, status, page),
    queryFn: () => internalApiClient.get<Page<AutomationRun>>(`/automations/${id}/runs?${q.toString()}`),
    placeholderData: keepPreviousData,
  });
};

export const usePersonAutomationRuns = (personId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Page<AutomationRun>>({
    queryKey: automationQueryKeys.personRuns(personId),
    queryFn: () => internalApiClient.get<Page<AutomationRun>>(`/automations/runs?personId=${personId}&size=20`),
    enabled: enabled && Boolean(personId),
  });
};

export const useAssignmentHistory = (assignableType: AssignableType, assignableId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Page<AssignmentHistoryItem>>({
    queryKey: assignmentProvenanceQueryKeys.history(assignableType, assignableId),
    queryFn: () =>
      internalApiClient.get<Page<AssignmentHistoryItem>>(
        `/assignments/history?assignableType=${assignableType}&assignableId=${assignableId}&size=100`,
      ),
    enabled: enabled && Boolean(assignableId),
  });
};

export const useAssignmentProvenance = (userId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AssignmentProvenance[]>({
    queryKey: assignmentProvenanceQueryKeys.provenance(userId),
    queryFn: () => internalApiClient.get<AssignmentProvenance[]>(`/assignments/provenance/${userId}`),
    enabled: enabled && Boolean(userId),
  });
};

/** The builder's preview: writes nothing, so it is a mutation only in transport. */
export const useAutomationPreview = () =>
  useMutation<AutomationPreview, Error, AutomationPreviewRequest>({
    mutationFn: async (request) => unwrapAction(await previewAutomationAction(request)),
  });

export const useLiveRulePreview = () =>
  useMutation<LiveAssignmentPreview, Error, LiveAssignmentRequest>({
    mutationFn: async (request) => unwrapAction(await previewLiveRuleAction(request)),
  });

export const useCreateLiveRule = () => {
  const queryClient = useQueryClient();
  return useMutation<LiveAssignmentCreated, Error, LiveAssignmentRequest>({
    mutationFn: async (request) => unwrapAction(await createLiveRuleAction(request)),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: automationQueryKeys.root }),
      queryClient.invalidateQueries({ queryKey: assignmentProvenanceQueryKeys.historyRoot }),
    ]),
  });
};

export const useReturnToRule = () => {
  const queryClient = useQueryClient();
  return useMutation<AssignmentProvenance[], Error, ReturnToRuleRequest>({
    mutationFn: async (request) => unwrapAction(await returnToRuleAction(request)),
    onSuccess: (provenance, request) => {
      queryClient.setQueryData(assignmentProvenanceQueryKeys.provenance(request.userId), provenance);
    },
  });
};

/** Everything an automation mutation can have changed. */
export const useInvalidateAutomations = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: automationQueryKeys.root });
};
