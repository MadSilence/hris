import { hrisIdentityService } from "@/api/modules/identity/services";

export class IdentityRoutes {
  public async connection() {
    return Response.json(await hrisIdentityService.connection());
  }

  public async tokens() {
    return Response.json(await hrisIdentityService.tokens());
  }

  public async groups() {
    return Response.json(await hrisIdentityService.groups());
  }
}

export const identityRoutes = new IdentityRoutes();
