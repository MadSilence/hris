import { OfficeDTO } from "@/api/modules/office/dto";
import { Office } from "@/models/office";

export class OfficeMapper {
  public mapOfficeDtoToOffice(dto: OfficeDTO): Office {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      email: dto.email,
      phone: dto.phone,
      isSystem: dto.isSystem,
      country: dto.country,
      city: dto.city,
      street: dto.street,
      building: dto.building,
      postCode: dto.postCode,
    };
  }
}

export const officeMapper = new OfficeMapper();
