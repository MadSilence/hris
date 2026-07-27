import { hrisApiUserRolesClient } from "@/api/modules/roles/clients/hrisApiUserRolesClient";
import { roleMapper } from "@/api/modules/roles/mappers/roleMapper";
import { Role } from "@/models/role/Role";
import { UsersSearchResponseDTO } from "@/models/user/fields";

export class HrisUserRolesService {
  public async getUserRoles(userId: string): Promise<Role[]> {
    const dtos = await hrisApiUserRolesClient.getUserRoles(userId);
    return dtos.map(roleMapper.mapRoleDTOtoRole);
  }

  public async getRoleUsers(
    roleId: string,
    params: { q?: string | null; cursor?: string | null; limit?: number },
  ): Promise<UsersSearchResponseDTO> {
    return hrisApiUserRolesClient.getRoleUsers(roleId, params);
  }

  public async assignRole(userId: string, roleId: string): Promise<void> {
    await hrisApiUserRolesClient.assignRole(userId, roleId);
  }

  public async removeRole(userId: string, roleId: string): Promise<void> {
    await hrisApiUserRolesClient.removeRole(userId, roleId);
  }
}

export const hrisUserRolesService = new HrisUserRolesService();
