import { UserDTO } from "@/api/modules/users/dto";
import { User } from "@/models/user/User";

const HRIS_API_BASE_URL =
  process.env.BACKEND_URL;

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
      avatarUrl: this.resolveBackendAssetUrl(dto.avatarUrl),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      custom: dto.custom,
    };
  }

  private resolveBackendAssetUrl(path?: string | null): string | null {
    if (!path) return null;

    if (path.includes("/uploads/http")) {
      const idx = path.indexOf("/uploads/");
      const inner = path.substring(idx + "/uploads/".length);

      if (inner.startsWith("http")) {
        return inner;
      }
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${HRIS_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }
}

export const userMapper = new UserMapper();
