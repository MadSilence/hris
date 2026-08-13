import { internalApiClient } from "@/components/clients/apiClient";
import type { Notification, NotificationPreference } from "@/models/notifications";

export class NotificationsService {
  public async list(): Promise<Notification[]> {
    return internalApiClient.get<Notification[]>("/notifications");
  }

  public async unreadCount(): Promise<number> {
    const data = await internalApiClient.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  }

  public async listPreferences(): Promise<NotificationPreference[]> {
    return internalApiClient.get<NotificationPreference[]>("/notifications/preferences");
  }
}

export const notificationsService = new NotificationsService();
