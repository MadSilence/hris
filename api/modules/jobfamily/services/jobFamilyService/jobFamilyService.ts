import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisJobFamilyClient } from "@/api/modules/jobfamily/clients";
import {
  ActivateJobFamilyRequest,
  CreateJobFamilyRequest,
  DuplicateJobFamilyRequest,
  JobFamilyIdRequest,
  UpdateJobFamilyRequest,
} from "@/api/modules/jobfamily/dto";
import { JobFamily, JobFamilyRestoreImpact } from "@/models/job";
import { jobFamilyMapper } from "@/api/modules/jobfamily/mappers";

export class JobFamilyService {
  public async getJobFamilies(): Promise<JobFamily[]> {
    const response = await hrisJobFamilyClient.getJobFamilies();
    return response.map((jobFamily) => jobFamilyMapper.mapJobFamilyDTOToJobFamily(jobFamily));
  }

  public async createJobFamily(payload: CreateJobFamilyRequest): Promise<NewEntity> {
    const createResponse = await hrisJobFamilyClient.createJobFamily(payload);
    return { id: createResponse.id };
  }

  public async updateJobFamily(payload: UpdateJobFamilyRequest): Promise<UpdatedEntity> {
    return hrisJobFamilyClient.updateJobFamily(payload);
  }

  public async duplicateJobFamily(payload: DuplicateJobFamilyRequest): Promise<NewEntity> {
    const createResponse = await hrisJobFamilyClient.duplicateJobFamily(payload);
    return { id: createResponse.id };
  }

  public async archiveJobFamily(payload: JobFamilyIdRequest): Promise<UpdatedEntity> {
    return hrisJobFamilyClient.archiveJobFamily(payload);
  }

  public async activateJobFamily(payload: ActivateJobFamilyRequest): Promise<UpdatedEntity> {
    return hrisJobFamilyClient.activateJobFamily(payload);
  }

  public async getRestoreImpact(id: string): Promise<JobFamilyRestoreImpact> {
    const dto = await hrisJobFamilyClient.getRestoreImpact(id);
    return { archivedJobs: dto.archivedJobs.map((job) => ({ ...job })) };
  }

  public async deleteJobFamily(payload: JobFamilyIdRequest): Promise<Response> {
    return hrisJobFamilyClient.deleteJobFamily(payload);
  }

  public async exportJobCatalog(format: "csv" | "xlsx"): Promise<Response> {
    return hrisJobFamilyClient.exportJobCatalog(format);
  }
}

export const jobFamilyService = new JobFamilyService();
