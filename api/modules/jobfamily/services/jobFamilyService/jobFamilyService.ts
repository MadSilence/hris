import { NewEntity, UpdatedEntity } from "@/models/misc";
import { hrisJobFamilyClient } from "@/api/modules/jobfamily/clients";
import { CreateJobFamilyRequest, DeleteJobFamilyRequest, RenameJobFamilyRequest } from "@/api/modules/jobfamily/dto";
import { JobFamily } from "@/models/job/JobFamily";
import { jobFamilyMapper } from "@/api/modules/jobfamily/mappers";

export class JobFamilyService {
  public async getJobFamilies(): Promise<JobFamily[]> {
    const response = await hrisJobFamilyClient.getJobFamilies();
    return response.map((jobFamily) =>
      jobFamilyMapper.mapJobFamilyDTOToJobFamily(jobFamily)
    );
  }

  public async createJobFamily(
    payload: CreateJobFamilyRequest
  ): Promise<NewEntity> {
    const createResponse = await hrisJobFamilyClient.createJobFamily(payload);

    return {
      id: createResponse.id,
    };
  }

  public async renameJobFamily(
    payload: RenameJobFamilyRequest
  ): Promise<UpdatedEntity> {
    return hrisJobFamilyClient.renameJobFamily(payload);
  }

  public async deleteJobFamily(
    payload: DeleteJobFamilyRequest
  ): Promise<Response> {
    return hrisJobFamilyClient.deleteJobFamily(payload);
  }
}

export const jobFamilyService = new JobFamilyService();
