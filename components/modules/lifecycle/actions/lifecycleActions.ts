"use server";

// Every export is an explicit `async function`. Next refuses anything else in a "use server" file —
// `export const x = withActionError(...)` compiles under tsc and fails at request time with "Server
// Actions must be async functions" — so the body calls `run`, which is the same middle.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  Process,
  ProcessStatus,
  StartPreview,
  StartProcessRequest,
  Task,
  Template,
  TemplateWrite,
} from "@/models/lifecycle";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

// Templates
export async function saveTemplateAction(input: { id: string | null; body: TemplateWrite }): Promise<ActionResult<Template>> {
  return run("saveTemplateAction", () => hrisApiLifecycleService.saveTemplate(input.id, input.body));
}
export async function archiveTemplateAction(id: string): Promise<ActionResult<void>> {
  return run("archiveTemplateAction", () => hrisApiLifecycleService.archiveTemplate(id));
}
export async function unarchiveTemplateAction(id: string): Promise<ActionResult<void>> {
  return run("unarchiveTemplateAction", () => hrisApiLifecycleService.unarchiveTemplate(id));
}
export async function deleteTemplateAction(id: string): Promise<ActionResult<void>> {
  return run("deleteTemplateAction", () => hrisApiLifecycleService.deleteTemplate(id));
}

// Starting a process. The preview writes nothing; it is a POST because it carries the edited summary.
export async function previewStartAction(input: { userId: string; body: StartProcessRequest }): Promise<ActionResult<StartPreview>> {
  return run("previewStartAction", () => hrisApiLifecycleService.previewStart(input.userId, input.body));
}
export async function startProcessAction(input: { userId: string; body: StartProcessRequest }): Promise<ActionResult<Process>> {
  return run("startProcessAction", () => hrisApiLifecycleService.start(input.userId, input.body));
}

// Running a process
export async function closeProcessAction(input: { id: string; outcome: ProcessStatus }): Promise<ActionResult<Process>> {
  return run("closeProcessAction", () => hrisApiLifecycleService.close(input.id, input.outcome));
}
export async function completeProcessTaskAction(input: { id: string; taskId: string }): Promise<ActionResult<Process>> {
  return run("completeProcessTaskAction", () => hrisApiLifecycleService.completeProcessTask(input.id, input.taskId));
}
export async function changeProcessManagerAction(input: { id: string; managerUserId: string }): Promise<ActionResult<Process>> {
  return run("changeProcessManagerAction", () => hrisApiLifecycleService.changeManager(input.id, input.managerUserId));
}
export async function rebaseProcessAction(id: string): Promise<ActionResult<Process>> {
  return run("rebaseProcessAction", () => hrisApiLifecycleService.rebase(id));
}
export async function reissuePreboardingLinkAction(id: string): Promise<ActionResult<Process>> {
  return run("reissuePreboardingLinkAction", () => hrisApiLifecycleService.reissueLink(id));
}
export async function revokePreboardingLinkAction(id: string): Promise<ActionResult<Process>> {
  return run("revokePreboardingLinkAction", () => hrisApiLifecycleService.revokeLink(id));
}
export async function archiveProcessAction(id: string): Promise<ActionResult<void>> {
  return run("archiveProcessAction", () => hrisApiLifecycleService.archiveProcess(id));
}
export async function unarchiveProcessAction(id: string): Promise<ActionResult<void>> {
  return run("unarchiveProcessAction", () => hrisApiLifecycleService.unarchiveProcess(id));
}
export async function deleteProcessAction(id: string): Promise<ActionResult<void>> {
  return run("deleteProcessAction", () => hrisApiLifecycleService.deleteProcess(id));
}

// My tasks
export async function completeMyTaskAction(id: string): Promise<ActionResult<Task>> {
  return run("completeMyTaskAction", () => hrisApiLifecycleService.completeMyTask(id));
}
