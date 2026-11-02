import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  LifecycleFile,
  PreboardingPage,
  QuestionnaireResponse,
  TaskAddRequest,
  TaskComment,
  TaskUpdateRequest,
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
  completeProcessTask(id: string, taskId: string, documentId?: string | null) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/tasks/${taskId}/complete`, { documentId: documentId ?? null });
  }
  addProcessTask(id: string, body: TaskAddRequest) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/tasks`, body as unknown as Record<string, unknown>);
  }
  updateProcessTask(id: string, taskId: string, body: TaskUpdateRequest) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/tasks/${taskId}`, body as unknown as Record<string, unknown>);
  }
  cancelProcessTask(id: string, taskId: string) {
    return hrisApiClient.post<Process>(`/lifecycle/processes/${id}/tasks/${taskId}/cancel`);
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
  completeMyTask(id: string, documentId?: string | null) {
    return hrisApiClient.post<Task>(`/tasks/${id}/complete`, { documentId: documentId ?? null });
  }
  answerQuestionnaire(id: string, answers: Record<string, unknown>) {
    return hrisApiClient.post<Task>(`/tasks/${id}/questionnaire`, { answers });
  }
  taskComments(id: string) {
    return hrisApiClient.get<TaskComment[]>(`/tasks/${id}/comments`);
  }
  addTaskComment(id: string, body: string) {
    return hrisApiClient.post<TaskComment[]>(`/tasks/${id}/comments`, { body });
  }

  // material and answers
  uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    return hrisApiClient.postForm<LifecycleFile>("/lifecycle/files", form);
  }
  downloadFile(id: string): Promise<Response> {
    return hrisApiClient.fetch(`/lifecycle/files/${id}/download`, "*/*");
  }
  questionnaires(userId: string) {
    return hrisApiClient.get<QuestionnaireResponse[]>(`/lifecycle/users/${userId}/questionnaires`);
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
  preboardingAnswer(token: string, taskId: string, answers: Record<string, unknown>) {
    return hrisApiClient.post<PreboardingPage>(`/public/preboarding/tasks/${taskId}/questionnaire`, { token, answers });
  }
  preboardingComments(token: string, taskId: string) {
    return hrisApiClient.post<TaskComment[]>(`/public/preboarding/tasks/${taskId}/comments/list`, { token });
  }
  preboardingComment(token: string, taskId: string, body: string) {
    return hrisApiClient.post<TaskComment[]>(`/public/preboarding/tasks/${taskId}/comments`, { token, body });
  }
  preboardingFile(token: string, fileId: string): Promise<Response> {
    return hrisApiClient.postForBinary(`/public/preboarding/files/${fileId}`, { token });
  }
}

export const hrisApiLifecycleClient = new HrisApiLifecycleClient();
