import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CreateTimeOffPolicyRequest,
  RenameTimeOffPolicyRequest,
  TimeOffPolicyDTO,
  SaveTimeOffPolicyRequest,
  TimeOffPolicyEditImpactDTO,
  UpdateTimeOffPolicyRequest,
} from "@/api/modules/timeOff/timeOffPolicies/dto";
import { timeOffPolicyMapper } from "@/api/modules/timeOff/timeOffPolicies/mappers/";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { TimeOffPolicy } from "@/models/timeOff";

export class HrisApiTimeOffPoliciesClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async create(
    body: CreateTimeOffPolicyRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      `${this.BASE_PATH}/create`,
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

  /** The whole policy in one call. See SaveTimeOffPolicyRequest for why. */
  public async save(
    id: string,
    body: SaveTimeOffPolicyRequest
  ): Promise<TimeOffPolicyDTO> {
    return hrisApiClient.put<TimeOffPolicyDTO, SaveTimeOffPolicyRequest>(
      `${this.BASE_PATH}/${id}`,
      body
    );
  }

  /** The catalogue as a file. Raw, because the body is a spreadsheet rather than JSON. */
  /** Copy a policy and everything hanging off it, as a draft. */
  public async duplicate(id: string, name: string): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(`${this.BASE_PATH}/${id}/duplicate`, {
      name,
    });
  }

  public async exportPolicies(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${this.BASE_PATH}/export?format=${format}`);
  }

  public async editImpact(id: string): Promise<TimeOffPolicyEditImpactDTO> {
    return hrisApiClient.get<TimeOffPolicyEditImpactDTO>(
      `${this.BASE_PATH}/${id}/edit-impact`
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

  /** The inverse of {@link archive}. Brings the policy back as a DRAFT, never straight to ACTIVE. */
  public async unarchive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/unarchive`
    );
  }

  public async delete(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.BASE_PATH}/${id}/delete`);
  }
}

export const hrisApiTimeOffPoliciesClient =
  new HrisApiTimeOffPoliciesClient();
