"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.
// The check, the test cases and the test run are here although they write nothing — they are POSTs, because they
// carry the definition being edited.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AssignmentProvenance,
  Automation,
  AutomationActivation,
  AutomationCheck,
  AutomationDefinition,
  AutomationRun,
  CheckAutomationRequest,
  CreateAutomationRequest,
  DraftAutomationRequest,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  RenameAutomationRequest,
  ReturnToRuleRequest,
  SaveAutomationRequest,
  SaveAutomationResult,
  TestCase,
  TestRun,
  TestRunRequest,
  TestSendRequest,
  TestSent,
  TurnOnRequest,
} from "@/models/automations";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

// ── an automation's life ────────────────────────────────────────────────────────────────────

export async function createAutomationAction(input: CreateAutomationRequest): Promise<ActionResult<Automation>> {
  return run("createAutomationAction", () => hrisApiAutomationsService.create(input));
}
export async function saveAutomationDraftAction(input: { id: string; request: DraftAutomationRequest }): Promise<ActionResult<Automation>> {
  return run("saveAutomationDraftAction", () => hrisApiAutomationsService.saveDraft(input.id, input.request));
}
export async function renameAutomationAction(input: { id: string; request: RenameAutomationRequest }): Promise<ActionResult<Automation>> {
  return run("renameAutomationAction", () => hrisApiAutomationsService.rename(input.id, input.request));
}
export async function saveAutomationAction(input: { id: string; request: SaveAutomationRequest }): Promise<ActionResult<SaveAutomationResult>> {
  return run("saveAutomationAction", () => hrisApiAutomationsService.save(input.id, input.request));
}
export async function turnOnAutomationAction(input: { id: string; request: TurnOnRequest }): Promise<ActionResult<AutomationActivation>> {
  return run("turnOnAutomationAction", () => hrisApiAutomationsService.turnOn(input.id, input.request));
}
export async function turnOffAutomationAction(id: string): Promise<ActionResult<AutomationActivation>> {
  return run("turnOffAutomationAction", () => hrisApiAutomationsService.turnOff(id));
}
export async function undoTurnOnAutomationAction(id: string): Promise<ActionResult<AutomationActivation>> {
  return run("undoTurnOnAutomationAction", () => hrisApiAutomationsService.undoTurnOn(id));
}
export async function archiveAutomationAction(id: string): Promise<ActionResult<Automation>> {
  return run("archiveAutomationAction", () => hrisApiAutomationsService.archive(id));
}
export async function unarchiveAutomationAction(id: string): Promise<ActionResult<Automation>> {
  return run("unarchiveAutomationAction", () => hrisApiAutomationsService.unarchive(id));
}
export async function deleteAutomationAction(id: string): Promise<ActionResult<void>> {
  return run("deleteAutomationAction", () => hrisApiAutomationsService.delete(id));
}
export async function duplicateAutomationAction(id: string): Promise<ActionResult<Automation>> {
  return run("duplicateAutomationAction", () => hrisApiAutomationsService.duplicate(id));
}
export async function changeAutomationOwnerAction(input: { id: string; userId: string }): Promise<ActionResult<Automation>> {
  return run("changeAutomationOwnerAction", () => hrisApiAutomationsService.changeOwner(input.id, input.userId));
}
export async function takeOverAutomationAction(input: { id: string; turnOnNow: boolean }): Promise<ActionResult<Automation>> {
  return run("takeOverAutomationAction", () => hrisApiAutomationsService.takeOver(input.id, input.turnOnNow));
}

// ── checking and the test run ───────────────────────────────────────────────────────────────

export async function checkAutomationAction(input: CheckAutomationRequest): Promise<ActionResult<AutomationCheck>> {
  return run("checkAutomationAction", () => hrisApiAutomationsService.check(input));
}
export async function automationTestCasesAction(definition: AutomationDefinition): Promise<ActionResult<TestCase[]>> {
  return run("automationTestCasesAction", () => hrisApiAutomationsService.testCases(definition));
}
export async function automationTestRunAction(input: TestRunRequest): Promise<ActionResult<TestRun>> {
  return run("automationTestRunAction", () => hrisApiAutomationsService.testRun(input));
}
export async function automationTestSendAction(input: TestSendRequest): Promise<ActionResult<TestSent>> {
  return run("automationTestSendAction", () => hrisApiAutomationsService.testSend(input));
}
export async function deleteAutomationTestItemsAction(automationId: string | null): Promise<ActionResult<{ deleted: number }>> {
  return run("deleteAutomationTestItemsAction", () => hrisApiAutomationsService.deleteTestItems(automationId));
}

// ── runs ────────────────────────────────────────────────────────────────────────────────────

export async function retryAutomationRunAction(runId: string): Promise<ActionResult<AutomationRun>> {
  return run("retryAutomationRunAction", () => hrisApiAutomationsService.retryRun(runId));
}
export async function cancelAutomationRunAction(runId: string): Promise<ActionResult<AutomationRun>> {
  return run("cancelAutomationRunAction", () => hrisApiAutomationsService.cancelRun(runId));
}
export async function restoreAutomationRunAction(runId: string): Promise<ActionResult<AutomationRun>> {
  return run("restoreAutomationRunAction", () => hrisApiAutomationsService.restoreRun(runId));
}
export async function skipAutomationStepAction(input: { runId: string; stepId: string }): Promise<ActionResult<AutomationRun>> {
  return run("skipAutomationStepAction", () => hrisApiAutomationsService.skipStep(input.runId, input.stepId));
}
export async function reassignAutomationStepAction(input: { runId: string; stepId: string; userId: string }): Promise<ActionResult<AutomationRun>> {
  return run("reassignAutomationStepAction", () =>
    hrisApiAutomationsService.reassignStep(input.runId, input.stepId, input.userId));
}
export async function decideAutomationApprovalAction(input: { taskId: string; approve: boolean; comment?: string | null }): Promise<ActionResult<void>> {
  return run("decideAutomationApprovalAction", () => hrisApiAutomationsService.decideApproval(input.taskId, input.approve, input.comment));
}

// ── live assignment rules — the assignment modal's segment mode ─────────────────────────────

export async function previewLiveRuleAction(input: LiveAssignmentRequest): Promise<ActionResult<LiveAssignmentPreview>> {
  return run("previewLiveRuleAction", () => hrisApiAutomationsService.liveRulePreview(input));
}
export async function createLiveRuleAction(input: LiveAssignmentRequest): Promise<ActionResult<LiveAssignmentCreated>> {
  return run("createLiveRuleAction", () => hrisApiAutomationsService.liveRuleCreate(input));
}
export async function returnToRuleAction(input: ReturnToRuleRequest): Promise<ActionResult<AssignmentProvenance[]>> {
  return run("returnToRuleAction", () => hrisApiAutomationsService.returnToRule(input));
}
