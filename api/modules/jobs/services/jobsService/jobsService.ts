import { hrisJobsClient } from "@/api/modules/jobs/clients";
import { JobDTO } from "@/api/modules/jobfamily/dto";

export class JobsService {
  // Identity-only projection for pickers: { id, name }.
  public async listJobs(): Promise<{ id: string; name: string }[]> {
    const jobs: JobDTO[] = await hrisJobsClient.listJobs();
    return jobs.map((j) => ({ id: j.id, name: j.name }));
  }
}

export const jobsService = new JobsService();
