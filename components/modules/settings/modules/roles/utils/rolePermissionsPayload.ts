import { RolePermissionDTO } from "@/api/modules/roles/dto/RolePermissionsDTO";
import {
  ACCESS_ACTION_RANK,
  AccessAction,
  AccessScope,
  isSupportedPermission,
  RESOURCE_GROUPS,
  ResourceCode,
} from "@/models/access";

// Editor state: which scopes are granted for every resource/action pair.
// An action that is absent, or present with an empty list, means "no access".
export type RolePermissionsDraft = Partial<
  Record<ResourceCode, Partial<Record<AccessAction, AccessScope[]>>>
>;

const RESOURCE_ORDER: ResourceCode[] = RESOURCE_GROUPS.flatMap((group) =>
  group.resources.map((resource) => resource.code),
);

const ACTIONS_IN_ORDER = (Object.keys(ACCESS_ACTION_RANK) as AccessAction[]).sort(
  (a, b) => ACCESS_ACTION_RANK[a] - ACCESS_ACTION_RANK[b],
);

// Normalizes a scope selection: COMPANY is the widest scope and absorbs the narrower
// ones, so sending it alongside SELF/DIRECT_REPORTS is redundant.
export function normalizeScopes(scopes: AccessScope[]): AccessScope[] {
  const unique = Array.from(new Set(scopes));
  if (unique.includes("COMPANY")) return ["COMPANY"];

  return unique;
}

export function draftFromPermissions(permissions: RolePermissionDTO[]): RolePermissionsDraft {
  const draft: RolePermissionsDraft = {};

  for (const permission of permissions) {
    const resource = draft[permission.resourceCode] ?? {};
    resource[permission.action] = normalizeScopes(permission.scopes);
    draft[permission.resourceCode] = resource;
  }

  return draft;
}

// Builds the PUT body. The backend does a full replace and matches actions literally
// (MANAGE does NOT imply EDIT/VIEW), so the caller must have granted every action it
// wants explicitly — this function never expands or infers anything.
//
// Rows are dropped when the combination is unsupported (422 RA00001/RA00002/RA00003)
// or the scope list is empty. An empty list is NOT sent as a row: the backend would keep
// the row and let can() pass, which reads as access rather than as a denial.
export function buildRolePermissionsPayload(draft: RolePermissionsDraft): RolePermissionDTO[] {
  const payload: RolePermissionDTO[] = [];

  // One row per resource/action pair at most — a duplicate pair is a 422 RA00004.
  for (const resourceCode of RESOURCE_ORDER) {
    const actions = draft[resourceCode];
    if (!actions) continue;

    for (const action of ACTIONS_IN_ORDER) {
      const scopes = normalizeScopes(actions[action] ?? []).filter((scope) =>
        isSupportedPermission(resourceCode, action, scope),
      );

      if (scopes.length === 0) continue;

      payload.push({ resourceCode, action, scopes });
    }
  }

  return payload;
}

// A single cell of the matrix. The backend accepts any combination of SELF and
// DIRECT_REPORTS, so both the pair and each one alone need to be representable.
export const SCOPE_CHOICES = [
  "NONE",
  "SELF",
  "DIRECT_REPORTS",
  "SELF_AND_REPORTS",
  "COMPANY",
] as const;

export type ScopeChoice = (typeof SCOPE_CHOICES)[number];

export const SCOPE_CHOICE_LABELS: Record<ScopeChoice, string> = {
  NONE: "No access",
  SELF: "Own record",
  DIRECT_REPORTS: "Direct reports",
  SELF_AND_REPORTS: "Own record + direct reports",
  COMPANY: "Whole company",
};

export function scopesToChoice(scopes: AccessScope[] | undefined): ScopeChoice {
  const normalized = normalizeScopes(scopes ?? []);

  if (normalized.includes("COMPANY")) return "COMPANY";

  const hasSelf = normalized.includes("SELF");
  const hasReports = normalized.includes("DIRECT_REPORTS");

  if (hasSelf && hasReports) return "SELF_AND_REPORTS";
  if (hasReports) return "DIRECT_REPORTS";
  if (hasSelf) return "SELF";

  return "NONE";
}

export function choiceToScopes(choice: ScopeChoice): AccessScope[] {
  switch (choice) {
    case "COMPANY":
      return ["COMPANY"];
    case "SELF_AND_REPORTS":
      return ["SELF", "DIRECT_REPORTS"];
    case "DIRECT_REPORTS":
      return ["DIRECT_REPORTS"];
    case "SELF":
      return ["SELF"];
    default:
      return [];
  }
}

// Which choices make sense for a resource: COMPANY-only resources get a plain
// on/off pair, personal-scope resources get the full ladder.
export function availableScopeChoices(resourceCode: ResourceCode, action: AccessAction): ScopeChoice[] {
  return SCOPE_CHOICES.filter(
    (choice) =>
      choice === "NONE" ||
      choiceToScopes(choice).every((scope) => isSupportedPermission(resourceCode, action, scope)),
  );
}

export type RolePermissionChange = {
  resourceCode: ResourceCode;
  resourceLabel: string;
  action: AccessAction;
  from: ScopeChoice;
  to: ScopeChoice;
};

// Lists every resource/action whose granted scope changed between two drafts.
// Used to show a review summary before saving.
export function diffRolePermissions(
  before: RolePermissionsDraft,
  after: RolePermissionsDraft,
): RolePermissionChange[] {
  const changes: RolePermissionChange[] = [];

  for (const group of RESOURCE_GROUPS) {
    for (const resource of group.resources) {
      for (const action of resource.supportedActions) {
        const from = scopesToChoice(before[resource.code]?.[action]);
        const to = scopesToChoice(after[resource.code]?.[action]);

        if (from !== to) {
          changes.push({
            resourceCode: resource.code,
            resourceLabel: resource.label,
            action,
            from,
            to,
          });
        }
      }
    }
  }

  return changes;
}

// True when the role can reach a resource at all. A role holding only EDIT or MANAGE
// without VIEW passes no GET endpoint, which is almost never what the admin meant.
export function isMissingViewAccess(
  resourceCode: ResourceCode,
  actions: Partial<Record<AccessAction, AccessScope[]>> | undefined,
): boolean {
  if (!actions) return false;

  const hasView = (actions.VIEW ?? []).length > 0;
  const hasHigher = (actions.EDIT ?? []).length > 0 || (actions.MANAGE ?? []).length > 0;

  return hasHigher && !hasView && isSupportedPermission(resourceCode, "VIEW", "COMPANY");
}
