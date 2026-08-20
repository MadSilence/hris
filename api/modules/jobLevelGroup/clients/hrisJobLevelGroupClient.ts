import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { JobLevelDTO } from "@/api/modules/jobfamily/dto";
import {
  CreateJobLevelGroupRequest,
  JobLevelGroupDTO,
  JobLevelGroupIdRequest,
  ReorderJobLevelsRequest,
  UpdateJobLevelGroupRequest,
} from "@/api/modules/jobLevelGroup/dto";

class HrisJobLevelGroupClient {
  private readonly BASE_PATH: string = "/job-level-groups";

  public async getJobLevelGroups(): Promise<JobLevelGroupDTO[]> {
    return hrisApiClient.get<JobLevelGroupDTO[]>(this.BASE_PATH);
  }

  public async createJobLevelGroup(payload: CreateJobLevelGroupRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJobLevelGroup({ id, ...body }: UpdateJobLevelGroupRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, body);
  }

  public async deleteJobLevelGroup({ id }: JobLevelGroupIdRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${id}/delete`);
  }

  /** The whole ladder at once — see JobLevelReorderService for why it is not per level. */
  public async reorderJobLevels({ groupId, levelIds }: ReorderJobLevelsRequest) {
    return hrisApiClient.post<JobLevelDTO[]>(
      `${this.BASE_PATH}/${groupId}/levels/reorder`,
      { levelIds },
    );
  }
}

export const hrisJobLevelGroupClient = new HrisJobLevelGroupClient();
