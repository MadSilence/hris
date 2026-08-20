import { jobLevelsService, JobLevelsService } from "@/api/modules/jobLevels/services";

export class JobLevelsRoutes {
  public constructor(private readonly service: JobLevelsService) {}

  public async listJobLevels() {
    const levels = await this.service.listJobLevels();
    return Response.json(levels);
  }
}

export const jobLevelsRoutes = new JobLevelsRoutes(jobLevelsService);
