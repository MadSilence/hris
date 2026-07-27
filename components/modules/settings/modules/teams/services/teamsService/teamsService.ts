import type { TeamTreeNode, TeamMembersPage } from "@/models/teams";

export class TeamsService {
  public async tree(nested = true, includeArchived = false): Promise<TeamTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    const res = await fetch(`/api/teams/tree?${params}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load teams tree");
    return res.json();
  }

  public async getMembers(id: string, page: number, size: number): Promise<TeamMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const res = await fetch(`/api/teams/${id}/members?${params}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load team members");
    return res.json();
  }
}

export const teamsService = new TeamsService();
