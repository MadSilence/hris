"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { CreateDepartmentRequest } from "@/api/modules/departments/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createDepartmentAction = async (
  submission: CreateDepartmentActionInput,
): Promise<CreateDepartmentActionOutput> => {
  try {
    const data = await hrisDepartmentsService.create(submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("createDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating the department. Please try again.",
    };
  }
};

export type CreateDepartmentActionInput = CreateDepartmentRequest;
export type CreateDepartmentActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
