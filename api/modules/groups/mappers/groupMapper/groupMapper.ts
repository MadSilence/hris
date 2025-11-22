import { AttributeGroupDTO } from "@/api/modules/groups/dto/AttributeGroupDTO";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

export class GroupMapper {
  public mapGroupDtoToGroup(dto: AttributeGroupDTO): AttributeGroup {
    return {
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      sortOrder: dto.sortOrder,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
      updatedAt: dto.updatedAt,
      attributes: dto.attributes,
    }
  }
}

export const groupMapper = new GroupMapper();
