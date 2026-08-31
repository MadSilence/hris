"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { MoveDepartmentRequest } from "@/api/modules/departments/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const moveDepartmentAction = async (
  id: string,
  submission: MoveDepartmentRequest,
): Promise<MoveDepartmentActionOutput> => {
  try {
    const data = await hrisDepartmentsService.move(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "moveDepartmentAction");
  }
};

export type MoveDepartmentActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
