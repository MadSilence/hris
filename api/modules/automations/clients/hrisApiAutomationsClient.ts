import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AssignableType,
  AssignmentHistoryItem,
  AssignmentProvenance,
  AutomationActivationResult,
  AutomationCatalog,
  AutomationPreview,
  AutomationPreviewRequest,
  AutomationRule,
  AutomationRuleSummary,
  AutomationRun,
  AutomationRunStatus,
  AutomationVersion,
  CreateAutomationRequest,
  EnableAutomationRequest,
  LiveAssignmentCreated,
  LiveAssignmentPreview,
  LiveAssignmentRequest,
  Page,
  PublishAutomationRequest,
  PublishAutomationResult,
  RenameAutomationRequest,
  ReturnToRuleRequest,
} from "@/models/automations";

type Body = Record<string, unknown>;
const body = <T,>(value: T) => value as unknown as Body;

export type AutomationRunsQuery = {
  status?: AutomationRunStatus | null;
  personId?: string | null;
  page?: number;
  size?: number;
};

const query = (params: Record<string, string | number | boolean | null | undefined>): string => {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
};

/** Backend URLs for Settings → Automation and the live assignment rules. No logic (AUTOMATIONS_DESIGN.md § 8). */
export class HrisApiAutomationsClient {
  catalog() {
    return hrisApiClient.get<AutomationCatalog>("/automations/catalog");
  }
  list(includeArchived: boolean) {
    return hrisApiClient.get<AutomationRuleSummary[]>(`/automations${query({ includeArchived })}`);
  }
  get(id: string) {
    return hrisApiClient.get<AutomationRule>(`/automations/${id}`);
  }
  versions(id: string) {
    return hrisApiClient.get<AutomationVersion[]>(`/automations/${id}/versions`);
  }
  create(request: CreateAutomationRequest) {
    return hrisApiClient.post<AutomationRule>("/automations", body(request));
  }
  rename(id: string, request: RenameAutomationRequest) {
    return hrisApiClient.patch<AutomationRule>(`/automations/${id}`, body(request));
  }
  publish(id: string, request: PublishAutomationRequest) {
    return hrisApiClient.post<PublishAutomationResult>(`/automations/${id}/versions`, body(request));
  }
  preview(request: AutomationPreviewRequest) {
    return hrisApiClient.post<AutomationPreview>("/automations/preview", body(request));
  }
  enable(id: string, request: EnableAutomationRequest) {
    return hrisApiClient.post<AutomationActivationResult>(`/automations/${id}/enable`, body(request));
  }
  disable(id: string) {
    return hrisApiClient.post<AutomationActivationResult>(`/automations/${id}/disable`);
  }
  resume(id: string) {
    return hrisApiClient.post<AutomationActivationResult>(`/automations/${id}/resume`);
  }
  archive(id: string) {
    return hrisApiClient.post<AutomationRule>(`/automations/${id}/archive`);
  }
  unarchive(id: string) {
    return hrisApiClient.post<AutomationRule>(`/automations/${id}/unarchive`);
  }
  delete(id: string) {
    return hrisApiClient.delete<void>(`/automations/${id}`);
  }
  runs(id: string, q: AutomationRunsQuery) {
    return hrisApiClient.get<Page<AutomationRun>>(
      `/automations/${id}/runs${query({ status: q.status, personId: q.personId, page: q.page, size: q.size })}`,
    );
  }
  personRuns(personId: string, page = 0, size = 20) {
    return hrisApiClient.get<Page<AutomationRun>>(`/automations/runs${query({ personId, page, size })}`);
  }
  retryRun(runId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/retry`);
  }
  cancelRun(runId: string) {
    return hrisApiClient.post<AutomationRun>(`/automations/runs/${runId}/cancel`);
  }

  // live assignment rules — checked against the target's own module right, not SETTINGS.AUTOMATIONS
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
