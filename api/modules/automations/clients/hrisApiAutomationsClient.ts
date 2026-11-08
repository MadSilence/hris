import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AssignableType,
  AssignmentHistoryItem,
  AssignmentProvenance,
  Automation,
  AutomationActivation,
  AutomationCatalog,
  AutomationCheck,
  AutomationDefinition,
  AutomationRun,
  AutomationSummary,
  AutomationTemplate,
  AutomationVersion,
  CheckAutomationRequest,
  CreateAutomationRequest,
  DraftAutomationRequest,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  Page,
  PersonRef,
  RenameAutomationRequest,
  ReturnToRuleRequest,
  RunQuery,
  RunSlice,
  SaveAutomationRequest,
  SaveAutomationResult,
  TestCase,
  TestRun,
  TestRunRequest,
  TestSendRequest,
  TestSent,
  TurnOnRequest,
} from "@/models/automations";

type Body = Record<string, unknown>;
const body = <T,>(value: T) => value as unknown as Body;

const query = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
};

/** Backend URLs for Automations and the live assignment rules. No logic. */
export class HrisApiAutomationsClient {
  catalog() {
    return hrisApiClient.get<AutomationCatalog>("/automations/catalog");
  }
  templates() {
    return hrisApiClient.get<AutomationTemplate[]>("/automations/templates");
  }
  list(archived: boolean) {
    return hrisApiClient.get<AutomationSummary[]>(`/automations${query({ archived })}`);
  }
  archivedCount() {
    return hrisApiClient.get<number>("/automations/archived-count");
  }
  ownerCandidates(q: string | null) {
    return hrisApiClient.get<PersonRef[]>(`/automations/owner-candidates${query({ q })}`);
  }
  get(id: string) {
    return hrisApiClient.get<Automation>(`/automations/${id}`);
  }
  versions(id: string) {
    return hrisApiClient.get<AutomationVersion[]>(`/automations/${id}/versions`);
  }
  check(request: CheckAutomationRequest) {
    return hrisApiClient.post<AutomationCheck>("/automations/check", body(request));
  }

  create(request: CreateAutomationRequest) {
    return hrisApiClient.post<Automation>("/automations", body(request));
  }
  saveDraft(id: string, request: DraftAutomationRequest) {
    return hrisApiClient.put<Automation>(`/automations/${id}/draft`, body(request));
  }
  rename(id: string, request: RenameAutomationRequest) {
    return hrisApiClient.patch<Automation>(`/automations/${id}`, body(request));
  }
  save(id: string, request: SaveAutomationRequest) {
    return hrisApiClient.post<SaveAutomationResult>(`/automations/${id}/versions`, body(request));
  }
  turnOn(id: string, request: TurnOnRequest) {
    return hrisApiClient.post<AutomationActivation>(`/automations/${id}/turn-on`, body(request));
  }
  turnOff(id: string) {
    return hrisApiClient.post<AutomationActivation>(`/automations/${id}/turn-off`);
  }
  undoTurnOn(id: string) {
    return hrisApiClient.post<AutomationActivation>(`/automations/${id}/undo-turn-on`);
  }
  archive(id: string) {
    return hrisApiClient.post<Automation>(`/automations/${id}/archive`);
  }
  unarchive(id: string) {
    return hrisApiClient.post<Automation>(`/automations/${id}/unarchive`);
  }
  delete(id: string) {
    return hrisApiClient.delete<void>(`/automations/${id}`);
  }
  duplicate(id: string) {
    return hrisApiClient.post<Automation>(`/automations/${id}/duplicate`);
  }
  changeOwner(id: string, userId: string) {
    return hrisApiClient.post<Automation>(`/automations/${id}/owner`, body({ userId }));
  }
  takeOver(id: string, turnOnNow: boolean) {
    return hrisApiClient.post<Automation>(`/automations/${id}/take-over`, body({ turnOnNow }));
  }

  testCases(definition: AutomationDefinition) {
    return hrisApiClient.post<TestCase[]>("/automations/test-cases", body({ definition }));
  }
  testRun(request: TestRunRequest) {
    return hrisApiClient.post<TestRun>("/automations/test-run", body(request));
  }
  testSend(request: TestSendRequest) {
    return hrisApiClient.post<TestSent>("/automations/test-run/send", body(request));
  }
  deleteTestItems(automationId: string | null) {
    return hrisApiClient.delete<{ deleted: number }>(`/automations/test-items${query({ automationId })}`);
  }

  runs(request: RunQuery) {
    return hrisApiClient.post<RunSlice>("/automations/runs/search", body(request));
  }
  run(runId: string) {
    return hrisApiClient.get<AutomationRun>(`/automations/runs/${runId}`);
  }
  personRuns(personId: string, page = 0, size = 20) {
    return hrisApiClient.get<AutomationRun[]>(`/automations/people/${personId}/runs${query({ page, size })}`);
  }
  retryRun(runId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/retry`);
  }
  cancelRun(runId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/cancel`);
  }
  restoreRun(runId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/restore`);
  }
  skipStep(runId: string, stepId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/steps/${stepId}/skip`);
  }
  reassignStep(runId: string, stepId: string, userId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/steps/${stepId}/assignee`, body({ userId }));
  }

  decideApproval(taskId: string, approve: boolean, comment?: string | null) {
    return hrisApiClient.post<void>(`/automations/approvals/${taskId}/${approve ? "approve" : "decline"}`, body({ comment }));
  }

  // ── live assignment rules ─────────────────────────────────────────────────────────────────
  liveRulePreview(request: LiveAssignmentRequest) {
    return hrisApiClient.post<LiveAssignmentPreview>("/assignments/live-rules/preview", body(request));
  }
  liveRuleCreate(request: LiveAssignmentRequest) {
    return hrisApiClient.post<LiveAssignmentCreated>("/assignments/live-rules", body(request));
  }
  history(assignableType: AssignableType, assignableId: string, page = 0, size = 50) {
    return hrisApiClient.get<Page<AssignmentHistoryItem>>(
      `/assignments/history${query({ assignableType, assignableId, page, size })}`,
    );
  }
  provenance(userId: string) {
    return hrisApiClient.get<AssignmentProvenance[]>(`/assignments/provenance/${userId}`);
  }
  returnToRule(request: ReturnToRuleRequest) {
    return hrisApiClient.post<AssignmentProvenance[]>("/assignments/return-to-rule", body(request));
  }
}

export const hrisApiAutomationsClient = new HrisApiAutomationsClient();
