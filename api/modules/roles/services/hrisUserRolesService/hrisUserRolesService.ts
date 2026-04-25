import { hrisApiUserRolesClient } from "@/api/modules/roles/clients/hrisApiUserRolesClient";
import { roleMapper } from "@/api/modules/roles/mappers/roleMapper";
import { Role } from "@/models/role/Role";

export class HrisUserRolesService {
  public async getUserRoles(userId: string): Promise<Role[]> {
    const dtos = await hrisApiUserRolesClient.getUserRoles(userId);
    return dtos.map(roleMapper.mapRoleDTOtoRole);
  }

  public async assignRole(userId: string, roleId: string): Promise<void> {
    await hrisApiUserRolesClient.assignRole(userId, roleId);
  }

  public async removeRole(userId: string, roleId: string): Promise<void> {
    await hrisApiUserRolesClient.removeRole(userId, roleId);
  }
}

export const hrisUserRolesService = new HrisUserRolesService();
