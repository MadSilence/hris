import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { RoleDeleteImpactDTO } from "@/api/modules/roles/dto/RoleDeleteImpactDTO";
import { RoleAccessPreviewDTO } from "@/api/modules/roles/dto/RoleAccessPreviewDTO";
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

  public async getRoles(includeArchived = false): Promise<RoleDTO[]> {
    const suffix = includeArchived ? "?includeArchived=true" : "";
    return hrisApiClient.get<RoleDTO[]>(`${this.BASE_PATH}${suffix}`);
  }

  public async previewRoleAccess(roleIds: string[]): Promise<RoleAccessPreviewDTO> {
    return hrisApiClient.post<RoleAccessPreviewDTO>(
      `${this.BASE_PATH}/preview`,
      { roleIds },
    );
  }

  public async getRoleDeleteImpact(roleId: string): Promise<RoleDeleteImpactDTO> {
    return hrisApiClient.get<RoleDeleteImpactDTO>(`${this.BASE_PATH}/${roleId}/impact`);
  }

  public async archiveRole(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }

  public async restoreRole(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/restore`);
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
    // Undefined fields are dropped so the backend leaves them alone — that is what makes editing
    // the description without touching the name (and vice versa) possible.
    const payload: Record<string, string> = {};
    if (requestDTO.newName !== undefined) payload.name = requestDTO.newName;
    if (requestDTO.description !== undefined) payload.description = requestDTO.description;

    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, payload);
  }

  public async duplicateRole(id: string, requestDTO: DuplicateRoleRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/${id}/duplicate`, requestDTO);
  }

  public async deleteRole(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/delete`);
  }

  public async exportRoles(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }

  public async exportRoleUsers(id: string, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/${id}/users/export?format=${format}`);
  }
}

export const hrisApiRolesClient = new HrisApiRolesClient();
