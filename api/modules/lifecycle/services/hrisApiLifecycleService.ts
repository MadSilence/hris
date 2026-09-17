import { hrisApiLifecycleClient } from "@/api/modules/lifecycle/clients/hrisApiLifecycleClient";
import type { ProcessStatus, ProcessType, StartProcessRequest, TemplateWrite } from "@/models/lifecycle";

/** The seam for lifecycle processes: every transport — route handler, action, RSC — calls this. */
export class HrisApiLifecycleService {
  listTemplates = (type?: ProcessType | null) => hrisApiLifecycleClient.listTemplates(type);
  getTemplate = (id: string) => hrisApiLifecycleClient.getTemplate(id);
  saveTemplate = (id: string | null, body: TemplateWrite) =>
    id ? hrisApiLifecycleClient.updateTemplate(id, body) : hrisApiLifecycleClient.createTemplate(body);
  archiveTemplate = (id: string) => hrisApiLifecycleClient.archiveTemplate(id);
  unarchiveTemplate = (id: string) => hrisApiLifecycleClient.unarchiveTemplate(id);
  deleteTemplate = (id: string) => hrisApiLifecycleClient.deleteTemplate(id);

  listProcesses = (args: { archived?: boolean; userId?: string | null }) => hrisApiLifecycleClient.listProcesses(args);
  getProcess = (id: string) => hrisApiLifecycleClient.getProcess(id);
  previewStart = (userId: string, body: StartProcessRequest) => hrisApiLifecycleClient.previewStart(userId, body);
  start = (userId: string, body: StartProcessRequest) => hrisApiLifecycleClient.start(userId, body);
  close = (id: string, outcome: ProcessStatus) => hrisApiLifecycleClient.close(id, outcome);
  completeProcessTask = (id: string, taskId: string) => hrisApiLifecycleClient.completeProcessTask(id, taskId);
  changeManager = (id: string, managerUserId: string) => hrisApiLifecycleClient.changeManager(id, managerUserId);
  rebase = (id: string) => hrisApiLifecycleClient.rebase(id);
  reissueLink = (id: string) => hrisApiLifecycleClient.reissueLink(id);
  revokeLink = (id: string) => hrisApiLifecycleClient.revokeLink(id);
  archiveProcess = (id: string) => hrisApiLifecycleClient.archiveProcess(id);
  unarchiveProcess = (id: string) => hrisApiLifecycleClient.unarchiveProcess(id);
  deleteImpact = (id: string) => hrisApiLifecycleClient.deleteImpact(id);
  deleteProcess = (id: string) => hrisApiLifecycleClient.deleteProcess(id);

  myTasks = (includeDone: boolean) => hrisApiLifecycleClient.myTasks(includeDone);
  completeMyTask = (id: string) => hrisApiLifecycleClient.completeMyTask(id);

  preboardingView = (token: string) => hrisApiLifecycleClient.preboardingView(token);
  preboardingComplete = (token: string, taskId: string) => hrisApiLifecycleClient.preboardingComplete(token, taskId);
  preboardingFields = (token: string, taskId: string, values: Record<string, unknown>) =>
    hrisApiLifecycleClient.preboardingFields(token, taskId, values);
  preboardingDocument = (token: string, taskId: string, file: File) =>
    hrisApiLifecycleClient.preboardingDocument(token, taskId, file);
}

export const hrisApiLifecycleService = new HrisApiLifecycleService();
