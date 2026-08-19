import { internalApiClient } from "@/components/clients/apiClient";
import type {
  DepartmentPerson,
  DepartmentSummary,
  DepartmentTreeNode,
} from "@/models/departments";

export class DepartmentsService {
  public async tree(nested = true, includeArchived = false): Promise<DepartmentTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<DepartmentTreeNode[]>(`/departments/tree?${params}`);
  }

  public async summary(includeArchived = false): Promise<DepartmentSummary> {
    const params = new URLSearchParams();
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<DepartmentSummary>(`/departments/summary?${params}`);
  }

  public async people(q?: string): Promise<DepartmentPerson[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    return internalApiClient.get<DepartmentPerson[]>(`/departments/people?${params}`);
  }
}

export const departmentsService = new DepartmentsService();
