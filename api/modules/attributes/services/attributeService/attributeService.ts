import { NewEntity, UpdatedEntity } from "@/models/misc";

import { hrisAttributeClient } from "@/api/modules/attributes/clients/hrisAttributeClient";
import {
  CreateAttributeRequest,
  DeleteAttributeRequest,
  RenameAttributeRequest,
  UpdateAttributeRequest
} from "@/api/modules/attributes/dto";
import { ReorderItemRequest } from "@/api/modules/groups/dto";

export class AttributeService {

  public async createAttribute(payload: CreateAttributeRequest): Promise<NewEntity> {
    const createResponse = await hrisAttributeClient.createAttribute(payload);
    return { id: createResponse.id };
  }

  public async reorderAttributes(payload: ReorderItemRequest[]): Promise<Response> {
    return hrisAttributeClient.reorderAttributes(payload);
  }

  public async renameAttribute(payload: RenameAttributeRequest): Promise<UpdatedEntity> {
    return hrisAttributeClient.renameAttribute(payload);
  }

  public async updateAttribute(payload: UpdateAttributeRequest): Promise<UpdatedEntity> {
    return hrisAttributeClient.updateAttribute(payload);
  }

  public async deleteAttribute(payload: DeleteAttributeRequest): Promise<Response> {
    return hrisAttributeClient.deleteAttribute(payload);
  }
}

export const attributeService = new AttributeService();
