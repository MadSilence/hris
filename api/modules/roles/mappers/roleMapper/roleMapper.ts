import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { Role } from "@/models/role/Role";

export class RoleMapper {
  public mapRoleDTOtoRole(dto: RoleDTO): Role {
    return {
      id: dto.id,
      archived: dto.archived,
      archivedAt: dto.archivedAt ?? null,
      name: dto.name,
      description: dto.description || undefined,
      userCount: dto.userCount,
      createdAt: dto.createdAt,
      systemOwner: dto.systemOwner,
      isDefault: dto.isDefault,
      updatedAt: dto.updatedAt,
    };
  }
}

export const roleMapper = new RoleMapper();
