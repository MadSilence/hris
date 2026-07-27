import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { JobDTO } from "@/api/modules/jobfamily/dto";

class HrisJobsClient {
  private readonly BASE_PATH: string = "/jobs";

  // Flat list of every job in the company (backend familyId param omitted).
  public async listJobs(): Promise<JobDTO[]> {
    return hrisApiClient.get<JobDTO[]>(this.BASE_PATH);
  }
}

export const hrisJobsClient = new HrisJobsClient();
