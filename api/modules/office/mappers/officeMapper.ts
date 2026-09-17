import { OfficeDTO } from "@/api/modules/office/dto";
import { Office } from "@/models/office";

export class OfficeMapper {
  public mapOfficeDtoToOffice(dto: OfficeDTO): Office {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }
}

export const officeMapper = new OfficeMapper();
