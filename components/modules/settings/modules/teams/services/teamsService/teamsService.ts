import { internalApiClient } from "@/components/clients/apiClient";
import type { TeamPerson, TeamSummary, TeamTreeNode } from "@/models/teams";

export class TeamsService {
  public async tree(nested = true, includeArchived = false): Promise<TeamTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<TeamTreeNode[]>(`/teams/tree?${params}`);
  }

  public async summary(includeArchived = false): Promise<TeamSummary> {
    const params = new URLSearchParams();
    if (includeArchived) params.set("includeArchived", "true");
    return internalApiClient.get<TeamSummary>(`/teams/summary?${params}`);
  }

  public async people(q?: string): Promise<TeamPerson[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    return internalApiClient.get<TeamPerson[]>(`/teams/people?${params}`);
  }
}

export const teamsService = new TeamsService();
