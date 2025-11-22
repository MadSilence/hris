import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
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

  public async reorderAttributes(payload: ReorderItemRequest[]) {
    return hrisApiClient.put<Response>(`${this.BASE_PATH}/reorder`, payload);
  }

  public async renameAttribute(payload: RenameAttributeRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/rename`, payload.name);
  }

  public async updateAttribute(payload: UpdateAttributeRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/update`, payload)
  }

  public async deleteAttribute(payload: DeleteAttributeRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`);
  }
}

export const hrisAttributeClient = new HrisAttributeClient();
