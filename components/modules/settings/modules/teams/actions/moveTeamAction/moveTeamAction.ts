"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";
import type { MoveTeamRequest } from "@/api/modules/teams/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const moveTeamAction = async (
  id: string,
  submission: MoveTeamRequest,
): Promise<MoveTeamActionOutput> => {
  try {
    const data = await hrisTeamsService.move(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("moveTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while moving the team. Please try again.",
    };
  }
};

export type MoveTeamActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
