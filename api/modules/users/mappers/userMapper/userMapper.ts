import { UserDTO } from "@/api/modules/users/dto";
import { User } from "@/models/user/User";

export class UserMapper {
  public mapUserDTOtoUser(dto: UserDTO): User {
    return {
      id: dto.id,
      companyId: dto.companyId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      status: dto.status,
      isEmailVerified: dto.isEmailVerified,
      lastLoginAt: dto.lastLoginAt,
      avatarUrl: dto.avatarUrl,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      custom: dto.custom,
    };
  }
}

export const userMapper = new UserMapper();
