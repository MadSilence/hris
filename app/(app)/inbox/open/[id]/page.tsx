import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { hrisNotificationsService } from "@/api/modules/notifications/services";
import {
  presentNotification,
  type NotificationsTranslator,
} from "@/components/modules/notifications/components/notificationPresenter";
import type { Notification } from "@/models/notifications";

type Props = { params: Promise<{ id: string }> };

/**
 * Where an email's button lands (EMAIL_NOTIFICATIONS_DESIGN.md § 6.2). It marks the notification read and goes
 * where the inbox would have gone — the presenter's own destination, so there is one map of destinations, not a
 * second one in the backend. A notification that is gone, or not this reader's, lands in the inbox.
 */
export const dynamic = "force-dynamic";
export default async function OpenNotificationPage({ params }: Props) {
  const { id } = await params;
  let notification: Notification | null = null;
  try {
    notification = await hrisNotificationsService.markRead(id);
  } catch {
    notification = null;
  }
  if (!notification) redirect("/inbox");
  const t = (await getTranslations("notifications")) as unknown as NotificationsTranslator;
  const href = presentNotification(notification, t, await getLocale()).href;
  redirect(href ?? "/inbox");
}
