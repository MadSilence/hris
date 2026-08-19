export interface MoveDepartmentRequest {
  /** null makes the department top-level. */
  parentId: string | null;
}
