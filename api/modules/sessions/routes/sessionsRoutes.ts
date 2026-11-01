import { hrisSessionsService } from "@/api/modules/sessions/services";

export class SessionsRoutes {
  public async listMine() {
    return Response.json(await hrisSessionsService.listMine());
  }
}

export const sessionsRoutes = new SessionsRoutes();
