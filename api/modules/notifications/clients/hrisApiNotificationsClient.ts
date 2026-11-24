import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  NotificationDTO,
  NotificationPreferenceDTO,
  UnreadCountDTO,
} from "@/api/modules/notifications/dto";
import { notificationMapper } from "@/api/modules/notifications/mappers";
import type { TimeOffRequestDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { timeOffRequestMapper } from "@/api/modules/timeOff/timeOffRequests/mappers";
import {
  notificationPageQueryString,
  type InboxSummary,
  type Notification,
  type NotificationChannel,
  type NotificationPage,
  type NotificationPageQuery,
  type NotificationPreference,
  type WaitingOnMe,
} from "@/models/notifications";

export class HrisApiNotificationsClient {
  private readonly PATH = "/notifications";

  /** One page of the inbox (B5). */
  public async list(query: NotificationPageQuery = {}): Promise<NotificationPage> {
    const dto = await hrisApiClient.get<{ items: NotificationDTO[]; nextCursor: string | null }>(
      `${this.PATH}${notificationPageQueryString(query)}`,
    );
    return { items: notificationMapper.mapNotificationDTOs(dto.items), nextCursor: dto.nextCursor };
  }

  public async summary(): Promise<InboxSummary> {
    return hrisApiClient.get<InboxSummary>(`${this.PATH}/summary`);
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

  /** Undo of a delete — the author's own line, back as it was. */
  public async restore(id: string): Promise<void> {
    await hrisApiClient.post<void>(`${this.PATH}/${id}/restore`);
  }

  public async listPreferences(): Promise<NotificationPreference[]> {
    const dtos = await hrisApiClient.get<NotificationPreferenceDTO[]>(`${this.PATH}/preferences`);
    return notificationMapper.mapPreferenceDTOs(dtos);
  }

  public async setPreference(category: string, enabled: boolean, channel: NotificationChannel = "IN_APP"): Promise<void> {
    await hrisApiClient.put<void>(`${this.PATH}/preferences/${category}/${channel}`, { enabled });
  }

  /** What waits on the caller — one list for the inbox, Home and a profile (A1). Lives at `/me/actions`. */
  public async waitingOnMe(): Promise<WaitingOnMe> {
    const dto = await hrisApiClient.get<Omit<WaitingOnMe, "requests"> & { requests: TimeOffRequestDTO[] }>("/me/actions");
    // Leave reads as the awaiting-me list does: through the time-off mapper, never as raw DTOs.
    return { ...dto, requests: timeOffRequestMapper.mapTimeOffRequestDTOs(dto.requests) };
  }
}

export const hrisApiNotificationsClient = new HrisApiNotificationsClient();
