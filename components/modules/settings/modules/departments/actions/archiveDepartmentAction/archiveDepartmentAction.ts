"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { ArchiveDepartmentRequest } from "@/api/modules/departments/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const archiveDepartmentAction = async (
  id: string,
  submission?: ArchiveDepartmentActionInput,
): Promise<ArchiveDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.archive(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "archiveDepartmentAction");
  }
};

export type ArchiveDepartmentActionInput = ArchiveDepartmentRequest;
export type ArchiveDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
