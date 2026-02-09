import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  CreateJobLevelGroupRequest,
  DeleteJobLevelGroupRequest,
  JobLevelGroupDTO,
  UpdateJobLevelGroupRequest
} from "@/api/modules/jobLevelGroup/dto";

class HrisJobLevelGroupClient {
  private readonly BASE_PATH: string = "/job-level-groups";

  public async getJobLevelGroups(): Promise<JobLevelGroupDTO[]> {
    return hrisApiClient.get<JobLevelGroupDTO[]>(this.BASE_PATH);
  }

  public async createJobLevelGroup(payload: CreateJobLevelGroupRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJobLevelGroup(payload: UpdateJobLevelGroupRequest) {
    return hrisApiClient.put<UpdateResponse>(`${this.BASE_PATH}/${payload.id}/update`, { name: payload.name });
  }

  public async deleteJobLevelGroup(payload: DeleteJobLevelGroupRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${payload.id}/delete`);
  }
}

export const hrisJobLevelGroupClient = new HrisJobLevelGroupClient();
