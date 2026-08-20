import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { JobLevelDTO } from "@/api/modules/jobfamily/dto";

export type CreateJobLevelRequest = {
  groupId: string;
  name: string;
};

export type UpdateJobLevelRequest = {
  id: string;
  name: string;
};

export type JobLevelIdRequest = {
  id: string;
};

class HrisJobLevelsClient {
  private readonly BASE_PATH: string = "/job-levels";

  /** Flat list of every grade in the company — the reference catalogue reads this. */
  public async listJobLevels(): Promise<JobLevelDTO[]> {
    return hrisApiClient.get<JobLevelDTO[]>(this.BASE_PATH);
  }

  public async createJobLevel(payload: CreateJobLevelRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJobLevel({ id, ...body }: UpdateJobLevelRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, body);
  }

  public async deleteJobLevel({ id }: JobLevelIdRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisJobLevelsClient = new HrisJobLevelsClient();
