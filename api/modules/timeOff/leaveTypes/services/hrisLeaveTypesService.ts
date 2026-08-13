import type {
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from "@/api/modules/timeOff/leaveTypes/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { hrisApiLeaveTypesClient } from "@/api/modules/timeOff/leaveTypes/clients/";
import { LeaveType } from "@/models/timeOff";

export class HrisLeaveTypesService {
  public async create(body: CreateLeaveTypeRequest): Promise<CreateResponse> {
    return hrisApiLeaveTypesClient.create(body);
  }

  public async list(includeArchived = true): Promise<LeaveType[]> {
    return hrisApiLeaveTypesClient.list(includeArchived);
  }

  public async getById(id: string): Promise<LeaveType> {
    return hrisApiLeaveTypesClient.getById(id);
  }

  public async update(
    id: string,
    body: UpdateLeaveTypeRequest
  ): Promise<UpdateResponse> {
    return hrisApiLeaveTypesClient.update(id, body);
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiLeaveTypesClient.archive(id);
  }
}

export const hrisLeaveTypesService = new HrisLeaveTypesService();
