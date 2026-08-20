import { JobLevel, JobLevelGroup } from "@/models/job";
import { JobLevelGroupDTO } from "@/api/modules/jobLevelGroup/dto";
import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export class JobLevelGroupMapper {
  public mapJobLevelDtoToJobLevel(dto: JobLevelDTO): JobLevel {
    return {
      id: dto.id,
      name: dto.name,
      sortOrder: dto.sortOrder,
      isSystem: dto.isSystem,
      groupId: dto.groupId,
      groupName: dto.groupName,
      assignedJobsCount: dto.assignedJobsCount,
      assignedUsersCount: dto.assignedUsersCount,
    };
  }

  public mapJobLevelGroupDtoToJobLevelGroup(dto: JobLevelGroupDTO): JobLevelGroup {
    return {
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      assignedJobsCount: dto.assignedJobsCount,
      assignedUsersCount: dto.assignedUsersCount,
      levels: (dto.levels ?? []).map((level) => this.mapJobLevelDtoToJobLevel(level)),
    };
  }
}

export const jobLevelGroupMapper = new JobLevelGroupMapper();
