import { LegalEntityDTO } from "@/api/modules/legalEntity/dto";
import { LegalEntity } from "@/models/legalEntity";

export class LegalEntityMapper {
  public mapLegalEntityDtoToLegalEntity(dto: LegalEntityDTO): LegalEntity {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem,
      registrationNumber: dto.registrationNumber,
      taxId: dto.taxId,
      country: dto.country,
      city: dto.city,
      street: dto.street,
      building: dto.building,
      postCode: dto.postCode,
    }
  }
}

export const legalEntityMapper = new LegalEntityMapper();
