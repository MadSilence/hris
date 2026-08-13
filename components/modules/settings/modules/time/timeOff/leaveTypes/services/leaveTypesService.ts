import { internalApiClient } from "@/components/clients/apiClient";
import type { LeaveType } from "@/models/timeOff";

export class LeaveTypesService {
  public async list(): Promise<LeaveType[]> {
    return internalApiClient.get<LeaveType[]>("/time-off/leave-types");
  }

  public async getById(id: string): Promise<LeaveType> {
    return internalApiClient.get<LeaveType>(`/time-off/leave-types/${id}`);
  }
}

export const leaveTypesService = new LeaveTypesService();
