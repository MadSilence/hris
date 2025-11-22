import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { CreateRoleRequest } from "@/api/modules/roles/dto/CreateRoleRequest";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { DuplicateRoleRequest } from "@/api/modules/roles/dto/DuplicateRoleRequest";
import { UpdateRoleNameRequest } from "@/api/modules/roles/dto/UpdateRoleNameRequest";

class HrisApiRolesClient {
  private readonly BASE_PATH: string = '/roles';

  public async getRoles(): Promise<RoleDTO[]> {
    return hrisApiClient.get<RoleDTO[]>(this.BASE_PATH);
  }

  // public async getRoleDetails(id: string) {
  //     return hrisApiClient.get<RoleDTO>(`${this.BASE_PATH}/${id}`);
  // }

  public async createRole(requestDTO: CreateRoleRequest) {
    return hrisApiClient.post<CreateResponse>(this.BASE_PATH + "/create", requestDTO);
  }

  public async updateRoleName(id: string, requestDTO: UpdateRoleNameRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${id}/update`);
  }

  public async duplicateRole(id: string, requestDTO: DuplicateRoleRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/${id}/duplicate`, requestDTO);
  }

  // public async deleteRole(id: string) {
  //     return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/delete`);
  // }
}

export const hrisApiRolesClient = new HrisApiRolesClient();
