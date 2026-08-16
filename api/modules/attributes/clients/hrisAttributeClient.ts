import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { AttributeDeleteImpact } from "@/models/attribute/DeleteImpact";
import { ReorderItemRequest } from "@/api/modules/groups/dto";
import {
  CreateAttributeRequest,
  DeleteAttributeRequest,
  RenameAttributeRequest,
  UpdateAttributeRequest
} from "@/api/modules/attributes/dto";

class HrisAttributeClient {
  private readonly BASE_PATH: string = "/attributes";

  public async createAttribute(payload: CreateAttributeRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async exportAttributes(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }

  public async reorderAttributes(payload: ReorderItemRequest[]) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/reorder`, payload);
  }

  public async renameAttribute(payload: RenameAttributeRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/rename`, payload.name);
  }

  public async updateAttribute(payload: UpdateAttributeRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${payload.id}`, payload)
  }

  public async deleteAttribute(payload: DeleteAttributeRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`);
  }

  public async setAttributeOptions(id: string, options: AttributeOptionUpsertRequest[]) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/${id}/options`, { options });
  }

  public async getAttributeImpact(id: string): Promise<AttributeDeleteImpact> {
    return hrisApiClient.get<AttributeDeleteImpact>(`${this.BASE_PATH}/${id}/impact`);
  }
}

export type AttributeOptionUpsertRequest = {
  id?: string;
  value: string;
  color: string;
  sortOrder?: number;
};

export const hrisAttributeClient = new HrisAttributeClient();
