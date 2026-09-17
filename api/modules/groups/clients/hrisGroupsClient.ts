import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { GroupDeleteImpact } from "@/models/attribute/DeleteImpact";
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

  // The backend refuses a body carrying a property its request does not declare, so the body is
  // built field by field rather than forwarding whatever the caller handed in.
  public async createGroup(payload: CreateGroupRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, {
      name: payload.name,
      description: payload.description ?? null,
    })
  }

  public async reorderAttributeGroups(payload: ReorderItemRequest[]) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/reorder`, payload)
  }

  public async renameAttributeGroup(payload: RenameAttributeGroupRequest) {
    // The description is replaced, not patched: a missing one clears it, so it always rides along.
    // The version is the one the form was opened with — a stale one is refused (E00409).
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/rename`, {
      name: payload.name,
      description: payload.description ?? null,
      version: payload.version,
    })
  }

  public async deleteAttributeGroup(payload: DeleteAttributeGroupRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }

  public async getGroupImpact(id: string): Promise<GroupDeleteImpact> {
    return hrisApiClient.get<GroupDeleteImpact>(`${this.BASE_PATH}/${id}/impact`);
  }
}

export const hrisGroupsClient = new HrisGroupsClient();
