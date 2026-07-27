"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";

export const archiveDepartmentAction = async (
  id: string,
): Promise<ArchiveDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.archive(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("archiveDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while archiving the department. Please try again.",
    };
  }
};

export type ArchiveDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
