import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PreboardingPage,
  Process,
  ProcessDeleteImpact,
  ProcessStatus,
  ProcessSummary,
  ProcessType,
  StartPreview,
  StartProcessRequest,
  Task,
  Template,
  TemplateSummary,
  TemplateWrite,
} from "@/models/lifecycle";

/** Backend URLs for templates, processes, tasks and the preboarding page. No logic. */
export class HrisApiLifecycleClient {
  // templates
  listTemplates(type?: ProcessType | null) {
    return hrisApiClient.get<TemplateSummary[]>(`/lifecycle/templates${type ? `?type=${type}` : ""}`);
  }
  getTemplate(id: string) {
    return hrisApiClient.get<Template>(`/lifecycle/templates/${id}`);
  }
  createTemplate(body: TemplateWrite) {
    return hrisApiClient.post<Template>("/lifecycle/templates", body as unknown as Record<string, unknown>);
  }
  updateTemplate(id: string, body: TemplateWrite) {
    return hrisApiClient.put<Template>(`/lifecycle/templates/${id}`, body as unknown as Record<string, unknown>);
  }
  archiveTemplate(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/templates/${id}/archive`);
  }
  unarchiveTemplate(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/templates/${id}/unarchive`);
  }
  deleteTemplate(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/templates/${id}/delete`);
  }

  // processes
  listProcesses(args: { archived?: boolean; userId?: string | null }) {
    const q = new URLSearchParams();
    if (args.archived) q.set("archived", "true");
    if (args.userId) q.set("userId", args.userId);
    const qs = q.toString();
    return hrisApiClient.get<ProcessSummary[]>(`/lifecycle/processes${qs ? `?${qs}` : ""}`);
  }
  getProcess(id: string) {
    return hrisApiClient.get<Process>(`/lifecycle/processes/${id}`);
  }
  previewStart(userId: string, body: StartProcessRequest) {
    return hrisApiClient.post<StartPreview>(`/lifecycle/users/${userId}/processes/preview`, body as unknown as Record<string, unknown>);
  }
  start(userId: string, body: StartProcessRequest) {
    return hrisApiClient.post<Process>(`/lifecycle/users/${userId}/processes`, body as unknown as Record<string, unknown>);
  }
  close(id: string, outcome: ProcessStatus) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/close`, { outcome });
  }
  completeProcessTask(id: string, taskId: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/tasks/${taskId}/complete`);
  }
  changeManager(id: string, managerUserId: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/manager`, { managerUserId });
  }
  rebase(id: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/rebase`);
  }
  reissueLink(id: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/link/reissue`);
  }
  revokeLink(id: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/link/revoke`);
  }
  archiveProcess(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/processes/${id}/archive`);
  }
  unarchiveProcess(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/processes/${id}/unarchive`);
  }
  deleteImpact(id: string) {
    return hrisApiClient.get<ProcessDeleteImpact>(`/lifecycle/processes/${id}/delete-impact`);
  }
  deleteProcess(id: string) {
    return hrisApiClient.post<void>(`/lifecycle/processes/${id}/delete`);
  }

  // tasks
  myTasks(includeDone: boolean) {
    return hrisApiClient.get<Task[]>(`/tasks/mine${includeDone ? "?includeDone=true" : ""}`);
  }
  completeMyTask(id: string) {
    return hrisApiClient.post<Task>(`/tasks/${id}/complete`);
  }

  // the preboarding page — unauthenticated; the token is the credential and travels in the body
  preboardingView(token: string) {
    return hrisApiClient.post<PreboardingPage>("/public/preboarding/view", { token });
  }
  preboardingComplete(token: string, taskId: string) {
    return hrisApiClient.post<PreboardingPage>(`/public/preboarding/tasks/${taskId}/complete`, { token });
  }
  preboardingFields(token: string, taskId: string, values: Record<string, unknown>) {
    return hrisApiClient.post<PreboardingPage>(`/public/preboarding/tasks/${taskId}/fields`, { token, values });
  }
  preboardingDocument(token: string, taskId: string, file: File) {
    const form = new FormData();
    form.append("token", token);
    form.append("file", file);
    return hrisApiClient.postForm<PreboardingPage>(`/public/preboarding/tasks/${taskId}/document`, form);
  }
}

export const hrisApiLifecycleClient = new HrisApiLifecycleClient();
