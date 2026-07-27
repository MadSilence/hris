"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTeamsService } from "@/api/modules/teams/services";

export const addTeamMemberAction = async (
  id: string,
  userId: string,
): Promise<AddTeamMemberActionOutput> => {
  try {
    await hrisTeamsService.addMember(id, { userId });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("addTeamMemberAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while adding the member. Please try again.",
    };
  }
};

export type AddTeamMemberActionOutput = { status: ActionStatus; errorMessage?: string };
