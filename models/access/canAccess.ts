import { AccessAction } from "./AccessAction";
import { AccessScope } from "./AccessScope";
import { EffectiveAccess, isAdmin, isSystemOwner } from "./EffectiveAccess";
import { ResourceCode } from "./ResourceCode";

export type AccessCheck = {
  resource: ResourceCode;
  action: AccessAction;
  scope?: AccessScope;
};

// Mirrors the backend check exactly (EffectiveAccess#can): the action must be granted
// literally. Actions are NOT hierarchical — MANAGE does not imply EDIT or VIEW, so a role
// holding only MANAGE is denied on every VIEW endpoint. Scopes, in contrast, ARE
// hierarchical: COMPANY covers SELF and DIRECT_REPORTS. The asymmetry is intentional on
// the backend, so do not "fix" one side to match the other.
export function canAccess(params: {
  access: EffectiveAccess | null | undefined;
  resource: ResourceCode;
  action: AccessAction;
  scope?: AccessScope;
}): boolean {
  const { access, resource, action, scope } = params;

  if (!access) return false;
  if (isSystemOwner(access)) return true;

  const scopes = access.permissions?.[resource]?.[action];
  if (!scopes || scopes.length === 0) return false;

  // No scope requested: any granted scope is enough.
  if (!scope) return true;

  // COMPANY is the widest scope and satisfies any requested scope.
  return scopes.includes(scope) || scopes.includes("COMPANY");
}

/**
 * Settings → Login & SSO → Sign-in Security: a System Owner, or an Admin holding SETTINGS.GENERAL MANAGE —
 * the backend's `MfaPolicy.mayChangeSecuritySettings`, which still decides on save. The Admin flag alone never grants.
 */
export function mayChangeSecuritySettings(access: EffectiveAccess | null | undefined): boolean {
  if (!access) return false;
  if (isSystemOwner(access)) return true;
  return isAdmin(access) && canAccess({ access, resource: "SETTINGS.GENERAL", action: "MANAGE" });
}
