import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisGroupsClient } from "@/api/modules/groups/clients";
import {
  CreateGroupRequest,
  RenameAttributeGroupRequest,
  ReorderItemRequest
} from "@/api/modules/groups/dto";
import { groupMapper } from "@/api/modules/groups/mappers/groupMapper";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { DeleteAttributeGroupRequest } from "@/api/modules/groups/dto/DeleteAttributeGroupRequest";

export class GroupsService {
  public async getGroups(): Promise<AttributeGroup[]> {
    const response = await hrisGroupsClient.getGroups();
    return response.map((group) => groupMapper.mapGroupDtoToGroup(group));
  }

  public async createGroup(payload: CreateGroupRequest): Promise<NewEntity> {
    const createResponse = await hrisGroupsClient.createGroup(payload);

    return {
      id: createResponse.id,
    };
  };

  public async reorderAttributeGroups(payload: ReorderItemRequest[]): Promise<Response> {
    return hrisGroupsClient.reorderAttributeGroups(payload);
  }

  public async renameAttributeGroup(payload: RenameAttributeGroupRequest): Promise<UpdatedEntity> {
    return hrisGroupsClient.renameAttributeGroup(payload);
  }

  public async deleteAttributeGroup(payload: DeleteAttributeGroupRequest): Promise<Response> {
    return hrisGroupsClient.deleteAttributeGroup(payload);
  }
}

export const groupsService = new GroupsService();
