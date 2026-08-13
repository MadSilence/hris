"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisNotificationsService } from "@/api/modules/notifications/services";

type ActionResult = {
  status: ActionStatus;
  errorMessage?: string;
};

const run = async (fn: () => Promise<unknown>, errorMessage: string): Promise<ActionResult> => {
  try {
    await fn();
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return { status: ActionStatus.ERROR, errorMessage };
  }
};

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markRead(id), "Failed to mark notification as read");
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markAllRead(), "Failed to mark all notifications as read");
}

export async function markAllNotificationsSeenAction(): Promise<ActionResult> {
  return run(() => hrisNotificationsService.markAllSeen(), "Failed to update notifications");
}

export async function setNotificationStarredAction(id: string, starred: boolean): Promise<ActionResult> {
  return run(() => hrisNotificationsService.setStarred(id, starred), "Failed to update notification");
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  return run(() => hrisNotificationsService.remove(id), "Failed to delete notification");
}

export async function setNotificationPreferenceAction(
  category: string,
  enabled: boolean,
): Promise<ActionResult> {
  return run(
    () => hrisNotificationsService.setPreference(category, enabled),
    "Failed to update notification preference",
  );
}
