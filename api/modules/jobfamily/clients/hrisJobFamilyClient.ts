import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  CreateJobFamilyRequest,
  DuplicateJobFamilyRequest,
  JobFamilyDTO,
  JobFamilyIdRequest,
  UpdateJobFamilyRequest,
} from "@/api/modules/jobfamily/dto";

class HrisJobFamilyClient {
  private readonly BASE_PATH: string = "/job-families";

  /** The catalogue screen: families with their jobs, archived rows included. */
  public async getJobFamilies(): Promise<JobFamilyDTO[]> {
    return hrisApiClient.get<JobFamilyDTO[]>(this.BASE_PATH);
  }

  public async createJobFamily(payload: CreateJobFamilyRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/create`, payload);
  }

  public async updateJobFamily({ id, ...body }: UpdateJobFamilyRequest) {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, body);
  }

  public async duplicateJobFamily({ id, ...body }: DuplicateJobFamilyRequest) {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/${id}/duplicate`, body);
  }

  public async archiveJobFamily({ id }: JobFamilyIdRequest) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }

  public async activateJobFamily({ id }: JobFamilyIdRequest) {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/activate`);
  }

  public async deleteJobFamily({ id }: JobFamilyIdRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${id}/delete`);
  }

  public async exportJobCatalog(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }
}

export const hrisJobFamilyClient = new HrisJobFamilyClient();
