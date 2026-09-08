import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffRequestDTO,
  CreateTimeOffRequestRequest,
  CancelTimeOffRequestRequest,
  CreateTimeOffRequestResponse,
  EditTimeOffRequestRequest,
  RejectTimeOffRequestRequest,
  TimeOffRequestDurationDTO,
  TimeOffOverlapDTO,
} from "@/api/modules/timeOff/timeOffRequests/dto";
import { timeOffRequestMapper } from "@/api/modules/timeOff/timeOffRequests/mappers";
import { UpdateResponse } from "@/api/models/misc";
import type { TimeOffRequest } from "@/models/timeOff";

export class HrisApiTimeOffRequestsClient {
  private readonly REQUESTS_PATH = "/time-off/requests";
  private readonly OVERLAPS_PATH = "/time-off/overlaps";
  private readonly USERS_PATH = "/users";

  public async create(
    body: CreateTimeOffRequestRequest
  ): Promise<CreateTimeOffRequestResponse> {
    return hrisApiClient.post<CreateTimeOffRequestResponse>(
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

  /** What is waiting for my decision — deliberately personal, not a company-wide list. */
  public async listAwaitingMe(): Promise<TimeOffRequest[]> {
    const dtos = await hrisApiClient.get<TimeOffRequestDTO[]>(
      `${this.REQUESTS_PATH}/awaiting-me`
    );

    return timeOffRequestMapper.mapTimeOffRequestDTOs(dtos);
  }

  public async listByUserId(
    userId: string,
    filters?: { year?: number | null; status?: string | null }
  ): Promise<TimeOffRequest[]> {
    const qs = new URLSearchParams();
    if (filters?.year) qs.set("year", String(filters.year));
    if (filters?.status) qs.set("status", filters.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";

    const dtos = await hrisApiClient.get<TimeOffRequestDTO[]>(
      `${this.USERS_PATH}/${userId}/time-off-requests${suffix}`
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

  /**
   * The approver's answer to a cancellation the employee asked for.
   *
   * Two calls rather than one with a flag, mirroring the backend: they are different decisions and
   * the journal should say which one was taken without anyone reading a boolean.
   */
  public async edit(
    id: string,
    body: EditTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}`,
      body as unknown as Record<string, unknown>
    );
  }

  public async confirmCancellation(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}/cancellation/confirm`
    );
  }

  public async declineCancellation(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.REQUESTS_PATH}/${id}/cancellation/decline`
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