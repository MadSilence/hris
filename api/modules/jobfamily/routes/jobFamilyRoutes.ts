import { jobFamilyService, JobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

export class JobFamilyRoutes {
  public constructor(private readonly service: JobFamilyService) {
  }

  public async getJobFamilies() {
    const jobFamilies = await this.service.getJobFamilies();
    return Response.json(jobFamilies);
  };
}

export const jobFamilyRoutes = new JobFamilyRoutes(jobFamilyService);
