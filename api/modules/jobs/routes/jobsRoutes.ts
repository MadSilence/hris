import { jobsService, JobsService } from "@/api/modules/jobs/services/jobsService";

export class JobsRoutes {
  public constructor(private readonly service: JobsService) {}

  public async listJobs() {
    const jobs = await this.service.listJobs();
    return Response.json(jobs);
  }
}

export const jobsRoutes = new JobsRoutes(jobsService);
