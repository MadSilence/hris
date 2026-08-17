import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffRequestDTO,
  CreateTimeOffRequestRequest,
  CancelTimeOffRequestRequest,
  RejectTimeOffRequestRequest,
  TimeOffRequestDurationDTO,
  TimeOffOverlapDTO,
} from "@/api/modules/timeOff/timeOffRequests/dto";
import { timeOffRequestMapper } from "@/api/modules/timeOff/timeOffRequests/mappers";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { TimeOffRequest } from "@/models/timeOff";

export class HrisApiTimeOffRequestsClient {
  private readonly REQUESTS_PATH = "/time-off/requests";
  private readonly OVERLAPS_PATH = "/time-off/overlaps";
  private readonly USERS_PATH = "/users";

  public async create(
    body: CreateTimeOffRequestRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.REQUESTS_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async previewDuration(
    assignmentId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffRequestDurationDTO> {
    const qs = new URLSearchParams({ assignmentId, startDate, endDate }).toString();
    return hrisApiClient.get<TimeOffRequestDurationDTO>(`${this.REQUESTS_PATH}/duration?${qs}`);
  }

  public async listOverlaps(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffOverlapDTO[]> {
    const qs = new URLSearchParams({ userId, startDate, endDate }).toString();
    return hrisApiClient.get<TimeOffOverlapDTO[]>(`${this.OVERLAPS_PATH}?${qs}`);
  }

  public async getById(id: string): Promise<TimeOffRequest> {
    const dto = await hrisApiClient.get<TimeOffRequestDTO>(
      `${this.REQUESTS_PATH}/${id}`
    );

    return timeOffRequestMapper.mapTimeOffRequestDTO(dto);
  }

  public async listByUserId(userId: string): Promise<TimeOffRequest[]> {
    const dtos = await hrisApiClient.get<TimeOffRequestDTO[]>(
      `${this.USERS_PATH}/${userId}/time-off-requests`
    );

    return timeOffRequestMapper.mapTimeOffRequestDTOs(dtos);
  }

  public async cancel(
    id: string,
    body: CancelTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}/cancel`,
      body as unknown as Record<string, unknown>
    );
  }

  public async approve(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}/approve`
    );
  }

  public async reject(
    id: string,
    body: RejectTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}/reject`,
      body as unknown as Record<string, unknown>
    );
  }
}

export const hrisApiTimeOffRequestsClient =
  new HrisApiTimeOffRequestsClient();