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
    return hrisApiClient.get<LegalEntityDTO[]>(`${this.BASE_PATH}?includeArchived=true`);
  }

  public async archiveLegalEntity(id: string, payload: { assignedUsersStrategy: "KEEP" | "UNASSIGN" }) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`, payload)
  }

  public async restoreLegalEntity(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/restore`)
  }

  public async createLegalEntity(payload: CreateLegalEntityRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload)
  }

  public async updateLegalEntity(payload: UpdateLegalEntityRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${payload.id}`, {
      name: payload.name,
      description: payload.description,
      registrationNumber: payload.registrationNumber,
      taxId: payload.taxId,
      country: payload.country,
      city: payload.city,
      street: payload.street,
      building: payload.building,
      postCode: payload.postCode,
    })
  }

  public async deleteLegalEntity(payload: DeleteLegalEntityRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }

  public async exportLegalEntities(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }

  public async exportLegalEntity(id: string, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/${id}/export?format=${format}`);
  }
}

export const hrisLegalEntityClient = new HrisLegalEntityClient();
