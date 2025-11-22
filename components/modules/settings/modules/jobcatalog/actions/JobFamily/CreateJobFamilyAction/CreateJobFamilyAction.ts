"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

export const createJobFamilyAction = async (
  submission: CreateJobFamilyActionInput
): Promise<CreateJobFamilyActionOutput> => {
  try {
    const createEntity = await jobFamilyService.createJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Family. Please try again.",
    };
  }
};

export type CreateJobFamilyActionInput = {
  name: string;
};

export type CreateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
