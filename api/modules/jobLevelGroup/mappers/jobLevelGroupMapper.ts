import { JobLevel, JobLevelGroup } from "@/models/job";
import { JobLevelGroupDTO } from "@/api/modules/jobLevelGroup/dto";
import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export class JobLevelGroupMapper {
  public mapJobLevelDtoToJobLevel(dto: JobLevelDTO): JobLevel {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapJobLevelGroupDtoToJobLevelGroup(dto: JobLevelGroupDTO): JobLevelGroup {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      levels: (dto.levels ?? []).map((level) => this.mapJobLevelDtoToJobLevel(level)),
    };
  }
}

export const jobLevelGroupMapper = new JobLevelGroupMapper();
