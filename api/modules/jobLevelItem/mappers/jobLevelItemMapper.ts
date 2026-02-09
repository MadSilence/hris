import { JobLevelItem } from "@/models/job";
import { JobLevelItemDTO } from "@/api/modules/jobLevelItem/dto";

export class JobLevelItemMapper {
  public mapJobLevelItemDtoToJobLevelItem(dto: JobLevelItemDTO): JobLevelItem {
    return {
      id: dto.id,
      name: dto.name,
      isSystem: dto.isSystem,
      sortOrder: dto.sortOrder,
    };
  }
}

export const jobLevelItemMapper = new JobLevelItemMapper();
