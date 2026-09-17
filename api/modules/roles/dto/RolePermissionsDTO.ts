import { AccessAction, AccessScope, ResourceCode } from "@/models/access";
import type { Segment } from "@/models/segment/Segment";

// Matches backend RoleAccessPermissionRow.
export type RolePermissionDTO = {
  resourceCode: ResourceCode;
  action: AccessAction;
  scopes: AccessScope[];
  /** Required with a CUSTOM scope and rejected without one (RA00006 / RA00007). */
  scopeFilters?: Segment;
};

// Matches backend RoleAccessPermissionsBody (GET /roles/{id}/permissions).
export type RolePermissionsDTO = {
  permissions: RolePermissionDTO[];
  /** The role's version the grants were read at. Sent back on save; a stale one is E00409. */
  version?: number;
};

// PUT /roles/{id}/permissions — full replace, identical shape to the GET response.
// Every granted action has to be listed explicitly: the backend does not expand
// MANAGE into EDIT/VIEW (see canAccess).
export type UpdateRolePermissionsRequest = {
  permissions: RolePermissionDTO[];
  /** The `version` the matrix was loaded with — see `buildRolePermissionsBody`. */
  version?: number;
};

// Saving rotates users.perm_hash, so the backend hands back a freshly signed token
// for the acting user. It is always present, even when their own hash did not change.
export type UpdateRolePermissionsResponse = {
  accessToken: string;
};
