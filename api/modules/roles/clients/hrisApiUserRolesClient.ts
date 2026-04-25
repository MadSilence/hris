import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { roleMapper } from "@/api/modules/roles/mappers/roleMapper";

export class HrisApiUserRolesClient {
  private readonly USERS_BASE: string = "/users";

  public async getUserRoles(userId: string): Promise<RoleDTO[]> {
    return hrisApiClient.get<RoleDTO[]>(`${this.USERS_BASE}/${userId}/roles`);
  }

  public async assignRole(userId: string, roleId: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.USERS_BASE}/${userId}/roles/${roleId}`);
  }

  public async removeRole(userId: string, roleId: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.USERS_BASE}/${userId}/roles/${roleId}`);
  }
}

export const hrisApiUserRolesClient = new HrisApiUserRolesClient();
