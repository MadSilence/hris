import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto/LeaveTypeCategory";

export interface CreateLeaveTypeRequest {
  name: string;
  description: string | null;
  category: LeaveTypeCategory | null;
}
