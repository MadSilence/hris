import { AttributeGroupDTO } from "@/api/modules/groups/dto/AttributeGroupDTO";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

export class GroupMapper {
  public mapGroupDtoToGroup(dto: AttributeGroupDTO): AttributeGroup {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    }
  }
}

export const groupMapper = new GroupMapper();
