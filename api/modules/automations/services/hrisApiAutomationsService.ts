import { hrisApiAutomationsClient, type AutomationRunsQuery } from "@/api/modules/automations/clients/hrisApiAutomationsClient";
import type {
  AssignableType,
  AutomationPreviewRequest,
  CreateAutomationRequest,
  EnableAutomationRequest,
  LiveAssignmentRequest,
  PublishAutomationRequest,
  RenameAutomationRequest,
  ReturnToRuleRequest,
} from "@/models/automations";

/** The seam for automations and live assignment rules: every transport — route handler, action, RSC — calls this. */
export class HrisApiAutomationsService {
  catalog = () => hrisApiAutomationsClient.catalog();
  list = (includeArchived: boolean) => hrisApiAutomationsClient.list(includeArchived);
  get = (id: string) => hrisApiAutomationsClient.get(id);
  versions = (id: string) => hrisApiAutomationsClient.versions(id);
  create = (request: CreateAutomationRequest) => hrisApiAutomationsClient.create(request);
  rename = (id: string, request: RenameAutomationRequest) => hrisApiAutomationsClient.rename(id, request);
  publish = (id: string, request: PublishAutomationRequest) => hrisApiAutomationsClient.publish(id, request);
  preview = (request: AutomationPreviewRequest) => hrisApiAutomationsClient.preview(request);
  enable = (id: string, request: EnableAutomationRequest) => hrisApiAutomationsClient.enable(id, request);
  disable = (id: string) => hrisApiAutomationsClient.disable(id);
  resume = (id: string) => hrisApiAutomationsClient.resume(id);
  archive = (id: string) => hrisApiAutomationsClient.archive(id);
  unarchive = (id: string) => hrisApiAutomationsClient.unarchive(id);
  delete = (id: string) => hrisApiAutomationsClient.delete(id);
  runs = (id: string, query: AutomationRunsQuery) => hrisApiAutomationsClient.runs(id, query);
  personRuns = (personId: string, page?: number, size?: number) =>
    hrisApiAutomationsClient.personRuns(personId, page, size);
  retryRun = (runId: string) => hrisApiAutomationsClient.retryRun(runId);
  cancelRun = (runId: string) => hrisApiAutomationsClient.cancelRun(runId);

  liveRulePreview = (request: LiveAssignmentRequest) => hrisApiAutomationsClient.liveRulePreview(request);
  liveRuleCreate = (request: LiveAssignmentRequest) => hrisApiAutomationsClient.liveRuleCreate(request);
  history = (assignableType: AssignableType, assignableId: string, page?: number, size?: number) =>
    hrisApiAutomationsClient.history(assignableType, assignableId, page, size);
  provenance = (userId: string) => hrisApiAutomationsClient.provenance(userId);
  returnToRule = (request: ReturnToRuleRequest) => hrisApiAutomationsClient.returnToRule(request);
}

export const hrisApiAutomationsService = new HrisApiAutomationsService();
