// Frontend mirror of the backend `Scope` enum (com.example.security.access.Scope:
// SELF | DIRECT_REPORTS | COMPANY | CUSTOM). Same values. Prefixed `AccessScope` for readability.
// NOTE: this is NOT the backend's old storage-layer `AccessScope` (SELF/ASSIGNED/ALL) — that one
// was removed in the authorization unification. CUSTOM is declared but not yet implemented server-side.
export const ACCESS_SCOPES = ["SELF", "DIRECT_REPORTS", "COMPANY", "CUSTOM"] as const;

export type AccessScope = (typeof ACCESS_SCOPES)[number];
