import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisJobsClient } from "@/api/modules/jobs/clients";
import { CreateJobRequest, JobDTO, JobIdRequest, UpdateJobRequest } from "@/api/modules/jobfamily/dto";

export class JobsService {
  /** Identity-only projection for pickers: { id, name }. */
  public async listJobs(): Promise<{ id: string; name: string }[]> {
    const jobs: JobDTO[] = await hrisJobsClient.listJobs();
    return jobs.map((j) => ({ id: j.id, name: j.name }));
  }

  public async createJob(payload: CreateJobRequest): Promise<NewEntity> {
    const createResponse = await hrisJobsClient.createJob(payload);
    return { id: createResponse.id };
  }

  public async updateJob(payload: UpdateJobRequest): Promise<UpdatedEntity> {
    return hrisJobsClient.updateJob(payload);
  }

  public async archiveJob(payload: JobIdRequest): Promise<UpdatedEntity> {
    return hrisJobsClient.archiveJob(payload);
  }

  public async activateJob(payload: JobIdRequest): Promise<UpdatedEntity> {
    return hrisJobsClient.activateJob(payload);
  }

  public async deleteJob(payload: JobIdRequest): Promise<Response> {
    return hrisJobsClient.deleteJob(payload);
  }
}

export const jobsService = new JobsService();
