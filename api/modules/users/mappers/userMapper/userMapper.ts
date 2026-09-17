import { UserDTO } from "@/api/modules/users/dto";
import { User } from "@/models/user/User";
import { resolveBackendAssetUrl } from "./resolveBackendAssetUrl";

export class UserMapper {
  public mapUserDTOtoUser(dto: UserDTO): User {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      avatarUrl: resolveBackendAssetUrl(dto.avatarUrl),
    };
  }
}

export const userMapper = new UserMapper();
