import { UserDTO } from "@/api/modules/users/dto";
import { User } from "@/models/user/User";
import { resolveBackendAssetUrl } from "./resolveBackendAssetUrl";

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
      jobId: dto.jobId,
      jobName: dto.jobName,
      department: dto.department,
      teams: dto.teams,
      office: dto.office,
      legalEntity: dto.legalEntity,
      calendars: dto.calendars,
      manager: dto.manager,
      hireDate: dto.hireDate,
      employmentType: dto.employmentType,
      probationEnd: dto.probationEnd,
      terminationDate: dto.terminationDate,
      lastLoginAt: dto.lastLoginAt,
      avatarUrl: resolveBackendAssetUrl(dto.avatarUrl),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      custom: dto.custom,
      fieldAccess: dto.fieldAccess,
    };
  }
}

export const userMapper = new UserMapper();
