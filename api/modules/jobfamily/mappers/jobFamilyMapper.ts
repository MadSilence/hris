import { JobFamily } from "@/models/job";
import { JobFamilyDTO } from "@/api/modules/jobfamily/dto";

export class JobFamilyMapper {
  public mapJobFamilyDTOToJobFamily(dto: JobFamilyDTO): JobFamily {
    return {
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      jobs: dto.jobs,
    }
  }
}

export const jobFamilyMapper = new JobFamilyMapper();
