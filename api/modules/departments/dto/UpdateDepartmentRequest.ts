export interface UpdateDepartmentRequest {
  name?: string;
  description?: string | null;
  code?: string | null;
  parentId?: string | null;
  leadId?: string | null;
  /** The version the dialog was opened with. */
  version?: number;
}
