import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto/LeaveTypeCategory";

export interface UpdateLeaveTypeRequest {
  name: string;
  description: string | null;
  color: string | null;
  category: LeaveTypeCategory | null;
}
