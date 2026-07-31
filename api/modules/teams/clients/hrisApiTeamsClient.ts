import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TeamDTO,
  TeamTreeNodeDTO,
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  ArchiveTeamRequest,
} from "@/api/modules/teams/dto";
import { teamMapper } from "@/api/modules/teams/mappers";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { Team, TeamTreeNode } from "@/models/teams";

function toBackendBody(
  body: CreateTeamRequest | UpdateTeamRequest,
): Record<string, unknown> {
  const { description, ...rest } = body;
  return { ...rest, about: description };
}

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
    return hrisApiClient.post<CreateResponse>(this.BASE_PATH, toBackendBody(body));
  }

  public async update(id: string, body: UpdateTeamRequest): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, toBackendBody(body));
  }

  public async archive(id: string, body?: ArchiveTeamRequest): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/archive`,
      body as unknown as Record<string, unknown>,
    );
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
}

export const hrisApiTeamsClient = new HrisApiTeamsClient();
