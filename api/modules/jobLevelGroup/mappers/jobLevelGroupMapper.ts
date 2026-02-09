import { JobLevelGroup } from "@/models/job";
import { JobLevelGroupDTO } from "@/api/modules/jobLevelGroup/dto";

export class JobLevelGroupMapper {
  public mapJobLevelGroupDtoToJobLevelGroup(dto: JobLevelGroupDTO): JobLevelGroup {
    return {
      id: dto.id,
      name: dto.name,
      levels: dto.levels,
      isSystem: dto.isSystem,
    }
  }
}

export const jobLevelGroupMapper = new JobLevelGroupMapper();
