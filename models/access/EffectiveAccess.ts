import { AccessAction } from "./AccessAction";
import { AccessScope } from "./AccessScope";
import { ResourceCode } from "./ResourceCode";

// Scopes granted per action for a single resource.
export type ResourceAccess = Partial<Record<AccessAction, AccessScope[]>>;

// Per-field access, merged across all of the user's roles (max level wins).
// A field missing from the map means no access. Non-configurable system fields are
// sent as "EDIT", so the single rule "not in the map → hide" holds without special cases.
export type FieldAccessGrant = "VIEW" | "EDIT";

// Effective access for the current user, as returned by GET /me/access.
// IMPORTANT: a system owner comes back with EMPTY permissions/moduleSummary/fields and
// `systemOwner: true` — the backend skips building the maps because every check passes
// anyway. Reading those empty maps as "no access" would lock the most privileged user out
// of the UI while the API lets them everywhere, so isSystemOwner must be checked first.
export type EffectiveAccess = {
  systemOwner: boolean;
  permissions: Partial<Record<ResourceCode, ResourceAccess>>;
  fields: Record<string, FieldAccessGrant>;
  moduleSummary: Partial<Record<ResourceCode, AccessAction>>;
  accessHash: string;
};

export type MeAccessDTO = EffectiveAccess;

// Legacy marker kept as a fallback for responses issued before `systemOwner` was added.
export const SYSTEM_OWNER_ACCESS_HASH = "system-owner";

export function isSystemOwner(access: EffectiveAccess | null | undefined): boolean {
  if (!access) return false;
  return access.systemOwner === true || access.accessHash === SYSTEM_OWNER_ACCESS_HASH;
}
