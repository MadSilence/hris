import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisJobLevelGroupClient } from "@/api/modules/jobLevelGroup/clients";
import { jobLevelGroupMapper } from "@/api/modules/jobLevelGroup/mappers";
import {
  CreateJobLevelGroupRequest,
  JobLevelGroupIdRequest,
  ReorderJobLevelsRequest,
  UpdateJobLevelGroupRequest,
} from "@/api/modules/jobLevelGroup/dto";
import { JobLevel, JobLevelGroup } from "@/models/job";

export class JobLevelGroupService {
  public async getJobLevelGroups(): Promise<JobLevelGroup[]> {
    const response = await hrisJobLevelGroupClient.getJobLevelGroups();
    return response.map((entity) => jobLevelGroupMapper.mapJobLevelGroupDtoToJobLevelGroup(entity));
  }

  public async createJobLevelGroup(payload: CreateJobLevelGroupRequest): Promise<NewEntity> {
    const createResponse = await hrisJobLevelGroupClient.createJobLevelGroup(payload);
    return { id: createResponse.id };
  }

  public async updateJobLevelGroup(payload: UpdateJobLevelGroupRequest): Promise<UpdatedEntity> {
    return hrisJobLevelGroupClient.updateJobLevelGroup(payload);
  }

  public async deleteJobLevelGroup(payload: JobLevelGroupIdRequest): Promise<Response> {
    return hrisJobLevelGroupClient.deleteJobLevelGroup(payload);
  }

  public async reorderJobLevels(payload: ReorderJobLevelsRequest): Promise<JobLevel[]> {
    const response = await hrisJobLevelGroupClient.reorderJobLevels(payload);
    return response.map((level) => jobLevelGroupMapper.mapJobLevelDtoToJobLevel(level));
  }
}

export const jobLevelGroupService = new JobLevelGroupService();
