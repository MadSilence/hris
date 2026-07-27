"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { DeleteTeamRequest } from "@/api/modules/teams/dto";

export const deleteTeamAction = async (
  id: string,
  submission: DeleteTeamActionInput,
): Promise<DeleteTeamActionOutput> => {
  try {
    await hrisTeamsService.delete(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("deleteTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the team. Please try again.",
    };
  }
};

export type DeleteTeamActionInput = DeleteTeamRequest;
export type DeleteTeamActionOutput = { status: ActionStatus; errorMessage?: string };
