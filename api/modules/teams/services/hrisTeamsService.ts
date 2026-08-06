import { hrisApiTeamsClient } from "@/api/modules/teams/clients";
import type {
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  ArchiveTeamRequest,
} from "@/api/modules/teams/dto";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { Team, TeamTreeNode } from "@/models/teams";

export class HrisTeamsService {
  public async list(): Promise<Team[]> {
    return hrisApiTeamsClient.list();
  }

  public async tree(nested: boolean, includeArchived?: boolean): Promise<TeamTreeNode[]> {
    return hrisApiTeamsClient.tree(nested, includeArchived);
  }

  public async getById(id: string): Promise<Team> {
    return hrisApiTeamsClient.getById(id);
  }

  public async create(body: CreateTeamRequest): Promise<CreateResponse> {
    return hrisApiTeamsClient.create(body);
  }

  public async update(id: string, body: UpdateTeamRequest): Promise<UpdateResponse> {
    return hrisApiTeamsClient.update(id, body);
  }

  public async archive(id: string, body?: ArchiveTeamRequest): Promise<UpdateResponse> {
    return hrisApiTeamsClient.archive(id, body);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiTeamsClient.activate(id);
  }

  public async delete(id: string, body: DeleteTeamRequest): Promise<void> {
    return hrisApiTeamsClient.delete(id, body);
  }

  public async exportTree(
    id: string,
    opts: { format: "csv" | "xlsx"; includeSubNodes: boolean; includePeople: boolean },
  ): Promise<Response> {
    return hrisApiTeamsClient.exportTree(id, opts);
  }
}

export const hrisTeamsService = new HrisTeamsService();
