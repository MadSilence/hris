import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { legalEntityService, LegalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export class LegalEntityRoutes {
  public constructor(private readonly service: LegalEntityService) {
  }

  public async getLegalEntities() {
    const legalEntities = await this.service.getLegalEntities();
    return Response.json(legalEntities);
  };

  public async exportLegalEntities(req: Request) {
    const backendResponse = await this.service.exportLegalEntities(formatOf(req));
    return streamBinary(backendResponse);
  };

  public async exportLegalEntity(req: Request, id: string) {
    const backendResponse = await this.service.exportLegalEntity(id, formatOf(req));
    return streamBinary(backendResponse);
  };
}

export const legalEntityRoutes = new LegalEntityRoutes(legalEntityService);
