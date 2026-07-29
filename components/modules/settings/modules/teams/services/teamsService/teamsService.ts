import { internalApiClient } from "@/components/clients/apiClient";
import type { TeamTreeNode, TeamMembersPage } from "@/models/teams";

export class TeamsService {
  public async tree(nested = true, includeArchived = false): Promise<TeamTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<TeamTreeNode[]>(`/teams/tree?${params}`);
  }

  public async getMembers(id: string, page: number, size: number): Promise<TeamMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return internalApiClient.get<TeamMembersPage>(`/teams/${id}/members?${params}`);
  }
}

export const teamsService = new TeamsService();
