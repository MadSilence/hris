export interface UpdateDepartmentPayload {
  name?: string;
  description?: string | null;
  code?: string | null;
  parentId?: string | null;
}
