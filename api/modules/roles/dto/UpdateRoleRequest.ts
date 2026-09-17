/** Partial patch: an omitted field is left as it is on the backend. */
export type UpdateRoleRequest = {
  newName?: string;
  description?: string;
  /** The role's version the form was opened with; a stale one is refused with E00409. */
  version?: number;
}
