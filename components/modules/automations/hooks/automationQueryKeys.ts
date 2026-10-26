import type { AssignableType, AutomationRunStatus } from "@/models/automations";

export const automationQueryKeys = {
  root: ["AUTOMATIONS"] as const,
  list: (includeArchived: boolean) => ["AUTOMATIONS", "LIST", includeArchived] as const,
  catalog: ["AUTOMATIONS", "CATALOG"] as const,
  rule: (id: string) => ["AUTOMATIONS", "RULE", id] as const,
  versions: (id: string) => ["AUTOMATIONS", "VERSIONS", id] as const,
  runs: (id: string, status: AutomationRunStatus | null, page: number) => ["AUTOMATIONS", "RUNS", id, status, page] as const,
  personRuns: (personId: string) => ["AUTOMATIONS", "PERSON_RUNS", personId] as const,
};

export const assignmentProvenanceQueryKeys = {
  history: (assignableType: AssignableType, assignableId: string) =>
    ["ASSIGNMENT_HISTORY", assignableType, assignableId] as const,
  historyRoot: ["ASSIGNMENT_HISTORY"] as const,
  provenance: (userId: string) => ["ASSIGNMENT_PROVENANCE", userId] as const,
};
