import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CreateTimeOffPolicyRequest,
  RenameTimeOffPolicyRequest,
  TimeOffPolicyDTO,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOffPolicies/dto";
import { timeOffPolicyMapper } from "@/api/modules/timeOffPolicies/mappers/";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { TimeOffPolicy } from "@/models/timeOff";

export class HrisApiTimeOffPoliciesClient {
  private readonly BASE_PATH = "/api/time-off/policies";

  public async create(
    body: CreateTimeOffPolicyRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.BASE_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async list(): Promise<TimeOffPolicy[]> {
    const dtos = await hrisApiClient.get<TimeOffPolicyDTO[]>(this.BASE_PATH);
    return timeOffPolicyMapper.mapTimeOffPolicyDTOs(dtos);
  }

  public async getById(id: string): Promise<TimeOffPolicy> {
    const dto = await hrisApiClient.get<TimeOffPolicyDTO>(
      `${this.BASE_PATH}/${id}`
    );

    return timeOffPolicyMapper.mapTimeOffPolicyDTO(dto);
  }

  public async update(
    id: string,
    body: UpdateTimeOffPolicyRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdateTimeOffPolicyRequest>(
      `${this.BASE_PATH}/${id}`,
      body
    );
  }

  public async rename(
    id: string,
    body: RenameTimeOffPolicyRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/rename`,
      body as unknown as Record<string, unknown>
    );
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/activate`
    );
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/archive`
    );
  }

  public async delete(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/delete`
    );
  }
}

export const hrisApiTimeOffPoliciesClient =
  new HrisApiTimeOffPoliciesClient();
