"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { CreateTeamRequest } from "@/api/modules/teams/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createTeamAction = async (
  submission: CreateTeamActionInput,
): Promise<CreateTeamActionOutput> => {
  try {
    const data = await hrisTeamsService.create(submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("createTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating the team. Please try again.",
    };
  }
};

export type CreateTeamActionInput = CreateTeamRequest;
export type CreateTeamActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
