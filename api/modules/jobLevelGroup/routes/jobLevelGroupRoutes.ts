import {
  jobLevelGroupService,
  JobLevelGroupService,
} from "@/api/modules/jobLevelGroup/services";

export class JobLevelGroupRoutes {
  public constructor(private readonly service: JobLevelGroupService) {
  }

  public async getJobLevelGroups() {
    const groups = await this.service.getJobLevelGroups();
    return Response.json(groups);
  }
}

export const jobLevelGroupRoutes = new JobLevelGroupRoutes(jobLevelGroupService);
