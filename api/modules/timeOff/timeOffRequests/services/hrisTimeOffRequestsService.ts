import { hrisApiTimeOffRequestsClient } from "@/api/modules/timeOff/timeOffRequests/clients";
import type {
  CreateTimeOffRequestRequest,
  CancelTimeOffRequestRequest,
  RejectTimeOffRequestRequest,
  TimeOffRequestDurationDTO,
} from "@/api/modules/timeOff/timeOffRequests/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { TimeOffRequest } from "@/models/timeOff";

export class HrisTimeOffRequestsService {
  public async create(
    body: CreateTimeOffRequestRequest
  ): Promise<CreateResponse> {
    return hrisApiTimeOffRequestsClient.create(body);
  }

  public async previewDuration(
    assignmentId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeOffRequestDurationDTO> {
    return hrisApiTimeOffRequestsClient.previewDuration(assignmentId, startDate, endDate);
  }

  public async getById(id: string): Promise<TimeOffRequest> {
    return hrisApiTimeOffRequestsClient.getById(id);
  }

  public async listByUserId(userId: string): Promise<TimeOffRequest[]> {
    return hrisApiTimeOffRequestsClient.listByUserId(userId);
  }

  public async cancel(
    id: string,
    body: CancelTimeOffRequestRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffRequestsClient.cancel(id, body);
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