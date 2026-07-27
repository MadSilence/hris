"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";

export const removeTeamMemberAction = async (
  id: string,
  userId: string,
): Promise<RemoveTeamMemberActionOutput> => {
  try {
    await hrisTeamsService.removeMember(id, userId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("removeTeamMemberAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while removing the member. Please try again.",
    };
  }
};

export type RemoveTeamMemberActionOutput = { status: ActionStatus; errorMessage?: string };
