import { hrisDelegationsService } from "@/api/modules/delegations/services";

export class DelegationsRoutes {
  public async list() {
    return Response.json(await hrisDelegationsService.list());
  }
}

export const delegationsRoutes = new DelegationsRoutes();
