"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import type { InviteStateDTO, InviteUserPayload, TerminatePayload } from "@/api/modules/users/clients/hrisApiUsersClient";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Invite now, or on `sendOn`. `fieldErrors.email` comes back when the person has no address. */
export async function inviteUserAction(
  submission: { userId: string } & InviteUserPayload,
): Promise<ActionResult<InviteStateDTO>> {
  try {
    const { userId, ...payload } = submission;
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.invite(userId, payload) };
  } catch (error) {
    return toActionError(error, "inviteUserAction");
  }
}

/** Withdraw a scheduled invitation. */
export async function cancelInviteAction(submission: { userId: string }): Promise<ActionResult<InviteStateDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.cancelInvite(submission.userId) };
  } catch (error) {
    return toActionError(error, "cancelInviteAction");
  }
}

/** End the person's ability to sign in. Behind `PEOPLE.PROFILE` BLOCK; the reason is optional. */
export async function blockUserAction(
  submission: { userId: string; reason?: string | null },
): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.block(submission.userId, submission.reason) };
  } catch (error) {
    return toActionError(error, "blockUserAction");
  }
}

/** Give sign-in back. The same right as blocking: whoever may take access away may return it. */
export async function unblockUserAction(
  submission: { userId: string; reason?: string | null },
): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.unblock(submission.userId, submission.reason) };
  } catch (error) {
    return toActionError(error, "unblockUserAction");
  }
}

/**
 * Mail the person a link to set a new password — also the only way to lift a sign-in lock.
 * Refusals: U00025 not registered, U00026 blocked, U00027 no email, U00020 mail failed.
 */
export async function sendPasswordResetAction(submission: { userId: string }): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.sendPasswordReset(submission.userId) };
  } catch (error) {
    return toActionError(error, "sendPasswordResetAction");
  }
}

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
