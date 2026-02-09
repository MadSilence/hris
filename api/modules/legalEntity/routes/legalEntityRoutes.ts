import { legalEntityService, LegalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export class LegalEntityRoutes {
  public constructor(private readonly service: LegalEntityService) {
  }

  public async getLegalEntities() {
    const legalEntities = await this.service.getLegalEntities();
    return Response.json(legalEntities);
  };
}

export const legalEntityRoutes = new LegalEntityRoutes(legalEntityService);
