"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";

export const setTeamLeadAction = async (
  id: string,
  userId: string,
): Promise<SetTeamLeadActionOutput> => {
  try {
    await hrisTeamsService.setLead(id, { userId });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("setTeamLeadAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while setting the team lead. Please try again.",
    };
  }
};

export type SetTeamLeadActionOutput = { status: ActionStatus; errorMessage?: string };
