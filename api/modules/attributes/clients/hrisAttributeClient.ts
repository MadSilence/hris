import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { AttributeDeleteImpact } from "@/models/attribute/DeleteImpact";
import { ReorderItemRequest } from "@/api/modules/groups/dto";
import {
  AttributeUpdateResponse,
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

  /** A copy of the definition and its options, never the values. Without a name the backend names it. */
  public async duplicateAttribute(id: string, name?: string) {
    return hrisApiClient.post<CreateResponse>(
      `${this.BASE_PATH}/${id}/duplicate`,
      name === undefined ? undefined : { name },
    );
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
    // The id addresses the attribute; it is not a field of the update. The backend refuses a body
    // carrying a property its request does not declare, so it must not ride along.
    const { id, ...body } = payload;
    return hrisApiClient.patch<AttributeUpdateResponse>(`${this.BASE_PATH}/${id}`, body);
  }

  public async deleteAttribute(payload: DeleteAttributeRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`);
  }

  /** `version` is the attribute's — the option set is part of it, and saving the set bumps it. */
  public async setAttributeOptions(id: string, options: AttributeOptionUpsertRequest[], version?: number) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/${id}/options`, { options, version });
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
