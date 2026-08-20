"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";

export type AssignedUsersStrategy = "KEEP" | "UNASSIGN";

export type ArchiveOfficeActionInput = {
  id: string;
  assignedUsersStrategy: AssignedUsersStrategy;
};

export type ArchiveOfficeActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const archiveOfficeAction = async (
  { id, assignedUsersStrategy }: ArchiveOfficeActionInput
): Promise<ArchiveOfficeActionOutput> => {
  try {
    await officeService.archiveOffice(id, assignedUsersStrategy);
    return { status: ActionStatus.SUCCESS };
  } catch (_error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the office. Please try again.",
    };
  }
};

export const restoreOfficeAction = async (
  { id }: { id: string }
): Promise<ArchiveOfficeActionOutput> => {
  try {
    await officeService.restoreOffice(id);
    return { status: ActionStatus.SUCCESS };
  } catch (_error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while restoring the office. Please try again.",
    };
  }
};
