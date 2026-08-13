import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  NotificationDTO,
  NotificationPreferenceDTO,
  UnreadCountDTO,
} from "@/api/modules/notifications/dto";
import { notificationMapper } from "@/api/modules/notifications/mappers";
import type { Notification, NotificationPreference } from "@/models/notifications";

export class HrisApiNotificationsClient {
  private readonly PATH = "/notifications";

  public async list(): Promise<Notification[]> {
    const dtos = await hrisApiClient.get<NotificationDTO[]>(this.PATH);
    return notificationMapper.mapNotificationDTOs(dtos);
  }

  public async unreadCount(): Promise<number> {
    const dto = await hrisApiClient.get<UnreadCountDTO>(`${this.PATH}/unread-count`);
    return dto.count;
  }

  public async markRead(id: string): Promise<Notification> {
    const dto = await hrisApiClient.post<NotificationDTO>(`${this.PATH}/${id}/read`);
    return notificationMapper.mapNotificationDTO(dto);
  }

  public async markAllRead(): Promise<void> {
    await hrisApiClient.post<void>(`${this.PATH}/read-all`);
  }

  public async markAllSeen(): Promise<void> {
    await hrisApiClient.post<void>(`${this.PATH}/seen-all`);
  }

  public async setStarred(id: string, starred: boolean): Promise<Notification> {
    const dto = await hrisApiClient.put<NotificationDTO>(`${this.PATH}/${id}/star`, { starred });
    return notificationMapper.mapNotificationDTO(dto);
  }

  public async remove(id: string): Promise<void> {
    await hrisApiClient.delete<void>(`${this.PATH}/${id}`);
  }

  public async listPreferences(): Promise<NotificationPreference[]> {
    const dtos = await hrisApiClient.get<NotificationPreferenceDTO[]>(`${this.PATH}/preferences`);
    return notificationMapper.mapPreferenceDTOs(dtos);
  }

  public async setPreference(category: string, enabled: boolean): Promise<void> {
    await hrisApiClient.put<void>(`${this.PATH}/preferences/${category}`, { enabled });
  }
}

export const hrisApiNotificationsClient = new HrisApiNotificationsClient();
