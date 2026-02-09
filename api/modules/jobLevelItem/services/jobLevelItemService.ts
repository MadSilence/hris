import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisJobLevelItemClient } from "@/api/modules/jobLevelItem/clients";
import { CreateJobLevelItemRequest, DeleteJobLevelItemRequest, UpdateJobLevelItemRequest } from "@/api/modules/jobLevelItem/dto";
import { jobLevelItemMapper } from "@/api/modules/jobLevelItem/mappers";
import { JobLevelItem } from "@/models/job";

export class JobLevelItemService {
  public async getJobLevelItems(): Promise<JobLevelItem[]> {
    const response = await hrisJobLevelItemClient.getJobLevelItems();
    return response.map((entity) =>
      jobLevelItemMapper.mapJobLevelItemDtoToJobLevelItem(entity)
    );
  }

  public async createJobLevelItem(
    payload: CreateJobLevelItemRequest
  ): Promise<NewEntity> {
    const createResponse =
      await hrisJobLevelItemClient.createJobLevelItem(payload);

    return {
      id: createResponse.id,
    };
  }

  public async updateJobLevelItem(
    payload: UpdateJobLevelItemRequest
  ): Promise<UpdatedEntity> {
    return hrisJobLevelItemClient.updateJobLevelItem(payload);
  }

  public async deleteJobLevelItem(
    payload: DeleteJobLevelItemRequest
  ): Promise<Response> {
    return hrisJobLevelItemClient.deleteJobLevelItem(payload);
  }
}

export const jobLevelItemService = new JobLevelItemService();
