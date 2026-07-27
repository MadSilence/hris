import { Role } from "@/models/role/Role";
import { hrisApiRolesClient } from "@/api/modules/roles/clients/hrisApiRolesClient";
import { roleMapper } from "@/api/modules/roles/mappers/roleMapper";
import { DuplicateRoleRequest } from "@/api/modules/roles/dto/DuplicateRoleRequest";
import { CreateRoleRequest } from "@/api/modules/roles/dto/CreateRoleRequest";
import { UpdateRoleRequest } from "@/api/modules/roles/dto/UpdateRoleRequest";
import { NewEntity, UpdatedEntity } from "@/models/misc";
import {
  RolePermissionsDTO,
  UpdateRolePermissionsRequest,
  UpdateRolePermissionsResponse,
} from "@/api/modules/roles/dto/RolePermissionsDTO";
import {
  RoleFieldAccessDTO,
  UpdateRoleFieldAccessRequest,
  UpdateRoleFieldAccessResponse,
} from "@/api/modules/roles/dto/RoleFieldAccessDTO";

export class HrisApiRolesService {
  public async getRoles(): Promise<Role[]> {
    const response = await hrisApiRolesClient.getRoles();
    return response.map((role) => roleMapper.mapRoleDTOtoRole(role));
  };

  public async getRolePermissions(roleId: string): Promise<RolePermissionsDTO> {
    return hrisApiRolesClient.getRolePermissions(roleId);
  }

  public async updateRolePermissions(
    roleId: string,
    payload: UpdateRolePermissionsRequest,
  ): Promise<UpdateRolePermissionsResponse> {
    return hrisApiRolesClient.updateRolePermissions(roleId, payload);
  }

  public async getRoleFieldAccess(roleId: string): Promise<RoleFieldAccessDTO> {
    return hrisApiRolesClient.getRoleFieldAccess(roleId);
  }

  public async updateRoleFieldAccess(
    roleId: string,
    payload: UpdateRoleFieldAccessRequest,
  ): Promise<UpdateRoleFieldAccessResponse> {
    return hrisApiRolesClient.updateRoleFieldAccess(roleId, payload);
  }

  public async createRole(payload: CreateRoleRequest): Promise<NewEntity> {
    const createResponse = await hrisApiRolesClient.createRole(payload);

    return {
      id: createResponse.id,
    };
  };

  public async updateRoleName(id: string, payload: UpdateRoleRequest): Promise<UpdatedEntity> {
    const updateResponse = await hrisApiRolesClient.updateRoleName(id, payload);

    return {
      id: updateResponse.id,
    };
  };

  public async duplicateRole(id: string, payload: DuplicateRoleRequest): Promise<NewEntity> {
    const createResponse = await hrisApiRolesClient.duplicateRole(id, payload);

    return {
      id: createResponse.id,
    };
  };

  public async deleteRole(id: string): Promise<UpdatedEntity> {
    // Backend responds 204 No Content (no body), so don't read from the response.
    await hrisApiRolesClient.deleteRole(id);
    return { id };
  }
}

export const hrisApiRolesService = new HrisApiRolesService();
