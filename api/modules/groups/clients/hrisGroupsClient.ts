import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  AttributeGroupDTO,
  CreateGroupRequest,
  DeleteAttributeGroupRequest,
  RenameAttributeGroupRequest,
  ReorderItemRequest
} from "@/api/modules/groups/dto";

class HrisGroupsClient {
  private readonly BASE_PATH: string = "/groups";

  public async getGroups(): Promise<AttributeGroupDTO[]> {
    return hrisApiClient.get<AttributeGroupDTO[]>(this.BASE_PATH);
  }

  public async createGroup(payload: CreateGroupRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload)
  }

  public async reorderAttributeGroups(payload: ReorderItemRequest[]) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/reorder`, payload)
  }

  public async renameAttributeGroup(payload: RenameAttributeGroupRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/rename`, { name: payload.name })
  }

  public async deleteAttributeGroup(payload: DeleteAttributeGroupRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }
}

export const hrisGroupsClient = new HrisGroupsClient();
