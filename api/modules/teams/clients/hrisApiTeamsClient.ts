import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TeamDTO,
  TeamTreeNodeDTO,
  TeamMembersPageDTO,
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  AssignTeamMemberRequest,
  AssignTeamLeadRequest,
} from "@/api/modules/teams/dto";
import { teamMapper } from "@/api/modules/teams/mappers";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { Team, TeamTreeNode, TeamMembersPage } from "@/models/teams";

export class HrisApiTeamsClient {
  private readonly BASE_PATH = "/teams";

  public async list(): Promise<Team[]> {
    const dtos = await hrisApiClient.get<TeamDTO[]>(this.BASE_PATH);
    return teamMapper.mapDTOs(dtos);
  }

  public async tree(nested: boolean, includeArchived = false): Promise<TeamTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    const dtos = await hrisApiClient.get<TeamTreeNodeDTO[]>(
      `${this.BASE_PATH}/tree?${params}`
    );
    return teamMapper.mapTreeNodeDTOs(dtos);
  }

  public async getById(id: string): Promise<Team> {
    const dto = await hrisApiClient.get<TeamDTO>(`${this.BASE_PATH}/${id}`);
    return teamMapper.mapDTO(dto);
  }

  public async create(body: CreateTeamRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.BASE_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async update(id: string, body: UpdateTeamRequest): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdateTeamRequest>(
      `${this.BASE_PATH}/${id}`,
      body
    );
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/activate`);
  }

  public async delete(id: string, body: DeleteTeamRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/delete`,
      body as unknown as Record<string, unknown>
    );
  }

  public async getMembers(id: string, page: number, size: number): Promise<TeamMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size), full: "false" });
    const dto = await hrisApiClient.get<TeamMembersPageDTO>(
      `${this.BASE_PATH}/${id}/members?${params}`
    );
    return teamMapper.mapMembersPageDTO(dto);
  }

  public async addMember(id: string, body: AssignTeamMemberRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/members`,
      body as unknown as Record<string, unknown>
    );
  }

  public async removeMember(id: string, userId: string): Promise<void> {
    return hrisApiClient.delete<void>(`${this.BASE_PATH}/${id}/members/${userId}`);
  }

  public async setLead(id: string, body: AssignTeamLeadRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/lead`,
      body as unknown as Record<string, unknown>
    );
  }
}

export const hrisApiTeamsClient = new HrisApiTeamsClient();
