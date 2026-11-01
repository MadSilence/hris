import { hrisMfaService } from "@/api/modules/mfa/services";

export class MfaRoutes {
  public async status() {
    return Response.json(await hrisMfaService.status());
  }

  public async securitySettings() {
    return Response.json(await hrisMfaService.securitySettings());
  }
}

export const mfaRoutes = new MfaRoutes();
