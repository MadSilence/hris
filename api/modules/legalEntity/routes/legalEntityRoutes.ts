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

const formatOf = (req: Request): "csv" | "xlsx" =>
  new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

const streamBinary = (backendResponse: Response) =>
  new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
    },
  });

export const legalEntityRoutes = new LegalEntityRoutes(legalEntityService);
