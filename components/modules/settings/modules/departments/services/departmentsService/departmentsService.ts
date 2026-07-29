import { internalApiClient } from "@/components/clients/apiClient";
import type { DepartmentTreeNode, DepartmentMembersPage } from "@/models/departments";

export class DepartmentsService {
  public async tree(nested = true, includeArchived = false): Promise<DepartmentTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<DepartmentTreeNode[]>(`/departments/tree?${params}`);
  }

  public async getMembers(id: string, page: number, size: number): Promise<DepartmentMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return internalApiClient.get<DepartmentMembersPage>(`/departments/${id}/members?${params}`);
  }
}

export const departmentsService = new DepartmentsService();
