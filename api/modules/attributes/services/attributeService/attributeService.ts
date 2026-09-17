import { NewEntity, UpdatedEntity } from "@/models/misc";

import {
  hrisAttributeClient,
  AttributeOptionUpsertRequest,
} from "@/api/modules/attributes/clients/hrisAttributeClient";
import {
  AttributeUpdateResponse,
  CreateAttributeRequest,
  DeleteAttributeRequest,
  RenameAttributeRequest,
  UpdateAttributeRequest
} from "@/api/modules/attributes/dto";
import { ReorderItemRequest } from "@/api/modules/groups/dto";
import { AttributeDeleteImpact } from "@/models/attribute/DeleteImpact";

export class AttributeService {

  public async createAttribute(payload: CreateAttributeRequest): Promise<NewEntity> {
    const createResponse = await hrisAttributeClient.createAttribute(payload);
    return { id: createResponse.id };
  }

  public async duplicateAttribute(id: string, name?: string): Promise<NewEntity> {
    const createResponse = await hrisAttributeClient.duplicateAttribute(id, name);
    return { id: createResponse.id };
  }

  public async exportAttributes(format: "csv" | "xlsx"): Promise<Response> {
    return hrisAttributeClient.exportAttributes(format);
  }

  public async reorderAttributes(payload: ReorderItemRequest[]): Promise<Response> {
    return hrisAttributeClient.reorderAttributes(payload);
  }

  public async renameAttribute(payload: RenameAttributeRequest): Promise<UpdatedEntity> {
    return hrisAttributeClient.renameAttribute(payload);
  }

  public async updateAttribute(payload: UpdateAttributeRequest): Promise<AttributeUpdateResponse> {
    return hrisAttributeClient.updateAttribute(payload);
  }

  public async deleteAttribute(payload: DeleteAttributeRequest): Promise<Response> {
    return hrisAttributeClient.deleteAttribute(payload);
  }

  public async setAttributeOptions(
    id: string,
    options: AttributeOptionUpsertRequest[],
    version?: number
  ): Promise<Response> {
    return hrisAttributeClient.setAttributeOptions(id, options, version);
  }

  public async getAttributeImpact(id: string): Promise<AttributeDeleteImpact> {
    return hrisAttributeClient.getAttributeImpact(id);
  }
}

export const attributeService = new AttributeService();
