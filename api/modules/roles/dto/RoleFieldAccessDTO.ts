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
  /** The role's version the matrix was read at. Sent back on save; a stale one is E00409. */
  version?: number;
};

// PUT /roles/{id}/field-access — full replace, same shape as the GET response.
export type UpdateRoleFieldAccessRequest = {
  fields: RoleFieldAccessRowDTO[];
  /** The `version` the matrix was loaded with — see `buildFieldAccessBody`. */
  version?: number;
};

// Saving rotates accessHash/perm_hash, so a freshly signed token comes back.
export type UpdateRoleFieldAccessResponse = {
  accessToken: string;
};
