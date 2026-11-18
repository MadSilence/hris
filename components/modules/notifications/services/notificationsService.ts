import { internalApiClient } from "@/components/clients/apiClient";
import {
  notificationPageQueryString,
  type InboxSummary,
  type NotificationPage,
  type NotificationPageQuery,
  type NotificationPreference,
  type WaitingOnMe,
} from "@/models/notifications";

export class NotificationsService {
  public async list(query: NotificationPageQuery = {}): Promise<NotificationPage> {
    return internalApiClient.get<NotificationPage>(`/notifications${notificationPageQueryString(query)}`);
  }

  public async summary(): Promise<InboxSummary> {
    return internalApiClient.get<InboxSummary>("/notifications/summary");
  }

  public async unreadCount(): Promise<number> {
    const data = await internalApiClient.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  }

  public async waitingOnMe(): Promise<WaitingOnMe> {
    return internalApiClient.get<WaitingOnMe>("/me/actions");
  }

  public async listPreferences(): Promise<NotificationPreference[]> {
    return internalApiClient.get<NotificationPreference[]>("/notifications/preferences");
  }
}

export const notificationsService = new NotificationsService();
