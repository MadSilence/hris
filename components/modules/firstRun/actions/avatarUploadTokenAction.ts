"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services/hrisUserAvatarService";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * A one-time link for uploading your own photo from your phone.
 *
 * <p>Takes no id and never will: the backend issues it only for whoever is signed in, because a link
 * that could be minted for somebody else would put a picture on their profile with nothing in the
 * record about who really did it.
 */
export async function issueAvatarUploadTokenAction(): Promise<
  ActionResult<{ token: string; expiresInSeconds: number }>
> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisUserAvatarService.issueAvatarUploadToken() };
  } catch (error) {
    return toActionError(error, "issueAvatarUploadTokenAction");
  }
}

/**
 * Uploads the photo the phone just took.
 *
 * <p>Takes a `FormData` rather than a `File` because the token travels with it as a form field: it
 * is the whole credential, and a query string ends up in access logs and browser history on a device
 * the company does not own.
 */
export async function uploadAvatarByTokenAction(form: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisFirstRunService.uploadAvatarByToken(form) };
  } catch (error) {
    return toActionError(error, "uploadAvatarByTokenAction");
  }
}
