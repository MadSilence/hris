"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import type { TerminatePayload } from "@/api/modules/users/clients/hrisApiUsersClient";
import { toActionError } from "@/lib/errors/withActionError";

export type LifecycleActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const terminateUserAction = async (
  submission: { userId: string } & TerminatePayload
): Promise<LifecycleActionOutput> => {
  try {
    const { userId, ...payload } = submission;
    await hrisApiUsersService.terminate(userId, payload);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "userLifecycleActions");
  }
};

export const changeUserStatusAction = async (
  submission: { userId: string; status: string }
): Promise<LifecycleActionOutput> => {
  try {
    await hrisApiUsersService.changeStatus(submission.userId, submission.status);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "userLifecycleActions");
  }
};

export const deleteUserAction = async (
  submission: { userId: string }
): Promise<LifecycleActionOutput> => {
  try {
    await hrisApiUsersService.deleteUser(submission.userId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "userLifecycleActions");
  }
};
