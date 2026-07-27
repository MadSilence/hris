"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";

export const activateTeamAction = async (id: string): Promise<ActivateTeamActionOutput> => {
  try {
    await hrisTeamsService.activate(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("activateTeamAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while activating the team. Please try again.",
    };
  }
};

export type ActivateTeamActionOutput = { status: ActionStatus; errorMessage?: string };
