import { hrisNotificationsService } from "@/api/modules/notifications/services";
import type { InboxStatus } from "@/models/notifications";

export class NotificationsRoutes {
  /** The page the browser asked for: status, category, cursor and limit pass through as they came. */
  public async list(req: Request) {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const data = await hrisNotificationsService.list({
      status: (status as InboxStatus | null) ?? undefined,
      category: url.searchParams.get("category"),
      cursor: url.searchParams.get("cursor"),
      limit: Number(url.searchParams.get("limit")) || undefined,
    });
    return Response.json(data);
  }

  public async summary(_req: Request) {
    const data = await hrisNotificationsService.summary();
    return Response.json(data);
  }

  public async unreadCount(_req: Request) {
    const count = await hrisNotificationsService.unreadCount();
    return Response.json({ count });
  }

  public async waitingOnMe(_req: Request) {
    const data = await hrisNotificationsService.waitingOnMe();
    return Response.json(data);
  }

  public async listPreferences(_req: Request) {
    const data = await hrisNotificationsService.listPreferences();
    return Response.json(data);
  }
}

export const notificationsRoutes = new NotificationsRoutes();
