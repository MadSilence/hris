"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  Process,
  ProcessDeleteImpact,
  ProcessSummary,
  ProcessType,
  Task,
  Template,
  TemplateSummary,
} from "@/models/lifecycle";
import { lifecycleQueryKeys } from "./lifecycleQueryKeys";

export const useLifecycleTemplates = (type?: ProcessType | null, enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<TemplateSummary[]>({
    queryKey: lifecycleQueryKeys.templates(type),
    queryFn: () => internalApiClient.get<TemplateSummary[]>(`/lifecycle/templates${type ? `?type=${type}` : ""}`),
    enabled,
  });
};

export const useLifecycleTemplate = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Template>({
    queryKey: lifecycleQueryKeys.template(id ?? ""),
    queryFn: () => internalApiClient.get<Template>(`/lifecycle/templates/${id}`),
    enabled: Boolean(id),
  });
};

export const useLifecycleProcesses = (archived: boolean, userId?: string | null) => {
  const { internalApiClient } = useAppDataContext();
  const q = new URLSearchParams();
  if (archived) q.set("archived", "true");
  if (userId) q.set("userId", userId);
  const qs = q.toString();
  return useQuery<ProcessSummary[]>({
    queryKey: lifecycleQueryKeys.processes(archived, userId),
    queryFn: () => internalApiClient.get<ProcessSummary[]>(`/lifecycle/processes${qs ? `?${qs}` : ""}`),
  });
};

export const useLifecycleProcess = (id: string) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Process>({
    queryKey: lifecycleQueryKeys.process(id),
    queryFn: () => internalApiClient.get<Process>(`/lifecycle/processes/${id}`),
  });
};

export const useProcessDeleteImpact = (id: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ProcessDeleteImpact>({
    queryKey: lifecycleQueryKeys.deleteImpact(id),
    queryFn: () => internalApiClient.get<ProcessDeleteImpact>(`/lifecycle/processes/${id}/delete-impact`),
    enabled,
  });
};

export const useMyTasks = (includeDone: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<Task[]>({
    queryKey: lifecycleQueryKeys.myTasks(includeDone),
    queryFn: () => internalApiClient.get<Task[]>(`/tasks/mine${includeDone ? "?includeDone=true" : ""}`),
  });
};

/** Everything a lifecycle mutation can have changed. */
export const useInvalidateLifecycle = () => {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.templatesRoot }),
    queryClient.invalidateQueries({ queryKey: ["LIFECYCLE_TEMPLATE"] }),
    queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.processesRoot }),
    queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.processRoot }),
    queryClient.invalidateQueries({ queryKey: lifecycleQueryKeys.myTasksRoot }),
  ]);
};
