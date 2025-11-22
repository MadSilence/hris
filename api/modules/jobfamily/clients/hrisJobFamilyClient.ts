import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { CreateJobFamilyRequest, DeleteJobFamilyRequest, JobFamilyDTO, RenameJobFamilyRequest } from "@/api/modules/jobfamily/dto";

class HrisJobFamilyClient {
  private readonly BASE_PATH: string = "/job-families";

  public async getJobFamilies(): Promise<JobFamilyDTO[]> {
    return hrisApiClient.get<JobFamilyDTO[]>(this.BASE_PATH);
  }

  public async createJobFamily(payload: CreateJobFamilyRequest) {
    return hrisApiClient.post<CreateResponse>(
      `${this.BASE_PATH}/create`,
      payload
    );
  };

  public async renameJobFamily(payload: RenameJobFamilyRequest) {
    return hrisApiClient.put<UpdateResponse>(
      `${this.BASE_PATH}/${payload.id}/rename`,
      { name: payload.name }
    );
  }

  public async deleteJobFamily(payload: DeleteJobFamilyRequest) {
    return hrisApiClient.post<Response>(
      `${this.BASE_PATH}/${payload.id}/delete`
    );
  }
}

export const hrisJobFamilyClient = new HrisJobFamilyClient();
