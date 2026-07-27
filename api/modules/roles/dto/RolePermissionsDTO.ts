import { AccessAction, AccessScope, ResourceCode } from "@/models/access";

// Matches backend RoleAccessPermissionRow.
export type RolePermissionDTO = {
  resourceCode: ResourceCode;
  action: AccessAction;
  scopes: AccessScope[];
};

// Matches backend RoleAccessPermissionsBody (GET /roles/{id}/permissions).
export type RolePermissionsDTO = {
  permissions: RolePermissionDTO[];
};

// PUT /roles/{id}/permissions — full replace, identical shape to the GET response.
// Every granted action has to be listed explicitly: the backend does not expand
// MANAGE into EDIT/VIEW (see canAccess).
export type UpdateRolePermissionsRequest = {
  permissions: RolePermissionDTO[];
};

// Saving rotates users.perm_hash, so the backend hands back a freshly signed token
// for the acting user. It is always present, even when their own hash did not change.
export type UpdateRolePermissionsResponse = {
  accessToken: string;
};
