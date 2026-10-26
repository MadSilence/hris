import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import {
  ActivateJobFamilyRequest,
  CreateJobFamilyRequest,
  DuplicateJobFamilyRequest,
  JobFamilyDTO,
  JobFamilyIdRequest,
  JobFamilyRestoreImpactDTO,
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

  public async activateJobFamily({ id, restoreJobIds }: ActivateJobFamilyRequest) {
    // No body at all when nothing is chosen: the backend reads that as "the family alone", as before.
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/activate`,
      restoreJobIds?.length ? { restoreJobIds } : undefined,
    );
  }

  /** The archived positions that could come back with this family. */
  public async getRestoreImpact(id: string): Promise<JobFamilyRestoreImpactDTO> {
    return hrisApiClient.get<JobFamilyRestoreImpactDTO>(`${this.BASE_PATH}/${id}/restore-impact`);
  }

  public async deleteJobFamily({ id }: JobFamilyIdRequest) {
    return hrisApiClient.post<Response>(`${this.BASE_PATH}/${id}/delete`);
  }

  public async exportJobCatalog(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }
}

export const hrisJobFamilyClient = new HrisJobFamilyClient();
