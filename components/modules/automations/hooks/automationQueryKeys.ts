import type { AssignableType, RunQuery } from "@/models/automations";

export const automationQueryKeys = {
  root: ["AUTOMATIONS"] as const,
  list: (archived: boolean) => ["AUTOMATIONS", "LIST", archived] as const,
  archivedCount: ["AUTOMATIONS", "ARCHIVED_COUNT"] as const,
  catalog: ["AUTOMATIONS", "CATALOG"] as const,
  templates: ["AUTOMATIONS", "TEMPLATES"] as const,
  automation: (id: string) => ["AUTOMATIONS", "ONE", id] as const,
  versions: (id: string) => ["AUTOMATIONS", "VERSIONS", id] as const,
  runs: (query: Omit<RunQuery, "cursor">) => ["AUTOMATIONS", "RUNS", query] as const,
  run: (runId: string) => ["AUTOMATIONS", "RUN", runId] as const,
  personRuns: (personId: string) => ["AUTOMATIONS", "PERSON_RUNS", personId] as const,
};

export const assignmentProvenanceQueryKeys = {
  history: (assignableType: AssignableType, assignableId: string) =>
    ["ASSIGNMENT_HISTORY", assignableType, assignableId] as const,
  historyRoot: ["ASSIGNMENT_HISTORY"] as const,
  provenance: (userId: string) => ["ASSIGNMENT_PROVENANCE", userId] as const,
};
