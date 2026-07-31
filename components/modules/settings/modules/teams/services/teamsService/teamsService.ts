import { internalApiClient } from "@/components/clients/apiClient";
import type { TeamTreeNode } from "@/models/teams";

export class TeamsService {
  public async tree(nested = true, includeArchived = false): Promise<TeamTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<TeamTreeNode[]>(`/teams/tree?${params}`);
  }
}

export const teamsService = new TeamsService();
