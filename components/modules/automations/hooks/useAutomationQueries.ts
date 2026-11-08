"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type {
  AssignableType,
  AssignmentHistoryItem,
  AssignmentProvenance,
  Automation,
  AutomationCatalog,
  AutomationCheck,
  AutomationRun,
  AutomationSummary,
  AutomationTemplate,
  AutomationVersion,
  CheckAutomationRequest,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  Page,
  ReturnToRuleRequest,
  RunQuery,
  RunSlice,
} from "@/models/automations";
import {
  checkAutomationAction,
  createLiveRuleAction,
  previewLiveRuleAction,
  returnToRuleAction,
} from "@/components/modules/automations/actions/automationActions";
import { assignmentProvenanceQueryKeys, automationQueryKeys } from "./automationQueryKeys";

/** An ERROR envelope becomes a rejected promise — what react-query needs. The text is already the dictionary's. */
export const unwrapAction = <T,>(result: ActionResult<T>): T => {
  if (result.status === ActionStatus.ERROR) {
    const error = new Error(result.errorMessage ?? "The request failed.") as Error & { code?: string };
    error.code = result.code;
    throw error;
  }
  return result.data as T;
};

/** The cards; `archived` is the archive alone. */
export const useAutomations = (archived = false) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationSummary[]>({
    queryKey: automationQueryKeys.list(archived),
    queryFn: () => internalApiClient.get<AutomationSummary[]>(`/automations${archived ? "?archived=true" : ""}`),
  });
};

export const useArchivedAutomationsCount = () => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<number>({
    queryKey: automationQueryKeys.archivedCount,
    queryFn: () => internalApiClient.get<number>("/automations/archived-count"),
  });
};

/** The shipped templates. Static per release — kept for the session. */
export const useAutomationTemplates = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationTemplate[]>({
    queryKey: automationQueryKeys.templates,
    queryFn: () => internalApiClient.get<AutomationTemplate[]>("/automations/templates"),
    staleTime: Infinity,
    enabled,
  });
};

/** The editor's vocabulary: steps, fields, roles, forms, templates. */
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
  return useQuery<Automation>({
    queryKey: automationQueryKeys.automation(id ?? ""),
    queryFn: () => internalApiClient.get<Automation>(`/automations/${id}`),
    enabled: Boolean(id),
  });
};

export const useAutomationVersions = (id: string | null, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationVersion[]>({
    queryKey: automationQueryKeys.versions(id ?? ""),
    queryFn: () => internalApiClient.get<AutomationVersion[]>(`/automations/${id}/versions`),
    enabled: enabled && Boolean(id),
  });
};

/** Activity and a run history: an endless list behind a cursor, with the chips' counts on every slice. */
export const useAutomationRuns = (query: Omit<RunQuery, "cursor">, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useInfiniteQuery<RunSlice, Error, { pages: RunSlice[] }, ReturnType<typeof automationQueryKeys.runs>, string | null>({
    queryKey: automationQueryKeys.runs(query),
    queryFn: ({ pageParam }) =>
      internalApiClient.post<RunSlice>("/automations/runs/search", { ...query, cursor: pageParam } as Record<string, unknown>),
    initialPageParam: null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
};

export const useAutomationRun = (runId: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationRun>({
    queryKey: automationQueryKeys.run(runId ?? ""),
    queryFn: () => internalApiClient.get<AutomationRun>(`/automations/runs/${runId}`),
    enabled: Boolean(runId),
  });
};

export const usePersonAutomationRuns = (personId: string, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<AutomationRun[]>({
    queryKey: automationQueryKeys.personRuns(personId),
    queryFn: () => internalApiClient.get<AutomationRun[]>(`/automations/people/${personId}/runs?size=20`),
    enabled: enabled && Boolean(personId),
  });
};

/** Missing details, the turn-on dialog's numbers and Who sees what: writes nothing, a mutation only in transport. */
export const useAutomationCheck = () =>
  useMutation<AutomationCheck, Error, CheckAutomationRequest>({
    mutationFn: async (request) => unwrapAction(await checkAutomationAction(request)),
  });

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

/**
 * One automation mutation: the action's envelope unwrapped, and every automation read refreshed after it.
 * Errors surface to the caller (`showError` / an `InlineAlert` in the dialog), never here.
 */
export const useAutomationMutation = <TInput, TOutput>(action: (input: TInput) => Promise<ActionResult<TOutput>>) => {
  const invalidate = useInvalidateAutomations();
  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (input) => unwrapAction(await action(input)),
    onSuccess: () => invalidate(),
  });
};
