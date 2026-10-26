"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.
// The preview is here although it writes nothing — it is a POST, because it carries the draft.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AssignmentProvenance,
  AutomationActivationResult,
  AutomationPreview,
  AutomationPreviewRequest,
  AutomationRule,
  AutomationRun,
  CreateAutomationRequest,
  EnableAutomationRequest,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  PublishAutomationRequest,
  PublishAutomationResult,
  RenameAutomationRequest,
  ReturnToRuleRequest,
} from "@/models/automations";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

export async function createAutomationAction(input: CreateAutomationRequest): Promise<ActionResult<AutomationRule>> {
  return run("createAutomationAction", () => hrisApiAutomationsService.create(input));
}
export async function renameAutomationAction(input: { id: string; body: RenameAutomationRequest }): Promise<ActionResult<AutomationRule>> {
  return run("renameAutomationAction", () => hrisApiAutomationsService.rename(input.id, input.body));
}
export async function publishAutomationAction(input: { id: string; body: PublishAutomationRequest }): Promise<ActionResult<PublishAutomationResult>> {
  return run("publishAutomationAction", () => hrisApiAutomationsService.publish(input.id, input.body));
}
export async function previewAutomationAction(input: AutomationPreviewRequest): Promise<ActionResult<AutomationPreview>> {
  return run("previewAutomationAction", () => hrisApiAutomationsService.preview(input));
}
export async function enableAutomationAction(input: { id: string; body: EnableAutomationRequest }): Promise<ActionResult<AutomationActivationResult>> {
  return run("enableAutomationAction", () => hrisApiAutomationsService.enable(input.id, input.body));
}
export async function disableAutomationAction(id: string): Promise<ActionResult<AutomationActivationResult>> {
  return run("disableAutomationAction", () => hrisApiAutomationsService.disable(id));
}
export async function resumeAutomationAction(id: string): Promise<ActionResult<AutomationActivationResult>> {
  return run("resumeAutomationAction", () => hrisApiAutomationsService.resume(id));
}
export async function archiveAutomationAction(id: string): Promise<ActionResult<AutomationRule>> {
  return run("archiveAutomationAction", () => hrisApiAutomationsService.archive(id));
}
export async function unarchiveAutomationAction(id: string): Promise<ActionResult<AutomationRule>> {
  return run("unarchiveAutomationAction", () => hrisApiAutomationsService.unarchive(id));
}
export async function deleteAutomationAction(id: string): Promise<ActionResult<void>> {
  return run("deleteAutomationAction", () => hrisApiAutomationsService.delete(id));
}
export async function retryAutomationRunAction(runId: string): Promise<ActionResult<AutomationRun>> {
  return run("retryAutomationRunAction", () => hrisApiAutomationsService.retryRun(runId));
}
export async function cancelAutomationRunAction(runId: string): Promise<ActionResult<AutomationRun>> {
  return run("cancelAutomationRunAction", () => hrisApiAutomationsService.cancelRun(runId));
}

// Live assignment rules — the assignment modal's segment mode.
export async function previewLiveRuleAction(input: LiveAssignmentRequest): Promise<ActionResult<LiveAssignmentPreview>> {
  return run("previewLiveRuleAction", () => hrisApiAutomationsService.liveRulePreview(input));
}
export async function createLiveRuleAction(input: LiveAssignmentRequest): Promise<ActionResult<LiveAssignmentCreated>> {
  return run("createLiveRuleAction", () => hrisApiAutomationsService.liveRuleCreate(input));
}
export async function returnToRuleAction(input: ReturnToRuleRequest): Promise<ActionResult<AssignmentProvenance[]>> {
  return run("returnToRuleAction", () => hrisApiAutomationsService.returnToRule(input));
}
