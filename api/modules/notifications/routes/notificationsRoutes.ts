import { hrisNotificationsService } from "@/api/modules/notifications/services";

export class NotificationsRoutes {
  public async list(_req: Request) {
    const data = await hrisNotificationsService.list();
    return Response.json(data);
  }

  public async unreadCount(_req: Request) {
    const count = await hrisNotificationsService.unreadCount();
    return Response.json({ count });
  }

  public async listPreferences(_req: Request) {
    const data = await hrisNotificationsService.listPreferences();
    return Response.json(data);
  }
}

export const notificationsRoutes = new NotificationsRoutes();
