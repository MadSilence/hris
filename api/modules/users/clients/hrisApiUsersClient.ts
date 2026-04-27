import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { UserDTO } from "@/api/modules/users/dto";
import { GetUsersArgs, UsersSearchArgs } from "@/api/modules/users/services/hrisUsersService";
import { userMapper } from "@/api/modules/users/mappers/userMapper";
import { FieldDTO, UsersSearchRequest, UsersSearchResponseDTO } from "@/models/user/fields";
import { User } from "@/models/user/User";

export class HrisApiUsersClient {
  private readonly BASE_PATH: string = '/users';

  public async getUsers(
    args?: GetUsersArgs
  ): Promise<UserDTO[] | { items: UserDTO[]; nextCursor?: string | null }> {
    const params = new URLSearchParams();
    if (args?.limit) params.set("limit", String(args.limit));
    if (args?.cursor) params.set("cursor", args.cursor);
    if (args?.q) params.set("q", args.q);
    if (args?.sortField) params.set("sortField", args.sortField);
    if (args?.sortDir) params.set("sortDir", args.sortDir);

    const path = `${this.BASE_PATH}${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await hrisApiClient.get<{ items: UserDTO[]; nextCursor?: string | null } | UserDTO[]>(path);
    if (Array.isArray(res)) {
      return res.map((u) => userMapper.mapUserDTOtoUser(u));
    }
    return {
      items: res.items.map((u) => userMapper.mapUserDTOtoUser(u)),
      nextCursor: res.nextCursor ?? null,
    } as any;
  }

  public async getUser(id: string) {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/${id}`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async getCurrentUser(): Promise<User> {
    const dto = await hrisApiClient.get<UserDTO>(`${this.BASE_PATH}/me`);
    return userMapper.mapUserDTOtoUser(dto);
  }

  public async searchUsers(
    args: UsersSearchArgs
  ): Promise<{ items: any[]; nextCursor?: string | null }> {
    const body = {
      limit: args.limit ?? 100,
      cursor: args.cursor ?? null,
      q: args.q ?? null,
      sortField: args.sortField ?? "last_name",
      sortDir: args.sortDir ?? "asc",
      filters: args.filters ?? [],
      selectedFields: args.selectedFields ?? [],
    };

    const res = await hrisApiClient.post<{ items: UserDTO[]; nextCursor?: string | null }>(
      `${this.BASE_PATH}/search`,
      body
    );

    return {
      items: res.items.map((u) => userMapper.mapUserDTOtoUser(u)),
      nextCursor: res.nextCursor ?? null,
    };
  }

  async getFields(): Promise<FieldDTO[]> {
    return hrisApiClient.get<FieldDTO[]>(`${this.BASE_PATH}/fields`);
  }

  async search(body: UsersSearchRequest): Promise<UsersSearchResponseDTO> {
    return hrisApiClient.post<UsersSearchResponseDTO>(`${this.BASE_PATH}/search`, body);
  }
}

export const hrisApiUsersClient = new HrisApiUsersClient();
