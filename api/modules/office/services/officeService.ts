import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisOfficeClient } from "@/api/modules/office/clients";
import { Office } from "@/models/office";
import { CreateOfficeRequest, DeleteOfficeRequest, UpdateOfficeRequest, } from "@/api/modules/office/dto";
import { officeMapper } from "@/api/modules/office/mappers/officeMapper";

export class OfficeService {
  public async getOffices(): Promise<Office[]> {
    const response = await hrisOfficeClient.getOffices();
    return response.map((office) =>
      officeMapper.mapOfficeDtoToOffice(office)
    );
  }

  public async createOffice(
    payload: CreateOfficeRequest
  ): Promise<NewEntity> {
    const createResponse = await hrisOfficeClient.createOffice(payload);

    return {
      id: createResponse.id,
    };
  }

  public async updateOffice(
    payload: UpdateOfficeRequest
  ): Promise<UpdatedEntity> {
    return hrisOfficeClient.updateOffice(payload);
  }

  public async deleteOffice(
    payload: DeleteOfficeRequest
  ): Promise<Response> {
    return hrisOfficeClient.deleteOffice(payload);
  }
}

export const officeService = new OfficeService();
