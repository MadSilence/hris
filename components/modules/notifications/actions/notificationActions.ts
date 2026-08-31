"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError } from "@/lib/errors/withActionError";
import { hrisNotificationsService } from "@/api/modules/notifications/services";

type ActionResult = {
  status: ActionStatus;
  errorMessage?: string;
  code?: string;
  requestId?: string;
};

/**
 * `context` used to double as the message shown to the user; it is now only a label for the log.
 * What a person reads comes from the error code via the dictionary.
 */
const run = async (fn: () => Promise<unknown>, context: string): Promise<ActionResult> => {
  try {
    await fn();
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, context);
  }
};

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markRead(id), "markNotificationReadAction");
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markAllRead(), "markAllNotificationsReadAction");
}

export async function markAllNotificationsSeenAction(): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markAllSeen(), "markAllNotificationsSeenAction");
}

export async function setNotificationStarredAction(id: string, starred: boolean): Promise<ActionResult> {
  return run(() => hrisNotificationsService.setStarred(id, starred), "setNotificationStarredAction");
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  return run(() => hrisNotificationsService.remove(id), "deleteNotificationAction");
}

export async function setNotificationPreferenceAction(
  category: string,
  enabled: boolean,
): Promise<ActionResult> {
  return run(
    () => hrisNotificationsService.setPreference(category, enabled),
    "setNotificationPreferenceAction",
  );
}
