import { Job, JobFamily } from "@/models/job";
import { JobDTO, JobFamilyDTO } from "@/api/modules/jobfamily/dto";

export class JobFamilyMapper {
  public mapJobDTOToJob(dto: JobDTO): Job {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapJobFamilyDTOToJobFamily(dto: JobFamilyDTO): JobFamily {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      jobs: (dto.jobs ?? []).map((job) => this.mapJobDTOToJob(job)),
    };
  }
}

export const jobFamilyMapper = new JobFamilyMapper();
