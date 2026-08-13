import { hrisApiNotificationsClient } from "@/api/modules/notifications/clients";
import type { Notification, NotificationPreference } from "@/models/notifications";

export class HrisNotificationsService {
  public async list(): Promise<Notification[]> {
    return hrisApiNotificationsClient.list();
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

  public async listPreferences(): Promise<NotificationPreference[]> {
    return hrisApiNotificationsClient.listPreferences();
  }

  public async setPreference(category: string, enabled: boolean): Promise<void> {
    return hrisApiNotificationsClient.setPreference(category, enabled);
  }
}

export const hrisNotificationsService = new HrisNotificationsService();
