"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { CreateResponse } from "@/api/models/misc";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";
import { toActionError } from "@/lib/errors/withActionError";

export const uploadUserAvatarAction = async (
  submission: UploadUserAvatarActionInput
): Promise<UploadUserAvatarActionOutput> => {
  try {
    const response = await hrisUserAvatarService.uploadAvatar(
      submission.userId,
      submission.file
    );

    return {
      status: ActionStatus.SUCCESS,
      data: response,
    };
  } catch (error) {
    return toActionError(error, "uploadUserAvatarAction");
  }
};

export type UploadUserAvatarActionInput = {
  userId: string;
  file: File;
};

export type UploadUserAvatarActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
