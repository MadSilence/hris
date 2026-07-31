import { internalApiClient } from "@/components/clients/apiClient";
import type { DepartmentTreeNode } from "@/models/departments";

export class DepartmentsService {
  public async tree(nested = true, includeArchived = false): Promise<DepartmentTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<DepartmentTreeNode[]>(`/departments/tree?${params}`);
  }
}

export const departmentsService = new DepartmentsService();
