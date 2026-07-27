"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { UpdateTeamRequest } from "@/api/modules/teams/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTeamAction = async (
  id: string,
  submission: UpdateTeamActionInput,
): Promise<UpdateTeamActionOutput> => {
  try {
    const data = await hrisTeamsService.update(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("updateTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while updating the team. Please try again.",
    };
  }
};

export type UpdateTeamActionInput = UpdateTeamRequest;
export type UpdateTeamActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
