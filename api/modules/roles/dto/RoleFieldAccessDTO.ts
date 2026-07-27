// Matches backend role field access row. Each action lists the scopes it applies to
// (SELF / DIRECT_REPORTS / COMPANY); a scope belongs to at most one action.
export type RoleFieldAccessRowDTO = {
  fieldId: string;
  viewScopes: string[];
  editScopes: string[];
  manageScopes: string[];
};

// GET /roles/{id}/field-access
export type RoleFieldAccessDTO = {
  fields: RoleFieldAccessRowDTO[];
};

// PUT /roles/{id}/field-access — full replace, same shape as the GET response.
export type UpdateRoleFieldAccessRequest = {
  fields: RoleFieldAccessRowDTO[];
};

// Saving rotates accessHash/perm_hash, so a freshly signed token comes back.
export type UpdateRoleFieldAccessResponse = {
  accessToken: string;
};
