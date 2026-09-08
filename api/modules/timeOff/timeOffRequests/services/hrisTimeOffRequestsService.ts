import { hrisApiTimeOffRequestsClient } from "@/api/modules/timeOff/timeOffRequests/clients";
import type {
  CreateTimeOffRequestRequest,
  CancelTimeOffRequestRequest,
  CreateTimeOffRequestResponse,
  EditTimeOffRequestRequest,
  RejectTimeOffRequestRequest,
  TimeOffRequestDurationDTO,
  TimeOffOverlapDTO,
} from "@/api/modules/timeOff/timeOffRequests/dto";
import { UpdateResponse } from "@/api/models/misc";
import type { TimeOffRequest } from "@/models/timeOff";

export class HrisTimeOffRequestsService {
  public async create(
    body: CreateTimeOffRequestRequest
  ): Promise<CreateTimeOffRequestResponse> {
    return hrisApiTimeOffRequestsClient.create(body);
  }

  public async previewDuration(
    assignmentId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffRequestDurationDTO> {
    return hrisApiTimeOffRequestsClient.previewDuration(assignmentId, startDate, endDate);
  }

  public async listOverlaps(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffOverlapDTO[]> {
    return hrisApiTimeOffRequestsClient.listOverlaps(userId, startDate, endDate);
  }

  public async getById(id: string): Promise<TimeOffRequest> {
    return hrisApiTimeOffRequestsClient.getById(id);
  }

  public async listAwaitingMe(): Promise<TimeOffRequest[]> {
    return hrisApiTimeOffRequestsClient.listAwaitingMe();
  }

  public async listByUserId(
    userId: string,
    filters?: { year?: number | null; status?: string | null }
  ): Promise<TimeOffRequest[]> {
    return hrisApiTimeOffRequestsClient.listByUserId(userId, filters);
  }

  public async cancel(
    id: string,
    body: CancelTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.cancel(id, body);
  }

  public async edit(
    id: string,
    body: EditTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.edit(id, body);
  }

  public async confirmCancellation(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.confirmCancellation(id);
  }

  public async declineCancellation(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.declineCancellation(id);
  }

  public async approve(id: string): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.approve(id);
  }

  public async reject(
    id: string,
    body: RejectTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.reject(id, body);
  }
}

export const hrisTimeOffRequestsService = new HrisTimeOffRequestsService();