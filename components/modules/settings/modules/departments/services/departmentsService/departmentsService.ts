import type { DepartmentTreeNode, DepartmentMembersPage } from "@/models/departments";

export class DepartmentsService {
  public async tree(nested = true, includeArchived = false): Promise<DepartmentTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    const res = await fetch(`/api/departments/tree?${params}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load departments tree");
    return res.json();
  }

  public async getMembers(id: string, page: number, size: number): Promise<DepartmentMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const res = await fetch(`/api/departments/${id}/members?${params}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load department members");
    return res.json();
  }
}

export const departmentsService = new DepartmentsService();
