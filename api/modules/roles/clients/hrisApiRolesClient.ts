import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { CreateRoleRequest } from "@/api/modules/roles/dto/CreateRoleRequest";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { DuplicateRoleRequest } from "@/api/modules/roles/dto/DuplicateRoleRequest";
import { UpdateRoleRequest } from "@/api/modules/roles/dto/UpdateRoleRequest";
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

class HrisApiRolesClient {
  private readonly BASE_PATH: string = '/roles';

  public async getRoles(): Promise<RoleDTO[]> {
    return hrisApiClient.get<RoleDTO[]>(this.BASE_PATH);
  }

  public async getRolePermissions(roleId: string): Promise<RolePermissionsDTO> {
    return hrisApiClient.get<RolePermissionsDTO>(`${this.BASE_PATH}/${roleId}/permissions`);
  }

  public async updateRolePermissions(
    roleId: string,
    payload: UpdateRolePermissionsRequest,
  ): Promise<UpdateRolePermissionsResponse> {
    return hrisApiClient.put<UpdateRolePermissionsResponse, UpdateRolePermissionsRequest>(
      `${this.BASE_PATH}/${roleId}/permissions`,
      payload,
    );
  }

  public async getRoleFieldAccess(roleId: string): Promise<RoleFieldAccessDTO> {
    return hrisApiClient.get<RoleFieldAccessDTO>(`${this.BASE_PATH}/${roleId}/field-access`);
  }

  public async updateRoleFieldAccess(
    roleId: string,
    payload: UpdateRoleFieldAccessRequest,
  ): Promise<UpdateRoleFieldAccessResponse> {
    return hrisApiClient.put<UpdateRoleFieldAccessResponse, UpdateRoleFieldAccessRequest>(
      `${this.BASE_PATH}/${roleId}/field-access`,
      payload,
    );
  }

  public async createRole(requestDTO: CreateRoleRequest) {
    return hrisApiClient.post<CreateResponse>(this.BASE_PATH + "/create", requestDTO);
  }

  public async updateRoleName(id: string, requestDTO: UpdateRoleRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, {
      name: requestDTO.newName,
    });
  }

  public async duplicateRole(id: string, requestDTO: DuplicateRoleRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/${id}/duplicate`, requestDTO);
  }

  public async deleteRole(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisApiRolesClient = new HrisApiRolesClient();
