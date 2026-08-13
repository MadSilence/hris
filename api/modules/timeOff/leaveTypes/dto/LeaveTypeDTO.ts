import { LeaveTypeStatus } from "@/api/modules/timeOff/leaveTypes/dto/LeaveTypeStatus";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto/LeaveTypeCategory";

export interface LeaveTypeDTO {
  id: string;
  companyId: string;

  name: string;
  description: string | null;
  color: string | null;
  category: LeaveTypeCategory | null;

  status: LeaveTypeStatus;

  archivedAt: string | null;
  archivedBy: string | null;

  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;

  version: number;
}
