import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto/LeaveTypeCategory";

export interface UpdateLeaveTypeRequest {
  name: string;
  description: string | null;
  color: string | null;
  category: LeaveTypeCategory | null;
  /** The version the form was opened with; the backend refuses a stale one with E00409. */
  version?: number;
}
