import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { UsersSearchResponseDTO } from "@/models/user/fields";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";

export class HrisApiUserRolesClient {
  private readonly USERS_BASE: string = "/users";

  public async getUserRoles(userId: string): Promise<RoleDTO[]> {
    return hrisApiClient.get<RoleDTO[]>(`${this.USERS_BASE}/${userId}/roles`);
  }

  public async assignRole(userId: string, roleId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.USERS_BASE}/${userId}/roles/assign`, { roleId });
  }

  public async removeRole(userId: string, roleId: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.USERS_BASE}/${userId}/roles/${roleId}`);
  }

  public async getRoleUsers(
    roleId: string,
    params: { q?: string | null; cursor?: string | null; limit?: number },
  ): Promise<UsersSearchResponseDTO> {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit != null) search.set("limit", String(params.limit));

    const query = search.toString();
    const response = await hrisApiClient.get<UsersSearchResponseDTO>(
      `/roles/${roleId}/users${query ? `?${query}` : ""}`,
    );

    return {
      ...response,
      items: response.items.map((item) => ({
        ...item,
        avatarUrl: resolveBackendAssetUrl(item.avatarUrl),
      })),
    };
  }
}

export const hrisApiUserRolesClient = new HrisApiUserRolesClient();
