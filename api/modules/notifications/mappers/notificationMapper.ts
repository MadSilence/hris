import type { NotificationDTO, NotificationPreferenceDTO } from "@/api/modules/notifications/dto";
import type { Notification, NotificationPreference } from "@/models/notifications";

export class NotificationMapper {
  public mapNotificationDTO(dto: NotificationDTO): Notification {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      params: dto.params ?? {},
      targetType: dto.targetType ?? null,
      targetId: dto.targetId ?? null,
      sourceType: dto.sourceType ?? null,
      sourceId: dto.sourceId ?? null,
      source: dto.source
        ? {
            type: dto.source.type,
            id: dto.source.id,
            status: dto.source.status ?? null,
            open: dto.source.open,
            details: dto.source.details ?? null,
          }
        : null,
    };
  }

  public mapNotificationDTOs(dtos: NotificationDTO[]): Notification[] {
    return dtos.map((dto) => this.mapNotificationDTO(dto));
  }

  public mapPreferenceDTO(dto: NotificationPreferenceDTO): NotificationPreference {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
    };
  }

  public mapPreferenceDTOs(dtos: NotificationPreferenceDTO[]): NotificationPreference[] {
    return dtos.map((dto) => this.mapPreferenceDTO(dto));
  }
}

export const notificationMapper = new NotificationMapper();
