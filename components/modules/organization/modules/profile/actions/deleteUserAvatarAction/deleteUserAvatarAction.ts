"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteUserAvatarAction = async (
  submission: DeleteUserAvatarActionInput
): Promise<DeleteUserAvatarActionOutput> => {
  try {
    await hrisUserAvatarService.deleteAvatar(submission.userId);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteUserAvatarAction");
  }
};

export type DeleteUserAvatarActionInput = {
  userId: string;
};

export type DeleteUserAvatarActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
