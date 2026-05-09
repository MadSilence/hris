"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";

export const deleteUserAvatarAction = async (
  submission: DeleteUserAvatarActionInput
): Promise<DeleteUserAvatarActionOutput> => {
  try {
    await hrisUserAvatarService.deleteAvatar(submission.userId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deleteUserAvatarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the avatar. Please try again.",
    };
  }
};

export type DeleteUserAvatarActionInput = {
  userId: string;
};

export type DeleteUserAvatarActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
