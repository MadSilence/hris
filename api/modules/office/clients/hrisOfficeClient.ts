import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { DeleteOfficeRequest, OfficeDTO } from "@/api/modules/office/dto";

class HrisOfficeClient {
  private readonly BASE_PATH: string = "/office";

  public async getOffices(): Promise<OfficeDTO[]> {
    return hrisApiClient.get<OfficeDTO[]>(this.BASE_PATH);
  }

  public async createOffice(payload: CreateOfficeRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload)
  }

  public async updateOffice(payload: UpdateOfficeRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/update`, { name: payload.name })
  }

  public async deleteOffice(payload: DeleteOfficeRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`)
  }
}

export const hrisOfficeClient = new HrisOfficeClient();
