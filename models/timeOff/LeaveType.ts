import type {
  LeaveTypeCategory,
  LeaveTypeStatus,
} from "@/api/modules/timeOff/leaveTypes/dto";

export interface LeaveType {
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
