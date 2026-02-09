import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  CreateLegalEntityRequest,
  DeleteLegalEntityRequest,
  LegalEntityDTO,
  UpdateLegalEntityRequest
} from "@/api/modules/legalEntity/dto";

class HrisLegalEntityClient {
  private readonly BASE_PATH: string = "/legal-entities";

  public async getLegalEntities(): Promise<LegalEntityDTO[]> {
    return hrisApiClient.get<LegalEntityDTO[]>(this.BASE_PATH);
  }

  public async createLegalEntity(payload: CreateLegalEntityRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload)
  }

  public async updateLegalEntity(payload: UpdateLegalEntityRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/update`, { name: payload.name })
  }

  public async deleteLegalEntity(payload: DeleteLegalEntityRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }
}

export const hrisLegalEntityClient = new HrisLegalEntityClient();
