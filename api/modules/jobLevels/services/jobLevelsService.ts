import { NewEntity, UpdatedEntity } from "@/models/misc";
import {
  CreateJobLevelRequest,
  hrisJobLevelsClient,
  JobLevelIdRequest,
  UpdateJobLevelRequest,
} from "@/api/modules/jobLevels/clients";

export class JobLevelsService {
  /** Identity-only projection for pickers: { id, name }. */
  public async listJobLevels(): Promise<{ id: string; name: string }[]> {
    const levels = await hrisJobLevelsClient.listJobLevels();
    return levels.map((l) => ({ id: l.id, name: l.name }));
  }

  public async createJobLevel(payload: CreateJobLevelRequest): Promise<NewEntity> {
    const createResponse = await hrisJobLevelsClient.createJobLevel(payload);
    return { id: createResponse.id };
  }

  public async updateJobLevel(payload: UpdateJobLevelRequest): Promise<UpdatedEntity> {
    return hrisJobLevelsClient.updateJobLevel(payload);
  }

  public async deleteJobLevel(payload: JobLevelIdRequest): Promise<Response> {
    return hrisJobLevelsClient.deleteJobLevel(payload);
  }
}

export const jobLevelsService = new JobLevelsService();
