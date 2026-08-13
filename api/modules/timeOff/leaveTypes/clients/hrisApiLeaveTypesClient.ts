import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  CreateLeaveTypeRequest,
  LeaveTypeDTO,
  UpdateLeaveTypeRequest,
} from "@/api/modules/timeOff/leaveTypes/dto";
import { leaveTypeMapper } from "@/api/modules/timeOff/leaveTypes/mappers/";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import { LeaveType } from "@/models/timeOff";

export class HrisApiLeaveTypesClient {
  private readonly BASE_PATH = "/time-off/leave-types";

  public async create(body: CreateLeaveTypeRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      `${this.BASE_PATH}/create`,
      body as unknown as Record<string, unknown>
    );
  }

  public async list(includeArchived = true): Promise<LeaveType[]> {
    const dtos = await hrisApiClient.get<LeaveTypeDTO[]>(
      `${this.BASE_PATH}?includeArchived=${includeArchived}`
    );
    return leaveTypeMapper.mapLeaveTypeDTOs(dtos);
  }

  public async getById(id: string): Promise<LeaveType> {
    const dto = await hrisApiClient.get<LeaveTypeDTO>(`${this.BASE_PATH}/${id}`);
    return leaveTypeMapper.mapLeaveTypeDTO(dto);
  }

  public async update(
    id: string,
    body: UpdateLeaveTypeRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdateLeaveTypeRequest>(
      `${this.BASE_PATH}/${id}`,
      body
    );
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }
}

export const hrisApiLeaveTypesClient = new HrisApiLeaveTypesClient();
