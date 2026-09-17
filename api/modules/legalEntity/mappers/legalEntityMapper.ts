import { LegalEntityDTO } from "@/api/modules/legalEntity/dto";
import { LegalEntity } from "@/models/legalEntity";

export class LegalEntityMapper {
  public mapLegalEntityDtoToLegalEntity(dto: LegalEntityDTO): LegalEntity {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    }
  }
}

export const legalEntityMapper = new LegalEntityMapper();
