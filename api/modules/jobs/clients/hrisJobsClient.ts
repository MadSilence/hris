import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { CreateJobRequest, JobDTO, JobIdRequest, UpdateJobRequest } from "@/api/modules/jobfamily/dto";

class HrisJobsClient {
  private readonly BASE_PATH: string = "/jobs";

  /** Flat list for pickers. Archived positions are excluded by the backend unless asked for. */
  public async listJobs(): Promise<JobDTO[]> {
    return hrisApiClient.get<JobDTO[]>(this.BASE_PATH);
  }

  public async createJob(payload: CreateJobRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJob({ id, ...body }: UpdateJobRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, body);
  }

  public async archiveJob({ id }: JobIdRequest) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }

  public async activateJob({ id }: JobIdRequest) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/activate`);
  }

  public async deleteJob({ id }: JobIdRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisJobsClient = new HrisJobsClient();
