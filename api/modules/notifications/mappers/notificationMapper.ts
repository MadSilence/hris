import type { NotificationDTO, NotificationPreferenceDTO } from "@/api/modules/notifications/dto";
import type { Notification, NotificationPreference } from "@/models/notifications";

export class NotificationMapper {
  public mapNotificationDTO(dto: NotificationDTO): Notification {
    return {
      id: dto.id,
      type: dto.type,
      category: dto.category,
      params: dto.params ?? {},
      targetType: dto.targetType ?? null,
      targetId: dto.targetId ?? null,
      sourceType: dto.sourceType ?? null,
      sourceId: dto.sourceId ?? null,
      seen: dto.seen,
      read: dto.read,
      starred: dto.starred,
      createdAt: dto.createdAt,
      source: dto.source
        ? {
            type: dto.source.type,
            id: dto.source.id,
            status: dto.source.status ?? null,
            open: dto.source.open,
          }
        : null,
    };
  }

  public mapNotificationDTOs(dtos: NotificationDTO[]): Notification[] {
    return dtos.map((dto) => this.mapNotificationDTO(dto));
  }

  public mapPreferenceDTO(dto: NotificationPreferenceDTO): NotificationPreference {
    return {
      category: dto.category,
      label: dto.label,
      enabled: dto.enabled,
      mandatory: dto.mandatory,
      canManage: dto.canManage,
    };
  }

  public mapPreferenceDTOs(dtos: NotificationPreferenceDTO[]): NotificationPreference[] {
    return dtos.map((dto) => this.mapPreferenceDTO(dto));
  }
}

export const notificationMapper = new NotificationMapper();
