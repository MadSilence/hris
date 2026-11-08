import { hrisApiAutomationsClient } from "@/api/modules/automations/clients/hrisApiAutomationsClient";
import type {
  AssignableType,
  AutomationDefinition,
  CheckAutomationRequest,
  CreateAutomationRequest,
  DraftAutomationRequest,
  LiveAssignmentRequest,
  RenameAutomationRequest,
  ReturnToRuleRequest,
  RunQuery,
  SaveAutomationRequest,
  TestRunRequest,
  TestSendRequest,
  TurnOnRequest,
} from "@/models/automations";

/** The seam for automations and live assignment rules: every transport — route handler, action, RSC — calls this. */
export class HrisApiAutomationsService {
  catalog = () => hrisApiAutomationsClient.catalog();
  templates = () => hrisApiAutomationsClient.templates();
  list = (archived: boolean) => hrisApiAutomationsClient.list(archived);
  archivedCount = () => hrisApiAutomationsClient.archivedCount();
  ownerCandidates = (q: string | null) => hrisApiAutomationsClient.ownerCandidates(q);
  get = (id: string) => hrisApiAutomationsClient.get(id);
  versions = (id: string) => hrisApiAutomationsClient.versions(id);
  check = (request: CheckAutomationRequest) => hrisApiAutomationsClient.check(request);

  create = (request: CreateAutomationRequest) => hrisApiAutomationsClient.create(request);
  saveDraft = (id: string, request: DraftAutomationRequest) => hrisApiAutomationsClient.saveDraft(id, request);
  rename = (id: string, request: RenameAutomationRequest) => hrisApiAutomationsClient.rename(id, request);
  save = (id: string, request: SaveAutomationRequest) => hrisApiAutomationsClient.save(id, request);
  turnOn = (id: string, request: TurnOnRequest) => hrisApiAutomationsClient.turnOn(id, request);
  turnOff = (id: string) => hrisApiAutomationsClient.turnOff(id);
  undoTurnOn = (id: string) => hrisApiAutomationsClient.undoTurnOn(id);
  archive = (id: string) => hrisApiAutomationsClient.archive(id);
  unarchive = (id: string) => hrisApiAutomationsClient.unarchive(id);
  delete = (id: string) => hrisApiAutomationsClient.delete(id);
  duplicate = (id: string) => hrisApiAutomationsClient.duplicate(id);
  changeOwner = (id: string, userId: string) => hrisApiAutomationsClient.changeOwner(id, userId);
  takeOver = (id: string, turnOnNow: boolean) => hrisApiAutomationsClient.takeOver(id, turnOnNow);

  testCases = (definition: AutomationDefinition) => hrisApiAutomationsClient.testCases(definition);
  testRun = (request: TestRunRequest) => hrisApiAutomationsClient.testRun(request);
  testSend = (request: TestSendRequest) => hrisApiAutomationsClient.testSend(request);
  deleteTestItems = (automationId: string | null) => hrisApiAutomationsClient.deleteTestItems(automationId);

  runs = (request: RunQuery) => hrisApiAutomationsClient.runs(request);
  run = (runId: string) => hrisApiAutomationsClient.run(runId);
  personRuns = (personId: string, page?: number, size?: number) =>
    hrisApiAutomationsClient.personRuns(personId, page, size);
  retryRun = (runId: string) => hrisApiAutomationsClient.retryRun(runId);
  cancelRun = (runId: string) => hrisApiAutomationsClient.cancelRun(runId);
  restoreRun = (runId: string) => hrisApiAutomationsClient.restoreRun(runId);
  skipStep = (runId: string, stepId: string) => hrisApiAutomationsClient.skipStep(runId, stepId);
  reassignStep = (runId: string, stepId: string, userId: string) =>
    hrisApiAutomationsClient.reassignStep(runId, stepId, userId);

  decideApproval = (taskId: string, approve: boolean, comment?: string | null) =>
    hrisApiAutomationsClient.decideApproval(taskId, approve, comment);

  liveRulePreview = (request: LiveAssignmentRequest) => hrisApiAutomationsClient.liveRulePreview(request);
  liveRuleCreate = (request: LiveAssignmentRequest) => hrisApiAutomationsClient.liveRuleCreate(request);
  history = (assignableType: AssignableType, assignableId: string, page?: number, size?: number) =>
    hrisApiAutomationsClient.history(assignableType, assignableId, page, size);
  provenance = (userId: string) => hrisApiAutomationsClient.provenance(userId);
  returnToRule = (request: ReturnToRuleRequest) => hrisApiAutomationsClient.returnToRule(request);
}

export const hrisApiAutomationsService = new HrisApiAutomationsService();
