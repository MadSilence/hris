import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { DeleteOfficeRequest, OfficeDTO } from "@/api/modules/office/dto";

class HrisOfficeClient {
  private readonly BASE_PATH: string = "/offices";

  public async getOffices(): Promise<OfficeDTO[]> {
    return hrisApiClient.get<OfficeDTO[]>(`${this.BASE_PATH}?includeArchived=true`);
  }

  public async archiveOffice(id: string, payload: { assignedUsersStrategy: "KEEP" | "UNASSIGN" }) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`, payload)
  }

  public async restoreOffice(id: string) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/restore`)
  }

  public async createOffice(payload: CreateOfficeRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload)
  }

  public async updateOffice(payload: UpdateOfficeRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${payload.id}`, {
      name: payload.name,
      description: payload.description,
      email: payload.email,
      phone: payload.phone,
      country: payload.country,
      city: payload.city,
      street: payload.street,
      building: payload.building,
      postCode: payload.postCode,
    })
  }

  public async deleteOffice(payload: DeleteOfficeRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }

  public async exportOffices(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }

  public async exportOffice(id: string, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/${id}/export?format=${format}`);
  }
}

export const hrisOfficeClient = new HrisOfficeClient();
