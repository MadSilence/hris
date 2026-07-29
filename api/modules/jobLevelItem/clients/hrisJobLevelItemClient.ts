import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  CreateJobLevelItemRequest,
  DeleteJobLevelItemRequest,
  JobLevelItemDTO,
  UpdateJobLevelItemRequest
} from "@/api/modules/jobLevelItem/dto";

class HrisJobLevelItemClient {
  private readonly BASE_PATH: string = "/job-level-items";

  public async getJobLevelItems(): Promise<JobLevelItemDTO[]> {
    return hrisApiClient.get<JobLevelItemDTO[]>(this.BASE_PATH);
  }

  public async createJobLevelItem(payload: CreateJobLevelItemRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJobLevelItem(payload: UpdateJobLevelItemRequest) {
    return hrisApiClient.patch<UpdateResponse>(
      `${this.BASE_PATH}/${payload.id}`,
      { name: payload.name }
    );
  }

  public async deleteJobLevelItem(payload: DeleteJobLevelItemRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`);
  }
}

export const hrisJobLevelItemClient = new HrisJobLevelItemClient();
