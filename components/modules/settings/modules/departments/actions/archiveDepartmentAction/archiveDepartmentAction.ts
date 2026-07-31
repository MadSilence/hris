"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { ArchiveDepartmentRequest } from "@/api/modules/departments/dto";

export const archiveDepartmentAction = async (
  id: string,
  submission?: ArchiveDepartmentActionInput,
): Promise<ArchiveDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.archive(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("archiveDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the department. Please try again.",
    };
  }
};

export type ArchiveDepartmentActionInput = ArchiveDepartmentRequest;
export type ArchiveDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
