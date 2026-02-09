import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisLegalEntityClient } from "@/api/modules/legalEntity/clients";
import { LegalEntity } from "@/models/legalEntity";
import { CreateLegalEntityRequest, DeleteLegalEntityRequest, UpdateLegalEntityRequest } from "@/api/modules/legalEntity/dto";
import { legalEntityMapper } from "@/api/modules/legalEntity/mappers";

export class LegalEntityService {
  public async getLegalEntities(): Promise<LegalEntity[]> {
    const response = await hrisLegalEntityClient.getLegalEntities();
    return response.map((entity) =>
      legalEntityMapper.mapLegalEntityDtoToLegalEntity(entity)
    );
  }

  public async createLegalEntity(
    payload: CreateLegalEntityRequest
  ): Promise<NewEntity> {
    const createResponse = await hrisLegalEntityClient.createLegalEntity(payload);

    return {
      id: createResponse.id,
    };
  }

  public async updateLegalEntity(
    payload: UpdateLegalEntityRequest
  ): Promise<UpdatedEntity> {
    return hrisLegalEntityClient.updateLegalEntity(payload);
  }

  public async deleteLegalEntity(
    payload: DeleteLegalEntityRequest
  ): Promise<Response> {
    return hrisLegalEntityClient.deleteLegalEntity(payload);
  }
}

export const legalEntityService = new LegalEntityService();
