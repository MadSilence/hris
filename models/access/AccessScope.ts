// Frontend mirror of the backend `Scope` enum (com.example.security.access.Scope). Same values.
// Prefixed `AccessScope` for readability.
// NOTE: this is NOT the backend's old storage-layer `AccessScope` (SELF/ASSIGNED/ALL) — that one
// was removed in the authorization unification. CUSTOM is declared but not yet implemented
// server-side.
export const ACCESS_SCOPES = [
  "SELF",
  "DIRECT_REPORTS",
  "COMPANY",
  // Resolved from the actor's own record, so one role covers every manager. Labelled "My …" so
  // they never read like CUSTOM's "department = Sales", which is the same for every holder.
  "MY_DEPARTMENT",
  "MY_DEPARTMENT_SUBTREE",
  "MY_TEAM",
  "MY_TEAM_SUBTREE",
  "MY_OFFICE",
  "MY_LEGAL_ENTITY",
  "CUSTOM",
] as const;

export type AccessScope = (typeof ACCESS_SCOPES)[number];

export const ACCESS_SCOPE_LABELS: Record<AccessScope, string> = {
  SELF: "Own record",
  DIRECT_REPORTS: "Direct reports",
  COMPANY: "Whole company",
  MY_DEPARTMENT: "My department",
  MY_DEPARTMENT_SUBTREE: "My department and sub-departments",
  MY_TEAM: "My team",
  MY_TEAM_SUBTREE: "My team and sub-teams",
  MY_OFFICE: "My office",
  MY_LEGAL_ENTITY: "My legal entity",
  CUSTOM: "Custom",
};
