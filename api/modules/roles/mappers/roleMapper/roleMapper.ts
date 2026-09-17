import { RoleDTO } from "@/api/modules/roles/dto/RoleDTO";
import { Role } from "@/models/role/Role";

export class RoleMapper {
  public mapRoleDTOtoRole(dto: RoleDTO): Role {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      archivedAt: dto.archivedAt ?? null,
      description: dto.description || undefined,
    };
  }
}

export const roleMapper = new RoleMapper();
