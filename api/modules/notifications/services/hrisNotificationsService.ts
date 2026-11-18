import { hrisApiNotificationsClient } from "@/api/modules/notifications/clients";
import type {
  InboxSummary,
  Notification,
  NotificationChannel,
  NotificationPage,
  NotificationPageQuery,
  NotificationPreference,
  WaitingOnMe,
} from "@/models/notifications";

export class HrisNotificationsService {
  public async list(query: NotificationPageQuery = {}): Promise<NotificationPage> {
    return hrisApiNotificationsClient.list(query);
  }

  public async summary(): Promise<InboxSummary> {
    return hrisApiNotificationsClient.summary();
  }

  public async unreadCount(): Promise<number> {
    return hrisApiNotificationsClient.unreadCount();
  }

  public async markRead(id: string): Promise<Notification> {
    return hrisApiNotificationsClient.markRead(id);
  }

  public async markAllRead(): Promise<void> {
    return hrisApiNotificationsClient.markAllRead();
  }

  public async markAllSeen(): Promise<void> {
    return hrisApiNotificationsClient.markAllSeen();
  }

  public async setStarred(id: string, starred: boolean): Promise<Notification> {
    return hrisApiNotificationsClient.setStarred(id, starred);
  }

  public async remove(id: string): Promise<void> {
    return hrisApiNotificationsClient.remove(id);
  }

  public async waitingOnMe(): Promise<WaitingOnMe> {
    return hrisApiNotificationsClient.waitingOnMe();
  }

  public async listPreferences(): Promise<NotificationPreference[]> {
    return hrisApiNotificationsClient.listPreferences();
  }

  public async setPreference(category: string, enabled: boolean, channel: NotificationChannel = "IN_APP"): Promise<void> {
    return hrisApiNotificationsClient.setPreference(category, enabled, channel);
  }
}

export const hrisNotificationsService = new HrisNotificationsService();
