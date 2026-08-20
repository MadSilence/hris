import { Job, JobFamily } from "@/models/job";
import { JobDTO, JobFamilyDTO } from "@/api/modules/jobfamily/dto";

export class JobFamilyMapper {
  public mapJobDTOToJob(dto: JobDTO): Job {
    return {
      id: dto.id,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      isSystem: dto.isSystem,
      archived: dto.archived,
      familyId: dto.familyId,
      familyName: dto.familyName,
      level: dto.level,
      assignedUsersCount: dto.assignedUsersCount,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
    };
  }

  public mapJobFamilyDTOToJobFamily(dto: JobFamilyDTO): JobFamily {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem,
      archived: dto.archived,
      assignedUsersCount: dto.assignedUsersCount,
      jobs: (dto.jobs ?? []).map((job) => this.mapJobDTOToJob(job)),
    };
  }
}

export const jobFamilyMapper = new JobFamilyMapper();
